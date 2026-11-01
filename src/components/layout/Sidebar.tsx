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
  Lock,
  LogOut,
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
    lockApp,
    logout,
    users,
    canEdit,
    departments,
  } = useApp();

  const userDept = currentUser?.departmentId
    ? departments.find((d) => d.id === currentUser.departmentId)?.name
    : undefined;
  const departmentSubtitle = userDept ? `${userDept} Department` : 'Task Management';

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
      {/* Brand Header with eSewa Green Logo and Collapse Toggle */}
      <div className="flex h-14 items-center justify-between border-b border-[var(--border)] px-3">
        {isSidebarCollapsed ? (
          <div className="flex w-full items-center justify-between">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[var(--brand-600)] text-white shadow-xs font-semibold">
              <span className="text-base tracking-tighter">eA</span>
            </div>
            <button
              onClick={() => setIsSidebarCollapsed(false)}
              className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--text-3)] hover:bg-[var(--surface-2)] hover:text-[var(--text)] cursor-pointer transition-colors"
              title="Expand sidebar"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2.5 overflow-hidden">
              {/* eSewa Green Brand Icon */}
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[var(--brand-600)] text-white shadow-xs font-semibold">
                <span className="text-base tracking-tighter">eA</span>
              </div>
              <div className="flex flex-col truncate leading-tight">
                <span className="font-semibold text-sm text-[var(--text)] tracking-tight">
                  Align
                </span>
                <span className="text-[11px] text-[var(--text-3)] truncate" title={departmentSubtitle}>
                  {departmentSubtitle}
                </span>
              </div>
            </div>

            {/* Collapse toggle at top of nav bar */}
            <button
              onClick={() => setIsSidebarCollapsed(true)}
              className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--text-3)] hover:bg-[var(--surface-2)] hover:text-[var(--text)] cursor-pointer transition-colors shrink-0"
              title="Collapse sidebar"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </>
        )}
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

        {/* Active Account Profile */}
        <div className="pt-1">
          <div className="rounded-md bg-[var(--surface-2)] p-2">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--brand-600)] text-[10px] font-semibold text-white shrink-0">
                {currentUser.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)}
              </div>
              {!isSidebarCollapsed && (
                <div className="min-w-0 flex-1 leading-tight">
                  <div className="truncate text-xs font-semibold text-[var(--text)]">
                    {currentUser.name}
                  </div>
                  <div className="truncate text-[10px] uppercase font-mono text-[var(--brand-600)] font-medium">
                    {currentUser.role === 'admin'
                      ? 'Administrator'
                      : currentUser.role === 'ea'
                      ? 'Executive Assistant'
                      : currentUser.role === 'ceo_viewer'
                      ? 'CEO Viewer'
                      : 'Viewer'}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Lock & Sign Out actions */}
        <div className="flex items-center gap-1 pt-1 border-t border-[var(--border)]/60">
          <button
            onClick={lockApp}
            className="flex-1 flex items-center justify-center gap-1.5 py-1 px-2 rounded text-xs text-[var(--text-3)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
            title="Lock App (Alt+L)"
          >
            <Lock className="h-3.5 w-3.5" />
            {!isSidebarCollapsed && <span>Lock</span>}
          </button>
          <button
            onClick={logout}
            className="flex-1 flex items-center justify-center gap-1.5 py-1 px-2 rounded text-xs text-[var(--text-3)] hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="h-3.5 w-3.5" />
            {!isSidebarCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};
