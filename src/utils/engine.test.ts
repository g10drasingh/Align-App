/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateAutoWeights,
  computeItemProgressAndWeights,
  getDeadlineInfo,
  checkParentDueDateExtension,
  checkLinkCycle,
  wouldCreateParentCycle,
} from './engine';
import { Priority, Status, WorkItem } from '../types';

test('Auto weights - Spec Example A: 2 Medium tasks with 1 leaf each gets 50% / 50%', () => {
  const children = [
    { id: 'task-1', leaves: 1, cap: 50 },
    { id: 'task-2', leaves: 1, cap: 50 },
  ];
  const weights = calculateAutoWeights(children, 100);
  assert.equal(weights['task-1'], 50);
  assert.equal(weights['task-2'], 50);
});

test('Auto weights - Spec Example B: Caps in action with 3 children', () => {
  // Task A: Medium (cap 50), 3 leaves
  // Task B: High (cap 75), 1 leaf
  // Task C: Low (cap 25), 6 leaves
  const children = [
    { id: 'A', leaves: 3, cap: 50 },
    { id: 'B', leaves: 1, cap: 75 },
    { id: 'C', leaves: 6, cap: 25 },
  ];
  const weights = calculateAutoWeights(children, 100);

  // C gets capped at 25%
  // Remaining 75% split 3:1 between A & B
  // A proposal is 56.25% -> capped at 50%
  // B takes remaining 25%
  assert.equal(weights['C'], 25);
  assert.equal(weights['A'], 50);
  assert.equal(weights['B'], 25);
});

test('Auto weights - Single Low child with 25% cap ignores cap to total 100%', () => {
  const children = [{ id: 'lone', leaves: 2, cap: 25 }];
  const weights = calculateAutoWeights(children, 100);
  assert.equal(weights['lone'], 100);
});

