/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  MessageSquare,
  Plus,
  AlertCircle,
  CalendarClock,
  RotateCcw,
  Ban,
  FileText,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Followup } from '../../types';

export const FollowupsView: React.FC = () => {
  const {
    followups,
    workItems,
    todayStr,
    canEdit,
    setSelectedItemId,
    logFollowupOutcome,
    postponeFollowup,
    cancelFollowup,
    createFollowup,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'scheduled' | 'missed' | 'done' | 'all'>('scheduled');

  // Modals state
  const [selectedFuForOutcome, setSelectedFuForOutcome] = useState<Followup | null>(null);
  const [outcomeText, setOutcomeText] = useState('');
  const [nextFollowupDate, setNextFollowupDate] = useState('');

  const [selectedFuForPostpone, setSelectedFuForPostpone] = useState<Followup | null>(null);
  const [newPostponeDate, setNewPostponeDate] = useState('');

  const [isScheduleNewOpen, setIsScheduleNewOpen] = useState(false);
  const [newFuItemId, setNewFuItemId] = useState('');
  const [newFuDate, setNewFuDate] = useState(todayStr);
  const [newFuRemarks, setNewFuRemarks] = useState('');

  const missedCount = followups.filter((f) => f.statusId === 'fstat-missed').length;

  const filteredFollowups = followups.filter((f) => {
    if (activeTab === 'scheduled') return f.statusId === 'fstat-scheduled';
    if (activeTab === 'missed') return f.statusId === 'fstat-missed';
    if (activeTab === 'done') return f.statusId === 'fstat-done';
    return true;
  }).sort((a, b) => b.followupDate.localeCompare(a.followupDate));

  return (
    <div className="space-y-4 pb-16 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--text)]">Follow-ups</h1>
          <p className="text-xs text-[var(--text-3)] mt-0.5">
            Scheduled check-ins, stakeholder updates, and tamper-evident outcome logs
          </p>
        </div>
        {canEdit && (
          <button
            onClick={() => {
              setNewFuItemId(workItems[0]?.id || '');
              setNewFuDate(todayStr);
              setNewFuRemarks('');
              setIsScheduleNewOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-md bg-[var(--brand-600)] hover:bg-[var(--brand-700)] px-3 py-1.5 text-xs font-semibold text-white shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Schedule follow-up</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--border)] text-sm">
        <button
          onClick={() => setActiveTab('scheduled')}
          className={`flex items-center gap-1.5 pb-2.5 px-3 font-medium transition-colors cursor-pointer ${
            activeTab === 'scheduled'
              ? 'border-b-2 border-[var(--brand-600)] text-[var(--brand-600)] font-semibold'
              : 'text-[var(--text-2)] hover:text-[var(--text)]'
          }`}
        >
          <span>Scheduled</span>
          <span className="text-xs text-[var(--text-3)] tabular-nums">
            {followups.filter((f) => f.statusId === 'fstat-scheduled').length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('missed')}
          className={`flex items-center gap-1.5 pb-2.5 px-3 font-medium transition-colors cursor-pointer ${
            activeTab === 'missed'
              ? 'border-b-2 border-[var(--danger-fg)] text-[var(--danger-fg)] font-semibold'
              : missedCount > 0
              ? 'text-[var(--danger-fg)]'
              : 'text-[var(--text-2)] hover:text-[var(--text)]'
          }`}
        >
          <span>Missed</span>
          {missedCount > 0 && (
            <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[var(--danger-bg)] text-[var(--danger-fg)] px-1 text-[10px] font-bold">
              {missedCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('done')}
          className={`flex items-center gap-1.5 pb-2.5 px-3 font-medium transition-colors cursor-pointer ${
            activeTab === 'done'
              ? 'border-b-2 border-[var(--brand-600)] text-[var(--brand-600)] font-semibold'
              : 'text-[var(--text-2)] hover:text-[var(--text)]'
          }`}
        >
          <span>Done</span>
          <span className="text-xs text-[var(--text-3)] tabular-nums">
            {followups.filter((f) => f.statusId === 'fstat-done').length}
          </span>
        </button>
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
            {followups.length}
          </span>
        </button>
      </div>

      {/* Follow-ups List */}
      <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] divide-y divide-[var(--border)] shadow-2xs">
        {filteredFollowups.length === 0 ? (
          <div className="py-12 text-center text-xs text-[var(--text-3)]">
            No follow-ups found in this view.
          </div>
        ) : (
          filteredFollowups.map((fu) => {
            const targetItem = workItems.find((w) => w.id === fu.workItemId);
            const isMissed = fu.statusId === 'fstat-missed';
            const isDone = fu.statusId === 'fstat-done';
            const isPostponed = fu.statusId === 'fstat-postponed';
            const isCancelled = fu.statusId === 'fstat-cancelled';
            const isScheduled = fu.statusId === 'fstat-scheduled';

            return (
              <div
                key={fu.id}
                className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[var(--surface-2)] transition-colors ${
                  isMissed ? 'bg-red-50/40 dark:bg-red-950/20' : ''
                }`}
              >
                <div
                  onClick={() => setSelectedItemId(fu.workItemId)}
                  className="flex-1 min-w-0 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-semibold tabular-nums px-2 py-0.5 rounded border ${
                        isMissed
                          ? 'bg-[var(--danger-bg)] text-[var(--danger-fg)] border-red-300 dark:border-red-900'
                          : isDone
                          ? 'bg-[var(--success-bg)] text-[var(--success-fg)] border-emerald-300 dark:border-emerald-900'
                          : isPostponed
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : isCancelled
                          ? 'bg-[var(--surface-3)] text-[var(--text-3)] border-[var(--border)]'
                          : 'bg-[var(--brand-subtle)] text-[var(--brand-600)] border-[var(--brand-border)]'
                      }`}
                    >
                      {fu.followupDate}
                    </span>
                    <span className="text-xs font-bold text-[var(--text)] truncate">
                      {targetItem?.name ?? 'Unknown item'}
                    </span>
                  </div>

                  <p className="text-xs text-[var(--text-2)] mt-1.5">
                    {fu.remarks || '(no outcome remarks logged)'}
                  </p>

                  {fu.outcomeLoggedAt && (
                    <div className="text-[10px] text-[var(--text-3)] mt-1">
                      Logged on {new Date(fu.outcomeLoggedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {/* Quick actions for EA/Admin */}
                {canEdit && (isScheduled || isMissed) && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setSelectedFuForOutcome(fu);
                        setOutcomeText(fu.remarks || '');
                        setNextFollowupDate('');
                      }}
                      className="rounded bg-[var(--brand-600)] hover:bg-[var(--brand-700)] px-2.5 py-1 text-xs font-semibold text-white shadow-2xs transition-colors cursor-pointer"
                    >
                      Log outcome
                    </button>
                    {isScheduled && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedFuForPostpone(fu);
                            setNewPostponeDate('');
                          }}
                          className="rounded border border-[var(--border-strong)] bg-[var(--surface)] hover:bg-[var(--surface-2)] px-2.5 py-1 text-xs font-medium text-[var(--text-2)] transition-colors cursor-pointer"
                        >
                          Postpone
                        </button>
                        <button
                          onClick={() => cancelFollowup(fu.id)}
                          className="rounded border border-[var(--border)] hover:bg-red-50 dark:hover:bg-red-950/40 px-2 py-1 text-xs text-[var(--text-3)] hover:text-[var(--danger-fg)] transition-colors cursor-pointer"
                          title="Cancel follow-up"
                        >
                          <Ban className="h-3 w-3" />
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Log Outcome Modal */}
      {selectedFuForOutcome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-[var(--text)]">Log Follow-up Outcome</h2>
            <p className="text-xs text-[var(--text-2)]">
              Record the outcome, confirmations, or blockers discovered during this check-in.
            </p>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--text-2)]">Remarks / Outcome</label>
              <textarea
                autoFocus
                rows={4}
                value={outcomeText}
                onChange={(e) => setOutcomeText(e.target.value)}
                placeholder="e.g. Engineering confirmed API credentials will be provisioned by Tuesday..."
                className="w-full rounded border border-[var(--border-strong)] bg-[var(--surface)] p-2 text-xs text-[var(--text)] focus:border-[var(--brand-600)] focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--text-2)]">
                Next Follow-up Date (optional)
              </label>
              <input
                type="date"
                value={nextFollowupDate}
                onChange={(e) => setNextFollowupDate(e.target.value)}
                className="w-full rounded border border-[var(--border-strong)] bg-[var(--surface)] px-2.5 py-1.5 text-xs text-[var(--text)] focus:border-[var(--brand-600)] focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedFuForOutcome(null)}
                className="rounded px-3 py-1.5 text-xs font-medium text-[var(--text-2)] hover:bg-[var(--surface-2)]"
              >
                Cancel
              </button>
              <button
                disabled={!outcomeText.trim()}
                onClick={() => {
                  logFollowupOutcome(
                    selectedFuForOutcome.id,
                    outcomeText.trim(),
                    nextFollowupDate || undefined
                  );
                  setSelectedFuForOutcome(null);
                }}
                className="rounded bg-[var(--brand-600)] hover:bg-[var(--brand-700)] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
              >
                Save outcome & close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Postpone Modal */}
      {selectedFuForPostpone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-[var(--text)]">Postpone Follow-up</h2>
            <p className="text-xs text-[var(--text-2)]">
              Per specification, the current check-in remains in history as Postponed, and a new Scheduled follow-up is created with the new date.
            </p>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--text-2)]">New Date</label>
              <input
                type="date"
                value={newPostponeDate}
                onChange={(e) => setNewPostponeDate(e.target.value)}
                className="w-full rounded border border-[var(--border-strong)] bg-[var(--surface)] px-2.5 py-1.5 text-xs text-[var(--text)] focus:border-[var(--brand-600)] focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedFuForPostpone(null)}
                className="rounded px-3 py-1.5 text-xs font-medium text-[var(--text-2)] hover:bg-[var(--surface-2)]"
              >
                Cancel
              </button>
              <button
                disabled={!newPostponeDate}
                onClick={() => {
                  postponeFollowup(selectedFuForPostpone.id, newPostponeDate);
                  setSelectedFuForPostpone(null);
                }}
                className="rounded bg-[var(--brand-600)] hover:bg-[var(--brand-700)] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
              >
                Confirm postponement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule New Follow-up Modal */}
      {isScheduleNewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-[var(--text)]">Schedule Follow-up</h2>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--text-2)]">Target Item</label>
              <select
                value={newFuItemId}
                onChange={(e) => setNewFuItemId(e.target.value)}
                className="w-full rounded border border-[var(--border-strong)] bg-[var(--surface)] px-2.5 py-1.5 text-xs text-[var(--text)]"
              >
                {workItems
                  .filter((w) => !w.isArchived)
                  .map((w) => (
                    <option key={w.id} value={w.id}>
                      [{w.itemType.toUpperCase()}] {w.name}
                    </option>
                  ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--text-2)]">Follow-up Date</label>
              <input
                type="date"
                value={newFuDate}
                onChange={(e) => setNewFuDate(e.target.value)}
                className="w-full rounded border border-[var(--border-strong)] bg-[var(--surface)] px-2.5 py-1.5 text-xs text-[var(--text)]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--text-2)]">Agenda / Objective</label>
              <textarea
                rows={3}
                value={newFuRemarks}
                onChange={(e) => setNewFuRemarks(e.target.value)}
                placeholder="What will you check in on?"
                className="w-full rounded border border-[var(--border-strong)] bg-[var(--surface)] p-2 text-xs text-[var(--text)]"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsScheduleNewOpen(false)}
                className="rounded px-3 py-1.5 text-xs font-medium text-[var(--text-2)] hover:bg-[var(--surface-2)]"
              >
                Cancel
              </button>
              <button
                disabled={!newFuItemId || !newFuDate}
                onClick={() => {
                  createFollowup({
                    workItemId: newFuItemId,
                    followupDate: newFuDate,
                    statusId: 'fstat-scheduled',
                    remarks: newFuRemarks.trim() || undefined,
                  });
                  setIsScheduleNewOpen(false);
                }}
                className="rounded bg-[var(--brand-600)] hover:bg-[var(--brand-700)] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
              >
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
