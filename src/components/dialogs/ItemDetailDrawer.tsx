/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  AlertCircle,
  Archive,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Flag,
  Link2,
  Lock,
  MessageSquare,
  OctagonX,
  Plus,
  Repeat,
  Trash2,
  Unlock,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  computeItemProgressAndWeights,
  countLeaves,
  getDeadlineInfo,
} from '../../utils/engine';

export const ItemDetailDrawer: React.FC = () => {
  const {
    selectedItemId,
    setSelectedItemId,
    workItems,
    statusMap,
    priorityMap,
    departmentMap,
    categoryMap,
    ceoStatusMap,
    todayStr,
    dueSoonWindow,
    updateWorkItem,
    archiveWorkItem,
    toggleCeoAttention,
    setManualWeight,
    resetWeightToAuto,
    followups,
    createFollowup,
    logFollowupOutcome,
    postponeFollowup,
    cancelFollowup,
    itemLinks,
    addLink,
    removeLink,
    activityLogs,
    canEdit,
    isCeoViewer,
    departments,
    subDomains,
    teamMembers,
    statuses,
    priorities,
    categories,
    ceoAttentionStatuses,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'children' | 'followups' | 'links' | 'activity'>('overview');

  // Manual weight editor state
  const [editingWeightChildId, setEditingWeightChildId] = useState<string | null>(null);
  const [editingWeightValue, setEditingWeightValue] = useState<number>(0);

  // Follow-up form
  const [newFuDate, setNewFuDate] = useState(todayStr);
  const [newFuRemarks, setNewFuRemarks] = useState('');
  const [isAddingFu, setIsAddingFu] = useState(false);

  // Link form
  const [newLinkTargetId, setNewLinkTargetId] = useState('');

  if (!selectedItemId) return null;
  const item = workItems.find((w) => w.id === selectedItemId);
  if (!item) return null;

  const status = statusMap.get(item.statusId);
  const priority = priorityMap.get(item.priorityId);
  const dept = departmentMap.get(item.departmentIds[0]);
  const ceoStatus = ceoStatusMap.get(item.ceoAttentionStatusId ?? '');
  const category = categoryMap.get(item.categoryId);
  const dl = getDeadlineInfo(item.dueDate, status, todayStr, dueSoonWindow);

  const { progress, childWeights } = computeItemProgressAndWeights(
    item,
    workItems,
    statusMap,
    priorityMap
  );
  const children = workItems.filter((w) => w.parentId === item.id && !w.isArchived);

  // Calculate sum of child weights to warn if manual weights != 100
  const totalChildWeights = Object.values(childWeights).reduce((acc, c) => acc + c.weight, 0);

  // Follow-ups for this item
  const itemFollowups = followups
    .filter((f) => f.workItemId === item.id)
    .sort((a, b) => b.followupDate.localeCompare(a.followupDate));

  // Links for this item
  const incomingLinks = itemLinks.filter(
    (l) => l.targetType === 'work_item' && l.targetId === item.id
  );
  const outgoingLinks = itemLinks.filter(
    (l) => l.sourceType === 'work_item' && l.sourceId === item.id
  );

  // Activity logs for this item
  const itemLogs = activityLogs.filter(
    (a) => a.entityType === 'work_item' && a.entityId === item.id
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">
      <div
        className="fixed inset-0 bg-black/40 transition-opacity"
        onClick={() => setSelectedItemId(null)}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-2xl bg-[var(--surface)] border-l border-[var(--border)] shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[var(--surface-2)]">
            <div className="flex items-center gap-2 overflow-hidden pr-4">
              {item.needsCeoAttention && (
                <Flag className="h-4 w-4 text-[var(--attention-fg)] fill-[var(--attention-fg)] shrink-0" />
              )}
              <span className="rounded bg-[var(--surface-3)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--text-2)] uppercase shrink-0">
                {item.itemType}
              </span>
              <h2 className="text-sm font-bold text-[var(--text)] truncate">
                {item.name}
              </h2>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {canEdit && (
                <button
                  onClick={() => {
                    archiveWorkItem(item.id);
                    setSelectedItemId(null);
                  }}
                  className="p-1 rounded text-[var(--text-3)] hover:text-[var(--danger-fg)] hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                  title="Archive item"
                >
                  <Archive className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={() => setSelectedItemId(null)}
                className="p-1 rounded text-[var(--text-3)] hover:text-[var(--text)] hover:bg-[var(--surface-3)] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Subheader Tabs */}
          <div className="flex border-b border-[var(--border)] px-6 text-xs bg-[var(--surface)]">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-3 px-3 font-semibold transition-colors cursor-pointer ${
                activeTab === 'overview'
                  ? 'border-b-2 border-[var(--brand-600)] text-[var(--brand-600)]'
                  : 'text-[var(--text-2)] hover:text-[var(--text)]'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('children')}
              className={`py-3 px-3 font-semibold transition-colors cursor-pointer ${
                activeTab === 'children'
                  ? 'border-b-2 border-[var(--brand-600)] text-[var(--brand-600)]'
                  : 'text-[var(--text-2)] hover:text-[var(--text)]'
              }`}
            >
              Children & Weights ({children.length})
            </button>
            <button
              onClick={() => setActiveTab('followups')}
              className={`py-3 px-3 font-semibold transition-colors cursor-pointer ${
                activeTab === 'followups'
                  ? 'border-b-2 border-[var(--brand-600)] text-[var(--brand-600)]'
                  : 'text-[var(--text-2)] hover:text-[var(--text)]'
              }`}
            >
              Follow-ups ({itemFollowups.length})
            </button>
            <button
              onClick={() => setActiveTab('links')}
              className={`py-3 px-3 font-semibold transition-colors cursor-pointer ${
                activeTab === 'links'
                  ? 'border-b-2 border-[var(--brand-600)] text-[var(--brand-600)]'
                  : 'text-[var(--text-2)] hover:text-[var(--text)]'
              }`}
            >
              Links ({incomingLinks.length + outgoingLinks.length})
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`py-3 px-3 font-semibold transition-colors cursor-pointer ${
                activeTab === 'activity'
                  ? 'border-b-2 border-[var(--brand-600)] text-[var(--brand-600)]'
                  : 'text-[var(--text-2)] hover:text-[var(--text)]'
              }`}
            >
              Activity
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* 1. OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Description */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--text)]">Description</label>
                  {canEdit ? (
                    <textarea
                      rows={3}
                      value={item.description || ''}
                      onChange={(e) => updateWorkItem(item.id, { description: e.target.value })}
                      placeholder="Add strategic context or objectives..."
                      className="w-full rounded border border-[var(--border-strong)] bg-[var(--surface)] p-2.5 text-xs text-[var(--text)] focus:border-[var(--brand-600)] focus:outline-none"
                    />
                  ) : (
                    <p className="text-xs text-[var(--text-2)] bg-[var(--surface-2)] p-2.5 rounded">
                      {item.description || 'No description provided.'}
                    </p>
                  )}
                </div>

                {/* CEO Attention Alert & Note */}
                <div className="rounded-md border border-[var(--attention-border)] bg-[var(--attention-bg)] p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Flag className="h-4 w-4 text-[var(--attention-fg)] fill-[var(--attention-fg)]" />
                      <span className="text-xs font-bold text-[var(--attention-fg)]">
                        Needs CEO Attention
                      </span>
                    </div>
                    {canEdit && (
                      <button
                        onClick={() => toggleCeoAttention(item.id)}
                        className="text-xs font-semibold text-[var(--attention-fg)] hover:underline cursor-pointer"
                      >
                        {item.needsCeoAttention ? 'Clear flag' : 'Flag for CEO'}
                      </button>
                    )}
                  </div>

                  {item.needsCeoAttention && (
                    <div className="space-y-2 pt-1">
                      {canEdit ? (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-[var(--text-2)]">Status:</span>
                            <select
                              value={item.ceoAttentionStatusId || 'ceo-pending'}
                              onChange={(e) => updateWorkItem(item.id, { ceoAttentionStatusId: e.target.value })}
                              className="rounded border border-[var(--border-strong)] bg-[var(--surface)] px-2 py-1 text-xs font-medium"
                            >
                              {ceoAttentionStatuses.map((cs) => (
                                <option key={cs.id} value={cs.id}>
                                  {cs.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <input
                            type="text"
                            value={item.ceoNote || ''}
                            onChange={(e) => updateWorkItem(item.id, { ceoNote: e.target.value })}
                            placeholder="Add reason for CEO escalation..."
                            className="w-full rounded border border-[var(--border-strong)] bg-[var(--surface)] px-2.5 py-1 text-xs text-[var(--text)]"
                          />
                        </>
                      ) : (
                        <p className="text-xs text-[var(--attention-fg)] font-medium">
                          Note: {item.ceoNote || 'Flagged for CEO awareness.'}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Properties Grid */}
                <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-4 space-y-3">
                  <h3 className="text-xs font-bold text-[var(--text)] uppercase tracking-wider">
                    Properties
                  </h3>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    {/* Status */}
                    <div>
                      <span className="text-[var(--text-3)] block mb-1">Status</span>
                      {canEdit ? (
                        <select
                          value={item.statusId}
                          onChange={(e) => updateWorkItem(item.id, { statusId: e.target.value })}
                          className="w-full rounded border border-[var(--border-strong)] bg-[var(--surface)] px-2 py-1 text-xs font-medium"
                        >
                          {statuses.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="font-semibold text-[var(--text)]">{status?.name}</span>
                      )}
                    </div>

                    {/* Priority */}
                    <div>
                      <span className="text-[var(--text-3)] block mb-1">Priority</span>
                      {canEdit ? (
                        <select
                          value={item.priorityId}
                          onChange={(e) => updateWorkItem(item.id, { priorityId: e.target.value })}
                          className="w-full rounded border border-[var(--border-strong)] bg-[var(--surface)] px-2 py-1 text-xs font-medium"
                        >
                          {priorities.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} (Cap {p.weightCap}%)
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="font-semibold text-[var(--text)]">{priority?.name}</span>
                      )}
                    </div>

                    {/* Department */}
                    <div>
                      <span className="text-[var(--text-3)] block mb-1">Department</span>
                      {canEdit ? (
                        <select
                          value={item.departmentIds[0] || ''}
                          onChange={(e) => updateWorkItem(item.id, { departmentIds: [e.target.value] })}
                          className="w-full rounded border border-[var(--border-strong)] bg-[var(--surface)] px-2 py-1 text-xs font-medium"
                        >
                          {departments.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="font-semibold text-[var(--text)]">{dept?.name}</span>
                      )}
                    </div>

                    {/* Category */}
                    <div>
                      <span className="text-[var(--text-3)] block mb-1">Category</span>
                      {canEdit ? (
                        <select
                          value={item.categoryId}
                          onChange={(e) => updateWorkItem(item.id, { categoryId: e.target.value })}
                          className="w-full rounded border border-[var(--border-strong)] bg-[var(--surface)] px-2 py-1 text-xs font-medium"
                        >
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="font-semibold text-[var(--text)]">{category?.name}</span>
                      )}
                    </div>

                    {/* Due Date */}
                    <div>
                      <span className="text-[var(--text-3)] block mb-1">Due Date</span>
                      {canEdit ? (
                        <input
                          type="date"
                          value={item.dueDate || ''}
                          onChange={(e) => updateWorkItem(item.id, { dueDate: e.target.value || undefined })}
                          className="w-full rounded border border-[var(--border-strong)] bg-[var(--surface)] px-2 py-1 text-xs text-[var(--text)]"
                        />
                      ) : (
                        <span className="font-semibold text-[var(--text)] tabular-nums">
                          {item.dueDate || 'No due date'}
                        </span>
                      )}
                    </div>

                    {/* Days Left */}
                    <div>
                      <span className="text-[var(--text-3)] block mb-1">Deadline Status</span>
                      <span className="font-semibold text-[var(--text)] tabular-nums">
                        {dl.text}
                      </span>
                    </div>

                    {/* Progress */}
                    <div>
                      <span className="text-[var(--text-3)] block mb-1">Progress</span>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 rounded-full bg-[var(--surface-3)] overflow-hidden">
                          {progress !== null ? (
                            <div
                              className="h-full rounded-full bg-[var(--brand-600)]"
                              style={{ width: `${progress}%` }}
                            />
                          ) : null}
                        </div>
                        <span className="font-bold text-[var(--text)] tabular-nums">
                          {progress !== null ? `${progress}%` : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. CHILDREN & WEIGHTS TAB */}
            {activeTab === 'children' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-[var(--text)]">Children Weights Breakdown</h3>
                    <p className="text-xs text-[var(--text-3)]">
                      Priority caps enforce fair progress rollups. Manual weights freeze and rebalance remaining siblings.
                    </p>
                  </div>
                </div>

                {children.length === 0 ? (
                  <div className="rounded-md border border-dashed border-[var(--border)] p-8 text-center text-xs text-[var(--text-3)]">
                    No children items under this {item.itemType}.
                  </div>
                ) : (
                  <div className="rounded-md border border-[var(--border)] overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[var(--surface-2)] border-b border-[var(--border)] font-semibold text-[var(--text-2)]">
                        <tr>
                          <th className="p-2.5">Child</th>
                          <th className="p-2.5">Priority</th>
                          <th className="p-2.5 text-center">Leaves</th>
                          <th className="p-2.5 text-right">Weight</th>
                          <th className="p-2.5 text-center w-20">Mode</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border)]">
                        {children.map((child) => {
                          const childPrio = priorityMap.get(child.priorityId);
                          const childInfo = childWeights[child.id] || { weight: 0, isManual: false };
                          const leaves = countLeaves(child.id, workItems, statusMap);

                          return (
                            <tr key={child.id} className="hover:bg-[var(--surface-2)]">
                              <td
                                className="p-2.5 font-medium text-[var(--text)] cursor-pointer hover:underline"
                                onClick={() => setSelectedItemId(child.id)}
                              >
                                {child.name}
                              </td>
                              <td className="p-2.5 text-[var(--text-2)]">
                                {childPrio?.name} (Cap {childPrio?.weightCap}%)
                              </td>
                              <td className="p-2.5 text-center tabular-nums text-[var(--text-2)]">
                                {leaves}
                              </td>
                              <td className="p-2.5 text-right font-bold tabular-nums text-[var(--text)]">
                                {editingWeightChildId === child.id ? (
                                  <div className="flex items-center justify-end gap-1">
                                    <input
                                      type="number"
                                      min={0}
                                      max={100}
                                      value={editingWeightValue}
                                      onChange={(e) => setEditingWeightValue(parseFloat(e.target.value) || 0)}
                                      className="w-14 rounded border border-[var(--brand-600)] bg-[var(--surface)] p-1 text-right text-xs"
                                    />
                                    <button
                                      onClick={() => {
                                        setManualWeight(child.id, editingWeightValue);
                                        setEditingWeightChildId(null);
                                      }}
                                      className="p-1 text-[var(--brand-600)] hover:bg-[var(--surface-3)] rounded"
                                    >
                                      <Check className="h-3 w-3" />
                                    </button>
                                  </div>
                                ) : (
                                  <span
                                    className="cursor-pointer hover:underline"
                                    onClick={() => {
                                      if (canEdit) {
                                        setEditingWeightChildId(child.id);
                                        setEditingWeightValue(childInfo.weight);
                                      }
                                    }}
                                  >
                                    {childInfo.weight}%
                                  </span>
                                )}
                              </td>
                              <td className="p-2.5 text-center">
                                {childInfo.isManual ? (
                                  <button
                                    onClick={() => resetWeightToAuto(child.id)}
                                    className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded cursor-pointer"
                                    title="Manual weight. Click to reset to Auto."
                                  >
                                    <Lock className="h-2.5 w-2.5" />
                                    <span>Manual</span>
                                  </button>
                                ) : (
                                  <span className="text-[10px] text-[var(--text-3)] font-medium">
                                    Auto
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* 3. FOLLOW-UPS TAB (Vertical Timeline) */}
            {activeTab === 'followups' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[var(--text)]">Check-in Audit Log</h3>
                  {canEdit && (
                    <button
                      onClick={() => setIsAddingFu(!isAddingFu)}
                      className="flex items-center gap-1 rounded bg-[var(--brand-600)] px-2.5 py-1 text-xs font-semibold text-white shadow-2xs"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Schedule follow-up</span>
                    </button>
                  )}
                </div>

                {/* Inline form to schedule follow-up */}
                {isAddingFu && (
                  <div className="rounded-md border border-[var(--border)] bg-[var(--surface-2)] p-3 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="date"
                        value={newFuDate}
                        onChange={(e) => setNewFuDate(e.target.value)}
                        className="rounded border border-[var(--border-strong)] bg-[var(--surface)] p-1.5 text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Agenda / check-in purpose..."
                        value={newFuRemarks}
                        onChange={(e) => setNewFuRemarks(e.target.value)}
                        className="rounded border border-[var(--border-strong)] bg-[var(--surface)] p-1.5 text-xs"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setIsAddingFu(false)}
                        className="text-xs px-2 py-1 text-[var(--text-2)]"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          createFollowup({
                            workItemId: item.id,
                            followupDate: newFuDate,
                            statusId: 'fstat-scheduled',
                            remarks: newFuRemarks.trim() || undefined,
                          });
                          setIsAddingFu(false);
                          setNewFuRemarks('');
                        }}
                        className="rounded bg-[var(--brand-600)] px-2.5 py-1 text-xs font-semibold text-white"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                )}

                {itemFollowups.length === 0 ? (
                  <div className="rounded-md border border-dashed border-[var(--border)] p-8 text-center text-xs text-[var(--text-3)]">
                    No follow-ups recorded yet for this item.
                  </div>
                ) : (
                  <div className="relative border-l-2 border-[var(--border)] ml-3 pl-4 space-y-4">
                    {itemFollowups.map((fu) => {
                      const isDone = fu.statusId === 'fstat-done';
                      const isMissed = fu.statusId === 'fstat-missed';
                      const isPostponed = fu.statusId === 'fstat-postponed';

                      return (
                        <div key={fu.id} className="relative group">
                          {/* Dot marker on timeline rail */}
                          <div
                            className={`absolute -left-[23px] top-1 h-3 w-3 rounded-full border-2 border-[var(--surface)] ${
                              isDone
                                ? 'bg-emerald-600'
                                : isMissed
                                ? 'bg-[var(--danger-fg)]'
                                : isPostponed
                                ? 'bg-amber-500'
                                : 'bg-[var(--brand-600)]'
                            }`}
                          />

                          <div className="rounded border border-[var(--border)] bg-[var(--surface)] p-3 space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-[var(--text)] tabular-nums">
                                {fu.followupDate}
                              </span>
                              <span
                                className={`text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded ${
                                  isDone
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : isMissed
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-[var(--surface-3)] text-[var(--text-2)]'
                                }`}
                              >
                                {isDone ? 'Done' : isMissed ? 'Missed' : 'Scheduled'}
                              </span>
                            </div>

                            <p className="text-xs text-[var(--text-2)] whitespace-pre-line">
                              {fu.remarks || '(no outcome recorded)'}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 4. LINKS TAB (Lineage & cycle-guarded connections) */}
            {activeTab === 'links' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-[var(--text)]">Bi-directional Lineage</h3>
                  <p className="text-xs text-[var(--text-3)]">
                    Tracks where this deliverable originated from and what subsequent tasks or meetings it generated.
                  </p>
                </div>

                {/* Add Link */}
                {canEdit && (
                  <div className="flex gap-2">
                    <select
                      value={newLinkTargetId}
                      onChange={(e) => setNewLinkTargetId(e.target.value)}
                      className="flex-1 rounded border border-[var(--border-strong)] bg-[var(--surface)] px-2 py-1 text-xs"
                    >
                      <option value="">Select work item or meeting to link...</option>
                      {workItems
                        .filter((w) => w.id !== item.id && !w.isArchived)
                        .map((w) => (
                          <option key={w.id} value={w.id}>
                            [{w.itemType.toUpperCase()}] {w.name}
                          </option>
                        ))}
                    </select>
                    <button
                      disabled={!newLinkTargetId}
                      onClick={() => {
                        addLink('work_item', item.id, 'work_item', newLinkTargetId);
                        setNewLinkTargetId('');
                      }}
                      className="rounded bg-[var(--brand-600)] px-3 py-1 text-xs font-semibold text-white disabled:opacity-50"
                    >
                      Link
                    </button>
                  </div>
                )}

                {/* Incoming links: Originated from */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-[var(--text-2)]">Originated from</span>
                  {incomingLinks.length === 0 ? (
                    <div className="text-xs text-[var(--text-3)] italic">No upstream source</div>
                  ) : (
                    incomingLinks.map((link) => (
                      <div
                        key={link.id}
                        className="flex items-center justify-between p-2 rounded border border-[var(--border)] bg-[var(--surface-2)] text-xs"
                      >
                        <span className="font-medium text-[var(--text)]">
                          Source: {link.sourceType} ({link.sourceId})
                        </span>
                        {canEdit && (
                          <button
                            onClick={() => removeLink(link.id)}
                            className="text-[var(--text-3)] hover:text-[var(--danger-fg)]"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Outgoing links: Generated */}
                <div className="space-y-1.5 pt-2">
                  <span className="text-xs font-bold text-[var(--text-2)]">Generated items</span>
                  {outgoingLinks.length === 0 ? (
                    <div className="text-xs text-[var(--text-3)] italic">No downstream deliverables</div>
                  ) : (
                    outgoingLinks.map((link) => (
                      <div
                        key={link.id}
                        className="flex items-center justify-between p-2 rounded border border-[var(--border)] bg-[var(--surface-2)] text-xs"
                      >
                        <span className="font-medium text-[var(--text)]">
                          Target: {link.targetType} ({link.targetId})
                        </span>
                        {canEdit && (
                          <button
                            onClick={() => removeLink(link.id)}
                            className="text-[var(--text-3)] hover:text-[var(--danger-fg)]"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* 5. ACTIVITY TAB */}
            {activeTab === 'activity' && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-[var(--text)]">Audit Trail for this Item</h3>
                {itemLogs.length === 0 ? (
                  <div className="text-xs text-[var(--text-3)] text-center py-6">
                    No activity recorded yet.
                  </div>
                ) : (
                  <div className="divide-y divide-[var(--border)]">
                    {itemLogs.map((log) => (
                      <div key={log.id} className="py-2.5 space-y-0.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[var(--text)]">
                            {log.actorName}
                          </span>
                          <span className="text-[10px] text-[var(--text-3)] tabular-nums">
                            {new Date(log.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-[var(--text-2)] font-mono text-[11px]">
                          {log.action}
                        </div>
                        {log.reason && (
                          <p className="text-[var(--text)] bg-[var(--surface-2)] p-1.5 rounded mt-1">
                            {log.reason}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
