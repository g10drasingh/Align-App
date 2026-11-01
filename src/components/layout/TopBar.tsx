/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
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
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const TopBar: React.FC = () => {
  const {
    activeNav,
    setActiveNav,
    isSidebarCollapsed,
    theme,
    setTheme,
    density,
    setDensity,
    currentUser,
    setIsCommandPaletteOpen,
    setIsNewItemOpen,
    setNewItemDefaultType,
    canEdit,
    isCeoViewer,
  } = useApp();

  const [isNewMenuOpen, setIsNewMenuOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

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
        <span className="text-[var(--text-3)] font-medium">Align</span>
        <span className="text-[var(--text-3)]">/</span>
        <span className="font-semibold text-[var(--text)] truncate">
          {getBreadcrumbTitle()}
        </span>

        {isCeoViewer && (
          <span className="ml-2 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
            Executive Read-Only View
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

        {/* User avatar / badge */}
        <div className="flex items-center gap-2 pl-1 border-l border-[var(--border)]">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--surface-3)] text-xs font-semibold text-[var(--text-2)]"
            title={`${currentUser.name} (${currentUser.role.toUpperCase()})`}
          >
            {currentUser.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)}
          </div>
        </div>
      </div>
    </header>
  );
};
