/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Flag,
  Calendar,
  MessageSquare,
  AlertCircle,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getDeadlineInfo } from '../../utils/engine';

export const CeoAttentionView: React.FC = () => {
  const {
    workItems,
    ceoAttentionStatuses,
    statusMap,
    priorityMap,
    departmentMap,
    todayStr,
    dueSoonWindow,
    setSelectedItemId,
    followups,
    isCeoViewer,
  } = useApp();

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    'ceo-pending': true,
    'ceo-in-progress': true,
    'ceo-completed': false,
  });

  const toggleGroup = (id: string) => {
    setExpandedGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const flaggedItems = workItems.filter((i) => i.needsCeoAttention && !i.isArchived);

  return (
    <div className="space-y-5 pb-16 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-[var(--attention-bg)] text-[var(--attention-fg)]">
              <Flag className="h-4 w-4 fill-[var(--attention-fg)]" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-[var(--attention-fg)]">
              Needs CEO Attention
            </h1>
          </div>
          <p className="text-xs text-[var(--text-3)] mt-0.5">
            Prioritized executive queue reserved strictly for strategic decisions, escalations, and board alignments
          </p>
        </div>

        {isCeoViewer && (
          <span className="rounded-md border border-[var(--attention-border)] bg-[var(--attention-bg)] px-3 py-1 text-xs font-semibold text-[var(--attention-fg)]">
            CEO Executive Review Mode
          </span>
        )}
      </div>

      {/* Grouped by CEO Status: Pending, In-Progress, Completed */}
      <div className="space-y-4">
        {ceoAttentionStatuses.map((ceoStatus) => {
          const itemsInGroup = flaggedItems.filter(
            (i) => i.ceoAttentionStatusId === ceoStatus.id || (!i.ceoAttentionStatusId && ceoStatus.id === 'ceo-pending')
          );
          const isExpanded = !!expandedGroups[ceoStatus.id];

          return (
            <div
              key={ceoStatus.id}
              className="rounded-md border border-[var(--border)] bg-[var(--surface)] shadow-2xs overflow-hidden"
            >
              {/* Group Header */}
              <div
                onClick={() => toggleGroup(ceoStatus.id)}
                className="flex items-center justify-between px-4 py-3 bg-[var(--surface-2)] cursor-pointer hover:bg-[var(--surface-3)] transition-colors"
              >
                <div className="flex items-center gap-2">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-[var(--text-2)]" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-[var(--text-2)]" />
                  )}
                  <span className="text-xs font-bold text-[var(--text)] uppercase tracking-wider">
                    {ceoStatus.name}
                  </span>
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[var(--attention-bg)] border border-[var(--attention-border)] px-1.5 text-[11px] font-semibold text-[var(--attention-fg)]">
                    {itemsInGroup.length}
                  </span>
                </div>
                <span className="text-xs text-[var(--text-3)]">
                  {isExpanded ? 'Collapse' : 'Expand'}
                </span>
              </div>

              {/* Items in this CEO attention status */}
              {isExpanded && (
                <div className="divide-y divide-[var(--border)]">
                  {itemsInGroup.length === 0 ? (
                    <div className="py-6 text-center text-xs text-[var(--text-3)]">
                      No items currently marked {ceoStatus.name}.
                    </div>
                  ) : (
                    itemsInGroup.map((item) => {
                      const status = statusMap.get(item.statusId);
                      const priority = priorityMap.get(item.priorityId);
                      const dept = departmentMap.get(item.departmentIds[0]);
                      const dl = getDeadlineInfo(item.dueDate, status, todayStr, dueSoonWindow);

                      // Latest follow-up outcome
                      const latestFu = followups
                        .filter((f) => f.workItemId === item.id && f.statusId === 'fstat-done')
                        .sort((a, b) => b.followupDate.localeCompare(a.followupDate))[0];

                      return (
                        <div
                          key={item.id}
                          onClick={() => setSelectedItemId(item.id)}
                          className="p-4 hover:bg-[var(--surface-2)] transition-colors cursor-pointer space-y-2"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <Flag className="h-3.5 w-3.5 text-[var(--attention-fg)] fill-[var(--attention-fg)] shrink-0" />
                              <span className="text-sm font-semibold text-[var(--text)] truncate">
                                {item.name}
                              </span>
                              <span className="rounded bg-[var(--surface-3)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--text-2)] uppercase">
                                {item.itemType}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {dept && (
                                <span className="flex items-center gap-1 text-xs text-[var(--text-2)]">
                                  <span
                                    className="h-2 w-2 rounded-full shrink-0"
                                    style={{ backgroundColor: dept.color }}
                                  />
                                  <span>{dept.name}</span>
                                </span>
                              )}
                              <span className="text-xs font-medium text-[var(--text-3)]">
                                Priority: {priority?.name}
                              </span>
                              <span
                                className={`text-xs tabular-nums font-semibold ${
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

                          {/* CEO Note (Why flagged) */}
                          {item.ceoNote && (
                            <div className="rounded border border-[var(--attention-border)] bg-[var(--attention-bg)]/60 px-3 py-1.5 text-xs text-[var(--attention-fg)] font-medium">
                              <span className="font-semibold">Note to CEO: </span>
                              {item.ceoNote}
                            </div>
                          )}

                          {/* Blocked Reason if applicable */}
                          {status?.stateGroup === 'blocked' && (
                            <div className="rounded border border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/30 px-3 py-1.5 text-xs text-[var(--blocked-fg)] font-medium">
                              <span className="font-semibold">Bottleneck: </span>
                              {item.blockedReason}
                            </div>
                          )}

                          {/* Latest Follow-up Outcome */}
                          {latestFu && (
                            <div className="flex items-start gap-1.5 text-xs text-[var(--text-2)] pt-1">
                              <MessageSquare className="h-3.5 w-3.5 text-[var(--text-3)] shrink-0 mt-0.5" />
                              <div>
                                <span className="font-medium text-[var(--text)]">
                                  Latest check-in ({latestFu.followupDate}):{' '}
                                </span>
                                <span>{latestFu.remarks}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