test('Rollup progress calculation with manual and auto weights', () => {
  const statuses: Status[] = [
    { id: 's-not-started', name: 'Not Started', stateGroup: 'not_started', progressRule: 'fixed', progressValue: 0, sortOrder: 1, isActive: true },
    { id: 's-in-prog', name: 'In-Progress', stateGroup: 'active', progressRule: 'fixed', progressValue: 50, sortOrder: 2, isActive: true },
    { id: 's-done', name: 'Completed', stateGroup: 'done', progressRule: 'fixed', progressValue: 100, sortOrder: 3, isActive: true },
  ];
  const statusMap = new Map(statuses.map((s) => [s.id, s]));

  const priorities: Priority[] = [
    { id: 'p-med', name: 'Medium', rank: 2, weightCap: 50, isActive: true },
    { id: 'p-high', name: 'High', rank: 3, weightCap: 75, isActive: true },
    { id: 'p-low', name: 'Low', rank: 1, weightCap: 25, isActive: true },
  ];
  const priorityMap = new Map(priorities.map((p) => [p.id, p]));

  const parentProject: WorkItem = {
    id: 'proj-1',
    itemType: 'project',
    parentId: null,
    name: 'Q4 Merchant Report',
    statusId: 's-in-prog',
    priorityId: 'p-high',
    categoryId: 'c-data',
    departmentIds: ['d-data'],
    subDomainIds: [],
    teamMemberIds: [],
    weightMode: 'auto',
    needsCeoAttention: false,
    taskKind: 'one_time',
    isArchived: false,
    createdBy: 'u1',
    createdAt: '2026-11-01',
    updatedBy: 'u1',
    updatedAt: '2026-11-01',
  };

  // Example B tasks:
  // A: 60% progress, 50% weight
  // B: 0% progress, 25% weight
  // C: 100% progress, 25% weight
  // Expected progress = 0.50 * 60 + 0.25 * 0 + 0.25 * 100 = 55%
  const taskA: WorkItem = {
    id: 't-A',
    itemType: 'task',
    parentId: 'proj-1',
    name: 'Task A',
    statusId: 's-in-prog',
    progressOverride: 60,
    priorityId: 'p-med',
    categoryId: 'c-data',
    departmentIds: ['d-data'],
    subDomainIds: [],
    teamMemberIds: [],
    weightMode: 'auto',
    needsCeoAttention: false,
    taskKind: 'one_time',
    isArchived: false,
    createdBy: 'u1',
    createdAt: '2026-11-01',
    updatedBy: 'u1',
    updatedAt: '2026-11-01',
  };

  const taskB: WorkItem = {
    id: 't-B',
    itemType: 'task',
    parentId: 'proj-1',
    name: 'Task B',
    statusId: 's-not-started',
    priorityId: 'p-high',
    categoryId: 'c-data',
    departmentIds: ['d-data'],
    subDomainIds: [],
    teamMemberIds: [],
    weightMode: 'auto',
    needsCeoAttention: false,
    taskKind: 'one_time',
    isArchived: false,
    createdBy: 'u1',
    createdAt: '2026-11-01',
    updatedBy: 'u1',
    updatedAt: '2026-11-01',
  };

  const taskC: WorkItem = {
    id: 't-C',
    itemType: 'task',
    parentId: 'proj-1',
    name: 'Task C',
    statusId: 's-done',
    priorityId: 'p-low',
    categoryId: 'c-data',
    departmentIds: ['d-data'],
    subDomainIds: [],
    teamMemberIds: [],
    weightMode: 'auto',
    needsCeoAttention: false,
    taskKind: 'one_time',
    isArchived: false,
    createdBy: 'u1',
    createdAt: '2026-11-01',
    updatedBy: 'u1',
    updatedAt: '2026-11-01',
  };

  // Give Task A 3 leaves, Task B 1 leaf, Task C 6 leaves using subtasks
  const items: WorkItem[] = [
    parentProject,
    taskA,
    taskB,
    taskC,
    // 3 subtasks under A
    { ...taskA, id: 't-A1', parentId: 't-A', progressOverride: 60 },
    { ...taskA, id: 't-A2', parentId: 't-A', progressOverride: 60 },
    { ...taskA, id: 't-A3', parentId: 't-A', progressOverride: 60 },
    // 6 subtasks under C
    { ...taskC, id: 't-C1', parentId: 't-C' },
    { ...taskC, id: 't-C2', parentId: 't-C' },
    { ...taskC, id: 't-C3', parentId: 't-C' },
    { ...taskC, id: 't-C4', parentId: 't-C' },
    { ...taskC, id: 't-C5', parentId: 't-C' },
    { ...taskC, id: 't-C6', parentId: 't-C' },
  ];

  const res = computeItemProgressAndWeights(parentProject, items, statusMap, priorityMap);
  assert.equal(res.progress, 55);
});

test('Deadline flags - Correct evaluation of Overdue, Due today, Due soon, On track', () => {
  const activeStatus: Status = {
    id: 's-active',
    name: 'In-Progress',
    stateGroup: 'active',
    progressRule: 'fixed',
    progressValue: 50,
    sortOrder: 2,
    isActive: true,
  };

  const doneStatus: Status = {
    id: 's-done',
    name: 'Completed',
    stateGroup: 'done',
    progressRule: 'fixed',
    progressValue: 100,
    sortOrder: 5,
    isActive: true,
  };

  const today = '2026-11-01';

  // 1. Overdue
  const overdueInfo = getDeadlineInfo('2026-10-28', activeStatus, today, 7);
  assert.equal(overdueInfo.flag, 'overdue');
  assert.equal(overdueInfo.daysLeft, -4);
  assert.equal(overdueInfo.text, '4 days overdue');

  // 2. Due today
  const dueTodayInfo = getDeadlineInfo('2026-11-01', activeStatus, today, 7);
  assert.equal(dueTodayInfo.flag, 'due_today');
  assert.equal(dueTodayInfo.daysLeft, 0);

  // 3. Due soon (within 7 days)
  const dueSoonInfo = getDeadlineInfo('2026-11-06', activeStatus, today, 7);
  assert.equal(dueSoonInfo.flag, 'due_soon');
  assert.equal(dueSoonInfo.daysLeft, 5);

  // 4. On track (> 7 days)
  const onTrackInfo = getDeadlineInfo('2026-11-25', activeStatus, today, 7);
  assert.equal(onTrackInfo.flag, 'on_track');
  assert.equal(onTrackInfo.daysLeft, 24);

  // 5. Completed
  const completedInfo = getDeadlineInfo('2026-10-28', doneStatus, today, 7);
  assert.equal(completedInfo.flag, 'completed');
});

