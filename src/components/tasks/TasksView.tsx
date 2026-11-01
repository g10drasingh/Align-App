/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  Archive,
  ArrowUpDown,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Download,
  Filter,
  Flag,
  Folder,
  FolderTree,
  Link2,
  List,
  Lock,
  OctagonX,
  Plus,
  Repeat,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SummaryStrip } from '../common/SummaryStrip';
import {
  computeItemProgressAndWeights,
  countLeaves,
  getDeadlineInfo,
} from '../../utils/engine';
import { ItemType, Priority, Status, WorkItem } from '../../types';

export const TasksView: React.FC = () => {
  const {
    workItems,
    departments,
    subDomains,
    teamMembers,
    categories,
    priorities,
    statuses,
    ceoAttentionStatuses,
    departmentMap,
    statusMap,
    priorityMap,
    ceoStatusMap,
    todayStr,
    dueSoonWindow,
    dueSoonUnit,
    density,
    setSelectedItemId,
    inlineUpdateWorkItem,
    toggleCeoAttention,
    archiveWorkItem,
    canEdit,
    isCeoViewer,
    setIsNewItemOpen,
    setNewItemDefaultType,
    followups,
  } = useApp();

  // Page Tab state
  const [activeTab, setActiveTab] = useState<'all' | 'open' | 'overdue' | 'due_soon' | 'ceo'>('open');
  // Scope filter: all | project | task
  const [scope, setScope] = useState<'all' | 'project' | 'task'>('all');
  // View mode: tree | flat
  const [viewMode, setViewMode] = useState<'flat' | 'tree'>('flat');

  // Filter criteria
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState<string>('all');
  const [selectedPriorityId, setSelectedPriorityId] = useState<string>('all');
  const [selectedStatusId, setSelectedStatusId] = useState<string>('all');

  // Multi-row selection for bulk actions
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

  // Expanded nodes in tree mode
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    'wi-proj-q4': true,
    'wi-task-build-dash': true,
    'wi-proj-onboarding': true,
  });

  // Inline edit popovers
  const [activeInlineCell, setActiveInlineCell] = useState<{
    itemId: string;
    field: 'status' | 'priority' | 'dueDate' | 'blockedReason';
  } | null>(null);
  const [blockedReasonInput, setBlockedReasonInput] = useState('');

  const windowDays =
    dueSoonUnit === 'weeks' ? dueSoonWindow * 7 : dueSoonUnit === 'months' ? dueSoonWindow * 30 : dueSoonWindow;

  // Filter & sort pipeline
  const filteredItems = useMemo(() => {
    return workItems.filter((item) => {
      if (item.isArchived) return false;

      // Scope
      if (scope !== 'all' && item.itemType !== scope) return false;

      const status = statusMap.get(item.statusId);
      const isClosed = status?.stateGroup === 'done' || status?.stateGroup === 'cancelled';
      const dl = getDeadlineInfo(item.dueDate, status, todayStr, windowDays);

      // Tabs filter
      if (activeTab === 'open' && isClosed) return false;
      if (activeTab === 'overdue' && (isClosed || dl.flag !== 'overdue')) return false;
      if (activeTab === 'due_soon' && (isClosed || (dl.flag !== 'due_today' && dl.flag !== 'due_soon')))
        return false;
      if (activeTab === 'ceo') {
        if (!item.needsCeoAttention) return false;
        const ceoStat = ceoStatusMap.get(item.ceoAttentionStatusId ?? '');
        if (ceoStat?.isFinal) return false;
      }

      // Department filter
      if (selectedDeptId !== 'all' && !item.departmentIds.includes(selectedDeptId)) return false;

      // Priority filter
      if (selectedPriorityId !== 'all' && item.priorityId !== selectedPriorityId) return false;

      // Status filter
      if (selectedStatusId !== 'all' && item.statusId !== selectedStatusId) return false;

      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesDesc = item.description?.toLowerCase().includes(q);
        const matchesReason = item.blockedReason?.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesReason) return false;
      }

      return true;
    });
  }, [
    workItems,
    scope,
    activeTab,
    selectedDeptId,
    selectedPriorityId,
    selectedStatusId,
    searchQuery,
    statusMap,
    ceoStatusMap,
    todayStr,
    windowDays,
  ]);

  // Default Sort rule per spec Section 13.4:
  // (1) Needs CEO Attention first
  // (2) Open items (soonest due date first)
  // (3) Completed items
  // (4) Cancelled items last
  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      // 1. CEO attention
      const aCeo = a.needsCeoAttention && !ceoStatusMap.get(a.ceoAttentionStatusId ?? '')?.isFinal;
      const bCeo = b.needsCeoAttention && !ceoStatusMap.get(b.ceoAttentionStatusId ?? '')?.isFinal;
      if (aCeo && !bCeo) return -1;
      if (!aCeo && bCeo) return 1;

      // 2. Open vs closed
      const aStat = statusMap.get(a.statusId);
      const bStat = statusMap.get(b.statusId);
      const aDone = aStat?.stateGroup === 'done';
      const bDone = bStat?.stateGroup === 'done';
      const aCancelled = aStat?.stateGroup === 'cancelled';
      const bCancelled = bStat?.stateGroup === 'cancelled';

      if (!aDone && !aCancelled && (bDone || bCancelled)) return -1;
      if ((aDone || aCancelled) && !bDone && !bCancelled) return 1;
      if (aDone && bCancelled) return -1;
      if (aCancelled && bDone) return 1;

      // 3. Due dates soonest first
      if (a.dueDate && b.dueDate) {
        return a.dueDate.localeCompare(b.dueDate);
      }
      if (a.dueDate && !b.dueDate) return -1;
      if (!a.dueDate && b.dueDate) return 1;

      // 4. Priority rank
      const aRank = priorityMap.get(a.priorityId)?.rank ?? 0;
      const bRank = priorityMap.get(b.priorityId)?.rank ?? 0;
      return bRank - aRank;
    });
  }, [filteredItems, ceoStatusMap, statusMap, priorityMap]);

  // Tree items ordering
  const treeRows = useMemo<Array<{ item: WorkItem; depth: number; hasChildren: boolean }>>(() => {
    if (viewMode !== 'tree') {
      return sortedItems.map((item) => ({ item, depth: 0, hasChildren: false }));
    }

    // Build hierarchy map
    const rootItems = sortedItems.filter((i) => !i.parentId || !workItems.some((w) => w.id === i.parentId));
    const result: Array<{ item: WorkItem; depth: number; hasChildren: boolean }> = [];

    function traverse(node: WorkItem, depth: number) {
      const children = workItems.filter((w) => w.parentId === node.id && !w.isArchived);
      result.push({ item: node, depth, hasChildren: children.length > 0 });
      if (expandedNodes[node.id]) {
        for (const child of children) {
          traverse(child, depth + 1);
        }
      }
    }

    for (const root of rootItems) {
      traverse(root, 0);
    }
    return result;
  }, [sortedItems, viewMode, expandedNodes, workItems]);

  const toggleNode = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const hasActiveFilters =
    selectedDeptId !== 'all' ||
    selectedPriorityId !== 'all' ||
    selectedStatusId !== 'all' ||
    searchQuery.trim().length > 0 ||
    scope !== 'all' ||
    activeTab !== 'open';

  const clearAllFilters = () => {
    setSelectedDeptId('all');
    setSelectedPriorityId('all');
    setSelectedStatusId('all');
    setSearchQuery('');
    setScope('all');
    setActiveTab('open');
  };

  // Bulk actions
  const handleBulkStatusChange = (statusId: string) => {
    for (const id of selectedItemIds) {
      inlineUpdateWorkItem(id, 'statusId', statusId);
    }
    setSelectedItemIds([]);
  };

  const handleBulkArchive = () => {
    for (const id of selectedItemIds) {
      archiveWorkItem(id);
    }
    setSelectedItemIds([]);
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Type', 'Name', 'Status', 'Priority', 'Department', 'Due Date', 'CEO Attention'];
    const rows = sortedItems.map((i) => [
      i.id,
      i.itemType,
      `"${i.name.replace(/"/g, '""')}"`,
      statusMap.get(i.statusId)?.name ?? '',
      priorityMap.get(i.priorityId)?.name ?? '',
      departmentMap.get(i.departmentIds[0])?.name ?? '',
      i.dueDate ?? '',
      i.needsCeoAttention ? 'YES' : 'NO',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `align_tasks_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 pb-20 select-none">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--text)]">Tasks</h1>
          <p className="text-xs text-[var(--text-3)] mt-0.5">
            Operational work ledger for G&E department and cross-functional teams
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)] px-3 py-1.5 text-xs font-medium text-[var(--text)] shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 text-[var(--text-2)]" />
            <span>Export CSV</span>
          </button>
          {canEdit && (
            <button
              onClick={() => {
                setNewItemDefaultType('task');
                setIsNewItemOpen(true);
              }}
              className="flex items-center gap-1.5 rounded-md bg-[var(--brand-600)] hover:bg-[var(--brand-700)] px-3 py-1.5 text-xs font-semibold text-white shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New task</span>
            </button>
          )}
        </div>
      </div>

      {/* Page Tabs per spec Section 9.1 */}
      <div className="flex border-b border-[var(--border)] text-sm">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex items-center gap-1.5 pb-2.5 px-3 font-medium transition-colors cursor-pointer ${
            activeTab === 'all'
              ? 'border-b-2 border-[var(--brand-600)] text-[var(--brand-600)] font-semibold'
              : 'text-[var(--text-2)] hover:text-[var(--text)]'
          }`}
        >
          <span>All</span>
          <span className="text-xs text-[var(--text-3)] tabular-nums">
            {workItems.filter((i) => !i.isArchived).length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('open')}
          className={`flex items-center gap-1.5 pb-2.5 px-3 font-medium transition-colors cursor-pointer ${
            activeTab === 'open'
              ? 'border-b-2 border-[var(--brand-600)] text-[var(--brand-600)] font-semibold'
              : 'text-[var(--text-2)] hover:text-[var(--text)]'
          }`}
        >
          <span>Open</span>
        </button>
        <button
          onClick={() => setActiveTab('overdue')}
          className={`flex items-center gap-1.5 pb-2.5 px-3 font-medium transition-colors cursor-pointer ${
            activeTab === 'overdue'
              ? 'border-b-2 border-[var(--danger-fg)] text-[var(--danger-fg)] font-semibold'
              : 'text-[var(--text-2)] hover:text-[var(--text)]'
          }`}
        >
          <span>Overdue</span>
        </button>
        <button
          onClick={() => setActiveTab('due_soon')}
          className={`flex items-center gap-1.5 pb-2.5 px-3 font-medium transition-colors cursor-pointer ${
            activeTab === 'due_soon'
              ? 'border-b-2 border-[var(--brand-600)] text-[var(--brand-600)] font-semibold'
              : 'text-[var(--text-2)] hover:text-[var(--text)]'
          }`}
        >
          <span>Due next {dueSoonWindow} {dueSoonUnit}</span>
        </button>
        <button
          onClick={() => setActiveTab('ceo')}
          className={`flex items-center gap-1.5 pb-2.5 px-3 font-medium transition-colors cursor-pointer ${
            activeTab === 'ceo'
              ? 'border-b-2 border-[var(--attention-fg)] text-[var(--attention-fg)] font-semibold'
              : 'text-[var(--text-2)] hover:text-[var(--text)]'
          }`}
        >
          <Flag className="h-3.5 w-3.5 fill-[var(--attention-fg)] text-[var(--attention-fg)]" />
          <span>Needs CEO attention</span>
        </button>
      </div>

      {/* Scope segmented control + Filters row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Level 1 Scope control: All | Projects | Tasks */}
          <div className="inline-flex rounded-md border border-[var(--border)] bg-[var(--surface-2)] p-0.5 text-xs font-medium">
            <button
              onClick={() => setScope('all')}
              className={`rounded px-2.5 py-1 transition-colors cursor-pointer ${
                scope === 'all'
                  ? 'bg-[var(--surface)] text-[var(--text)] shadow-2xs font-semibold'
                  : 'text-[var(--text-2)] hover:text-[var(--text)]'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setScope('project')}
              className={`rounded px-2.5 py-1 transition-colors cursor-pointer ${
                scope === 'project'
                  ? 'bg-[var(--surface)] text-[var(--text)] shadow-2xs font-semibold'
                  : 'text-[var(--text-2)] hover:text-[var(--text)]'
              }`}
            >
              Projects
            </button>
            <button
              onClick={() => setScope('task')}
              className={`rounded px-2.5 py-1 transition-colors cursor-pointer ${
                scope === 'task'
                  ? 'bg-[var(--surface)] text-[var(--text)] shadow-2xs font-semibold'
                  : 'text-[var(--text-2)] hover:text-[var(--text)]'
              }`}
            >
              Tasks
            </button>
          </div>

          {/* Tree / Flat Toggle */}
          <button
            onClick={() => setViewMode(viewMode === 'flat' ? 'tree' : 'flat')}
            className={`flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
              viewMode === 'tree'
                ? 'border-[var(--brand-border)] bg-[var(--brand-subtle)] text-[var(--brand-600)] font-semibold'
                : 'border-[var(--border-strong)] bg-[var(--surface)] text-[var(--text-2)] hover:text-[var(--text)]'
            }`}
          >
            {viewMode === 'tree' ? <FolderTree className="h-3.5 w-3.5" /> : <List className="h-3.5 w-3.5" />}
            <span>{viewMode === 'tree' ? 'Tree view' : 'Flat view'}</span>
          </button>

          {/* Search box */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-[var(--text-3)]" />
            <input
              type="text"
              placeholder="Filter tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 rounded-md border border-[var(--border-strong)] bg-[var(--surface)] pl-8 pr-3 text-xs text-[var(--text)] placeholder-[var(--text-3)] focus:border-[var(--brand-600)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-600)] w-44 sm:w-56"
            />
          </div>

          {/* Department filter */}
          <select
            value={selectedDeptId}
            onChange={(e) => setSelectedDeptId(e.target.value)}
            className="h-8 rounded-md border border-[var(--border-strong)] bg-[var(--surface)] px-2.5 text-xs font-medium text-[var(--text-2)] hover:bg-[var(--surface-2)] cursor-pointer focus:outline-none focus:ring-1 focus:ring-[var(--brand-600)]"
          >
            <option value="all">Department: All</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                Dept: {d.name}
              </option>
            ))}
          </select>

          {/* Priority filter */}
          <select
            value={selectedPriorityId}
            onChange={(e) => setSelectedPriorityId(e.target.value)}
            className="h-8 rounded-md border border-[var(--border-strong)] bg-[var(--surface)] px-2.5 text-xs font-medium text-[var(--text-2)] hover:bg-[var(--surface-2)] cursor-pointer focus:outline-none focus:ring-1 focus:ring-[var(--brand-600)]"
          >
            <option value="all">Priority: All</option>
            {priorities.map((p) => (
              <option key={p.id} value={p.id}>
                Priority: {p.name}
              </option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={selectedStatusId}
            onChange={(e) => setSelectedStatusId(e.target.value)}
            className="h-8 rounded-md border border-[var(--border-strong)] bg-[var(--surface)] px-2.5 text-xs font-medium text-[var(--text-2)] hover:bg-[var(--surface-2)] cursor-pointer focus:outline-none focus:ring-1 focus:ring-[var(--brand-600)]"
          >
            <option value="all">Status: All</option>
            {statuses.map((s) => (
              <option key={s.id} value={s.id}>
                Status: {s.name}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-xs font-medium text-[var(--brand-600)] hover:underline flex items-center gap-1 cursor-pointer ml-1"
            >
              <X className="h-3.5 w-3.5" />
              <span>Clear filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary strip below filters per section 12.1 */}
      <SummaryStrip
        selectedSegment={
          activeTab === 'open'
            ? 'open'
            : activeTab === 'overdue'
            ? 'overdue'
            : activeTab === 'due_soon'
            ? 'due_soon'
            : activeTab === 'ceo'
            ? 'ceo'
            : null
        }
        onSelectSegment={(segment) => {
          if (segment === 'ceo') setActiveTab('ceo');
          else if (segment === 'open') setActiveTab('open');
          else if (segment === 'overdue') setActiveTab('overdue');
          else if (segment === 'due_soon') setActiveTab('due_soon');
          else setActiveTab('all');
        }}
      />

      {/* Dense Data Table */}
      <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] shadow-2xs overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--surface-2)] text-[11px] font-semibold text-[var(--text-2)] uppercase tracking-wider h-9">
              <th className="w-10 px-3 text-center">
                <input
                  type="checkbox"
                  checked={
                    sortedItems.length > 0 &&
                    selectedItemIds.length === sortedItems.length
                  }
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedItemIds(sortedItems.map((i) => i.id));
                    } else {
                      setSelectedItemIds([]);
                    }
                  }}
                  className="rounded border-[var(--border-strong)] text-[var(--brand-600)] focus:ring-[var(--brand-600)] cursor-pointer"
                />
              </th>
              <th className="w-8 px-1 text-center">
                <Flag className="h-3 w-3 text-[var(--attention-fg)]" />
              </th>
              <th className="px-3 min-w-[280px]">Name</th>
              <th className="px-3 w-32">Status</th>
              <th className="px-3 w-28">Priority</th>
              <th className="px-3 w-32">Department</th>
              <th className="px-3 w-28">Due Date</th>
              <th className="px-3 w-32">Days Left</th>
              <th className="px-3 w-36">Progress</th>
              <th className="px-3 w-32">Next Follow-up</th>
              <th className="px-3 w-28">CEO Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)] text-xs">
            {treeRows.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-12 text-center text-[var(--text-3)]">
                  No items match the selected filters.
                </td>
              </tr>
            ) : (
              treeRows.map(({ item, depth, hasChildren }) =>
                renderRow(item, depth, hasChildren)
              )
            )}
          </tbody>
        </table>
      </div>

      {/* Floating Bulk Action Bar */}
      {selectedItemIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 shadow-lg animate-in slide-in-from-bottom-4">
          <span className="text-xs font-semibold text-[var(--text)] tabular-nums">
            {selectedItemIds.length} selected
          </span>
          <div className="h-4 w-px bg-[var(--border)]" />
          {canEdit && (
            <>
              <button
                onClick={() => handleBulkStatusChange('stat-completed')}
                className="text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                Mark Completed
              </button>
              <button
                onClick={handleBulkArchive}
                className="text-xs font-medium text-[var(--danger-fg)] hover:underline cursor-pointer flex items-center gap-1"
              >
                <Archive className="h-3 w-3" />
                <span>Archive</span>
              </button>
            </>
          )}
          <button
            onClick={() => setSelectedItemIds([])}
            className="text-xs text-[var(--text-3)] hover:text-[var(--text)] cursor-pointer"
          >
            Clear
          </button>
        </div>
      )}

      {/* Popover for Blocked Reason when user chooses Blocked status inline */}
      {activeInlineCell?.field === 'blockedReason' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-sm rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
              <OctagonX className="h-4 w-4 text-[var(--blocked-fg)]" />
              <span>Why is this item blocked?</span>
            </div>
            <p className="text-xs text-[var(--text-2)]">
              Per specification, a reason is required so the executive team understands the bottleneck.
            </p>
            <textarea
              autoFocus
              value={blockedReasonInput}
              onChange={(e) => setBlockedReasonInput(e.target.value)}
              placeholder="e.g. Waiting for API access from Engineering Core..."
              rows={3}
              className="w-full rounded border border-[var(--border-strong)] bg-[var(--surface)] p-2 text-xs text-[var(--text)] focus:border-[var(--brand-600)] focus:outline-none"
            />
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setActiveInlineCell(null)}
                className="rounded px-3 py-1.5 text-xs font-medium text-[var(--text-2)] hover:bg-[var(--surface-2)]"
              >
                Cancel
              </button>
              <button
                disabled={!blockedReasonInput.trim()}
                onClick={() => {
                  inlineUpdateWorkItem(
                    activeInlineCell.itemId,
                    'statusId',
                    'stat-blocked',
                    blockedReasonInput.trim()
                  );
                  inlineUpdateWorkItem(
                    activeInlineCell.itemId,
                    'blockedReason',
                    blockedReasonInput.trim()
                  );
                  setActiveInlineCell(null);
                  setBlockedReasonInput('');
                }}
                className="rounded bg-[var(--brand-600)] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
              >
                Save reason
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  function renderRow(item: WorkItem, depth: number, hasChildren: boolean) {
    const isSelected = selectedItemIds.includes(item.id);
    const status = statusMap.get(item.statusId);
    const priority = priorityMap.get(item.priorityId);
    const dept = departmentMap.get(item.departmentIds[0]);
    const ceoStatus = ceoStatusMap.get(item.ceoAttentionStatusId ?? '');
    const dl = getDeadlineInfo(item.dueDate, status, todayStr, windowDays);

    const { progress, childWeights } = computeItemProgressAndWeights(
      item,
      workItems,
      statusMap,
      priorityMap
    );
    const hasManualWeights = Object.values(childWeights).some((w) => w.isManual);
    const directChildrenCount = workItems.filter(
      (w) => w.parentId === item.id && !w.isArchived
    ).length;

    // Next scheduled follow-up
    const nextFu = followups
      .filter((f) => f.workItemId === item.id && (f.statusId === 'fstat-scheduled' || f.statusId === 'fstat-missed'))
      .sort((a, b) => a.followupDate.localeCompare(b.followupDate))[0];

    const isCompact = density === 'compact';
    const rowHeight = isCompact ? 'h-9' : 'h-11';

    return (
      <tr
        key={item.id}
        onClick={() => setSelectedItemId(item.id)}
        className={`group transition-colors cursor-pointer ${rowHeight} ${
          isSelected
            ? 'bg-[var(--brand-subtle)]'
            : item.needsCeoAttention
            ? 'bg-[var(--attention-bg)]/40 hover:bg-[var(--attention-bg)]/60'
            : 'hover:bg-[var(--surface-2)]'
        }`}
      >
        {/* Checkbox */}
        <td
          className="px-3 text-center"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedItemIds((prev) => [...prev, item.id]);
              } else {
                setSelectedItemIds((prev) => prev.filter((id) => id !== item.id));
              }
            }}
            className="rounded border-[var(--border-strong)] text-[var(--brand-600)] focus:ring-[var(--brand-600)] cursor-pointer"
          />
        </td>

        {/* Plum CEO flag */}
        <td
          className="px-1 text-center"
          onClick={(e) => {
            e.stopPropagation();
            if (canEdit) toggleCeoAttention(item.id);
          }}
          title={canEdit ? 'Click to toggle CEO Attention flag' : undefined}
        >
          {item.needsCeoAttention ? (
            <Flag className="h-3.5 w-3.5 text-[var(--attention-fg)] fill-[var(--attention-fg)] mx-auto" />
          ) : (
            <Flag className="h-3.5 w-3.5 text-[var(--border-strong)] opacity-0 group-hover:opacity-60 mx-auto transition-opacity" />
          )}
        </td>

        {/* Name with indentation */}
        <td className="px-3 min-w-[280px]">
          <div
            className="flex items-center gap-1.5"
            style={{ paddingLeft: `${depth * 20}px` }}
          >
            {hasChildren ? (
              <button
                onClick={(e) => toggleNode(item.id, e)}
                className="p-0.5 rounded hover:bg-[var(--surface-3)] text-[var(--text-2)] cursor-pointer"
              >
                {expandedNodes[item.id] ? (
                  <ChevronDown className="h-3.5 w-3.5" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5" />
                )}
              </button>
            ) : depth > 0 ? (
              <div className="w-4.5" />
            ) : null}

            {item.itemType === 'project' ? (
              <Folder className="h-3.5 w-3.5 text-[var(--brand-600)] shrink-0" />
            ) : null}

            {item.taskKind === 'recurring' && (
              <span title="Recurring task">
                <Repeat className="h-3 w-3 text-teal-600 dark:text-teal-400 shrink-0" />
              </span>
            )}

            <span
              className={`font-medium truncate ${
                status?.stateGroup === 'cancelled'
                  ? 'line-through text-[var(--text-3)]'
                  : 'text-[var(--text)]'
              }`}
            >
              {item.name}
            </span>

            {item.itemType === 'project' && directChildrenCount > 0 && (
              <span className="text-[11px] text-[var(--text-3)] shrink-0">
                ({directChildrenCount} {directChildrenCount === 1 ? 'task' : 'tasks'})
              </span>
            )}
          </div>
        </td>

        {/* Status chip with inline editor */}
        <td
          className="px-3 w-32"
          onClick={(e) => {
            if (!canEdit) return;
            e.stopPropagation();
            setActiveInlineCell({ itemId: item.id, field: 'status' });
          }}
        >
          <div className="relative">
            {renderStatusChip(status)}
            {activeInlineCell?.itemId === item.id && activeInlineCell?.field === 'status' && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveInlineCell(null);
                  }}
                />
                <div className="absolute left-0 top-full mt-1 z-50 w-36 rounded-md border border-[var(--border)] bg-[var(--surface)] py-1 shadow-lg">
                  {statuses.map((s) => (
                    <button
                      key={s.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (s.stateGroup === 'blocked') {
                          setActiveInlineCell({ itemId: item.id, field: 'blockedReason' });
                          setBlockedReasonInput(item.blockedReason || '');
                        } else {
                          inlineUpdateWorkItem(item.id, 'statusId', s.id);
                          setActiveInlineCell(null);
                        }
                      }}
                      className="flex w-full items-center justify-between px-3 py-1.5 text-xs text-[var(--text)] hover:bg-[var(--surface-2)] cursor-pointer"
                    >
                      <span>{s.name}</span>
                      {s.id === item.statusId && <Check className="h-3 w-3 text-[var(--brand-600)]" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </td>

        {/* Priority */}
        <td
          className="px-3 w-28"
          onClick={(e) => {
            if (!canEdit) return;
            e.stopPropagation();
            setActiveInlineCell({ itemId: item.id, field: 'priority' });
          }}
        >
          <div className="relative flex items-center gap-1.5 text-[var(--text-2)] hover:text-[var(--text)]">
            {renderPriorityBars(priority?.rank ?? 1, priority?.name === 'Urgent')}
            <span className="text-xs">{priority?.name}</span>

            {activeInlineCell?.itemId === item.id && activeInlineCell?.field === 'priority' && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveInlineCell(null);
                  }}
                />
                <div className="absolute left-0 top-full mt-1 z-50 w-32 rounded-md border border-[var(--border)] bg-[var(--surface)] py-1 shadow-lg">
                  {priorities.map((p) => (
                    <button
                      key={p.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        inlineUpdateWorkItem(item.id, 'priorityId', p.id);
                        setActiveInlineCell(null);
                      }}
                      className="flex w-full items-center justify-between px-3 py-1.5 text-xs text-[var(--text)] hover:bg-[var(--surface-2)] cursor-pointer"
                    >
                      <span>{p.name}</span>
                      {p.id === item.priorityId && <Check className="h-3 w-3 text-[var(--brand-600)]" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </td>

        {/* Department with color dot */}
        <td className="px-3 w-32 truncate">
          {dept ? (
            <div className="flex items-center gap-1.5 truncate">
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: dept.color }}
              />
              <span className="text-xs text-[var(--text)] truncate">{dept.name}</span>
              {item.departmentIds.length > 1 && (
                <span className="text-[10px] text-[var(--text-3)] font-semibold">
                  +{item.departmentIds.length - 1}
                </span>
              )}
            </div>
          ) : (
            <span className="text-[var(--text-3)]">—</span>
          )}
        </td>

        {/* Due Date */}
        <td className="px-3 w-28 tabular-nums text-xs text-[var(--text-2)]">
          {item.dueDate || '—'}
        </td>

        {/* Days Left & Deadline Flag */}
        <td className="px-3 w-32 tabular-nums">
          <div className="flex items-center gap-1.5 text-xs">
            {dl.flag === 'overdue' ? (
              <span className="flex items-center gap-1 text-[var(--danger-fg)] font-semibold">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{dl.text}</span>
              </span>
            ) : dl.flag === 'due_today' ? (
              <span className="flex items-center gap-1 text-[var(--due-today-fg)] font-semibold">
                <Clock className="h-3.5 w-3.5 shrink-0" />
                <span>Due today</span>
              </span>
            ) : dl.flag === 'due_soon' ? (
              <span className="text-[var(--due-soon-fg)] font-medium">
                {dl.text}
              </span>
            ) : dl.flag === 'completed' ? (
              <span className="text-[var(--success-fg)] font-medium">
                Completed
              </span>
            ) : (
              <span className="text-[var(--text-2)]">{dl.text}</span>
            )}
          </div>
        </td>

        {/* Progress with roll-up bar */}
        <td className="px-3 w-36">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-[var(--surface-3)] overflow-hidden">
              {progress !== null ? (
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${progress}%`,
                    backgroundColor:
                      progress === 100
                        ? 'var(--success-fg)'
                        : 'var(--brand-600)',
                  }}
                />
              ) : null}
            </div>
            <div className="flex items-center gap-1 text-xs tabular-nums text-[var(--text)] font-semibold shrink-0">
              <span>{progress !== null ? `${progress}%` : 'N/A'}</span>
              {hasManualWeights && (
                <span title="Weights set manually">
                  <Lock className="h-3 w-3 text-[var(--text-3)]" />
                </span>
              )}
            </div>
          </div>
        </td>

        {/* Next follow-up */}
        <td className="px-3 w-32 text-xs">
          {nextFu ? (
            nextFu.statusId === 'fstat-missed' ? (
              <span className="inline-flex items-center rounded bg-[var(--danger-bg)] text-[var(--danger-fg)] px-1.5 py-0.5 text-[10px] font-semibold">
                Missed ({nextFu.followupDate})
              </span>
            ) : (
              <span className="tabular-nums text-[var(--text-2)]">
                {nextFu.followupDate}
              </span>
            )
          ) : (
            <span className="text-[var(--text-3)]">—</span>
          )}
        </td>

        {/* CEO Status */}
        <td className="px-3 w-28">
          {item.needsCeoAttention && ceoStatus ? (
            <span className="inline-flex rounded border border-[var(--attention-border)] bg-[var(--attention-bg)] px-2 py-0.5 text-[10px] font-semibold text-[var(--attention-fg)]">
              {ceoStatus.name}
            </span>
          ) : (
            <span className="text-[var(--text-3)]">—</span>
          )}
        </td>
      </tr>
    );
  }

  function renderStatusChip(status: Status | undefined) {
    if (!status) return <span className="text-[var(--text-3)]">—</span>;

    const baseClass =
      'inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium transition-colors cursor-pointer';

    switch (status.stateGroup) {
      case 'not_started':
        return (
          <span className={`${baseClass} bg-[var(--surface-3)] text-[var(--text-2)]`}>
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--text-3)]" />
            {status.name}
          </span>
        );
      case 'active':
        return (
          <span className={`${baseClass} bg-[var(--brand-subtle)] text-[var(--brand-600)]`}>
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-600)]" />
            {status.name}
          </span>
        );
      case 'blocked':
        return (
          <span
            className={`${baseClass} bg-red-100 dark:bg-red-950/60 text-[var(--blocked-fg)] hatch-blocked border border-red-200 dark:border-red-900`}
          >
            <OctagonX className="h-3 w-3" />
            {status.name}
          </span>
        );
      case 'done':
        return (
          <span className={`${baseClass} bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300`}>
            <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
            {status.name}
          </span>
        );
      case 'cancelled':
        return (
          <span className={`${baseClass} bg-[var(--surface-3)] text-[var(--text-3)]`}>
            {status.name}
          </span>
        );
      default:
        return <span>{status.name}</span>;
    }
  }

  function renderPriorityBars(rank: number, isUrgent: boolean) {
    const totalBars = 4;
    return (
      <div className="flex items-end gap-0.5 h-3">
        {Array.from({ length: totalBars }).map((_, i) => {
          const filled = i < rank;
          const barHeight = `${((i + 1) / totalBars) * 100}%`;
          return (
            <div
              key={i}
              className={`w-1 rounded-2xs ${
                filled
                  ? isUrgent
                    ? 'bg-[var(--danger-fg)]'
                    : 'bg-[var(--text-2)]'
                  : 'bg-[var(--border-strong)]'
              }`}
              style={{ height: barHeight }}
            />
          );
        })}
      </div>
    );
  }
};
