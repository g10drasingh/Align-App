/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Link2,
  ListPlus,
  Pencil,
  Plus,
  Trash2,
  Unlink,
  Users,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Meeting } from '../../types';
import { RichTextEditor } from '../common/RichTextEditor';

export const MeetingsView: React.FC = () => {
  const {
    meetings,
    meetingTypes,
    workItems,
    itemLinks,
    canEdit,
    createMeeting,
    updateMeeting,
    deleteMeeting,
    createMeetingDeliverable,
    deleteWorkItem,
    removeLink,
    updateWorkItem,
    setSelectedItemId,
  } = useApp();

  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);

  // New meeting modal
  const [isNewMeetingOpen, setIsNewMeetingOpen] = useState(false);
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingTypeId, setMeetingTypeId] = useState(meetingTypes[0]?.id || 'mt-weekly');
  const [meetingDate, setMeetingDate] = useState('2026-11-02T10:00');
  const [meetingAgenda, setMeetingAgenda] = useState('');
  const [initialActionItem, setInitialActionItem] = useState('');

  // Selected meeting inline editing
  const [isEditingMeeting, setIsEditingMeeting] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editTypeId, setEditTypeId] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editAgenda, setEditAgenda] = useState('');
  const [editNotes, setEditNotes] = useState('');

  // Delete meeting confirmation
  const [meetingToDelete, setMeetingToDelete] = useState<Meeting | null>(null);

  // Add deliverable directly from selected meeting
  const [actionItemInput, setActionItemInput] = useState('');
  const [actionItemDueDate, setActionItemDueDate] = useState('');

  // Inline rename deliverable
  const [editingDeliverableId, setEditingDeliverableId] = useState<string | null>(null);
  const [editingDeliverableTitle, setEditingDeliverableTitle] = useState('');

  // Delete deliverable confirmation
  const [deliverableToDelete, setDeliverableToDelete] = useState<{ id: string; name: string } | null>(null);

  const selectedMeeting = meetings.find((m) => m.id === selectedMeetingId) || meetings[0] || null;

  const filteredMeetings = meetings
    .filter((m) => {
      if (activeTab === 'all') return true;
      return m.meetingTypeId === activeTab;
    })
    .sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt));

  const handleStartEditMeeting = (m: Meeting) => {
    setIsEditingMeeting(true);
    setEditTitle(m.title);
    setEditTypeId(m.meetingTypeId);
    setEditDate(m.scheduledAt ? m.scheduledAt.slice(0, 16) : '');
    setEditAgenda(m.agenda || '');
    setEditNotes(m.notes || '');
  };

  const handleSaveEditMeeting = () => {
    if (!selectedMeeting || !editTitle.trim()) return;
    updateMeeting(selectedMeeting.id, {
      title: editTitle.trim(),
      meetingTypeId: editTypeId,
      scheduledAt: editDate ? new Date(editDate).toISOString() : selectedMeeting.scheduledAt,
      agenda: editAgenda.trim() || undefined,
      notes: editNotes.trim() || undefined,
    });
    setIsEditingMeeting(false);
  };

  const handleCreateMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingTitle.trim()) return;

    createMeeting(
      {
        title: meetingTitle.trim(),
        meetingTypeId,
        scheduledAt: new Date(meetingDate).toISOString(),
        status: 'scheduled',
        agenda: meetingAgenda.trim() || undefined,
        attendeeIds: [],
      },
      initialActionItem.trim() || undefined
    );

    setIsNewMeetingOpen(false);
    setMeetingTitle('');
    setMeetingAgenda('');
    setInitialActionItem('');
  };

  const handleAddDeliverable = () => {
    if (!selectedMeeting || !actionItemInput.trim()) return;
    createMeetingDeliverable(
      selectedMeeting.id,
      actionItemInput.trim(),
      actionItemDueDate || undefined
    );
    setActionItemInput('');
    setActionItemDueDate('');
  };

  return (
    <div className="space-y-4 pb-16 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--text)]">Meetings</h1>
          <p className="text-xs text-[var(--text-3)] mt-0.5">
            Executive leadership syncs, agendas, and direct meeting-to-deliverables action trace
          </p>
        </div>
        {canEdit && (
          <button
            onClick={() => setIsNewMeetingOpen(true)}
            className="flex items-center gap-1.5 rounded-md bg-[var(--brand-600)] hover:bg-[var(--brand-700)] px-3 py-1.5 text-xs font-semibold text-white shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New meeting</span>
          </button>
        )}
      </div>

      {/* Meeting Type Tabs */}
      <div className="flex border-b border-[var(--border)] text-sm">
        <button
          onClick={() => setActiveTab('all')}
          className={`pb-2.5 px-3 font-medium transition-colors cursor-pointer ${
            activeTab === 'all'
              ? 'border-b-2 border-[var(--brand-600)] text-[var(--brand-600)] font-semibold'
              : 'text-[var(--text-2)] hover:text-[var(--text)]'
          }`}
        >
          All
        </button>
        {meetingTypes.map((mt) => (
          <button
            key={mt.id}
            onClick={() => setActiveTab(mt.id)}
            className={`pb-2.5 px-3 font-medium transition-colors cursor-pointer ${
              activeTab === mt.id
                ? 'border-b-2 border-[var(--brand-600)] text-[var(--brand-600)] font-semibold'
                : 'text-[var(--text-2)] hover:text-[var(--text)]'
            }`}
          >
            {mt.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Meetings List (6 cols) */}
        <div className="lg:col-span-6 space-y-3">
          {filteredMeetings.length === 0 ? (
            <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-12 text-center text-xs text-[var(--text-3)]">
              No meetings found in this view.
            </div>
          ) : (
            filteredMeetings.map((m) => {
              const mt = meetingTypes.find((t) => t.id === m.meetingTypeId);
              const generatedLinks = itemLinks.filter(
                (l) => l.sourceType === 'meeting' && l.sourceId === m.id && l.targetType === 'work_item'
              );
              const isSelected = selectedMeeting?.id === m.id;

              return (
                <div
                  key={m.id}
                  onClick={() => {
                    setSelectedMeetingId(m.id);
                    setIsEditingMeeting(false);
                  }}
                  className={`p-4 rounded-md border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[var(--brand-border)] bg-[var(--brand-subtle)] ring-1 ring-[var(--brand-border)]'
                      : 'border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)] shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: mt?.color || 'var(--brand-600)' }}
                      />
                      <span className="text-xs font-bold text-[var(--text)] truncate">
                        {m.title}
                      </span>
                      <span className="rounded bg-[var(--surface-3)] px-1.5 py-0.5 text-[10px] text-[var(--text-2)] font-medium shrink-0">
                        {mt?.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                          m.status === 'held'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : m.status === 'cancelled'
                            ? 'bg-slate-100 text-slate-700 dark:bg-slate-800'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60'
                        }`}
                      >
                        {m.status}
                      </span>
                      {canEdit && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMeetingToDelete(m);
                          }}
                          className="p-1 rounded text-[var(--text-3)] hover:text-[var(--danger-fg)] hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer transition-colors"
                          title="Delete meeting"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-2 text-xs text-[var(--text-3)]">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5" />
                      <span>{new Date(m.scheduledAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                    </span>
                    {generatedLinks.length > 0 && (
                      <span className="flex items-center gap-1 text-[var(--brand-600)] font-medium">
                        <Link2 className="h-3.5 w-3.5" />
                        <span>{generatedLinks.length} deliverable{generatedLinks.length === 1 ? '' : 's'}</span>
                      </span>
                    )}
                  </div>

                  {m.agenda && (
                    <p className="text-xs text-[var(--text-2)] mt-2 line-clamp-2">
                      {m.agenda}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Selected Meeting Detail & Action Items Trace (6 cols) */}
        <div className="lg:col-span-6">
          {selectedMeeting ? (
            <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-5 shadow-2xs space-y-4">
              {/* Meeting Header */}
              {isEditingMeeting ? (
                <div className="space-y-3 pb-3 border-b border-[var(--border)]">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-[var(--text)]">Edit Meeting</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsEditingMeeting(false)}
                        className="px-2.5 py-1 text-xs text-[var(--text-2)] hover:bg-[var(--surface-2)] rounded cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveEditMeeting}
                        className="px-3 py-1 text-xs font-semibold text-white bg-[var(--brand-600)] hover:bg-[var(--brand-700)] rounded cursor-pointer shadow-2xs"
                      >
                        Save
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[var(--text-2)]">Title</label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full rounded border border-[var(--border-strong)] bg-[var(--surface)] px-2.5 py-1 text-xs text-[var(--text)]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-[var(--text-2)]">Type</label>
                      <select
                        value={editTypeId}
                        onChange={(e) => setEditTypeId(e.target.value)}
                        className="w-full rounded border border-[var(--border-strong)] bg-[var(--surface)] px-2 py-1 text-xs text-[var(--text)]"
                      >
                        {meetingTypes.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-[var(--text-2)]">Scheduled At</label>
                      <input
                        type="datetime-local"
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        className="w-full rounded border border-[var(--border-strong)] bg-[var(--surface)] px-2 py-1 text-xs text-[var(--text)]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[var(--text-2)]">Agenda</label>
                    <RichTextEditor
                      value={editAgenda}
                      onChange={setEditAgenda}
                      placeholder="Meeting agenda & topics..."
                      minHeight="90px"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[var(--text-2)]">Minutes / Notes</label>
                    <RichTextEditor
                      value={editNotes}
                      onChange={setEditNotes}
                      placeholder="Discussion minutes and takeaways..."
                      minHeight="100px"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3 pb-3 border-b border-[var(--border)]">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-bold text-[var(--text)]">
                          {selectedMeeting.title}
                        </h2>
                        {canEdit && (
                          <button
                            onClick={() => handleStartEditMeeting(selectedMeeting)}
                            className="p-1 text-[var(--text-3)] hover:text-[var(--text)] rounded cursor-pointer"
                            title="Edit meeting details"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-[var(--text-3)] mt-0.5">
                        {new Date(selectedMeeting.scheduledAt).toLocaleString([], {
                          dateStyle: 'full',
                          timeStyle: 'short',
                        })}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {canEdit && selectedMeeting.status === 'scheduled' && (
                        <button
                          onClick={() => updateMeeting(selectedMeeting.id, { status: 'held' })}
                          className="rounded bg-emerald-600 hover:bg-emerald-700 px-2.5 py-1 text-xs font-semibold text-white shadow-2xs cursor-pointer"
                        >
                          Mark as Held
                        </button>
                      )}
                      {canEdit && (
                        <button
                          onClick={() => setMeetingToDelete(selectedMeeting)}
                          className="p-1.5 text-[var(--text-3)] hover:text-[var(--danger-fg)] hover:bg-red-50 dark:hover:bg-red-950/40 rounded cursor-pointer transition-colors"
                          title="Delete this meeting"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {selectedMeeting.agenda && (
                    <div className="space-y-1">
                      <div className="text-xs font-semibold text-[var(--text-2)]">Agenda</div>
                      <div className="text-xs text-[var(--text)] whitespace-pre-line bg-[var(--surface-2)] p-3 rounded leading-relaxed border border-[var(--border)]">
                        {selectedMeeting.agenda}
                      </div>
                    </div>
                  )}

                  {selectedMeeting.notes && (
                    <div className="space-y-1">
                      <div className="text-xs font-semibold text-[var(--text-2)]">Meeting Minutes</div>
                      <div className="text-xs text-[var(--text)] whitespace-pre-line bg-[var(--surface-2)] p-3 rounded leading-relaxed border border-[var(--border)]">
                        {selectedMeeting.notes}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Items Created from this Meeting */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-[var(--text)]">
                      Deliverables Generated ({
                        itemLinks.filter(
                          (l) => l.sourceType === 'meeting' && l.sourceId === selectedMeeting.id && l.targetType === 'work_item'
                        ).length
                      })
                    </h3>
                    <p className="text-[11px] text-[var(--text-3)]">
                      Tasks produced by this sync. You can rename, unlink, or permanently delete them.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {itemLinks
                    .filter(
                      (l) => l.sourceType === 'meeting' && l.sourceId === selectedMeeting.id && l.targetType === 'work_item'
                    )
                    .map((link) => {
                      const item = workItems.find((w) => w.id === link.targetId);
                      if (!item) return null;
                      const isEditingThisItem = editingDeliverableId === item.id;

                      return (
                        <div
                          key={link.id}
                          className="flex items-center justify-between p-2.5 rounded border border-[var(--border)] bg-[var(--surface-2)] hover:bg-[var(--surface-3)] transition-colors group"
                        >
                          {isEditingThisItem ? (
                            <div className="flex items-center gap-1.5 flex-1 min-w-0 pr-2">
                              <input
                                type="text"
                                autoFocus
                                value={editingDeliverableTitle}
                                onChange={(e) => setEditingDeliverableTitle(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && editingDeliverableTitle.trim()) {
                                    updateWorkItem(item.id, { name: editingDeliverableTitle.trim() });
                                    setEditingDeliverableId(null);
                                  } else if (e.key === 'Escape') {
                                    setEditingDeliverableId(null);
                                  }
                                }}
                                className="flex-1 rounded border border-[var(--brand-600)] bg-[var(--surface)] px-2 py-0.5 text-xs text-[var(--text)]"
                              />
                              <button
                                onClick={() => {
                                  if (editingDeliverableTitle.trim()) {
                                    updateWorkItem(item.id, { name: editingDeliverableTitle.trim() });
                                    setEditingDeliverableId(null);
                                  }
                                }}
                                className="p-1 rounded bg-[var(--brand-600)] text-white hover:bg-[var(--brand-700)] cursor-pointer"
                                title="Save"
                              >
                                <Check className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => setEditingDeliverableId(null)}
                                className="p-1 rounded text-[var(--text-3)] hover:bg-[var(--surface)] cursor-pointer"
                                title="Cancel"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ) : (
                            <div
                              onClick={() => setSelectedItemId(item.id)}
                              className="min-w-0 pr-2 flex-1 cursor-pointer"
                            >
                              <div className="flex items-center gap-1.5">
                                <span className="rounded bg-[var(--surface)] px-1.5 py-0.2 text-[9px] font-bold text-[var(--text-2)] uppercase">
                                  {item.itemType}
                                </span>
                                <span className="text-xs font-semibold text-[var(--text)] truncate hover:underline">
                                  {item.name}
                                </span>
                              </div>
                              <span className="text-[10px] text-[var(--text-3)] block mt-0.5">
                                Due: {item.dueDate || 'No due date'}
                              </span>
                            </div>
                          )}

                          {/* Deliverable Actions: Rename, Unlink, Delete, Open */}
                          <div className="flex items-center gap-1 shrink-0">
                            {canEdit && !isEditingThisItem && (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingDeliverableId(item.id);
                                    setEditingDeliverableTitle(item.name);
                                  }}
                                  className="p-1 text-[var(--text-3)] hover:text-[var(--text)] rounded cursor-pointer"
                                  title="Rename deliverable"
                                >
                                  <Pencil className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeLink(link.id);
                                  }}
                                  className="p-1 text-[var(--text-3)] hover:text-amber-600 rounded cursor-pointer"
                                  title="Unlink from this meeting"
                                >
                                  <Unlink className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeliverableToDelete({ id: item.id, name: item.name });
                                  }}
                                  className="p-1 text-[var(--text-3)] hover:text-[var(--danger-fg)] rounded cursor-pointer"
                                  title="Delete deliverable permanently"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => setSelectedItemId(item.id)}
                              className="p-1 text-[var(--text-3)] hover:text-[var(--text)] rounded cursor-pointer"
                              title="Open in detail drawer"
                            >
                              <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>

                {/* Quick Add Action Item Linked to this Meeting */}
                {canEdit && (
                  <div className="rounded-md border border-[var(--border)] bg-[var(--surface-2)] p-3 space-y-2 pt-2.5">
                    <span className="text-[11px] font-bold text-[var(--text)] block">
                      + Generate New Deliverable / Task
                    </span>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        placeholder="Action item title..."
                        value={actionItemInput}
                        onChange={(e) => setActionItemInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && actionItemInput.trim()) {
                            handleAddDeliverable();
                          }
                        }}
                        className="flex-1 rounded border border-[var(--border-strong)] bg-[var(--surface)] px-2.5 py-1.5 text-xs text-[var(--text)] focus:border-[var(--brand-600)] focus:outline-none"
                      />
                      <input
                        type="date"
                        value={actionItemDueDate}
                        onChange={(e) => setActionItemDueDate(e.target.value)}
                        className="rounded border border-[var(--border-strong)] bg-[var(--surface)] px-2 py-1 text-xs text-[var(--text)]"
                      />
                      <button
                        disabled={!actionItemInput.trim()}
                        onClick={handleAddDeliverable}
                        className="rounded bg-[var(--brand-600)] hover:bg-[var(--brand-700)] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50 cursor-pointer shadow-2xs shrink-0"
                      >
                        Add Task
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-[var(--border-strong)] p-12 text-center text-xs text-[var(--text-3)]">
              Select a meeting to view minutes, agenda, and generated deliverables.
            </div>
          )}
        </div>
      </div>

      {/* Delete Meeting Confirmation Dialog */}
      {meetingToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--text)]">Delete Meeting?</h3>
                <p className="text-xs text-[var(--text-3)] mt-1">
                  Are you sure you want to permanently delete <strong>"{meetingToDelete.title}"</strong>?
                  Deliverable links associated with this meeting will be removed.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border)]">
              <button
                onClick={() => setMeetingToDelete(null)}
                className="px-3 py-1.5 text-xs font-semibold text-[var(--text-2)] hover:bg-[var(--surface-2)] rounded cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteMeeting(meetingToDelete.id);
                  if (selectedMeetingId === meetingToDelete.id) {
                    setSelectedMeetingId(null);
                  }
                  setMeetingToDelete(null);
                }}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded shadow-2xs cursor-pointer"
              >
                Delete Meeting
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Deliverable Confirmation Dialog */}
      {deliverableToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--text)]">Delete Deliverable?</h3>
                <p className="text-xs text-[var(--text-3)] mt-1">
                  Are you sure you want to permanently delete <strong>"{deliverableToDelete.name}"</strong>?
                  To keep the work item but disconnect it from this meeting, use Unlink instead.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border)]">
              <button
                onClick={() => setDeliverableToDelete(null)}
                className="px-3 py-1.5 text-xs font-semibold text-[var(--text-2)] hover:bg-[var(--surface-2)] rounded cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteWorkItem(deliverableToDelete.id);
                  setDeliverableToDelete(null);
                }}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded shadow-2xs cursor-pointer"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Meeting Modal */}
      {isNewMeetingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={handleCreateMeeting}
            className="w-full max-w-lg rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <h2 className="text-sm font-bold text-[var(--text)]">New Meeting</h2>
              <button
                type="button"
                onClick={() => setIsNewMeetingOpen(false)}
                className="p-1 rounded text-[var(--text-3)] hover:text-[var(--text)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--text-2)]">Meeting Title</label>
              <input
                type="text"
                required
                value={meetingTitle}
                onChange={(e) => setMeetingTitle(e.target.value)}
                placeholder="e.g. G&E Weekly Leadership Sync"
                className="w-full rounded border border-[var(--border-strong)] bg-[var(--surface)] px-2.5 py-1.5 text-xs text-[var(--text)] focus:border-[var(--brand-600)] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-2)]">Type</label>
                <select
                  value={meetingTypeId}
                  onChange={(e) => setMeetingTypeId(e.target.value)}
                  className="w-full rounded border border-[var(--border-strong)] bg-[var(--surface)] px-2.5 py-1.5 text-xs text-[var(--text)]"
                >
                  {meetingTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-2)]">Scheduled At</label>
                <input
                  type="datetime-local"
                  required
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                  className="w-full rounded border border-[var(--border-strong)] bg-[var(--surface)] px-2.5 py-1.5 text-xs text-[var(--text)]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--text-2)]">
                Agenda (Markdown supported)
              </label>
              <RichTextEditor
                value={meetingAgenda}
                onChange={setMeetingAgenda}
                placeholder="Key discussion topics and objectives..."
                minHeight="110px"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--text-2)]">
                Initial Action Item (optional)
              </label>
              <input
                type="text"
                value={initialActionItem}
                onChange={(e) => setInitialActionItem(e.target.value)}
                placeholder="Creates a task auto-linked to this meeting..."
                className="w-full rounded border border-[var(--border-strong)] bg-[var(--surface)] px-2.5 py-1.5 text-xs text-[var(--text)]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border)]">
              <button
                type="button"
                onClick={() => setIsNewMeetingOpen(false)}
                className="rounded px-3 py-1.5 text-xs font-medium text-[var(--text-2)] hover:bg-[var(--surface-2)] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded bg-[var(--brand-600)] hover:bg-[var(--brand-700)] px-3 py-1.5 text-xs font-semibold text-white cursor-pointer shadow-2xs"
              >
                Create meeting
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
