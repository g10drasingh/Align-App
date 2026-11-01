/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  FolderTree,
  History,
  LayoutDashboard,
  ListChecks,
  MessageSquareText,
  Settings,
  ShieldCheck,
  UserCheck,
  Eye,
  Flag,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Sidebar: React.FC = () => {
  const {
    activeNav,
    setActiveNav,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    summaryCounts,
    followups,
    currentUser,
    setCurrentUser,
    users,
    canEdit,
  } = useApp();

  const missedFollowupsCount = followups.filter(
    (f) => f.statusId === 'fstat-missed'
  ).length;

  const navItems = [
    {
      group: 'Work',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: LayoutDashboard,
          count: undefined,
        },
        {
          id: 'tasks',
          label: 'Tasks',
          icon: ListChecks,
          count: summaryCounts.open,
        },
        {
          id: 'projects',
          label: 'Projects',
          icon: FolderTree,
          count: undefined,
        },
        {
          id: 'ceo',
          label: 'CEO Attention',
          icon: Flag,
          count: summaryCounts.needsCeo,
          badgeColor: 'plum',
        },
      ],
    },
    {
      group: 'Check-ins',
      items: [
        {
          id: 'followups',
          label: 'Follow-ups',
          icon: MessageSquareText,
          count: missedFollowupsCount > 0 ? missedFollowupsCount : undefined,
          badgeColor: 'red',
        },
        {
          id: 'meetings',
          label: 'Meetings',
          icon: CalendarDays,
          count: undefined,
        },
      ],
    },
  ];

  return (
    <aside
      className={`fixed top-0 bottom-0 left-0 z-30 flex flex-col border-r border-[var(--border)] bg-[var(--surface)] transition-all duration-200 select-none ${
        isSidebarCollapsed ? 'w-16' : 'w-62'
      }`}
    >
      {/* Brand Header with eSewa Green Logo */}
      <div className="flex h-14 items-center justify-between border-b border-[var(--border)] px-3">
        <div className="flex items-center gap-2.5 overflow-hidden">
          {/* eSewa Green Brand Icon */}
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[var(--brand-600)] text-white shadow-xs font-semibold">
            <span className="text-base tracking-tighter">eA</span>
          </div>
          {!isSidebarCollapsed && (
            <div className="flex flex-col truncate leading-tight">
              <span className="font-semibold text-sm text-[var(--text)] tracking-tight">
                Align
              </span>
              <span className="text-[11px] text-[var(--text-3)] truncate">
                G&E Executive Ledger
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        {navItems.map((group) => (
          <div key={group.group} className="space-y-1">
            {!isSidebarCollapsed && (
              <div className="px-2 pb-1 text-[11px] font-medium text-[var(--text-3)] uppercase tracking-wider">
                {group.group}
              </div>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;
              const isPlum = item.badgeColor === 'plum';
              const isRed = item.badgeColor === 'red';

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveNav(item.id)}
                  title={isSidebarCollapsed ? item.label : undefined}
                  className={`group relative flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[var(--brand-subtle)] text-[var(--brand-600)]'
                      : 'text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]'
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 transition-transform ${
                      isActive
                        ? 'text-[var(--brand-600)]'
                        : isPlum && item.count && item.count > 0
                        ? 'text-[var(--attention-fg)]'
                        : 'text-[var(--text-2)] group-hover:text-[var(--text)]'
                    }`}
                  />
                  {!isSidebarCollapsed && (
                    <span className="flex-1 text-left truncate">{item.label}</span>
                  )}

                  {/* Badge */}
                  {item.count !== undefined && item.count > 0 && (
                    <span
                      className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-semibold tabular-nums shrink-0 ${
                        isPlum
                          ? 'bg-[var(--attention-bg)] text-[var(--attention-fg)] border border-[var(--attention-border)]'
                          : isRed
                          ? 'bg-[var(--danger-bg)] text-[var(--danger-fg)]'
                          : 'bg-[var(--surface-3)] text-[var(--text-2)]'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer / Role & Settings */}
      <div className="border-t border-[var(--border)] p-2 space-y-1">
        <button
          onClick={() => setActiveNav('settings')}
          className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
            activeNav === 'settings'
              ? 'bg-[var(--brand-subtle)] text-[var(--brand-600)]'
              : 'text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]'
          }`}
          title={isSidebarCollapsed ? 'Settings' : undefined}
        >
          <Settings className="h-4 w-4 shrink-0" />
          {!isSidebarCollapsed && <span>Settings & Lists</span>}
        </button>

        {/* User Role Switcher */}
        <div className="pt-1">
          <div className="rounded-md bg-[var(--surface-2)] p-1.5">
            <div className="flex items-center justify-between text-[11px] font-medium text-[var(--text-3)] mb-1 px-1">
              {!isSidebarCollapsed && <span>Active Role</span>}
            </div>
            <select
              value={currentUser.id}
              onChange={(e) => {
                const u = users.find((x) => x.id === e.target.value);
                if (u) setCurrentUser(u);
              }}
              className="w-full bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] rounded px-1.5 py-1 text-xs font-medium cursor-pointer focus:outline-none focus:ring-1 focus:ring-[var(--brand-600)]"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="flex w-full items-center justify-center rounded-md p-1.5 text-[var(--text-3)] hover:bg-[var(--surface-2)] hover:text-[var(--text)] cursor-pointer transition-colors"
          title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <div className="flex items-center gap-2 text-xs w-full px-1">
              <ChevronLeft className="h-4 w-4" />
              <span>Collapse sidebar</span>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};
