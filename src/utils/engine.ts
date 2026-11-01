/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  DeadlineFlag,
  ItemLink,
  Priority,
  RecurrenceSeries,
  Status,
  WorkItem,
} from '../types';

/**
 * Calculates auto weights based on leaf counts and priority caps.
 * Follows spec Section 7.5 algorithm.
 */
export function calculateAutoWeights(
  children: Array<{ id: string; leaves: number; cap: number }>,
  budget = 100
): Record<string, number> {
  if (children.length === 0) return {};
  if (budget <= 0) {
    const res: Record<string, number> = {};
    for (const c of children) res[c.id] = 0;
    return res;
  }

  // Filter out any 0-leaf children initially (they get 0%)
  const activeChildren = children.filter((c) => c.leaves > 0);
  const zeroLeafChildren = children.filter((c) => c.leaves <= 0);

  const result: Record<string, number> = {};
  for (const z of zeroLeafChildren) {
    result[z.id] = 0;
  }

  if (activeChildren.length === 0) {
    // If all have 0 leaves, divide equally
    const equalShare = Number((budget / children.length).toFixed(1));
    for (const c of children) result[c.id] = equalShare;
    return result;
  }

  const fixed: Record<string, number> = {};
  const free = [...activeChildren];

  while (free.length > 0) {
    const sumFixed = Object.values(fixed).reduce((acc, v) => acc + v, 0);
    const pool = budget - sumFixed;
    const totalLeaves = free.reduce((acc, c) => acc + c.leaves, 0);

    if (totalLeaves === 0 || pool <= 0) {
      for (const c of free) fixed[c.id] = 0;
      break;
    }

    const proposal: Record<string, number> = {};
    for (const c of free) {
      proposal[c.id] = (pool * c.leaves) / totalLeaves;
    }

    const over = free.filter((c) => proposal[c.id] > c.cap);
    if (over.length === 0) {
      for (const c of free) {
        fixed[c.id] = Number(proposal[c.id].toFixed(1));
      }
      break;
    }

    for (const c of over) {
      fixed[c.id] = c.cap;
      const index = free.findIndex((item) => item.id === c.id);
      if (index !== -1) free.splice(index, 1);
    }
  }

  const totalFixed = Object.values(fixed).reduce((acc, v) => acc + v, 0);
  if (Math.abs(totalFixed - budget) < 0.5) {
    return { ...result, ...fixed };
  }

  // If every child was capped and budget not fully used up (e.g. single Low child capped at 25%),
  // spec says: ignore caps and use plain leaf-count shares so total is budget (100%).
  const totalActiveLeaves = activeChildren.reduce((acc, c) => acc + c.leaves, 0);
  for (const c of activeChildren) {
    result[c.id] = Number(((budget * c.leaves) / totalActiveLeaves).toFixed(1));
  }

  return result;
}

/**
 * Counts non-cancelled leaf tasks under a given work item.
 */
export function countLeaves(
  itemId: string,
  allItems: WorkItem[],
  statusMap: Map<string, Status>
): number {
  const directChildren = allItems.filter(
    (item) => item.parentId === itemId && !item.isArchived
  );

  const activeChildren = directChildren.filter((item) => {
    const s = statusMap.get(item.statusId);
    return s?.stateGroup !== 'cancelled';
  });

  if (activeChildren.length === 0) {
    const self = allItems.find((item) => item.id === itemId);
    const selfStatus = self ? statusMap.get(self.statusId) : null;
    if (selfStatus?.stateGroup === 'cancelled') return 0;
    // A leaf task counts as 1. An empty project has 0 leaves.
    return self?.itemType === 'task' ? 1 : 0;
  }

  let leaves = 0;
  for (const child of activeChildren) {
    leaves += countLeaves(child.id, allItems, statusMap);
  }
  return leaves;
}

/**
 * Computes the effective progress and weights for all children of a parent.
 */
