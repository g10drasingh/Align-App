/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Archive,
  Check,
  CheckCircle2,
  Clock,
  Globe,
  History,
  Layers,
  List,
  Merge,
  MoreVertical,
  Plus,
  RefreshCw,
  Settings as SettingsIcon,
  Shield,
  Trash2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SettingsView: React.FC = () => {
  const {
    departments,
    subDomains,
    teamMembers,
    categories,
    priorities,
    statuses,
    ceoAttentionStatuses,
    meetingTypes,
    settings,
    updateSettings,
    addListOption,
    updateListOption,
    deactivateListOption,
    mergeListOption,
    deleteListOption,
    activityLogs,
    isAdmin,
    canEdit,
    resetAllData,
  } = useApp();

  const [activeSection, setActiveSection] = useState<'lists' | 'general' | 'logs'>('lists');
  const [selectedList, setSelectedList] = useState<string>('departments');

  // Add new list value modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newOptionName, setNewOptionName] = useState('');
  const [newOptionColor, setNewOptionColor] = useState('#419B2A');
  const [newOptionDeptId, setNewOptionDeptId] = useState(departments[0]?.id || '');
  const [newOptionCap, setNewOptionCap] = useState(50);
  const [newOptionStateGroup, setNewOptionStateGroup] = useState<any>('active');

  // Merge modal
  const [mergeSourceId, setMergeSourceId] = useState<string | null>(null);
  const [mergeTargetId, setMergeTargetId] = useState<string>('');

  const currentListItems = () => {
    switch (selectedList) {
      case 'departments':
        return departments;
      case 'subDomains':
        return subDomains;
      case 'teamMembers':
        return teamMembers;
      case 'categories':
        return categories;
      case 'priorities':
        return priorities;
      case 'statuses':
        return statuses;
      case 'ceoAttentionStatuses':
        return ceoAttentionStatuses;
      case 'meetingTypes':
        return meetingTypes;
      default:
        return [];
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOptionName.trim()) return;

    if (selectedList === 'subDomains') {
      addListOption('subDomains', {
        name: newOptionName.trim(),
        departmentId: newOptionDeptId,
      });
    } else if (selectedList === 'priorities') {
      addListOption('priorities', {
        name: newOptionName.trim(),
        rank: priorities.length + 1,
        weightCap: newOptionCap,
      });
    } else if (selectedList === 'statuses') {
      addListOption('statuses', {
        name: newOptionName.trim(),
        stateGroup: newOptionStateGroup,
        progressRule: 'fixed',
        progressValue: 50,
      });
    } else {
      addListOption(selectedList, {
        name: newOptionName.trim(),
        color: newOptionColor,
      });
    }

    setIsAddModalOpen(false);
    setNewOptionName('');
  };

  return (
    <div className="space-y-5 pb-20 select-none">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-[var(--text)]">Settings & Governance</h1>
        <p className="text-xs text-[var(--text-3)] mt-0.5">
          Configure editable lists, mathematical caps, working day schedules, and inspect system audit logs
        </p>
      </div>

      {/* Main navigation tabs */}
      <div className="flex border-b border-[var(--border)] text-sm">
        <button
          onClick={() => setActiveSection('lists')}
          className={`flex items-center gap-1.5 pb-2.5 px-3 font-medium transition-colors cursor-pointer ${
            activeSection === 'lists'
              ? 'border-b-2 border-[var(--brand-600)] text-[var(--brand-600)] font-semibold'
              : 'text-[var(--text-2)] hover:text-[var(--text)]'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Editable Lists</span>
        </button>
        <button
          onClick={() => setActiveSection('general')}
          className={`flex items-center gap-1.5 pb-2.5 px-3 font-medium transition-colors cursor-pointer ${
            activeSection === 'general'
              ? 'border-b-2 border-[var(--brand-600)] text-[var(--brand-600)] font-semibold'
              : 'text-[var(--text-2)] hover:text-[var(--text)]'
          }`}
        >
          <SettingsIcon className="h-4 w-4" />
          <span>General Settings</span>
        </button>
        <button
          onClick={() => setActiveSection('logs')}
          className={`flex items-center gap-1.5 pb-2.5 px-3 font-medium transition-colors cursor-pointer ${
            activeSection === 'logs'
              ? 'border-b-2 border-[var(--brand-600)] text-[var(--brand-600)] font-semibold'
              : 'text-[var(--text-2)] hover:text-[var(--text)]'
          }`}
        >
          <History className="h-4 w-4" />
          <span>Activity Audit Log</span>
        </button>
      </div>

      {/* 1. EDITABLE LISTS SECTION */}
      {activeSection === 'lists' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* List Selector sidebar */}
          <div className="md:col-span-3 space-y-1">
            {[
              { id: 'departments', label: 'Departments' },
              { id: 'subDomains', label: 'Sub-domains' },
              { id: 'teamMembers', label: 'Team Members (Ref)' },
              { id: 'categories', label: 'Categories' },
              { id: 'priorities', label: 'Priorities & Caps' },
              { id: 'statuses', label: 'Statuses & Rules' },
              { id: 'ceoAttentionStatuses', label: 'CEO Attention Statuses' },
              { id: 'meetingTypes', label: 'Meeting Types' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedList(item.id)}
                className={`flex w-full items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors cursor-pointer text-left ${
                  selectedList === item.id
                    ? 'bg-[var(--brand-subtle)] text-[var(--brand-600)] font-semibold'
                    : 'text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]'
                }`}
              >
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* List items table */}
          <div className="md:col-span-9 rounded-md border border-[var(--border)] bg-[var(--surface)] p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div>
                <h2 className="text-sm font-bold text-[var(--text)] capitalize">
                  {selectedList.replace(/([A-Z])/g, ' $1')}
                </h2>
                <p className="text-xs text-[var(--text-3)]">
                  Add, recolor, deactivate, or merge values without breaking historical records
                </p>
              </div>

              {canEdit && (
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center gap-1.5 rounded-md bg-[var(--brand-600)] hover:bg-[var(--brand-700)] px-3 py-1.5 text-xs font-semibold text-white shadow-2xs transition-colors cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add value</span>
                </button>
              )}
            </div>

            {/* List Table */}
            <div className="divide-y divide-[var(--border)]">
              {(currentListItems() as any[]).map((opt) => (
                <div
                  key={opt.id}
                  className="flex items-center justify-between py-2.5 hover:bg-[var(--surface-2)] -mx-5 px-5 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {'color' in opt && (
                      <span
                        className="h-3 w-3 rounded-full shrink-0"
                        style={{ backgroundColor: opt.color || 'var(--brand-600)' }}
                      />
                    )}
                    <span
                      className={`text-xs font-semibold ${
                        opt.isActive ? 'text-[var(--text)]' : 'line-through text-[var(--text-3)]'
                      }`}
                    >
                      {opt.name}
                    </span>

                    {'weightCap' in opt && (
                      <span className="rounded bg-[var(--surface-3)] px-2 py-0.5 text-[10px] font-semibold text-[var(--text-2)]">
                        Cap: {opt.weightCap}% (Rank {opt.rank})
                      </span>
                    )}

                    {'stateGroup' in opt && (
                      <span className="rounded bg-[var(--surface-3)] px-2 py-0.5 text-[10px] font-semibold text-[var(--text-2)]">
                        Group: {opt.stateGroup} ({opt.progressValue ?? 'keep'}%)
                      </span>
                    )}

                    {!opt.isActive && (
                      <span className="rounded bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 px-1.5 py-0.2 text-[10px]">
                        Inactive
                      </span>
                    )}
                  </div>

                  {canEdit && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => deactivateListOption(selectedList, opt.id)}
                        className="rounded border border-[var(--border)] px-2 py-1 text-[11px] font-medium text-[var(--text-2)] hover:bg-[var(--surface-3)] cursor-pointer"
                      >
                        {opt.isActive ? 'Deactivate' : 'Reactivate'}
                      </button>

                      {(selectedList === 'departments' || selectedList === 'categories') && (
                        <button
                          onClick={() => {
                            setMergeSourceId(opt.id);
                            const other = (currentListItems() as any[]).find((x) => x.id !== opt.id);
                            setMergeTargetId(other?.id || '');
                          }}
                          className="rounded border border-[var(--border)] px-2 py-1 text-[11px] font-medium text-[var(--text-2)] hover:bg-[var(--surface-3)] cursor-pointer"
                          title="Merge into another value"
                        >
                          <Merge className="h-3 w-3" />
                        </button>
                      )}

                      <button
                        onClick={() => deleteListOption(selectedList, opt.id)}
                        className="rounded border border-[var(--border)] p-1 text-[var(--text-3)] hover:text-[var(--danger-fg)] hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                        title="Delete (only if never used)"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. GENERAL SETTINGS SECTION */}
      {activeSection === 'general' && (
        <div className="max-w-2xl rounded-md border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xs space-y-6">
          <div>
            <h2 className="text-sm font-bold text-[var(--text)]">System Rules & Thresholds</h2>
            <p className="text-xs text-[var(--text-3)]">
              Settings governing time calculation, recurring tasks, and hierarchy limits
            </p>
          </div>

          <div className="space-y-4 divide-y divide-[var(--border)]">
            {/* Working days */}
            <div className="pt-4 first:pt-0 space-y-2">
              <label className="text-xs font-bold text-[var(--text)] block">Working Days</label>
              <p className="text-xs text-[var(--text-3)]">
                Days used for recurring schedules and business day arithmetic (Default: Mon–Fri).
              </p>
              <div className="flex gap-2">
                {[
                  { day: 1, label: 'Mon' },
                  { day: 2, label: 'Tue' },
                  { day: 3, label: 'Wed' },
                  { day: 4, label: 'Thu' },
                  { day: 5, label: 'Fri' },
                  { day: 6, label: 'Sat' },
                  { day: 7, label: 'Sun' },
                ].map(({ day, label }) => {
                  const isChecked = settings.workingDays.includes(day);
                  return (
                    <button
                      key={day}
                      disabled={!isAdmin}
                      onClick={() => {
                        const updated = isChecked
                          ? settings.workingDays.filter((d) => d !== day)
                          : [...settings.workingDays, day].sort();
                        updateSettings({ workingDays: updated });
                      }}
                      className={`h-8 w-10 rounded border text-xs font-semibold transition-colors ${
                        isChecked
                          ? 'border-[var(--brand-border)] bg-[var(--brand-subtle)] text-[var(--brand-600)]'
                          : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-3)]'
                      } ${isAdmin ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Due soon window */}
            <div className="pt-4 space-y-2">
              <label className="text-xs font-bold text-[var(--text)] block">
                "Due Soon" Threshold Window
              </label>
              <p className="text-xs text-[var(--text-3)]">
                Number of calendar days ahead to flag upcoming deliverables as Due Soon.
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={30}
                  disabled={!isAdmin}
                  value={settings.dueSoonDays}
                  onChange={(e) => updateSettings({ dueSoonDays: parseInt(e.target.value) || 7 })}
                  className="w-20 rounded border border-[var(--border-strong)] bg-[var(--surface)] px-2.5 py-1 text-xs text-[var(--text)] font-semibold"
                />
                <span className="text-xs text-[var(--text-2)]">days</span>
              </div>
            </div>

            {/* Timezone */}
            <div className="pt-4 space-y-2">
              <label className="text-xs font-bold text-[var(--text)] block">System Timezone</label>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-[var(--text-3)]" />
                <span className="text-xs font-medium text-[var(--text)]">
                  {settings.timezone} (Nepal Standard Time)
                </span>
              </div>
            </div>

            {/* Danger Zone: Reset demo data */}
            <div className="pt-6 space-y-2">
              <label className="text-xs font-bold text-[var(--danger-fg)] block">Danger Zone</label>
              <p className="text-xs text-[var(--text-3)]">
                Reset all projects, tasks, follow-ups, and logs back to the clean initial demo state.
              </p>
              <button
                onClick={resetAllData}
                className="flex items-center gap-1.5 rounded border border-red-300 dark:border-red-900 bg-red-50 dark:bg-red-950/40 px-3 py-1.5 text-xs font-semibold text-[var(--danger-fg)] hover:bg-red-100 transition-colors cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Reset to standard demo ledger</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. ACTIVITY AUDIT LOG SECTION */}
      {activeSection === 'logs' && (
        <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-5 shadow-2xs space-y-4">
          <div>
            <h2 className="text-sm font-bold text-[var(--text)]">Activity Audit Log</h2>
            <p className="text-xs text-[var(--text-3)]">
              Permanent tamper-evident audit history. Nothing changes silently in Align.
            </p>
          </div>

          <div className="divide-y divide-[var(--border)]">
            {activityLogs.map((log) => (
              <div key={log.id} className="py-3 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {log.isAutomatic ? (
                      <span className="rounded bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 px-1.5 py-0.2 text-[10px] font-semibold">
                        System
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-[var(--text)]">
                        {log.actorName}
                      </span>
                    )}
                    <span className="text-xs text-[var(--text-2)] font-mono text-[11px]">
                      {log.action}
                    </span>
                  </div>

                  {log.reason && (
                    <p className="text-xs text-[var(--text)] bg-[var(--surface-2)] p-2 rounded">
                      {log.reason}
                    </p>
                  )}

                  {log.fieldName && (
                    <div className="text-[11px] text-[var(--text-3)]">
                      Field: <span className="font-semibold text-[var(--text-2)]">{log.fieldName}</span>
                      {log.oldValue !== undefined && (
                        <span> | Was: {String(log.oldValue)}</span>
                      )}
                      {log.newValue !== undefined && (
                        <span> → Now: {String(log.newValue)}</span>
                      )}
                    </div>
                  )}
                </div>

                <span className="text-[11px] text-[var(--text-3)] shrink-0 tabular-nums">
                  {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Option Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={handleAddSubmit}
            className="w-full max-w-sm rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-xl space-y-4"
          >
            <h3 className="text-sm font-bold text-[var(--text)]">
              Add new {selectedList.slice(0, -1)}
            </h3>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--text-2)]">Name</label>
              <input
                type="text"
                required
                autoFocus
                value={newOptionName}
                onChange={(e) => setNewOptionName(e.target.value)}
                placeholder="e.g. Reconciliation"
                className="w-full rounded border border-[var(--border-strong)] bg-[var(--surface)] px-2.5 py-1.5 text-xs text-[var(--text)]"
              />
            </div>

            {selectedList === 'subDomains' && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-2)]">Department</label>
                <select
                  value={newOptionDeptId}
                  onChange={(e) => setNewOptionDeptId(e.target.value)}
                  className="w-full rounded border border-[var(--border-strong)] bg-[var(--surface)] px-2.5 py-1.5 text-xs text-[var(--text)]"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {selectedList === 'priorities' && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-2)]">Weight Cap (%)</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={newOptionCap}
                  onChange={(e) => setNewOptionCap(parseInt(e.target.value) || 50)}
                  className="w-full rounded border border-[var(--border-strong)] bg-[var(--surface)] px-2.5 py-1.5 text-xs text-[var(--text)]"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded px-3 py-1.5 text-xs font-medium text-[var(--text-2)] hover:bg-[var(--surface-2)] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded bg-[var(--brand-600)] hover:bg-[var(--brand-700)] px-3 py-1.5 text-xs font-semibold text-white cursor-pointer"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Merge Modal */}
      {mergeSourceId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-[var(--text)]">Merge Values</h3>
            <p className="text-xs text-[var(--text-2)]">
              All tasks using this value will be migrated to the target value, and the source will be deactivated.
            </p>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--text-2)]">Target Value</label>
              <select
                value={mergeTargetId}
                onChange={(e) => setMergeTargetId(e.target.value)}
                className="w-full rounded border border-[var(--border-strong)] bg-[var(--surface)] px-2.5 py-1.5 text-xs text-[var(--text)]"
              >
                {(currentListItems() as any[])
                  .filter((i) => i.id !== mergeSourceId)
                  .map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name}
                    </option>
                  ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setMergeSourceId(null)}
                className="rounded px-3 py-1.5 text-xs font-medium text-[var(--text-2)] hover:bg-[var(--surface-2)]"
              >
                Cancel
              </button>
              <button
                disabled={!mergeTargetId}
                onClick={() => {
                  mergeListOption(selectedList, mergeSourceId, mergeTargetId);
                  setMergeSourceId(null);
                }}
                className="rounded bg-[var(--danger-fg)] hover:opacity-90 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
              >
                Confirm merge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