test('Cascade detection - Child due date later than parent warns and identifies ancestors', () => {
  const parent: WorkItem = {
    id: 'p1',
    itemType: 'project',
    parentId: null,
    name: 'Grandparent',
    dueDate: '2026-11-10',
    statusId: 's1',
    priorityId: 'pr1',
    categoryId: 'c1',
    departmentIds: ['d1'],
    subDomainIds: [],
    teamMemberIds: [],
    weightMode: 'auto',
    needsCeoAttention: false,
    taskKind: 'one_time',
    isArchived: false,
    createdBy: 'u1',
    createdAt: '2026-11-01',
    updatedBy: 'u1',
    updatedAt: '2026-11-01',
  };

  const child: WorkItem = {
    ...parent,
    id: 'p2',
    parentId: 'p1',
    name: 'Child Project',
    dueDate: '2026-11-15',
  };

  const allItems = [parent, child];

  // If a grandchild is set to 2026-11-20
  const check = checkParentDueDateExtension('2026-11-20', 'p2', allItems);
  assert.equal(check.needsCascade, true);
  assert.equal(check.affectedAncestors.length, 2);
  assert.equal(check.affectedAncestors[0].id, 'p2');
  assert.equal(check.affectedAncestors[1].id, 'p1');
});

test('Link cycle guard - rejects loop A -> B -> A and direct self-link', () => {
  // Direct self-link
  assert.equal(checkLinkCycle('work_item', 'w1', 'work_item', 'w1', []), true);

  // Existing link: w1 -> w2
  const existingLinks = [
    {
      id: 'l1',
      sourceType: 'work_item' as const,
      sourceId: 'w1',
      targetType: 'work_item' as const,
      targetId: 'w2',
      createdAt: '2026-11-01',
    },
  ];

  // Adding link w2 -> w1 would form a cycle
  assert.equal(checkLinkCycle('work_item', 'w2', 'work_item', 'w1', existingLinks), true);

  // Adding link w2 -> w3 is fine
  assert.equal(checkLinkCycle('work_item', 'w2', 'work_item', 'w3', existingLinks), false);
});

test('Parent hierarchy cycle check prevents setting descendant as parent', () => {
  const p1: WorkItem = {
    id: 'p1',
    itemType: 'project',
    parentId: null,
    name: 'P1',
    statusId: 's1',
    priorityId: 'pr1',
    categoryId: 'c1',
    departmentIds: ['d1'],
    subDomainIds: [],
    teamMemberIds: [],
    weightMode: 'auto',
    needsCeoAttention: false,
    taskKind: 'one_time',
    isArchived: false,
    createdBy: 'u1',
    createdAt: '2026-11-01',
    updatedBy: 'u1',
    updatedAt: '2026-11-01',
  };
  const p2: WorkItem = { ...p1, id: 'p2', parentId: 'p1', name: 'P2' };
  const p3: WorkItem = { ...p1, id: 'p3', parentId: 'p2', name: 'P3' };

  const all = [p1, p2, p3];

  // Moving p1 to be child of p3 must be refused
  assert.equal(wouldCreateParentCycle('p1', 'p3', all), true);

  // Moving p3 to be child of root is allowed
  assert.equal(wouldCreateParentCycle('p3', null, all), false);
});
