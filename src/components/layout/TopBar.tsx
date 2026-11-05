/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  CalendarDays,
  Check,
  ChevronDown,
  FolderPlus,
  ListPlus,
  MessageSquarePlus,
  Moon,
  Plus,
  Search,
  Sliders,
  Sun,
  Monitor,
  PanelLeft,
  Eye,
  ShieldCheck,
  UserPlus,
  Users,
  Lock,
  LogOut,
  Sparkles,
  KeyRound,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const TopBar: React.FC = () => {
  const {
    activeNav,
    setActiveNav,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    theme,
    setTheme,
    density,
    setDensity,
    currentUser,
    users,
    lockApp,
    logout,
    setIsCommandPaletteOpen,
    setIsNewItemOpen,
    setNewItemDefaultType,
    canEdit,
    isAdmin,
    isEA,
    isCeoViewer,
    isViewer,
    updateInfo,
    checkUpdates,
    setIsChangePasswordRequired,
  } = useApp();

  const [isNewMenuOpen, setIsNewMenuOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Global Alt+L keyboard shortcut to lock the app
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'l' || e.key === 'L')) {
        e.preventDefault();
        lockApp();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lockApp]);

  // Breadcrumb mapping
  const getBreadcrumbTitle = () => {
    switch (activeNav) {
      case 'dashboard':
        return 'Dashboard';
      case 'tasks':
        return 'Tasks';
      case 'projects':
        return 'Projects';
      case 'ceo':
        return 'Needs CEO Attention';
      case 'followups':
        return 'Follow-ups';
      case 'meetings':
        return 'Meetings';
      case 'settings':
        return 'Settings & Lists';
      default:
        return 'Overview';
    }
  };

  return (
    <header
      className={`fixed top-0 right-0 z-20 flex h-14 items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-4 transition-all duration-200 ${
        isSidebarCollapsed ? 'left-16' : 'left-62'
      }`}
    >
      {/* Breadcrumb path */}
      <div className="flex items-center gap-2 overflow-hidden text-sm">
        {isSidebarCollapsed && (
          <button
            onClick={() => setIsSidebarCollapsed(false)}
            className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text)] cursor-pointer mr-1 transition-colors shrink-0"
            title="Expand sidebar"
          >
            <PanelLeft className="h-4 w-4" />
          </button>
        )}
        <span className="text-[var(--text-3)] font-medium">Align</span>
        <span className="text-[var(--text-3)]">/</span>
        <span className="font-semibold text-[var(--text)] truncate">
          {getBreadcrumbTitle()}
        </span>

        {isViewer && (
          <span className="ml-2 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-300 flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {isCeoViewer ? 'CEO Read-Only View' : 'Stakeholder Read-Only'}
          </span>
        )}
      </div>

      {/* Center Search / Command Palette shortcut */}
      <div className="flex flex-1 max-w-md mx-6">
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="flex w-full items-center justify-between rounded-md border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-1.5 text-xs text-[var(--text-3)] hover:border-[var(--text-3)] hover:text-[var(--text-2)] transition-colors cursor-pointer shadow-2xs"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="h-3.5 w-3.5 text-[var(--text-3)]" />
            <span className="truncate">Search tasks, projects, meetings, follow-ups...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-[var(--border)] bg-[var(--surface-2)] px-1.5 py-0.5 text-[10px] font-mono text-[var(--text-2)]">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2">
        {/* + New Button (EA / Admin only) */}
        {canEdit && (
          <div className="relative">
            <button
              onClick={() => setIsNewMenuOpen(!isNewMenuOpen)}
              className="flex items-center gap-1.5 rounded-md bg-[var(--brand-600)] hover:bg-[var(--brand-700)] px-3 py-1.5 text-xs font-semibold text-white shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New</span>
              <ChevronDown className="h-3 w-3 opacity-80" />
            </button>

            {isNewMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsNewMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-1.5 z-50 w-44 rounded-md border border-[var(--border)] bg-[var(--surface)] py-1 shadow-md animate-in fade-in-50 zoom-in-95">
                  <button
                    onClick={() => {
                      setNewItemDefaultType('task');
                      setIsNewItemOpen(true);
                      setIsNewMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-xs text-[var(--text)] hover:bg-[var(--surface-2)] cursor-pointer text-left font-medium"
                  >
                    <ListPlus className="h-3.5 w-3.5 text-[var(--brand-600)]" />
                    <span>New task</span>
                  </button>
                  <button
                    onClick={() => {
                      setNewItemDefaultType('project');
                      setIsNewItemOpen(true);
                      setIsNewMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-xs text-[var(--text)] hover:bg-[var(--surface-2)] cursor-pointer text-left font-medium"
                  >
                    <FolderPlus className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                    <span>New project</span>
                  </button>
                  <div className="my-1 border-t border-[var(--border)]" />
                  <button
                    onClick={() => {
                      setActiveNav('meetings');
                      setIsNewMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-xs text-[var(--text)] hover:bg-[var(--surface-2)] cursor-pointer text-left font-medium"
                  >
                    <CalendarDays className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                    <span>New meeting</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveNav('followups');
                      setIsNewMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-xs text-[var(--text)] hover:bg-[var(--surface-2)] cursor-pointer text-left font-medium"
                  >
                    <MessageSquarePlus className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                    <span>Schedule follow-up</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Density toggle */}
        <button
          onClick={() => setDensity(density === 'comfortable' ? 'compact' : 'comfortable')}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border)] text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text)] cursor-pointer transition-colors"
          title={`Switch to ${density === 'comfortable' ? 'Compact' : 'Comfortable'} density`}
        >
          <Sliders className="h-3.5 w-3.5" />
        </button>

        {/* Theme Menu */}
        <div className="relative">
          <button
            onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border)] text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text)] cursor-pointer transition-colors"
            title="Theme appearance"
          >
            {theme === 'dark' ? (
              <Moon className="h-3.5 w-3.5" />
            ) : theme === 'light' ? (
              <Sun className="h-3.5 w-3.5" />
            ) : (
              <Monitor className="h-3.5 w-3.5" />
            )}
          </button>

          {isThemeMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsThemeMenuOpen(false)}
              />
              <div className="absolute right-0 top-full mt-1.5 z-50 w-36 rounded-md border border-[var(--border)] bg-[var(--surface)] py-1 shadow-md">
                <button
                  onClick={() => {
                    setTheme('light');
                    setIsThemeMenuOpen(false);
                  }}
                  className="flex w-full items-center justify-between px-3 py-1.5 text-xs text-[var(--text)] hover:bg-[var(--surface-2)] cursor-pointer font-medium"
                >
                  <span className="flex items-center gap-2">
                    <Sun className="h-3.5 w-3.5 text-amber-500" /> Light
                  </span>
                  {theme === 'light' && <Check className="h-3 w-3 text-[var(--brand-600)]" />}
                </button>
                <button
                  onClick={() => {
                    setTheme('dark');
                    setIsThemeMenuOpen(false);
                  }}
                  className="flex w-full items-center justify-between px-3 py-1.5 text-xs text-[var(--text)] hover:bg-[var(--surface-2)] cursor-pointer font-medium"
                >
                  <span className="flex items-center gap-2">
                    <Moon className="h-3.5 w-3.5 text-blue-400" /> Dark
                  </span>
                  {theme === 'dark' && <Check className="h-3 w-3 text-[var(--brand-600)]" />}
                </button>
                <button
                  onClick={() => {
                    setTheme('system');
                    setIsThemeMenuOpen(false);
                  }}
                  className="flex w-full items-center justify-between px-3 py-1.5 text-xs text-[var(--text)] hover:bg-[var(--surface-2)] cursor-pointer font-medium"
                >
                  <span className="flex items-center gap-2">
                    <Monitor className="h-3.5 w-3.5 text-slate-400" /> System
                  </span>
                  {theme === 'system' && <Check className="h-3 w-3 text-[var(--brand-600)]" />}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Software Update Quick Action */}
        <button
          onClick={() => checkUpdates(true)}
          className="relative flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border)] text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text)] transition-colors cursor-pointer"
          title={
            updateInfo?.isAvailable
              ? `New update v${updateInfo.latestVersion} available! Click to update.`
              : 'Check for software updates'
          }
        >
          <Sparkles className="h-4 w-4 text-[var(--brand-600)]" />
          {updateInfo?.isAvailable && (
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          )}
        </button>

        {/* Quick Lock Button */}
        <button
          onClick={lockApp}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border)] text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text)] transition-colors cursor-pointer"
          title="Lock App (Alt+L)"
        >
          <Lock className="h-4 w-4" />
        </button>

        {/* User avatar / account switcher */}
        <div className="relative pl-1 border-l border-[var(--border)]">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-1.5 rounded-full p-0.5 hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
            title={`${currentUser.name} (${currentUser.role.toUpperCase()}) - Account & security`}
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--brand-600)] text-xs font-semibold text-white shadow-2xs">
              {currentUser.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)}
            </div>
            <ChevronDown className="h-3 w-3 text-[var(--text-3)]" />
          </button>

          {isUserMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-1.5 z-50 w-64 rounded-md border border-[var(--border)] bg-[var(--surface)] p-2 shadow-lg space-y-2">
                {/* Current profile info */}
                <div className="border-b border-[var(--border)] pb-2 px-1">
                  <div className="font-semibold text-xs text-[var(--text)]">{currentUser.name}</div>
                  <div className="text-[11px] text-[var(--text-3)] font-mono truncate">{currentUser.email}</div>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    {currentUser.role === 'admin' ? (
                      <span className="inline-flex items-center gap-1 rounded bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 dark:text-indigo-300">
                        <ShieldCheck className="h-3 w-3" /> Admin (Full Access + Users)
                      </span>
                    ) : currentUser.role === 'ea' ? (
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                        <Check className="h-3 w-3" /> EA (Executive Assistant)
                      </span>
                    ) : currentUser.role === 'ceo_viewer' ? (
                      <span className="inline-flex items-center gap-1 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-300">
                        <Eye className="h-3 w-3" /> CEO (Read-Only)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                        <Eye className="h-3 w-3" /> Stakeholder Viewer
                      </span>
                    )}
                  </div>
                </div>

                {/* Management shortcuts & Session controls */}
                <div className="border-t border-[var(--border)] pt-1 space-y-1">
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      checkUpdates(true);
                    }}
                    className="flex w-full items-center justify-between rounded px-2 py-1.5 text-xs text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text)] cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-3.5 w-3.5 text-[var(--brand-600)]" />
                      <span>Check for Updates</span>
                    </div>
                    {updateInfo?.isAvailable && (
                      <span className="rounded bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.2 text-[9px] font-bold">
                        NEW
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      setIsChangePasswordRequired(true);
                    }}
                    className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text)] cursor-pointer"
                  >
                    <KeyRound className="h-3.5 w-3.5 text-amber-500" />
                    <span>Change Password</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveNav('settings');
                      setIsUserMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text)] cursor-pointer"
                  >
                    <Users className="h-3.5 w-3.5 text-[var(--brand-600)]" />
                    <span>Manage Users & Settings</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      lockApp();
                    }}
                    className="flex w-full items-center justify-between rounded px-2 py-1.5 text-xs text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text)] cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Lock className="h-3.5 w-3.5 text-amber-500" />
                      <span>Lock Screen</span>
                    </div>
                    <kbd className="text-[10px] font-mono text-[var(--text-3)]">Alt+L</kbd>
                  </button>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      logout();
                    }}
                    className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer font-medium"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
