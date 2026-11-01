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
  Eye,
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
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
  Lock,
  KeyRound,
  Key,
  Laptop,
  EyeOff,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

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
    users,
    currentUser,
    addUser,
    updateUser,
    toggleUserStatus,
    deleteUser,
    lockApp,
    hasPinConfigured,
    setupPin,
    changePin,
    resetPin,
    autoLockMinutes,
    setAutoLockMinutes,
    lockOnTabBlur,
    setLockOnTabBlur,
    changeUserPassword,
  } = useApp();

  const [activeSection, setActiveSection] = useState<'lists' | 'general' | 'security' | 'users' | 'logs'>('lists');
  const [selectedList, setSelectedList] = useState<string>('departments');

  // In-app delete confirmation modal state
  const [deleteItemTarget, setDeleteItemTarget] = useState<{
    type: 'user' | 'list_item';
    id: string;
    name: string;
    listName?: string;
  } | null>(null);

  // Security PIN state
  const [oldPinInput, setOldPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [pinMessage, setPinMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Password change state
  const [oldPasswordInput, setOldPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [passwordMessage, setPasswordMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  // Add new list value modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newOptionName, setNewOptionName] = useState('');
  const [newOptionColor, setNewOptionColor] = useState('#419B2A');
  const [newOptionDeptId, setNewOptionDeptId] = useState(departments[0]?.id || '');
  const [newOptionCap, setNewOptionCap] = useState(50);
  const [newOptionStateGroup, setNewOptionStateGroup] = useState<any>('active');

  // User management state
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('align@2026');
  const [newUserRole, setNewUserRole] = useState<UserRole>('viewer');
  const [newUserDeptId, setNewUserDeptId] = useState('');
  const [userActionError, setUserActionError] = useState<string | null>(null);

  // Merge modal
  const [mergeSourceId, setMergeSourceId] = useState<string | null>(null);
  const [mergeTargetId, setMergeTargetId] = useState<string>('');

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinMessage(null);
    if (!/^\d{6}$/.test(newPinInput)) {
      setPinMessage({ text: 'New PIN must be exactly 6 numeric digits.', type: 'error' });
      return;
    }
    if (newPinInput !== confirmPinInput) {
      setPinMessage({ text: 'New PIN and confirmation PIN do not match.', type: 'error' });
      return;
    }
    const res = changePin(oldPinInput, newPinInput);
    if (res.success) {
      setPinMessage({ text: '6-digit PIN successfully updated.', type: 'success' });
      setOldPinInput('');
      setNewPinInput('');
      setConfirmPinInput('');
    } else {
      setPinMessage({ text: res.error || 'Failed to update PIN.', type: 'error' });
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);
    if (newPasswordInput.length < 6) {
      setPasswordMessage({ text: 'New password must be at least 6 characters.', type: 'error' });
      return;
    }
    if (newPasswordInput !== confirmPasswordInput) {
      setPasswordMessage({ text: 'New passwords do not match.', type: 'error' });
      return;
    }
    const res = changeUserPassword(currentUser.id, oldPasswordInput, newPasswordInput);
    if (res.success) {
      setPasswordMessage({ text: 'Password successfully updated.', type: 'success' });
      setOldPasswordInput('');
      setNewPasswordInput('');
      setConfirmPasswordInput('');
    } else {
      setPasswordMessage({ text: res.error || 'Failed to update password.', type: 'error' });
    }
  };

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

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUserActionError(null);
    const res = addUser({
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      role: newUserRole,
      departmentId: newUserDeptId || undefined,
      password: newUserPassword.trim() || 'align@2026',
      isActive: true,
    });
    if (res.success) {
      setIsAddUserModalOpen(false);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('align@2026');
      setNewUserRole('viewer');
      setNewUserDeptId('');
    } else {
      setUserActionError(res.error || 'Failed to create user');
    }
  };

  return (
    <div className="space-y-5 pb-20 select-none">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-[var(--text)]">Settings & Governance</h1>
        <p className="text-xs text-[var(--text-3)] mt-0.5">
          Configure editable lists, user roles & permissions, mathematical caps, working schedules, and audit logs
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
          onClick={() => setActiveSection('users')}
          className={`flex items-center gap-1.5 pb-2.5 px-3 font-medium transition-colors cursor-pointer ${
            activeSection === 'users'
              ? 'border-b-2 border-[var(--brand-600)] text-[var(--brand-600)] font-semibold'
              : 'text-[var(--text-2)] hover:text-[var(--text)]'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Users & Access ({users.length})</span>
        </button>
        <button
          onClick={() => setActiveSection('security')}
          className={`flex items-center gap-1.5 pb-2.5 px-3 font-medium transition-colors cursor-pointer ${
            activeSection === 'security'
              ? 'border-b-2 border-[var(--brand-600)] text-[var(--brand-600)] font-semibold'
              : 'text-[var(--text-2)] hover:text-[var(--text)]'
          }`}
        >
          <Lock className="h-4 w-4" />
          <span>Security & App Lock</span>
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
                        onClick={() =>
                          setDeleteItemTarget({
                            type: 'list_item',
                            id: opt.id,
                            name: opt.name,
                            listName: selectedList,
                          })
                        }
                        className="rounded border border-[var(--border)] p-1 text-[var(--text-3)] hover:text-[var(--danger-fg)] hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                        title={`Delete ${opt.name}`}
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

      {/* 3. USERS & ROLES ACCESS CONTROL SECTION */}
      {activeSection === 'users' && (
        <div className="space-y-6">
          {/* Header & stats */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-md border border-[var(--border)] bg-[var(--surface)] p-5 shadow-2xs">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[var(--brand-600)]" />
                <h2 className="text-sm font-bold text-[var(--text)]">Users & Role-Based Access Control</h2>
              </div>
              <p className="text-xs text-[var(--text-3)] mt-1">
                Manage executive accounts, assign roles (Admin, EA, CEO Viewer, Viewer), and manage session switching.
              </p>
            </div>
            {canEdit && (
              <button
                onClick={() => {
                  setUserActionError(null);
                  setIsAddUserModalOpen(true);
                }}
                className="flex items-center gap-1.5 rounded-md bg-[var(--brand-600)] hover:bg-[var(--brand-700)] px-3 py-1.5 text-xs font-semibold text-white shadow-2xs transition-colors cursor-pointer self-start sm:self-auto shrink-0"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>Create User</span>
              </button>
            )}
          </div>

          {/* User Table */}
          <div className="overflow-hidden rounded-md border border-[var(--border)] bg-[var(--surface)] shadow-2xs">
            <div className="border-b border-[var(--border)] px-4 py-3 bg-[var(--surface-2)] flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--text-2)] uppercase tracking-wider">
                Configured System Users ({users.length})
              </span>
              <span className="text-[11px] text-[var(--text-3)]">
                Active Session: <strong className="text-[var(--text)]">{currentUser.name}</strong> ({currentUser.role.toUpperCase()})
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--surface)] text-[var(--text-3)] font-semibold">
                    <th className="py-2.5 px-4">User</th>
                    <th className="py-2.5 px-4">Email</th>
                    <th className="py-2.5 px-4">Role & Access Level</th>
                    <th className="py-2.5 px-4">Department</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {users.map((u) => {
                    const isSelf = currentUser.id === u.id;
                    const dept = departments.find((d) => d.id === u.departmentId);

                    return (
                      <tr key={u.id} className="hover:bg-[var(--surface-2)] transition-colors">
                        <td className="py-3 px-4 font-medium text-[var(--text)]">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--surface-3)] text-xs font-semibold text-[var(--text-2)] shrink-0">
                              {u.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .slice(0, 2)}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-[var(--text)]">{u.name}</span>
                                {isSelf && (
                                  <span className="rounded bg-[var(--brand-subtle)] text-[var(--brand-600)] px-1.5 py-0.2 text-[10px] font-semibold border border-[var(--brand-border)]">
                                    Current Session
                                  </span>
                                )}
                              </div>
                              {u.createdAt && (
                                <span className="text-[10px] text-[var(--text-3)]">Joined {u.createdAt}</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-[var(--text-2)] font-mono text-[11px]">{u.email}</td>
                        <td className="py-3 px-4">
                          {u.role === 'admin' ? (
                            <span className="inline-flex items-center gap-1 rounded bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300">
                              <ShieldCheck className="h-3 w-3" />
                              Admin (All Access + Users)
                            </span>
                          ) : u.role === 'ea' ? (
                            <span className="inline-flex items-center gap-1 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                              <CheckCircle2 className="h-3 w-3" />
                              EA (All Access + CEO Flag)
                            </span>
                          ) : u.role === 'ceo_viewer' ? (
                            <span className="inline-flex items-center gap-1 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                              <Eye className="h-3 w-3" />
                              CEO (Executive View-Only)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-2 py-0.5 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                              <Eye className="h-3 w-3" />
                              Viewer (Read-Only)
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-[var(--text-2)]">{dept?.name || '—'}</td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => toggleUserStatus(u.id)}
                            disabled={isSelf || !canEdit}
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed ${
                              u.isActive
                                ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                                : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                            }`}
                            title={isSelf ? "Cannot deactivate yourself" : "Click to toggle active state"}
                          >
                            {u.isActive ? 'Active' : 'Deactivated'}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isAdmin && !isSelf && (
                              <button
                                onClick={() =>
                                  setDeleteItemTarget({
                                    type: 'user',
                                    id: u.id,
                                    name: u.name,
                                  })
                                }
                                className="rounded p-1 text-[var(--text-3)] hover:bg-[var(--danger-bg)] hover:text-[var(--danger-fg)] transition-colors cursor-pointer"
                                title={`Delete user ${u.name}`}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Role Specification Matrix Card */}
          <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-5 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-2)]">
              Role & Permissions Governance Matrix
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              <div className="rounded border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/20 p-3 space-y-1.5">
                <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-bold">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>EA (Executive Assistant)</span>
                </div>
                <p className="text-[11px] text-[var(--text-2)] leading-relaxed">
                  Primary operator. Has full read/write access: creates & manages projects, tasks, meetings, logs check-in outcomes, and exclusively manages the <strong>CEO Attention flag</strong>.
                </p>
              </div>
              <div className="rounded border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/50 dark:bg-indigo-950/20 p-3 space-y-1.5">
                <div className="flex items-center gap-1.5 text-indigo-800 dark:text-indigo-300 font-bold">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Admin</span>
                </div>
                <p className="text-[11px] text-[var(--text-2)] leading-relaxed">
                  Trusted executive operator. Possesses all EA operational powers, plus full rights to create and manage user accounts, change mathematical settings, and reset demo data.
                </p>
              </div>
              <div className="rounded border border-amber-200 dark:border-amber-800/60 bg-amber-50/50 dark:bg-amber-950/20 p-3 space-y-1.5">
                <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-bold">
                  <Eye className="h-4 w-4" />
                  <span>CEO (Executive Viewer)</span>
                </div>
                <p className="text-[11px] text-[var(--text-2)] leading-relaxed">
                  Executive oversight. Complete visibility across dashboard, projects, meetings, and follow-ups. Read-only mode: cannot accidentally edit rows, delete records, or change status.
                </p>
              </div>
              <div className="rounded border border-slate-200 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/30 p-3 space-y-1.5">
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-bold">
                  <Eye className="h-4 w-4" />
                  <span>Viewer (Stakeholder)</span>
                </div>
                <p className="text-[11px] text-[var(--text-2)] leading-relaxed">
                  General stakeholder. Read-only access to progress tracking, projects, and task reports. Cannot edit tasks, manage options, or access system administration.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECURITY & APP LOCK SECTION */}
      {activeSection === 'security' && (
        <div className="space-y-6 max-w-4xl">
          {/* Header Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-md border border-[var(--border)] bg-[var(--surface)] p-5 shadow-2xs">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[var(--brand-600)]" />
                <h2 className="text-sm font-bold text-[var(--text)]">Security, PIN Lock & Auto-Lock Governance</h2>
              </div>
              <p className="text-xs text-[var(--text-3)] mt-1">
                Configure screen lock PIN, auto-lock inactivity countdown, tab-blur protection, and user credentials.
              </p>
            </div>
            <button
              onClick={lockApp}
              className="flex items-center gap-1.5 rounded-md bg-[var(--brand-600)] hover:bg-[var(--brand-700)] px-3 py-1.5 text-xs font-semibold text-white shadow-2xs transition-colors cursor-pointer shrink-0"
            >
              <Lock className="h-3.5 w-3.5" />
              <span>Lock Screen Now (Alt+L)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: 6-Digit App Lock PIN */}
            <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                <div className="flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-[var(--brand-600)]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text)]">
                    6-Digit App Lock PIN
                  </h3>
                </div>
                {hasPinConfigured ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Configured
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                    Not Set Up
                  </span>
                )}
              </div>

              <p className="text-xs text-[var(--text-2)] leading-relaxed">
                {hasPinConfigured
                  ? 'A 6-digit PIN is set up to shield your executive screen from unauthorized eyes when away from your desk.'
                  : 'No PIN is set yet. When the screen locks for the first time, you will be prompted to choose a 6-digit PIN.'}
              </p>

              {pinMessage && (
                <div
                  className={`p-2.5 rounded text-xs border ${
                    pinMessage.type === 'success'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                      : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                  }`}
                >
                  {pinMessage.text}
                </div>
              )}

              <form onSubmit={handleChangePin} className="space-y-3 pt-1">
                {hasPinConfigured && (
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-2)] mb-1">
                      Current 6-Digit PIN
                    </label>
                    <input
                      type="password"
                      maxLength={6}
                      pattern="[0-9]{6}"
                      inputMode="numeric"
                      value={oldPinInput}
                      onChange={(e) => setOldPinInput(e.target.value)}
                      placeholder="••••••"
                      className="w-full rounded border border-[var(--border-strong)] bg-[var(--surface)] px-2.5 py-1.5 text-xs text-[var(--text)] font-mono tracking-widest"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-2)] mb-1">
                    {hasPinConfigured ? 'New 6-Digit PIN' : 'Set Initial 6-Digit PIN'}
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    pattern="[0-9]{6}"
                    inputMode="numeric"
                    value={newPinInput}
                    onChange={(e) => setNewPinInput(e.target.value)}
                    placeholder="Enter 6 numbers"
                    className="w-full rounded border border-[var(--border-strong)] bg-[var(--surface)] px-2.5 py-1.5 text-xs text-[var(--text)] font-mono tracking-widest"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-2)] mb-1">
                    Confirm 6-Digit PIN
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    pattern="[0-9]{6}"
                    inputMode="numeric"
                    value={confirmPinInput}
                    onChange={(e) => setConfirmPinInput(e.target.value)}
                    placeholder="Confirm 6 numbers"
                    className="w-full rounded border border-[var(--border-strong)] bg-[var(--surface)] px-2.5 py-1.5 text-xs text-[var(--text)] font-mono tracking-widest"
                    required
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  {hasPinConfigured && (
                    <button
                      type="button"
                      onClick={resetPin}
                      className="text-[11px] text-[var(--text-3)] hover:text-rose-500 cursor-pointer underline"
                    >
                      Reset / Clear PIN
                    </button>
                  )}
                  <button
                    type="submit"
                    className="ml-auto rounded bg-[var(--brand-600)] hover:bg-[var(--brand-700)] px-3 py-1.5 text-xs font-semibold text-white shadow-2xs transition-colors cursor-pointer"
                  >
                    {hasPinConfigured ? 'Update PIN' : 'Save PIN'}
                  </button>
                </div>
              </form>
            </div>

            {/* Card 2: Auto-Lock & Inactivity Rules */}
            <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-5 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3">
                <Clock className="h-4 w-4 text-[var(--brand-600)]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text)]">
                  Auto-Lock & Inactivity Settings
                </h3>
              </div>

              <p className="text-xs text-[var(--text-2)] leading-relaxed">
                Control how swiftly the application engages the PIN veil when no keyboard, mouse, or scroll activity is detected.
              </p>

              <div className="space-y-4 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-2)] mb-1.5">
                    Inactivity Timeout Interval
                  </label>
                  <select
                    value={autoLockMinutes}
                    onChange={(e) => setAutoLockMinutes(parseInt(e.target.value))}
                    className="w-full rounded border border-[var(--border-strong)] bg-[var(--surface)] px-2.5 py-1.5 text-xs text-[var(--text)] cursor-pointer font-medium"
                  >
                    <option value={1}>1 minute (High Security)</option>
                    <option value={5}>5 minutes</option>
                    <option value={15}>15 minutes (Standard Default)</option>
                    <option value={30}>30 minutes</option>
                    <option value={0}>Never (Manual Lock Only)</option>
                  </select>
                  <p className="text-[11px] text-[var(--text-3)] mt-1">
                    {autoLockMinutes === 0
                      ? 'Auto-lock disabled. Screen will only lock when you press Alt+L or click Lock.'
                      : `Locks automatically after ${autoLockMinutes} minute${autoLockMinutes > 1 ? 's' : ''} of idle time.`}
                  </p>
                </div>

                <div className="pt-2 border-t border-[var(--border)]/70">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={lockOnTabBlur}
                      onChange={(e) => setLockOnTabBlur(e.target.checked)}
                      className="mt-0.5 rounded border-[var(--border-strong)] text-[var(--brand-600)] focus:ring-[var(--brand-600)] cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-semibold text-[var(--text)] block">
                        Lock immediately when leaving the app
                      </span>
                      <span className="text-[11px] text-[var(--text-3)] leading-relaxed block mt-0.5">
                        Instantly triggers PIN screen lock whenever you switch browser tabs or minimize this window.
                      </span>
                    </div>
                  </label>
                </div>

                <div className="rounded bg-[var(--surface-2)] p-3 border border-[var(--border)] text-xs text-[var(--text-2)] space-y-1">
                  <div className="font-semibold text-[var(--text)] flex items-center gap-1.5">
                    <Laptop className="h-3.5 w-3.5 text-[var(--brand-600)]" />
                    <span>Quick Keyboard Access</span>
                  </div>
                  <p className="text-[11px] text-[var(--text-3)]">
                    Press <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-3)] font-mono text-[10px] text-[var(--text)]">Alt+L</kbd> anytime to lock the app immediately.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 3: Account Password */}
            <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                <div className="flex items-center gap-2">
                  <Key className="h-4 w-4 text-[var(--brand-600)]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text)]">
                    Account Password
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-[var(--text-3)] truncate max-w-[150px]">
                  {currentUser.email}
                </span>
              </div>

              <p className="text-xs text-[var(--text-2)] leading-relaxed">
                Change your sign-in password for <span className="font-semibold text-[var(--text)]">{currentUser.name}</span>. Initial default was <code className="text-[var(--brand-600)] font-mono">align@2026</code>.
              </p>

              {passwordMessage && (
                <div
                  className={`p-2.5 rounded text-xs border ${
                    passwordMessage.type === 'success'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                      : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                  }`}
                >
                  {passwordMessage.text}
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-2)] mb-1">
                    Current Password
                  </label>
                  <input
                    type={showPasswordFields ? 'text' : 'password'}
                    value={oldPasswordInput}
                    onChange={(e) => setOldPasswordInput(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full rounded border border-[var(--border-strong)] bg-[var(--surface)] px-2.5 py-1.5 text-xs text-[var(--text)]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-2)] mb-1">
                    New Password (min 6 chars)
                  </label>
                  <input
                    type={showPasswordFields ? 'text' : 'password'}
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full rounded border border-[var(--border-strong)] bg-[var(--surface)] px-2.5 py-1.5 text-xs text-[var(--text)]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-2)] mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type={showPasswordFields ? 'text' : 'password'}
                    value={confirmPasswordInput}
                    onChange={(e) => setConfirmPasswordInput(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full rounded border border-[var(--border-strong)] bg-[var(--surface)] px-2.5 py-1.5 text-xs text-[var(--text)]"
                    required
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPasswordFields(!showPasswordFields)}
                    className="text-[11px] text-[var(--text-3)] hover:text-[var(--text)] cursor-pointer"
                  >
                    {showPasswordFields ? 'Hide characters' : 'Show characters'}
                  </button>
                  <button
                    type="submit"
                    className="rounded bg-[var(--brand-600)] hover:bg-[var(--brand-700)] px-3 py-1.5 text-xs font-semibold text-white shadow-2xs transition-colors cursor-pointer"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            </div>

            {/* Card 4: Architecture & Offline Guarantee */}
            <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-5 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3">
                <Shield className="h-4 w-4 text-[var(--brand-600)]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text)]">
                  Offline & Privacy Architecture
                </h3>
              </div>

              <div className="space-y-3 text-xs text-[var(--text-2)]">
                <div className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-[var(--brand-600)] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-[var(--text)] block">100% Offline Capability</span>
                    <span className="text-[11px] text-[var(--text-3)]">
                      All tasks, follow-ups, agendas, and PIN credentials execute locally in your browser. No internet connection is mandatory for full operational access.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-[var(--brand-600)] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-[var(--text)] block">Zero Cost & Zero Cloud Sync</span>
                    <span className="text-[11px] text-[var(--text-3)]">
                      No external servers, subscriptions, or cloud database fees. All data resides safely in your browser local storage under the <code className="font-mono text-[var(--brand-600)]">align_app_</code> namespace.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-[var(--brand-600)] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-[var(--text)] block">Preserved Work State</span>
                    <span className="text-[11px] text-[var(--text-3)]">
                      When the 6-digit lock screen activates, all open tab filters, selected projects, and drafts are fully preserved in memory and restored the moment you unlock.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. ACTIVITY AUDIT LOG SECTION */}
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

      {/* Create User Modal */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={handleAddUserSubmit}
            className="w-full max-w-md rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-[var(--brand-600)]" />
                <h3 className="text-sm font-bold text-[var(--text)]">Create New User</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddUserModalOpen(false)}
                className="text-[var(--text-3)] hover:text-[var(--text)] text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {userActionError && (
              <div className="rounded bg-[var(--danger-bg)] p-2 text-xs text-[var(--danger-fg)] border border-[var(--danger-border)]">
                {userActionError}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--text-2)]">Full Name *</label>
              <input
                type="text"
                required
                autoFocus
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder="e.g. Jeetendra Singh"
                className="w-full rounded border border-[var(--border-strong)] bg-[var(--surface)] px-2.5 py-1.5 text-xs text-[var(--text)]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--text-2)]">Work Email *</label>
              <input
                type="email"
                required
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                placeholder="e.g. jeetendra@esewa.com.np"
                className="w-full rounded border border-[var(--border-strong)] bg-[var(--surface)] px-2.5 py-1.5 text-xs text-[var(--text)]"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[var(--text-2)]">Initial Password</label>
                <span className="text-[10px] text-[var(--text-3)] font-mono">Default: align@2026</span>
              </div>
              <input
                type="text"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
                placeholder="align@2026"
                className="w-full rounded border border-[var(--border-strong)] bg-[var(--surface)] px-2.5 py-1.5 text-xs text-[var(--text)] font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--text-2)]">Role & Permissions *</label>
              <select
                value={newUserRole}
                onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                className="w-full rounded border border-[var(--border-strong)] bg-[var(--surface)] px-2.5 py-1.5 text-xs text-[var(--text)] cursor-pointer"
              >
                <option value="ea">EA (Executive Assistant) — Full Access + CEO Flagging</option>
                <option value="admin">Admin — Full Access + User Management</option>
                <option value="ceo_viewer">CEO (Executive Viewer) — Full Read-Only</option>
                <option value="viewer">Viewer — Read-Only Stakeholder</option>
              </select>
              <p className="text-[11px] text-[var(--text-3)] pt-0.5">
                {newUserRole === 'ea' && 'EA has operational write privileges on all items and can set the CEO Attention flag.'}
                {newUserRole === 'admin' && 'Admin has all EA privileges plus user management and configuration rights.'}
                {newUserRole === 'ceo_viewer' && 'CEO Viewer has complete visibility across all items in safe read-only mode.'}
                {newUserRole === 'viewer' && 'Viewer has read-only access to progress tracking and project views.'}
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--text-2)]">Department (Optional)</label>
              <select
                value={newUserDeptId}
                onChange={(e) => setNewUserDeptId(e.target.value)}
                className="w-full rounded border border-[var(--border-strong)] bg-[var(--surface)] px-2.5 py-1.5 text-xs text-[var(--text)] cursor-pointer"
              >
                <option value="">No department assigned</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[var(--border)]">
              <button
                type="button"
                onClick={() => setIsAddUserModalOpen(false)}
                className="rounded px-3 py-1.5 text-xs font-medium text-[var(--text-2)] hover:bg-[var(--surface-2)] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded bg-[var(--brand-600)] hover:bg-[var(--brand-700)] px-3 py-1.5 text-xs font-semibold text-white cursor-pointer shadow-xs"
              >
                Create Account
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal (In-App Dialog, no window.confirm) */}
      {deleteItemTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400">
              <Trash2 className="h-5 w-5 shrink-0" />
              <h3 className="text-sm font-bold text-[var(--text)]">
                {deleteItemTarget.type === 'user' ? 'Delete User Account' : 'Delete List Value'}
              </h3>
            </div>

            <p className="text-xs text-[var(--text-2)] leading-relaxed">
              {deleteItemTarget.type === 'user' ? (
                <>
                  Are you sure you want to permanently delete user account <strong className="text-[var(--text)]">"{deleteItemTarget.name}"</strong>?
                  {users.filter((u) => u.role === 'admin').length <= 1 && (
                    <span className="block mt-1.5 text-amber-600 dark:text-amber-400 font-medium">
                      Note: At least one active administrator account must always be present.
                    </span>
                  )}
                </>
              ) : (
                <>
                  Are you sure you want to permanently delete <strong className="text-[var(--text)]">"{deleteItemTarget.name}"</strong> from <strong className="text-[var(--text)] capitalize">{deleteItemTarget.listName}</strong>? Dangling item references will be automatically scrubbed or reassigned.
                </>
              )}
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border)]">
              <button
                type="button"
                onClick={() => setDeleteItemTarget(null)}
                className="rounded px-3 py-1.5 text-xs font-medium text-[var(--text-2)] hover:bg-[var(--surface-2)] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (deleteItemTarget.type === 'user') {
                    deleteUser(deleteItemTarget.id);
                  } else if (deleteItemTarget.listName) {
                    deleteListOption(deleteItemTarget.listName, deleteItemTarget.id);
                  }
                  setDeleteItemTarget(null);
                }}
                className="rounded bg-rose-600 hover:bg-rose-700 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs cursor-pointer"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
