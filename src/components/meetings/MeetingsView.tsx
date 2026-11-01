/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  CalendarDays,
  Plus,
  Users,
  CheckCircle2,
  Clock,
  Link2,
  ListPlus,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Meeting } from '../../types';

export const MeetingsView: React.FC = () => {
  const {
    meetings,
    meetingTypes,
    teamMembers,
    workItems,
    itemLinks,
    canEdit,
    createMeeting,
    updateMeeting,
    setSelectedItemId,
  } = useApp();

  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);

  // Modal to create new meeting
  const [isNewMeetingOpen, setIsNewMeetingOpen] = useState(false);
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingTypeId, setMeetingTypeId] = useState(meetingTypes[0]?.id || 'mt-weekly');
  const [meetingDate, setMeetingDate] = useState('2026-11-02T10:00');
  const [meetingAgenda, setMeetingAgenda] = useState('');
  const [initialActionItem, setInitialActionItem] = useState('');

  // Add action item directly from selected meeting
  const [actionItemInput, setActionItemInput] = useState('');

  const filteredMeetings = meetings.filter((m) => {
    if (activeTab === 'all') return true;
    return m.meetingTypeId === activeTab;
  }).sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt));

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
        {/* Left Column: Meetings List (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
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
                  onClick={() => setSelectedMeeting(m)}
                  className={`p-4 rounded-md border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[var(--brand-border)] bg-[var(--brand-subtle)] ring-1 ring-[var(--brand-border)]'
                      : 'border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)] shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: mt?.color || 'var(--brand-600)' }}
                      />
                      <span className="text-xs font-bold text-[var(--text)] truncate">
                        {m.title}
                      </span>
                      <span className="rounded bg-[var(--surface-3)] px-1.5 py-0.5 text-[10px] text-[var(--text-2)] font-medium">
                        {mt?.name}
                      </span>
                    </div>

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
                  </div>

                  <div className="flex items-center gap-4 mt-2 text-xs text-[var(--text-3)]">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5" />
                      <span>{new Date(m.scheduledAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                    </span>
                    {generatedLinks.length > 0 && (
                      <span className="flex items-center gap-1 text-[var(--brand-600)] font-medium">
                        <Link2 className="h-3.5 w-3.5" />
                        <span>{generatedLinks.length} action item{generatedLinks.length === 1 ? '' : 's'}</span>
                      </span>
                    )}
                  </div>

                  {m.notes && (
                    <p className="text-xs text-[var(--text-2)] mt-2 line-clamp-2">
                      {m.notes}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Selected Meeting Detail & Action Items Trace (5 cols) */}
        <div className="lg:col-span-5">
          {selectedMeeting ? (
            <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-5 shadow-2xs space-y-4 sticky top-20">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-base font-bold text-[var(--text)]">
                    {selectedMeeting.title}
                  </h2>
                  <p className="text-xs text-[var(--text-3)] mt-0.5">
                    {new Date(selectedMeeting.scheduledAt).toLocaleString()}
                  </p>
                </div>
                {canEdit && selectedMeeting.status === 'scheduled' && (
                  <button
                    onClick={() => updateMeeting(selectedMeeting.id, { status: 'held' })}
                    className="rounded bg-emerald-600 hover:bg-emerald-700 px-2.5 py-1 text-xs font-semibold text-white shadow-2xs cursor-pointer"
                  >
                    Mark as Held
                  </button>
                )}
              </div>

              {selectedMeeting.agenda && (
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-[var(--text-2)]">Agenda</div>
                  <div className="text-xs text-[var(--text)] whitespace-pre-line bg-[var(--surface-2)] p-2.5 rounded">
                    {selectedMeeting.agenda}
                  </div>
                </div>
              )}

              {selectedMeeting.notes && (
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-[var(--text-2)]">Meeting Minutes</div>
                  <div className="text-xs text-[var(--text)] whitespace-pre-line bg-[var(--surface-2)] p-2.5 rounded">
                    {selectedMeeting.notes}
                  </div>
                </div>
              )}

              {/* Items Created from this Meeting */}
              <div className="space-y-2 pt-2 border-t border-[var(--border)]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--text)]">
                    Deliverables Generated
                  </span>
                </div>

                <div className="space-y-1.5">
                  {itemLinks
                    .filter(
                      (l) => l.sourceType === 'meeting' && l.sourceId === selectedMeeting.id && l.targetType === 'work_item'
                    )
                    .map((link) => {
                      const item = workItems.find((w) => w.id === link.targetId);
                      if (!item) return null;
                      return (
                        <div
                          key={link.id}
                          onClick={() => setSelectedItemId(item.id)}
                          className="flex items-center justify-between p-2 rounded border border-[var(--border)] bg-[var(--surface-2)] hover:bg-[var(--surface-3)] transition-colors cursor-pointer"
                        >
                          <div className="min-w-0 pr-2">
                            <span className="text-xs font-medium text-[var(--text)] truncate block">
                              {item.name}
                            </span>
                            <span className="text-[10px] text-[var(--text-3)]">
                              Due: {item.dueDate || 'No due date'}
                            </span>
                          </div>
                          <ChevronRight className="h-3.5 w-3.5 text-[var(--text-3)] shrink-0" />
                        </div>
                      );
                    })}
                </div>

                {/* Quick Add Action Item Linked to this Meeting */}
                {canEdit && (
                  <div className="flex gap-2 pt-2">
                    <input
                      type="text"
                      placeholder="Add action item directly from meeting..."
                      value={actionItemInput}
                      onChange={(e) => setActionItemInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && actionItemInput.trim()) {
                          createMeeting(
                            { ...selectedMeeting, scheduledAt: selectedMeeting.scheduledAt },
                            actionItemInput.trim()
                          );
                          setActionItemInput('');
                        }
                      }}
                      className="flex-1 rounded border border-[var(--border-strong)] bg-[var(--surface)] px-2.5 py-1 text-xs text-[var(--text)] focus:border-[var(--brand-600)] focus:outline-none"
                    />
                    <button
                      disabled={!actionItemInput.trim()}
                      onClick={() => {
                        createMeeting(
                          { ...selectedMeeting, scheduledAt: selectedMeeting.scheduledAt },
                          actionItemInput.trim()
                        );
                        setActionItemInput('');
                      }}
                      className="rounded bg-[var(--brand-600)] hover:bg-[var(--brand-700)] px-2.5 py-1 text-xs font-semibold text-white disabled:opacity-50 cursor-pointer"
                    >
                      Add
                    </button>
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

      {/* Create Meeting Modal */}
      {isNewMeetingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={handleCreateMeeting}
            className="w-full max-w-md rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-xl space-y-4"
          >
            <h2 className="text-sm font-bold text-[var(--text)]">New Meeting</h2>

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
              <label className="text-xs font-semibold text-[var(--text-2)]">Agenda (optional)</label>
              <textarea
                rows={3}
                value={meetingAgenda}
                onChange={(e) => setMeetingAgenda(e.target.value)}
                placeholder="Key discussion topics..."
                className="w-full rounded border border-[var(--border-strong)] bg-[var(--surface)] p-2 text-xs text-[var(--text)]"
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

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsNewMeetingOpen(false)}
                className="rounded px-3 py-1.5 text-xs font-medium text-[var(--text-2)] hover:bg-[var(--surface-2)] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded bg-[var(--brand-600)] hover:bg-[var(--brand-700)] px-3 py-1.5 text-xs font-semibold text-white cursor-pointer"
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
