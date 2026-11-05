/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Flag, FolderPlus, ListPlus, X, CornerDownRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ItemType, Priority, TaskKind, WorkItem } from '../../types';
import { RichTextEditor } from '../common/RichTextEditor';

export const NewItemModal: React.FC = () => {
  const {
    isNewItemOpen,
    setIsNewItemOpen,
    newItemDefaultType,
    newItemDefaultParentId,
    newItemMode,
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
  const [priorityId, setPriorityId] = useState<string>(
    priorities.find((p) => p.rank === 2)?.id || 'prio-med'
  );
  const [startDate, setStartDate] = useState(todayStr);
  const [dueDate, setDueDate] = useState('');
  const [taskKind, setTaskKind] = useState<TaskKind>('one_time');
  const [needsCeoAttention, setNeedsCeoAttention] = useState(false);
  const [ceoNote, setCeoNote] = useState('');

  // Keep form synchronized whenever modal is opened
  useEffect(() => {
    if (isNewItemOpen) {
      setItemType(newItemDefaultType);
      setParentId(newItemDefaultParentId || '');
      setName('');
      setDescription('');
      setNeedsCeoAttention(false);
      setCeoNote('');

      if (newItemDefaultParentId) {
        const parent = workItems.find((w) => w.id === newItemDefaultParentId);
        if (parent) {
          if (parent.departmentIds && parent.departmentIds[0]) {
            setDepartmentId(parent.departmentIds[0]);
          }
          if (parent.subDomainIds && parent.subDomainIds[0]) {
            setSubDomainId(parent.subDomainIds[0]);
          }
          if (parent.categoryId) {
            setCategoryId(parent.categoryId);
          }
        }
      }
    }
  }, [isNewItemOpen, newItemDefaultType, newItemDefaultParentId, workItems]);

  if (!isNewItemOpen) return null;

  // Selected parent item
  const selectedParent = workItems.find((w) => w.id === parentId);

  // Determine dynamic modal title and badge based on creation context
  let modalTitle = 'Create Task';
  let modalSubtitle = 'Add a new task';
  let submitButtonText = 'Create Task';
  let isTypeLocked = false;

  if (newItemMode === 'sub_task' || (selectedParent && selectedParent.itemType === 'task')) {
    modalTitle = 'Create Subtask';
    modalSubtitle = selectedParent
      ? `Adding subtask under task: "${selectedParent.name}"`
      : 'Adding nested subtask';
    submitButtonText = 'Create Subtask';
    isTypeLocked = true;
  } else if (newItemMode === 'sub_project' || (selectedParent && itemType === 'project')) {
    modalTitle = 'Create Sub-project';
    modalSubtitle = selectedParent
      ? `Adding sub-project under: "${selectedParent.name}"`
      : 'Adding sub-project';
    submitButtonText = 'Create Sub-project';
    isTypeLocked = true;
  } else if (newItemMode === 'project' && !selectedParent) {
    modalTitle = 'Create Project';
    modalSubtitle = 'New top-level strategic initiative';
    submitButtonText = 'Create Project';
    isTypeLocked = true;
  } else if (newItemMode === 'task' && selectedParent) {
    modalTitle = 'Create Task';
    modalSubtitle = `Adding task under: "${selectedParent.name}"`;
    submitButtonText = 'Create Task';
    isTypeLocked = true;
  } else if (newItemMode === 'task' && !selectedParent) {
    modalTitle = 'Create Task';
    modalSubtitle = 'New top-level standalone task';
    submitButtonText = 'Create Task';
    isTypeLocked = false;
  } else {
    modalTitle = itemType === 'project' ? 'Create Project' : 'Create Task';
    modalSubtitle = 'Specify details and hierarchy';
    submitButtonText = `Create ${itemType === 'project' ? 'Project' : 'Task'}`;
    isTypeLocked = false;
  }

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
      <div className="w-full max-w-xl rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-[var(--brand-subtle)] p-2 text-[var(--brand-600)] border border-[var(--brand-border)]">
              {itemType === 'project' ? (
                <FolderPlus className="h-5 w-5" />
              ) : (
                <ListPlus className="h-5 w-5" />
              )}
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--text)]">{modalTitle}</h2>
              <p className="text-xs text-[var(--text-3)] truncate max-w-sm sm:max-w-md">
                {modalSubtitle}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsNewItemOpen(false)}
            className="p-1.5 rounded text-[var(--text-3)] hover:text-[var(--text)] hover:bg-[var(--surface-3)] cursor-pointer transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Hierarchy Context Banner when Parent is Present */}
        {selectedParent && (
          <div className="flex items-center gap-2 rounded-md bg-[var(--surface-2)] p-2.5 border border-[var(--border)] text-xs">
            <CornerDownRight className="h-4 w-4 text-[var(--brand-600)] shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-[var(--text-3)] mr-1.5">
                Parent {selectedParent.itemType}:
              </span>
              <span className="font-semibold text-[var(--text)] truncate">
                {selectedParent.name}
              </span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Level 1 Selector: Project vs Task Selection Box (only if not locked by sub-creation context) */}
          {!isTypeLocked && (
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
          )}

          {/* Name / Title */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text-2)]">
              {modalTitle} Name / Title *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`e.g. ${
                itemType === 'project'
                  ? 'Q1 Merchant Settlement Revamp'
                  : selectedParent
                  ? 'Verify API response caching'
                  : 'Audit SMS gateway logs'
              }`}
              className="w-full rounded-md border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--text)] focus:border-[var(--brand-600)] focus:outline-none"
            />
          </div>

          {/* Parent Item selector (allows changing parent or clearing if generic) */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text-2)]">
              Parent Item {isTypeLocked ? '(Attached Hierarchy)' : '(optional)'}
            </label>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

          {/* Roomy Formatted Rich Description */}
          <RichTextEditor
            label="Description & Strategic Notes (Markdown)"
            value={description}
            onChange={setDescription}
            placeholder="Add scope details, acceptance criteria, or markdown checklist (- [ ] task)..."
            minHeight="120px"
          />

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

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-3 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={() => setIsNewItemOpen(false)}
              className="rounded-md px-4 py-2 text-xs font-semibold text-[var(--text-2)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-[var(--brand-600)] hover:bg-[var(--brand-700)] px-4 py-2 text-xs font-semibold text-white shadow-2xs transition-colors cursor-pointer"
            >
              {submitButtonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
