/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Flag, FolderPlus, ListPlus, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ItemType, Priority, TaskKind, WorkItem } from '../../types';

export const NewItemModal: React.FC = () => {
  const {
    isNewItemOpen,
    setIsNewItemOpen,
    newItemDefaultType,
    newItemDefaultParentId,
    departments,
    subDomains,
    categories,
    priorities,
    statuses,
    workItems,
    createWorkItem,
    todayStr,
    canEdit,
  } = useApp();

  const [itemType, setItemType] = useState<ItemType>(newItemDefaultType);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState<string>(newItemDefaultParentId || '');
  const [departmentId, setDepartmentId] = useState<string>(departments[0]?.id || 'dept-ge');
  const [subDomainId, setSubDomainId] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>(categories[0]?.id || 'cat-plan');
  const [priorityId, setPriorityId] = useState<string>(priorities.find((p) => p.rank === 2)?.id || 'prio-med');
  const [startDate, setStartDate] = useState(todayStr);
  const [dueDate, setDueDate] = useState('');
  const [taskKind, setTaskKind] = useState<TaskKind>('one_time');
  const [needsCeoAttention, setNeedsCeoAttention] = useState(false);
  const [ceoNote, setCeoNote] = useState('');

  if (!isNewItemOpen) return null;

  // Filter subdomains by department
  const availableSubDomains = subDomains.filter((s) => s.departmentId === departmentId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    createWorkItem({
      itemType,
      parentId: parentId || null,
      name: name.trim(),
      description: description.trim() || undefined,
      statusId: 'stat-not-started', // Default Not Started per spec
      priorityId,
      categoryId,
      departmentIds: [departmentId],
      subDomainIds: subDomainId ? [subDomainId] : [],
      teamMemberIds: [],
      startDate: startDate || undefined,
      dueDate: dueDate || undefined,
      weightMode: 'auto',
      needsCeoAttention,
      ceoAttentionStatusId: needsCeoAttention ? 'ceo-pending' : undefined,
      ceoNote: needsCeoAttention ? ceoNote.trim() : undefined,
      taskKind,
    });

    setIsNewItemOpen(false);
    setName('');
    setDescription('');
    setNeedsCeoAttention(false);
    setCeoNote('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 select-none animate-in fade-in-50">
      <div className="w-full max-w-lg rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            {itemType === 'project' ? (
              <FolderPlus className="h-5 w-5 text-[var(--brand-600)]" />
            ) : (
              <ListPlus className="h-5 w-5 text-[var(--brand-600)]" />
            )}
            <h2 className="text-base font-bold text-[var(--text)]">
              Create New {itemType === 'project' ? 'Project' : 'Task'}
            </h2>
          </div>
          <button
            onClick={() => setIsNewItemOpen(false)}
            className="p-1 rounded text-[var(--text-3)] hover:text-[var(--text)] cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Level 1 Selector: Project vs Task Selection Box */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text-2)]">Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setItemType('task')}
                className={`py-2 px-3 rounded-md border text-xs font-semibold cursor-pointer transition-colors ${
                  itemType === 'task'
                    ? 'border-[var(--brand-border)] bg-[var(--brand-subtle)] text-[var(--brand-600)]'
                    : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-2)] hover:bg-[var(--surface-2)]'
                }`}
              >
                Task
              </button>
              <button
                type="button"
                onClick={() => setItemType('project')}
                className={`py-2 px-3 rounded-md border text-xs font-semibold cursor-pointer transition-colors ${
                  itemType === 'project'
                    ? 'border-[var(--brand-border)] bg-[var(--brand-subtle)] text-[var(--brand-600)]'
                    : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-2)] hover:bg-[var(--surface-2)]'
                }`}
              >
                Project
              </button>
            </div>
          </div>

          {/* Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text-2)]">Title / Name *</label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`e.g. ${itemType === 'project' ? 'Q1 Merchant Settlement Revamp' : 'Audit SMS gateway logs'}`}
              className="w-full rounded-md border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-1.5 text-xs text-[var(--text)] focus:border-[var(--brand-600)] focus:outline-none"
            />
          </div>

          {/* Parent Item */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text-2)]">Parent Item (optional)</label>
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="w-full rounded-md border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-1.5 text-xs text-[var(--text)]"
            >
              <option value="">None (Top-level / Standalone)</option>
              {workItems
                .filter((w) => !w.isArchived)
                .map((w) => (
                  <option key={w.id} value={w.id}>
                    [{w.itemType.toUpperCase()}] {w.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Department & Sub-domain */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--text-2)]">Department *</label>
              <select
                value={departmentId}
                onChange={(e) => {
                  setDepartmentId(e.target.value);
                  setSubDomainId('');
                }}
                className="w-full rounded-md border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-1.5 text-xs text-[var(--text)]"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--text-2)]">Sub-domain (optional)</label>
              <select
                value={subDomainId}
                onChange={(e) => setSubDomainId(e.target.value)}
                disabled={availableSubDomains.length === 0}
                className="w-full rounded-md border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-1.5 text-xs text-[var(--text)] disabled:opacity-50"
              >
                <option value="">None</option>
                {availableSubDomains.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category & Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--text-2)]">Category *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-md border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-1.5 text-xs text-[var(--text)]"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--text-2)]">Priority *</label>
              <select
                value={priorityId}
                onChange={(e) => setPriorityId(e.target.value)}
                className="w-full rounded-md border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-1.5 text-xs text-[var(--text)]"
              >
                {priorities.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Cap {p.weightCap}%)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Start date & Due date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--text-2)]">Start Date (optional)</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-md border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-1.5 text-xs text-[var(--text)]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--text-2)]">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-md border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-1.5 text-xs text-[var(--text)]"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text-2)]">Description (optional)</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Key notes, scope details or milestones..."
              className="w-full rounded-md border border-[var(--border-strong)] bg-[var(--surface)] p-2 text-xs text-[var(--text)] focus:border-[var(--brand-600)] focus:outline-none"
            />
          </div>

          {/* Needs CEO Attention Flag */}
          {canEdit && (
            <div className="rounded-md border border-[var(--border)] bg-[var(--surface-2)] p-3 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={needsCeoAttention}
                  onChange={(e) => setNeedsCeoAttention(e.target.checked)}
                  className="rounded border-[var(--border-strong)] text-[var(--attention-fg)] focus:ring-[var(--attention-fg)]"
                />
                <span className="text-xs font-bold text-[var(--attention-fg)] flex items-center gap-1.5">
                  <Flag className="h-3.5 w-3.5 fill-[var(--attention-fg)]" />
                  <span>Flag: Needs CEO Attention</span>
                </span>
              </label>

              {needsCeoAttention && (
                <input
                  type="text"
                  value={ceoNote}
                  onChange={(e) => setCeoNote(e.target.value)}
                  placeholder="Reason for CEO attention (optional note)..."
                  className="w-full rounded border border-[var(--border-strong)] bg-[var(--surface)] px-2.5 py-1 text-xs text-[var(--text)]"
                />
              )}
            </div>
          )}

          {/* Footer buttons */}
          <div className="flex justify-end gap-2 pt-3 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={() => setIsNewItemOpen(false)}
              className="rounded-md px-3 py-1.5 text-xs font-medium text-[var(--text-2)] hover:bg-[var(--surface-2)] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-[var(--brand-600)] hover:bg-[var(--brand-700)] px-4 py-1.5 text-xs font-semibold text-white shadow-2xs cursor-pointer"
            >
              Save {itemType === 'project' ? 'Project' : 'Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