export function computeItemProgressAndWeights(
  item: WorkItem,
  allItems: WorkItem[],
  statusMap: Map<string, Status>,
  priorityMap: Map<string, Priority>
): {
  progress: number | null;
  childWeights: Record<string, { weight: number; isManual: boolean }>;
} {
  const directChildren = allItems.filter(
    (c) => c.parentId === item.id && !c.isArchived
  );

  const activeChildren = directChildren.filter((c) => {
    const s = statusMap.get(c.statusId);
    return s?.stateGroup !== 'cancelled';
  });

  // If leaf item
  if (activeChildren.length === 0) {
    if (item.itemType === 'project') {
      // Empty project = N/A
      return { progress: null, childWeights: {} };
    }
    if (item.progressOverride != null) {
      return { progress: item.progressOverride, childWeights: {} };
    }
    const status = statusMap.get(item.statusId);
    if (!status || status.stateGroup === 'cancelled') {
      return { progress: null, childWeights: {} };
    }
    return { progress: status.progressValue ?? 0, childWeights: {} };
  }

  // Calculate weights for active children
  const childWeights: Record<string, { weight: number; isManual: boolean }> = {};
  let manualBudget = 0;
  const autoCandidates: Array<{ id: string; leaves: number; cap: number }> = [];

  for (const child of activeChildren) {
    if (child.weightMode === 'manual' && child.weightManual != null) {
      childWeights[child.id] = {
        weight: child.weightManual,
        isManual: true,
      };
      manualBudget += child.weightManual;
    } else {
      const leaves = countLeaves(child.id, allItems, statusMap);
      const prio = priorityMap.get(child.priorityId);
      const cap = prio?.weightCap ?? 50;
      autoCandidates.push({ id: child.id, leaves, cap });
    }
  }

  const remainingBudget = Math.max(0, 100 - manualBudget);
  const autoWeights = calculateAutoWeights(autoCandidates, remainingBudget);

  for (const auto of autoCandidates) {
    childWeights[auto.id] = {
      weight: autoWeights[auto.id] ?? 0,
      isManual: false,
    };
  }

  // Roll-up progress
  let weightedProgressSum = 0;
  let totalWeight = 0;

  for (const child of activeChildren) {
    const { progress: childProg } = computeItemProgressAndWeights(
      child,
      allItems,
      statusMap,
      priorityMap
    );
    const weight = childWeights[child.id]?.weight ?? 0;
    if (childProg != null) {
      weightedProgressSum += (childProg * weight) / 100;
      totalWeight += weight;
    }
  }

  if (totalWeight === 0) {
    return { progress: null, childWeights };
  }

  // Normalize if totalWeight != 100
  const finalProgress =
    totalWeight === 100
      ? weightedProgressSum
      : (weightedProgressSum * 100) / totalWeight;

  return {
    progress: Math.min(100, Math.max(0, Math.round(finalProgress))),
    childWeights,
  };
}

/**
 * Calculates deadline flag and days left.
 */
export function getDeadlineInfo(
  dueDateStr: string | undefined,
  status: Status | undefined,
  todayStr: string,
  dueSoonDays = 7
): {
  flag: DeadlineFlag;
  daysLeft: number | null;
  text: string;
} {
  if (!status) {
    return { flag: 'no_due_date', daysLeft: null, text: '—' };
  }

  if (status.stateGroup === 'cancelled') {
    return { flag: 'cancelled', daysLeft: null, text: '—' };
  }

  if (status.stateGroup === 'done') {
    return { flag: 'completed', daysLeft: null, text: 'Completed' };
  }

  if (!dueDateStr) {
    return { flag: 'no_due_date', daysLeft: null, text: '—' };
  }

  // Parse YYYY-MM-DD
  const today = new Date(todayStr + 'T00:00:00');
  const due = new Date(dueDateStr + 'T00:00:00');
  const diffTime = due.getTime() - today.getTime();
  const daysLeft = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) {
    const overdueDays = Math.abs(daysLeft);
    return {
      flag: 'overdue',
      daysLeft,
      text: `${overdueDays} day${overdueDays === 1 ? '' : 's'} overdue`,
    };
  }

  if (daysLeft === 0) {
    return { flag: 'due_today', daysLeft: 0, text: 'Due today' };
  }

  if (daysLeft <= dueSoonDays) {
    return {
      flag: 'due_soon',
      daysLeft,
      text: `${daysLeft} day${daysLeft === 1 ? '' : 's'} left`,
    };
  }

  return {
    flag: 'on_track',
    daysLeft,
    text: `${daysLeft} days left`,
  };
}

