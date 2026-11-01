/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Clock,
  Flag,
  Lock,
  OctagonX,
  Plus,
  CalendarDays,
  Link2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SummaryStrip } from '../common/SummaryStrip';
import {
  computeItemProgressAndWeights,
  countLeaves,
  getDeadlineInfo,
} from '../../utils/engine';
import { Meeting } from '../../types';

export const DashboardView: React.FC = () => {
  const {
    workItems,
    departments,
    statusMap,
    priorityMap,
    ceoStatusMap,
    todayStr,
    dueSoonWindow,
    dueSoonUnit,
    setActiveNav,
    setSelectedItemId,
    followups,
    departmentMap,
    canEdit,
    setIsNewItemOpen,
    setNewItemDefaultType,
    meetings,
    meetingTypes,
    itemLinks,
    updateMeeting,
  } = useApp();

  const [followupTab, setFollowupTab] = useState<'today' | 'upcoming' | 'missed'>('today');
  const [meetingTab, setMeetingTab] = useState<'today' | 'upcoming' | 'all'>('today');

  const windowDays =
    dueSoonUnit === 'weeks' ? dueSoonWindow * 7 : dueSoonUnit === 'months' ? dueSoonWindow * 30 : dueSoonWindow;

  // Filter items
  const activeItems = workItems.filter((i) => !i.isArchived);

  // 1. Needs CEO attention
  const ceoItems = activeItems.filter((i) => {
    if (!i.needsCeoAttention) return false;
    const ceoStat = ceoStatusMap.get(i.ceoAttentionStatusId ?? '');
    return !ceoStat?.isFinal;
  });

  // 2. Overdue items
  const overdueItems = activeItems.filter((i) => {
    const status = statusMap.get(i.statusId);
    if (!status || status.stateGroup === 'done' || status.stateGroup === 'cancelled') return false;
    const dl = getDeadlineInfo(i.dueDate, status, todayStr, windowDays);
    return dl.flag === 'overdue';
  });

  // 3. Blocked items
  const blockedItems = activeItems.filter((i) => {
    const status = statusMap.get(i.statusId);
    return status?.stateGroup === 'blocked';
  });

  // 4. Due in next X days
  const dueSoonItems = activeItems.filter((i) => {
    const status = statusMap.get(i.statusId);
    if (!status || status.stateGroup === 'done' || status.stateGroup === 'cancelled') return false;
    const dl = getDeadlineInfo(i.dueDate, status, todayStr, windowDays);
    return dl.flag === 'due_today' || dl.flag === 'due_soon';
  });

  // 5. Projects
  const projects = activeItems.filter((i) => i.itemType === 'project');

  // Follow-ups tabs
  const todayFollowups = followups.filter((f) => f.followupDate === todayStr && f.statusId === 'fstat-scheduled');
  const upcomingFollowups = followups.filter((f) => f.followupDate > todayStr && f.statusId === 'fstat-scheduled');
  const missedFollowups = followups.filter((f) => f.statusId === 'fstat-missed');

  // Meetings (Today & Upcoming)
  const todayMeetings = meetings
    .filter((m) => !m.isArchived && m.scheduledAt.startsWith(todayStr))
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));

  const upcomingMeetings = meetings
    .filter((m) => !m.isArchived && m.scheduledAt.slice(0, 10) > todayStr)
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));

  // Department workloads (only open items)
  const deptCounts = departments.map((d) => {
    const count = activeItems.filter((item) => {
      const status = statusMap.get(item.statusId);
      const isClosed = status?.stateGroup === 'done' || status?.stateGroup === 'cancelled';
      return !isClosed && item.departmentIds.includes(d.id);
    }).length;
    return { dept: d, count };
  }).sort((a, b) => b.count - a.count);

  const maxDeptCount = Math.max(1, ...deptCounts.map((d) => d.count));

  const renderMeetingCard = (m: Meeting, isTodaySection = false) => {
    const mt = meetingTypes.find((t) => t.id === m.meetingTypeId);
    const dateObj = new Date(m.scheduledAt);
    const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = dateObj.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
    const generatedLinks = itemLinks.filter(
      (l) => l.sourceType === 'meeting' && l.sourceId === m.id && l.targetType === 'work_item'
    );

    return (
      <div
        key={m.id}
        onClick={() => setActiveNav('meetings')}
        className="flex flex-col sm:flex-row sm:items-center justify-between py-3 gap-2 hover:bg-[var(--surface-2)] -mx-4 px-4 transition-colors cursor-pointer group"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full shrink-0"
              style={{ backgroundColor: mt?.color || 'var(--brand-600)' }}
            />
            <span className="text-xs font-semibold text-[var(--text)] truncate">
              {m.title}
            </span>
            <span className="rounded bg-[var(--surface-3)] px-1.5 py-0.2 text-[10px] text-[var(--text-2)] font-medium shrink-0">
              {mt?.name}
            </span>
            {m.status === 'held' && (
              <span className="rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.2 text-[10px] font-semibold uppercase shrink-0">
                Held
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 mt-1 text-[11px] text-[var(--text-3)] truncate">
            <span className="flex items-center gap-1 font-medium text-[var(--text-2)] shrink-0">
              <Clock className="h-3 w-3 text-[var(--brand-600)] shrink-0" />
              <span>{isTodaySection ? `Today at ${timeStr}` : `${dateStr} · ${timeStr}`}</span>
            </span>
            {m.agenda && (
              <span className="text-[var(--text-2)] truncate max-w-sm">
                Agenda: {m.agenda.split('\n')[0]}
              </span>
            )}
            {generatedLinks.length > 0 && (
              <span className="text-[var(--brand-600)] font-semibold flex items-center gap-1 shrink-0">
                <Link2 className="h-3 w-3" />
                <span>{generatedLinks.length} action item{generatedLinks.length === 1 ? '' : 's'}</span>
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {canEdit && m.status === 'scheduled' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                updateMeeting(m.id, { status: 'held' });
              }}
              className="rounded border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 text-[11px] font-semibold hover:bg-emerald-100 transition-colors cursor-pointer"
            >
              Mark Held
            </button>
          )}
          <ChevronRight className="h-3.5 w-3.5 text-[var(--text-3)] group-hover:text-[var(--text)] transition-colors" />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Title & Date Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--text)]">Dashboard</h1>
          <p className="text-xs text-[var(--text-3)] mt-0.5">
            Summary as of Sunday, 1 November 2026 (Asia/Kathmandu)
          </p>
        </div>
        {canEdit && (
          <div className="flex items-center gap-2">
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
          </div>
        )}
      </div>

      {/* Connected 5-segment Summary Strip with large text */}
      <SummaryStrip size="large" />

      {/* 12-Column Responsive Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top-Left: Needs CEO Attention (8 cols) */}
        <section className="lg:col-span-8 rounded-md border border-[var(--border)] bg-[var(--surface)] p-4 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded bg-[var(--attention-bg)] text-[var(--attention-fg)]">
                <Flag className="h-3.5 w-3.5 fill-[var(--attention-fg)]" />
              </div>
              <h2 className="text-sm font-semibold text-[var(--text)]">
                Needs CEO Attention
              </h2>
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[var(--attention-bg)] border border-[var(--attention-border)] px-1.5 text-[11px] font-semibold text-[var(--attention-fg)]">
                {ceoItems.length}
              </span>
            </div>
            <button
              onClick={() => setActiveNav('ceo')}
              className="text-xs font-medium text-[var(--brand-600)] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View all</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="divide-y divide-[var(--border)]">
            {ceoItems.length === 0 ? (
              <div className="py-8 text-center text-xs text-[var(--text-3)]">
                No items currently require executive CEO intervention.
              </div>
            ) : (
              ceoItems.slice(0, 5).map((item) => {
                const status = statusMap.get(item.statusId);
                const ceoStatus = ceoStatusMap.get(item.ceoAttentionStatusId ?? '');
                const dl = getDeadlineInfo(item.dueDate, status, todayStr, windowDays);
                const dept = departmentMap.get(item.departmentIds[0]);

                // Find latest follow-up outcome
                const latestFu = followups
                  .filter((f) => f.workItemId === item.id && f.statusId === 'fstat-done')
                  .sort((a, b) => b.followupDate.localeCompare(a.followupDate))[0];

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItemId(item.id)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between py-3 gap-2 hover:bg-[var(--surface-2)] -mx-4 px-4 transition-colors cursor-pointer"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Flag className="h-3 w-3 text-[var(--attention-fg)] shrink-0 fill-[var(--attention-fg)]" />
                        <span className="text-xs font-semibold text-[var(--text)] truncate">
                          {item.name}
                        </span>
                        {item.itemType === 'project' && (
                          <span className="rounded bg-[var(--surface-3)] px-1.5 py-0.2 text-[10px] text-[var(--text-2)] font-medium">
                            Project
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-[var(--text-3)] truncate">
                        {dept && (
                          <span className="flex items-center gap-1">
                            <span
                              className="h-1.5 w-1.5 rounded-full shrink-0"
                              style={{ backgroundColor: dept.color }}
                            />
                            {dept.name}
                          </span>
                        )}
                        {item.ceoNote && (
                          <span className="text-[var(--attention-fg)] truncate max-w-sm">
                            "{item.ceoNote}"
                          </span>
                        )}
                        {latestFu && (
                          <span className="text-[var(--text-2)] truncate max-w-xs">
                            Latest: {latestFu.remarks}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      {ceoStatus && (
                        <span className="rounded border border-[var(--attention-border)] bg-[var(--attention-bg)] px-2 py-0.5 text-[11px] font-semibold text-[var(--attention-fg)]">
                          {ceoStatus.name}
                        </span>
                      )}
                      <span
                        className={`text-xs tabular-nums font-medium ${
                          dl.flag === 'overdue'
                            ? 'text-[var(--danger-fg)]'
                            : dl.flag === 'due_today'
                            ? 'text-[var(--due-today-fg)]'
                            : 'text-[var(--text-2)]'
                        }`}
                      >
                        {dl.text}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Top-Right: Follow-ups (4 cols) */}
        <section className="lg:col-span-4 rounded-md border border-[var(--border)] bg-[var(--surface)] p-4 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
            <h2 className="text-sm font-semibold text-[var(--text)]">Follow-ups</h2>
            <button
              onClick={() => setActiveNav('followups')}
              className="text-xs font-medium text-[var(--brand-600)] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View all</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Inner Tabs: Today | Upcoming | Missed */}
          <div className="flex border-b border-[var(--border)] mt-2 text-xs">
            <button
              onClick={() => setFollowupTab('today')}
              className={`flex-1 pb-2 text-center font-medium cursor-pointer transition-colors ${
                followupTab === 'today'
                  ? 'border-b-2 border-[var(--brand-600)] text-[var(--brand-600)] font-semibold'
                  : 'text-[var(--text-3)] hover:text-[var(--text)]'
              }`}
            >
              Today ({todayFollowups.length})
            </button>
            <button
              onClick={() => setFollowupTab('upcoming')}
              className={`flex-1 pb-2 text-center font-medium cursor-pointer transition-colors ${
                followupTab === 'upcoming'
                  ? 'border-b-2 border-[var(--brand-600)] text-[var(--brand-600)] font-semibold'
                  : 'text-[var(--text-3)] hover:text-[var(--text)]'
              }`}
            >
              Upcoming ({upcomingFollowups.length})
            </button>
            <button
              onClick={() => setFollowupTab('missed')}
              className={`flex-1 pb-2 text-center font-medium cursor-pointer transition-colors ${
                followupTab === 'missed'
                  ? 'border-b-2 border-[var(--danger-fg)] text-[var(--danger-fg)] font-semibold'
                  : missedFollowups.length > 0
                  ? 'text-[var(--danger-fg)] hover:opacity-80'
                  : 'text-[var(--text-3)] hover:text-[var(--text)]'
              }`}
            >
              Missed ({missedFollowups.length})
            </button>
          </div>

          <div className="divide-y divide-[var(--border)] mt-1">
            {followupTab === 'today' &&
              (todayFollowups.length === 0 ? (
                <div className="py-6 text-center text-xs text-[var(--text-3)]">
                  No follow-ups due today.
                </div>
              ) : (
                todayFollowups.slice(0, 4).map((fu) => {
                  const targetItem = workItems.find((w) => w.id === fu.workItemId);
                  return (
                    <div
                      key={fu.id}
                      onClick={() => setSelectedItemId(fu.workItemId)}
                      className="py-2.5 hover:bg-[var(--surface-2)] -mx-4 px-4 transition-colors cursor-pointer"
                    >
                      <div className="text-xs font-semibold text-[var(--text)] truncate">
                        {targetItem?.name ?? 'Unknown item'}
                      </div>
                      <div className="text-[11px] text-[var(--text-2)] truncate mt-0.5">
                        {fu.remarks}
                      </div>
                    </div>
                  );
                })
              ))}

            {followupTab === 'upcoming' &&
              (upcomingFollowups.length === 0 ? (
                <div className="py-6 text-center text-xs text-[var(--text-3)]">
                  No upcoming follow-ups scheduled.
                </div>
              ) : (
                upcomingFollowups.slice(0, 4).map((fu) => {
                  const targetItem = workItems.find((w) => w.id === fu.workItemId);
                  return (
                    <div
                      key={fu.id}
                      onClick={() => setSelectedItemId(fu.workItemId)}
                      className="py-2.5 hover:bg-[var(--surface-2)] -mx-4 px-4 transition-colors cursor-pointer flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-[var(--text)] truncate">
                          {targetItem?.name}
                        </div>
                        <div className="text-[11px] text-[var(--text-3)] truncate mt-0.5">
                          {fu.remarks}
                        </div>
                      </div>
                      <span className="text-[11px] text-[var(--text-2)] tabular-nums shrink-0 font-medium">
                        {fu.followupDate}
                      </span>
                    </div>
                  );
                })
              ))}

            {followupTab === 'missed' &&
              (missedFollowups.length === 0 ? (
                <div className="py-6 text-center text-xs text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>No missed follow-ups!</span>
                </div>
              ) : (
                missedFollowups.slice(0, 4).map((fu) => {
                  const targetItem = workItems.find((w) => w.id === fu.workItemId);
                  return (
                    <div
                      key={fu.id}
                      onClick={() => setSelectedItemId(fu.workItemId)}
                      className="py-2.5 hover:bg-[var(--surface-2)] -mx-4 px-4 transition-colors cursor-pointer bg-red-50/40 dark:bg-red-950/20"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[var(--danger-fg)] truncate">
                          {targetItem?.name}
                        </span>
                        <span className="text-[10px] font-semibold text-[var(--danger-fg)] uppercase">
                          Missed ({fu.followupDate})
                        </span>
                      </div>
                      <div className="text-[11px] text-[var(--text-2)] truncate mt-0.5">
                        {fu.remarks || '(no outcome logged)'}
                      </div>
                    </div>
                  );
                })
              ))}
          </div>
        </section>

        {/* Mid-Left: Meetings Section (8 cols) with Today & Upcoming */}
        <section className="lg:col-span-8 rounded-md border border-[var(--border)] bg-[var(--surface)] p-4 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded bg-[var(--brand-subtle)] text-[var(--brand-600)]">
                <CalendarDays className="h-3.5 w-3.5" />
              </div>
              <h2 className="text-sm font-semibold text-[var(--text)]">Meetings</h2>
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[var(--brand-subtle)] border border-[var(--brand-border)] px-1.5 text-[11px] font-semibold text-[var(--brand-600)]">
                {todayMeetings.length + upcomingMeetings.length}
              </span>
            </div>
            <button
              onClick={() => setActiveNav('meetings')}
              className="text-xs font-medium text-[var(--brand-600)] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View all</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Inner Tabs: Today | Upcoming | All */}
          <div className="flex border-b border-[var(--border)] mt-2 text-xs">
            <button
              onClick={() => setMeetingTab('today')}
              className={`flex-1 pb-2 text-center font-medium cursor-pointer transition-colors ${
                meetingTab === 'today'
                  ? 'border-b-2 border-[var(--brand-600)] text-[var(--brand-600)] font-semibold'
                  : 'text-[var(--text-3)] hover:text-[var(--text)]'
              }`}
            >
              Today ({todayMeetings.length})
            </button>
            <button
              onClick={() => setMeetingTab('upcoming')}
              className={`flex-1 pb-2 text-center font-medium cursor-pointer transition-colors ${
                meetingTab === 'upcoming'
                  ? 'border-b-2 border-[var(--brand-600)] text-[var(--brand-600)] font-semibold'
                  : 'text-[var(--text-3)] hover:text-[var(--text)]'
              }`}
            >
              Upcoming ({upcomingMeetings.length})
            </button>
            <button
              onClick={() => setMeetingTab('all')}
              className={`flex-1 pb-2 text-center font-medium cursor-pointer transition-colors ${
                meetingTab === 'all'
                  ? 'border-b-2 border-[var(--brand-600)] text-[var(--brand-600)] font-semibold'
                  : 'text-[var(--text-3)] hover:text-[var(--text)]'
              }`}
            >
              All ({todayMeetings.length + upcomingMeetings.length})
            </button>
          </div>

          <div className="divide-y divide-[var(--border)] mt-1">
            {meetingTab === 'today' &&
              (todayMeetings.length === 0 ? (
                <div className="py-8 text-center text-xs text-[var(--text-3)]">
                  No meetings scheduled for today.
                </div>
              ) : (
                todayMeetings.map((m) => renderMeetingCard(m, true))
              ))}

            {meetingTab === 'upcoming' &&
              (upcomingMeetings.length === 0 ? (
                <div className="py-8 text-center text-xs text-[var(--text-3)]">
                  No upcoming meetings scheduled.
                </div>
              ) : (
                upcomingMeetings.map((m) => renderMeetingCard(m, false))
              ))}

            {meetingTab === 'all' && (
              <div className="space-y-4 pt-2">
                {/* Today subsection */}
                <div>
                  <div className="text-[11px] font-bold text-[var(--text-3)] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <span>Today's Meetings</span>
                    <span className="text-[10px] rounded bg-[var(--surface-3)] px-1.5 py-0.2 tabular-nums">
                      {todayMeetings.length}
                    </span>
                  </div>
                  {todayMeetings.length === 0 ? (
                    <div className="py-2 text-xs text-[var(--text-3)] italic">No meetings today</div>
                  ) : (
                    <div className="divide-y divide-[var(--border)]">
                      {todayMeetings.map((m) => renderMeetingCard(m, true))}
                    </div>
                  )}
                </div>

                {/* Upcoming subsection */}
                <div className="pt-2 border-t border-[var(--border)]">
                  <div className="text-[11px] font-bold text-[var(--text-3)] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <span>Upcoming Meetings</span>
                    <span className="text-[10px] rounded bg-[var(--surface-3)] px-1.5 py-0.2 tabular-nums">
                      {upcomingMeetings.length}
                    </span>
                  </div>
                  {upcomingMeetings.length === 0 ? (
                    <div className="py-2 text-xs text-[var(--text-3)] italic">No upcoming meetings</div>
                  ) : (
                    <div className="divide-y divide-[var(--border)]">
                      {upcomingMeetings.map((m) => renderMeetingCard(m, false))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Mid-Right: Blocked Items (4 cols) */}
        <section className="lg:col-span-4 rounded-md border border-[var(--border)] bg-[var(--surface)] p-4 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-[var(--danger-fg)]" />
              <h2 className="text-sm font-semibold text-[var(--text)]">Overdue</h2>
              <span className="text-xs text-[var(--danger-fg)] font-semibold">
                ({overdueItems.length})
              </span>
            </div>
            <button
              onClick={() => setActiveNav('tasks')}
              className="text-xs font-medium text-[var(--brand-600)] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View all</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="divide-y divide-[var(--border)]">
            {overdueItems.length === 0 ? (
              <div className="py-8 text-center text-xs text-[var(--text-3)] flex items-center justify-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>Nothing overdue! Excellent work.</span>
              </div>
            ) : (
              overdueItems.slice(0, 5).map((item) => {
                const status = statusMap.get(item.statusId);
                const dl = getDeadlineInfo(item.dueDate, status, todayStr, windowDays);
                const dept = departmentMap.get(item.departmentIds[0]);

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItemId(item.id)}
                    className="flex items-center justify-between py-2.5 hover:bg-[var(--surface-2)] -mx-4 px-4 transition-colors cursor-pointer"
                  >
                    <div className="min-w-0 pr-4">
                      <div className="text-xs font-medium text-[var(--text)] truncate">
                        {item.name}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[var(--text-3)]">
                        {dept && <span>{dept.name}</span>}
                        <span>Due {item.dueDate}</span>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-[var(--danger-fg)] tabular-nums shrink-0">
                      {dl.text}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Mid-Right: Blocked Items (4 cols) */}
        <section className="lg:col-span-4 rounded-md border border-[var(--border)] bg-[var(--surface)] p-4 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <OctagonX className="h-4 w-4 text-[var(--blocked-fg)]" />
              <h2 className="text-sm font-semibold text-[var(--text)]">Blocked</h2>
              <span className="text-xs text-[var(--blocked-fg)] font-semibold">
                ({blockedItems.length})
              </span>
            </div>
            <button
              onClick={() => setActiveNav('tasks')}
              className="text-xs font-medium text-[var(--brand-600)] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View all</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="divide-y divide-[var(--border)]">
            {blockedItems.length === 0 ? (
              <div className="py-8 text-center text-xs text-[var(--text-3)]">
                No items are currently blocked.
              </div>
            ) : (
              blockedItems.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItemId(item.id)}
                  className="py-2.5 hover:bg-[var(--surface-2)] -mx-4 px-4 transition-colors cursor-pointer"
                >
                  <div className="text-xs font-semibold text-[var(--text)] truncate">
                    {item.name}
                  </div>
                  <div className="text-[11px] text-[var(--blocked-fg)] truncate font-medium mt-0.5">
                    Reason: {item.blockedReason || 'No reason provided'}
                  </div>
                  {item.blockedSince && (
                    <div className="text-[10px] text-[var(--text-3)] mt-0.5">
                      Blocked since {item.blockedSince}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        {/* Lower-Left: Due in next X days (8 cols) */}
        <section className="lg:col-span-8 rounded-md border border-[var(--border)] bg-[var(--surface)] p-4 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <h2 className="text-sm font-semibold text-[var(--text)]">
                Due in next {dueSoonWindow} {dueSoonUnit}
              </h2>
              <span className="text-xs text-[var(--text-3)]">
                ({dueSoonItems.length})
              </span>
            </div>
            <button
              onClick={() => setActiveNav('tasks')}
              className="text-xs font-medium text-[var(--brand-600)] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View all</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="divide-y divide-[var(--border)]">
            {dueSoonItems.length === 0 ? (
              <div className="py-8 text-center text-xs text-[var(--text-3)]">
                No upcoming deliverables within this window.
              </div>
            ) : (
              dueSoonItems.slice(0, 5).map((item) => {
                const status = statusMap.get(item.statusId);
                const dl = getDeadlineInfo(item.dueDate, status, todayStr, windowDays);
                const dept = departmentMap.get(item.departmentIds[0]);

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItemId(item.id)}
                    className="flex items-center justify-between py-2.5 hover:bg-[var(--surface-2)] -mx-4 px-4 transition-colors cursor-pointer"
                  >
                    <div className="min-w-0 pr-4">
                      <div className="text-xs font-medium text-[var(--text)] truncate">
                        {item.name}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[var(--text-3)]">
                        {dept && <span>{dept.name}</span>}
                        <span>Due {item.dueDate}</span>
                      </div>
                    </div>
                    <span
                      className={`text-xs tabular-nums font-semibold shrink-0 ${
                        dl.flag === 'due_today'
                          ? 'text-[var(--due-today-fg)]'
                          : 'text-[var(--due-soon-fg)]'
                      }`}
                    >
                      {dl.text}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Lower-Right: Department Workload Bars (4 cols) */}
        <section className="lg:col-span-4 rounded-md border border-[var(--border)] bg-[var(--surface)] p-4 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
            <h2 className="text-sm font-semibold text-[var(--text)]">
              Open items by department
            </h2>
          </div>

          <div className="space-y-3 mt-3">
            {deptCounts.map(({ dept, count }) => {
              const widthPct = Math.round((count / maxDeptCount) * 100);
              return (
                <div
                  key={dept.id}
                  onClick={() => setActiveNav('tasks')}
                  className="space-y-1 hover:opacity-80 transition-opacity cursor-pointer"
                >
                  <div className="flex items-center justify-between text-xs font-medium text-[var(--text-2)]">
                    <span className="flex items-center gap-1.5 truncate">
                      <span
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: dept.color }}
                      />
                      {dept.name}
                    </span>
                    <span className="tabular-nums font-semibold text-[var(--text)]">
                      {count}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[var(--surface-3)] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${widthPct}%`,
                        backgroundColor: dept.color || 'var(--brand-600)',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Bottom: Projects Health Overview (12 cols) */}
        <section className="lg:col-span-12 rounded-md border border-[var(--border)] bg-[var(--surface)] p-4 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-[var(--text)]">Projects</h2>
              <span className="text-xs text-[var(--text-3)] font-medium">
                ({projects.length})
              </span>
            </div>
            <button
              onClick={() => setActiveNav('projects')}
              className="text-xs font-medium text-[var(--brand-600)] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View project tree</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="divide-y divide-[var(--border)] mt-1">
            {projects.map((proj) => {
              const { progress, childWeights } = computeItemProgressAndWeights(
                proj,
                workItems,
                statusMap,
                priorityMap
              );
              const leaves = countLeaves(proj.id, workItems, statusMap);
              const hasManualWeight = Object.values(childWeights).some((w) => w.isManual);
              const status = statusMap.get(proj.id);
              const dl = getDeadlineInfo(proj.dueDate, status, todayStr, windowDays);

              return (
                <div
                  key={proj.id}
                  onClick={() => setSelectedItemId(proj.id)}
                  className="flex flex-col sm:flex-row sm:items-center justify-between py-3 gap-3 hover:bg-[var(--surface-2)] -mx-4 px-4 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0 max-w-md">
                    {proj.needsCeoAttention && (
                      <Flag className="h-3.5 w-3.5 text-[var(--attention-fg)] fill-[var(--attention-fg)] shrink-0" />
                    )}
                    <div className="truncate">
                      <div className="text-xs font-semibold text-[var(--text)] truncate">
                        {proj.name}
                      </div>
                      <div className="text-[11px] text-[var(--text-3)] truncate mt-0.5">
                        {proj.description || 'No description'}
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="flex items-center gap-3 flex-1 max-w-xs">
                    <div className="flex-1 h-2 rounded-full bg-[var(--surface-3)] overflow-hidden">
                      {progress !== null ? (
                        <div
                          className="h-full rounded-full transition-all duration-300"
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
                    <div className="flex items-center gap-1 text-xs tabular-nums font-semibold text-[var(--text)] shrink-0">
                      <span>{progress !== null ? `${progress}%` : 'N/A'}</span>
                      {hasManualWeight && (
                        <span title="Weights set manually">
                          <Lock className="h-3 w-3 text-[var(--text-3)]" />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Meta stats */}
                  <div className="flex items-center gap-4 text-xs text-[var(--text-3)] shrink-0">
                    <span className="tabular-nums">
                      {leaves} {leaves === 1 ? 'task' : 'tasks'}
                    </span>
                    <span className="tabular-nums font-medium text-[var(--text-2)]">
                      {proj.dueDate ? `Due ${proj.dueDate}` : 'No due date'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};
