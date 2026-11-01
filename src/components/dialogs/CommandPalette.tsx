/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  CalendarDays,
  CheckSquare,
  Flag,
  FolderTree,
  LayoutDashboard,
  MessageSquareText,
  Plus,
  Search,
  Settings,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    workItems,
    meetings,
    setActiveNav,
    setSelectedItemId,
    setSelectedMeetingId,
    setIsNewItemOpen,
    setNewItemDefaultType,
    canEdit,
  } = useApp();

  const [query, setQuery] = useState('');

  // Keyboard shortcut listener for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(!isCommandPaletteOpen);
      }
      if (e.key === 'Escape' && isCommandPaletteOpen) {
        setIsCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setIsCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const filteredItems = workItems
    .filter((w) => !w.isArchived && w.name.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 5);

  const filteredMeetings = meetings
    .filter((m) => m.title.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 3);

  const navigationShortcuts = [
    { label: 'Go to Dashboard', nav: 'dashboard', icon: LayoutDashboard },
    { label: 'Go to Tasks', nav: 'tasks', icon: CheckSquare },
    { label: 'Go to Projects Hierarchy', nav: 'projects', icon: FolderTree },
    { label: 'Go to CEO Attention Queue', nav: 'ceo', icon: Flag },
    { label: 'Go to Follow-ups', nav: 'followups', icon: MessageSquareText },
    { label: 'Go to Meetings', nav: 'meetings', icon: CalendarDays },
    { label: 'Go to Settings', nav: 'settings', icon: Settings },
  ].filter((s) => s.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/40 p-4 select-none animate-in fade-in-50">
      <div className="w-full max-w-lg rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl overflow-hidden divide-y divide-[var(--border)]">
        {/* Search input header */}
        <div className="flex items-center px-4 py-3 gap-2.5">
          <Search className="h-4 w-4 text-[var(--text-3)] shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Type a command or search items, meetings, navigation..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-xs text-[var(--text)] placeholder-[var(--text-3)] focus:outline-none"
          />
          <button
            onClick={() => setIsCommandPaletteOpen(false)}
            className="p-1 rounded text-[var(--text-3)] hover:text-[var(--text)] cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-3">
          {/* Work items */}
          {filteredItems.length > 0 && (
            <div>
              <div className="px-2 pb-1 text-[10px] font-bold text-[var(--text-3)] uppercase tracking-wider">
                Work Items
              </div>
              {filteredItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedItemId(item.id);
                    setIsCommandPaletteOpen(false);
                  }}
                  className="flex w-full items-center justify-between px-2.5 py-1.5 rounded-md hover:bg-[var(--surface-2)] text-left text-xs cursor-pointer group"
                >
                  <div className="flex items-center gap-2 truncate">
                    {item.needsCeoAttention && (
                      <Flag className="h-3 w-3 text-[var(--attention-fg)] fill-[var(--attention-fg)] shrink-0" />
                    )}
                    <span className="font-medium text-[var(--text)] truncate">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-[10px] uppercase font-semibold text-[var(--text-3)] shrink-0">
                    {item.itemType}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Meetings */}
          {filteredMeetings.length > 0 && (
            <div>
              <div className="px-2 pb-1 text-[10px] font-bold text-[var(--text-3)] uppercase tracking-wider">
                Meetings
              </div>
              {filteredMeetings.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setActiveNav('meetings');
                    setIsCommandPaletteOpen(false);
                  }}
                  className="flex w-full items-center justify-between px-2.5 py-1.5 rounded-md hover:bg-[var(--surface-2)] text-left text-xs cursor-pointer"
                >
                  <span className="font-medium text-[var(--text)] truncate">{m.title}</span>
                  <span className="text-[10px] text-[var(--text-3)]">Meeting</span>
                </button>
              ))}
            </div>
          )}

          {/* Navigation */}
          {navigationShortcuts.length > 0 && (
            <div>
              <div className="px-2 pb-1 text-[10px] font-bold text-[var(--text-3)] uppercase tracking-wider">
                Navigation
              </div>
              {navigationShortcuts.map((s) => {
                const Icon = s.icon;
                return (
                  <button
                    key={s.nav}
                    onClick={() => {
                      setActiveNav(s.nav);
                      setIsCommandPaletteOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-[var(--surface-2)] text-left text-xs text-[var(--text-2)] hover:text-[var(--text)] cursor-pointer"
                  >
                    <Icon className="h-3.5 w-3.5 text-[var(--text-3)]" />
                    <span>{s.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Quick Actions */}
          {canEdit && (
            <div>
              <div className="px-2 pb-1 text-[10px] font-bold text-[var(--text-3)] uppercase tracking-wider">
                Quick Actions
              </div>
              <button
                onClick={() => {
                  setNewItemDefaultType('task');
                  setIsNewItemOpen(true);
                  setIsCommandPaletteOpen(false);
                }}
                className="flex w-full items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-[var(--surface-2)] text-left text-xs text-[var(--brand-600)] font-medium cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Create new task</span>
              </button>
              <button
                onClick={() => {
                  setNewItemDefaultType('project');
                  setIsNewItemOpen(true);
                  setIsCommandPaletteOpen(false);
                }}
                className="flex w-full items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-[var(--surface-2)] text-left text-xs text-[var(--brand-600)] font-medium cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Create new project</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