/**
 * Checks if extending a child's due date requires cascading to ancestors.
 */
export function checkParentDueDateExtension(
  childDueDate: string,
  parentId: string | null,
  allItems: WorkItem[]
): {
  needsCascade: boolean;
  affectedAncestors: Array<{ id: string; name: string; currentDueDate?: string }>;
} {
  if (!parentId || !childDueDate) {
    return { needsCascade: false, affectedAncestors: [] };
  }

  const affected: Array<{ id: string; name: string; currentDueDate?: string }> = [];
  let currId: string | null = parentId;

  while (currId) {
    const ancestor = allItems.find((item) => item.id === currId);
    if (!ancestor) break;

    if (!ancestor.dueDate || ancestor.dueDate < childDueDate) {
      affected.push({
        id: ancestor.id,
        name: ancestor.name,
        currentDueDate: ancestor.dueDate,
      });
      currId = ancestor.parentId;
    } else {
      break;
    }
  }

  return {
    needsCascade: affected.length > 0,
    affectedAncestors: affected,
  };
}

/**
 * Detects cycles in item links (Bi-directional Originated from / Generated items).
 */
export function checkLinkCycle(
  sourceType: 'work_item' | 'meeting',
  sourceId: string,
  targetType: 'work_item' | 'meeting',
  targetId: string,
  allLinks: ItemLink[]
): boolean {
  // Direct self-link
  if (sourceType === targetType && sourceId === targetId) return true;

  // Breadth-first search from target to see if it can reach source
  const visited = new Set<string>();
  const queue: Array<{ type: string; id: string }> = [{ type: targetType, id: targetId }];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const key = `${current.type}:${current.id}`;
    if (key === `${sourceType}:${sourceId}`) return true;
    if (visited.has(key)) continue;
    visited.add(key);

    const outgoing = allLinks.filter(
      (l) => l.sourceType === current.type && l.sourceId === current.id
    );
    for (const link of outgoing) {
      queue.push({ type: link.targetType, id: link.targetId });
    }
  }

  return false;
}

/**
 * Cycle guard for hierarchy moves.
 */
export function wouldCreateParentCycle(
  itemId: string,
  proposedParentId: string | null,
  allItems: WorkItem[]
): boolean {
  if (!proposedParentId) return false;
  if (itemId === proposedParentId) return true;

  let currentId: string | null = proposedParentId;
  while (currentId) {
    if (currentId === itemId) return true;
    const parent = allItems.find((i) => i.id === currentId);
    currentId = parent?.parentId ?? null;
  }
  return false;
}

/**
 * Computes next scheduled date for a recurring series.
 */
export function getNextRecurrenceDate(
  lastDateStr: string,
  series: RecurrenceSeries,
  workingDays: number[] = [1, 2, 3, 4, 5]
): string {
  const date = new Date(lastDateStr + 'T00:00:00');

  switch (series.ruleType) {
    case 'daily':
      date.setDate(date.getDate() + 1);
      break;
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'every_x_days':
      date.setDate(date.getDate() + (series.intervalDays ?? 1));
      break;
  }

  // Skip non-working days if enabled
  if (series.skipNonWorking) {
    while (!workingDays.includes(date.getDay() === 0 ? 7 : date.getDay())) {
      date.setDate(date.getDate() + 1);
    }
  }

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
