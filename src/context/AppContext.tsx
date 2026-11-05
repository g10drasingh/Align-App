/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  initialActivityLogs,
  initialCategories,
  initialCeoAttentionStatuses,
  initialDepartments,
  initialFollowupStatuses,
  initialFollowups,
  initialItemLinks,
  initialMeetingTypes,
  initialMeetings,
  initialPriorities,
  initialSeries,
  initialSettings,
  initialStatuses,
  initialSubDomains,
  initialTeamMembers,
  initialUsers,
  initialWorkItems,
} from '../data/initialData';
import {
  ActivityLog,
  AppUser,
  Category,
  CeoAttentionStatus,
  DensityMode,
  Department,
  Followup,
  FollowupStatus,
  ItemLink,
  Meeting,
  MeetingType,
  Priority,
  RecurrenceSeries,
  Status,
  SubDomain,
  SystemSettings,
  TeamMember,
  ThemeMode,
  UserRole,
  WorkItem,
} from '../types';
import {
  checkLinkCycle,
  checkParentDueDateExtension,
  computeItemProgressAndWeights,
  getDeadlineInfo,
} from '../utils/engine';
import {
  encryptData,
  decryptData,
  hashPassword,
  verifyPassword,
  generateSalt,
} from '../utils/crypto';
import {
  checkForAppUpdates,
  loadUpdateSettings,
  saveUpdateSettings,
  shouldCheckForUpdate,
  createPreUpdateBackup,
  UpdateInfo,
  CURRENT_APP_VERSION,
} from '../services/updateService';

export interface ToastInfo {
  id: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'danger';
  undoAction?: () => void;
}

export interface CascadeWarning {
  childName: string;
  childDueDate: string;
  affectedAncestors: Array<{ id: string; name: string; currentDueDate?: string }>;
  onConfirm: () => void;
  onCancel: () => void;
}

interface AppContextType {
  // Current user & role
  currentUser: AppUser;
  setCurrentUser: (user: AppUser) => void;
  users: AppUser[];
  canEdit: boolean; // EA or Admin
  isAdmin: boolean;
  isEA: boolean;
  isCeoViewer: boolean;
  isViewer: boolean;
  addUser: (user: Omit<AppUser, 'id' | 'createdAt'>) => Promise<{ success: boolean; error?: string }>;
  updateUser: (id: string, updates: Partial<AppUser>) => void;
  toggleUserStatus: (id: string) => void;
  deleteUser: (id: string) => { success: boolean; error?: string };
  switchUser: (id: string) => void;

  // Auth & Security state
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAppLocked: boolean;
  lockApp: () => void;
  unlockApp: (pin: string) => boolean;
  hasPinConfigured: boolean;
  setupPin: (pin: string) => boolean;
  changePin: (oldPin: string, newPin: string) => { success: boolean; error?: string };
  resetPin: () => void;
  autoLockMinutes: number;
  setAutoLockMinutes: (m: number) => void;
  lockOnTabBlur: boolean;
  setLockOnTabBlur: (b: boolean) => void;
  changeUserPassword: (userId: string, oldPass: string, newPass: string) => Promise<{ success: boolean; error?: string }>;
  isChangePasswordRequired: boolean;
  setIsChangePasswordRequired: (req: boolean) => void;

  // In-App Updates & Encrypted Vault
  isUpdateModalOpen: boolean;
  setIsUpdateModalOpen: (open: boolean) => void;
  updateInfo: UpdateInfo | null;
  isCheckingUpdates: boolean;
  checkUpdates: (isManual?: boolean) => Promise<UpdateInfo>;
  exportDatabaseBackup: () => void;
  restoreDatabaseBackup: (jsonStr: string) => { success: boolean; error?: string };

  // View state
  activeNav: string; // 'dashboard' | 'tasks' | 'projects' | 'ceo' | 'followups' | 'meetings' | 'settings'
  setActiveNav: (nav: string) => void;
  density: DensityMode;
  setDensity: (d: DensityMode) => void;
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (c: boolean) => void;

  // Active dates
  todayStr: string;
  dueSoonWindow: number;
  setDueSoonWindow: (days: number) => void;
  dueSoonUnit: 'days' | 'weeks' | 'months';
  setDueSoonUnit: (unit: 'days' | 'weeks' | 'months') => void;

  // Domain data
  departments: Department[];
  subDomains: SubDomain[];
  teamMembers: TeamMember[];
  categories: Category[];
  priorities: Priority[];
  statuses: Status[];
  ceoAttentionStatuses: CeoAttentionStatus[];
  followupStatuses: FollowupStatus[];
  meetingTypes: MeetingType[];
  workItems: WorkItem[];
  followups: Followup[];
  meetings: Meeting[];
  itemLinks: ItemLink[];
  activityLogs: ActivityLog[];
  settings: SystemSettings;
  recurrenceSeries: RecurrenceSeries[];

  // Computed helper maps
  departmentMap: Map<string, Department>;
  categoryMap: Map<string, Category>;
  priorityMap: Map<string, Priority>;
  statusMap: Map<string, Status>;
  teamMemberMap: Map<string, TeamMember>;
  ceoStatusMap: Map<string, CeoAttentionStatus>;

  // Actions
  createWorkItem: (item: Omit<WorkItem, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'isArchived'>) => WorkItem;
  updateWorkItem: (id: string, updates: Partial<WorkItem>, reason?: string) => void;
  deleteWorkItem: (id: string) => void;
  inlineUpdateWorkItem: (id: string, field: keyof WorkItem, value: any, reason?: string) => void;
  archiveWorkItem: (id: string) => void;
  restoreWorkItem: (id: string) => void;
  toggleCeoAttention: (id: string, note?: string) => void;
  setManualWeight: (id: string, weight: number) => void;
  resetWeightToAuto: (id: string) => void;

  // Followups
  createFollowup: (fu: Omit<Followup, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => void;
  updateFollowup: (id: string, updates: Partial<Followup>) => void;
  deleteFollowup: (id: string) => void;
  logFollowupOutcome: (id: string, outcomeRemarks: string, nextFollowupDate?: string) => void;
  postponeFollowup: (id: string, newDate: string) => void;
  cancelFollowup: (id: string) => void;

  // Meetings
  createMeeting: (m: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'isArchived'>, actionItemTitle?: string) => Meeting;
  updateMeeting: (id: string, updates: Partial<Meeting>) => void;
  deleteMeeting: (id: string) => void;
  createMeetingDeliverable: (meetingId: string, title: string, dueDate?: string) => WorkItem;

  // Links
  addLink: (sourceType: 'work_item' | 'meeting', sourceId: string, targetType: 'work_item' | 'meeting', targetId: string) => { success: boolean; error?: string };
  removeLink: (id: string) => void;

  // Lists management
  addListOption: (listName: string, data: any) => void;
  updateListOption: (listName: string, id: string, data: any) => void;
  deactivateListOption: (listName: string, id: string) => void;
  mergeListOption: (listName: string, sourceId: string, targetId: string) => void;
  deleteListOption: (listName: string, id: string) => { success: boolean; error?: string };

  // Settings
  updateSettings: (updates: Partial<SystemSettings>) => void;

  // Toasts & Dialogs
  toasts: ToastInfo[];
  addToast: (t: Omit<ToastInfo, 'id'>) => void;
  removeToast: (id: string) => void;
  cascadeWarning: CascadeWarning | null;
  setCascadeWarning: (w: CascadeWarning | null) => void;

  // Selected item modal / drawer
  selectedItemId: string | null;
  setSelectedItemId: (id: string | null) => void;
  selectedMeetingId: string | null;
  setSelectedMeetingId: (id: string | null) => void;

  // New Item dialog state
  isNewItemOpen: boolean;
  setIsNewItemOpen: (open: boolean) => void;
  newItemDefaultType: 'project' | 'task';
  setNewItemDefaultType: (type: 'project' | 'task') => void;
  newItemDefaultParentId?: string | null;
  setNewItemDefaultParentId: (id: string | null) => void;
  newItemMode: 'project' | 'sub_project' | 'task' | 'sub_task' | 'generic';
  setNewItemMode: (mode: 'project' | 'sub_project' | 'task' | 'sub_task' | 'generic') => void;
  openCreateModal: (options?: {
    type?: 'project' | 'task';
    parentId?: string | null;
    mode?: 'project' | 'sub_project' | 'task' | 'sub_task' | 'generic';
  }) => void;

  // Command palette
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;

  // Summary counts
  summaryCounts: {
    open: number;
    overdue: number;
    dueSoon: number;
    active: number;
    needsCeo: number;
  };

  // Reset demo data
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_PREFIX = 'align_app_';

function loadStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function saveStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<AppUser[]>(() => {
    const saved = loadStorage<AppUser[]>('users', initialUsers);
    if (Array.isArray(saved) && saved.length > 0) {
      // If user list still has old mock accounts without u-admin or has u-ea, normalize to single admin
      const hasAdmin = saved.some((u) => u.email === 'admin@admin.com');
      if (!hasAdmin) {
        return initialUsers;
      }
      return saved.map((u) => {
        if (u.email === 'admin@admin.com') {
          return {
            ...u,
            passwordHash: u.passwordHash || 'a36d8e7e4107dab47a2a94f97345b89095e7d7d510afe3ba03ce16025e99e3ed',
            salt: u.salt || 'align_admin_salt_2026',
            mustChangePassword: u.mustChangePassword !== undefined ? u.mustChangePassword : true,
          };
        }
        return u;
      });
    }
    return initialUsers;
  });

  const [currentUser, setCurrentUser] = useState<AppUser>(() => {
    const saved = loadStorage<AppUser | null>('user', null);
    if (saved && users.some((u) => u.id === saved.id && u.isActive)) {
      const matched = users.find((u) => u.id === saved.id);
      return matched || saved;
    }
    const adminUser = users.find((u) => u.email === 'admin@admin.com');
    return adminUser || users[0] || initialUsers[0];
  });

  const [isChangePasswordRequired, setIsChangePasswordRequired] = useState<boolean>(() => {
    const adminUser = users.find((u) => u.email === 'admin@admin.com');
    return Boolean(currentUser?.mustChangePassword || adminUser?.mustChangePassword);
  });

  // Authentication & Security state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() =>
    loadStorage<boolean>('is_authenticated', true)
  );

  const [isAppLocked, setIsAppLocked] = useState<boolean>(() =>
    loadStorage<boolean>('is_locked', false)
  );

  const [hasPinConfigured, setHasPinConfigured] = useState<boolean>(() => {
    const pin = loadStorage<string | null>('pin', null);
    return Boolean(pin && /^\d{6}$/.test(pin));
  });

  const [autoLockMinutes, setAutoLockMinutesState] = useState<number>(() =>
    loadStorage<number>('auto_lock_minutes', 15)
  );

  const [lockOnTabBlur, setLockOnTabBlurState] = useState<boolean>(() =>
    loadStorage<boolean>('lock_on_tab_blur', false)
  );

  const [activeNav, setActiveNav] = useState<string>('dashboard');
  const [density, setDensity] = useState<DensityMode>(() =>
    loadStorage('density', 'comfortable')
  );
  const [theme, setTheme] = useState<ThemeMode>(() =>
    loadStorage('theme', 'system')
  );
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() =>
    loadStorage('sidebar_collapsed', false)
  );

  const [todayStr] = useState<string>('2026-11-01');
  const [dueSoonWindow, setDueSoonWindow] = useState<number>(7);
  const [dueSoonUnit, setDueSoonUnit] = useState<'days' | 'weeks' | 'months'>('days');

  // Domain state
  const [departments, setDepartments] = useState<Department[]>(() =>
    loadStorage('departments', initialDepartments)
  );
  const [subDomains, setSubDomains] = useState<SubDomain[]>(() =>
    loadStorage('subDomains', initialSubDomains)
  );
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() =>
    loadStorage('teamMembers', initialTeamMembers)
  );
  const [categories, setCategories] = useState<Category[]>(() =>
    loadStorage('categories', initialCategories)
  );
  const [priorities, setPriorities] = useState<Priority[]>(() =>
    loadStorage('priorities', initialPriorities)
  );
  const [statuses, setStatuses] = useState<Status[]>(() =>
    loadStorage('statuses', initialStatuses)
  );
  const [ceoAttentionStatuses, setCeoAttentionStatuses] = useState<CeoAttentionStatus[]>(() =>
    loadStorage('ceoAttentionStatuses', initialCeoAttentionStatuses)
  );
  const [followupStatuses] = useState<FollowupStatus[]>(initialFollowupStatuses);
  const [meetingTypes, setMeetingTypes] = useState<MeetingType[]>(() =>
    loadStorage('meetingTypes', initialMeetingTypes)
  );
  const [workItems, setWorkItems] = useState<WorkItem[]>(() =>
    loadStorage('workItems', initialWorkItems)
  );
  const [followups, setFollowups] = useState<Followup[]>(() =>
    loadStorage('followups', initialFollowups)
  );
  const [meetings, setMeetings] = useState<Meeting[]>(() =>
    loadStorage('meetings', initialMeetings)
  );
  const [itemLinks, setItemLinks] = useState<ItemLink[]>(() =>
    loadStorage('itemLinks', initialItemLinks)
  );
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() =>
    loadStorage('activityLogs', initialActivityLogs)
  );
  const [settings, setSettings] = useState<SystemSettings>(() =>
    loadStorage('settings', initialSettings)
  );
  const [recurrenceSeries, setRecurrenceSeries] = useState<RecurrenceSeries[]>(() =>
    loadStorage('series', initialSeries)
  );

  // Overlays
  const [toasts, setToasts] = useState<ToastInfo[]>([]);
  const [cascadeWarning, setCascadeWarning] = useState<CascadeWarning | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);

  const [isNewItemOpen, setIsNewItemOpen] = useState(false);
  const [newItemDefaultType, setNewItemDefaultType] = useState<'project' | 'task'>('task');
  const [newItemDefaultParentId, setNewItemDefaultParentId] = useState<string | null>(null);
  const [newItemMode, setNewItemMode] = useState<
    'project' | 'sub_project' | 'task' | 'sub_task' | 'generic'
  >('generic');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  const openCreateModal = (options?: {
    type?: 'project' | 'task';
    parentId?: string | null;
    mode?: 'project' | 'sub_project' | 'task' | 'sub_task' | 'generic';
  }) => {
    const type = options?.type || 'task';
    const parentId = options?.parentId !== undefined ? options.parentId : null;
    let mode = options?.mode;

    if (!mode) {
      if (parentId) {
        const parent = workItems.find((w) => w.id === parentId);
        if (parent?.itemType === 'task') {
          mode = 'sub_task';
        } else if (parent?.itemType === 'project') {
          mode = type === 'project' ? 'sub_project' : 'task';
        } else {
          mode = 'generic';
        }
      } else {
        mode = type === 'project' ? 'project' : 'task';
      }
    }

    setNewItemDefaultType(type);
    setNewItemDefaultParentId(parentId);
    setNewItemMode(mode || 'generic');
    setIsNewItemOpen(true);
  };

  // In-App Updates state
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [isCheckingUpdates, setIsCheckingUpdates] = useState(false);

  const checkUpdates = async (isManual = false): Promise<UpdateInfo> => {
    setIsCheckingUpdates(true);
    try {
      const info = await checkForAppUpdates();
      setUpdateInfo(info);
      if (isManual) {
        setIsUpdateModalOpen(true);
      }
      return info;
    } finally {
      setIsCheckingUpdates(false);
    }
  };

  useEffect(() => {
    const updateSettings = loadUpdateSettings();
    if (shouldCheckForUpdate(updateSettings)) {
      checkForAppUpdates().then((info) => {
        setUpdateInfo(info);
        if (info.isAvailable && (!updateSettings.ignoredVersion || updateSettings.ignoredVersion !== info.latestVersion)) {
          setIsUpdateModalOpen(true);
        }
      });
    }
  }, []);

  // Database Backup and Restore with zero data loss guarantee
  const exportDatabaseBackup = () => {
    const fullSnapshot = {
      workItems,
      meetings,
      followups,
      users,
      departments,
      subDomains,
      teamMembers,
      categories,
      priorities,
      statuses,
      ceoAttentionStatuses,
      itemLinks,
      activityLogs,
      settings,
    };
    const res = createPreUpdateBackup(fullSnapshot);
    if (res.success) {
      addToast({ message: `Encrypted database backup downloaded: ${res.filename}`, type: 'success' });
    }
  };

  const restoreDatabaseBackup = (jsonStr: string): { success: boolean; error?: string } => {
    try {
      const parsed = JSON.parse(jsonStr);
      const data = parsed.data || parsed;
      if (!data.workItems || !Array.isArray(data.workItems)) {
        return { success: false, error: 'Invalid backup format: missing workItems data.' };
      }

      if (data.users && Array.isArray(data.users)) setUsers(data.users);
      if (data.workItems && Array.isArray(data.workItems)) setWorkItems(data.workItems);
      if (data.meetings && Array.isArray(data.meetings)) setMeetings(data.meetings);
      if (data.followups && Array.isArray(data.followups)) setFollowups(data.followups);
      if (data.departments && Array.isArray(data.departments)) setDepartments(data.departments);
      if (data.subDomains && Array.isArray(data.subDomains)) setSubDomains(data.subDomains);
      if (data.teamMembers && Array.isArray(data.teamMembers)) setTeamMembers(data.teamMembers);
      if (data.itemLinks && Array.isArray(data.itemLinks)) setItemLinks(data.itemLinks);
      if (data.settings) setSettings(data.settings);

      addToast({ message: 'Database successfully restored with zero data loss.', type: 'success' });
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to parse backup JSON.' };
    }
  };

  // Asynchronous AES-256 Vault persistence
  useEffect(() => {
    const timer = setTimeout(() => {
      const snapshot = {
        version: CURRENT_APP_VERSION,
        timestamp: new Date().toISOString(),
        users,
        departments,
        subDomains,
        teamMembers,
        categories,
        priorities,
        statuses,
        ceoAttentionStatuses,
        workItems,
        followups,
        meetings,
        itemLinks,
        activityLogs,
        settings,
      };
      encryptData(snapshot).then((ciphertext) => {
        try {
          localStorage.setItem('align_app_vault_aes256', ciphertext);
        } catch {
          // ignore
        }
      });
    }, 1500);
    return () => clearTimeout(timer);
  }, [
    users,
    departments,
    subDomains,
    teamMembers,
    categories,
    priorities,
    statuses,
    ceoAttentionStatuses,
    workItems,
    followups,
    meetings,
    itemLinks,
    activityLogs,
    settings,
  ]);

  // Sync to localStorage
  useEffect(() => saveStorage('user', currentUser), [currentUser]);
  useEffect(() => saveStorage('users', users), [users]);
  useEffect(() => saveStorage('density', density), [density]);
  useEffect(() => saveStorage('theme', theme), [theme]);
  useEffect(() => saveStorage('sidebar_collapsed', isSidebarCollapsed), [isSidebarCollapsed]);
  useEffect(() => saveStorage('departments', departments), [departments]);
  useEffect(() => saveStorage('subDomains', subDomains), [subDomains]);
  useEffect(() => saveStorage('teamMembers', teamMembers), [teamMembers]);
  useEffect(() => saveStorage('categories', categories), [categories]);
  useEffect(() => saveStorage('priorities', priorities), [priorities]);
  useEffect(() => saveStorage('statuses', statuses), [statuses]);
  useEffect(() => saveStorage('ceoAttentionStatuses', ceoAttentionStatuses), [ceoAttentionStatuses]);
  useEffect(() => saveStorage('meetingTypes', meetingTypes), [meetingTypes]);
  useEffect(() => saveStorage('workItems', workItems), [workItems]);
  useEffect(() => saveStorage('followups', followups), [followups]);
  useEffect(() => saveStorage('meetings', meetings), [meetings]);
  useEffect(() => saveStorage('itemLinks', itemLinks), [itemLinks]);
  useEffect(() => saveStorage('activityLogs', activityLogs), [activityLogs]);
  useEffect(() => saveStorage('settings', settings), [settings]);
  useEffect(() => saveStorage('series', recurrenceSeries), [recurrenceSeries]);

  // Handle theme application on html root
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.setAttribute('data-theme', 'light');
      root.classList.remove('dark');
    } else {
      root.removeAttribute('data-theme');
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [theme]);

  // Handle display density application on html root
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-density', density);
  }, [density]);

  // Maps for fast lookup
  const departmentMap = useMemo(() => new Map(departments.map((d) => [d.id, d])), [departments]);
  const categoryMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);
  const priorityMap = useMemo(() => new Map(priorities.map((p) => [p.id, p])), [priorities]);
  const statusMap = useMemo(() => new Map(statuses.map((s) => [s.id, s])), [statuses]);
  const teamMemberMap = useMemo(() => new Map(teamMembers.map((t) => [t.id, t])), [teamMembers]);
  const ceoStatusMap = useMemo(
    () => new Map(ceoAttentionStatuses.map((c) => [c.id, c])),
    [ceoAttentionStatuses]
  );

  const canEdit = currentUser.role === 'ea' || currentUser.role === 'admin';
  const isAdmin = currentUser.role === 'admin';
  const isEA = currentUser.role === 'ea';
  const isCeoViewer = currentUser.role === 'ceo_viewer';
  const isViewer = currentUser.role === 'ceo_viewer' || currentUser.role === 'viewer';

  const addUser = async (userData: Omit<AppUser, 'id' | 'createdAt'>): Promise<{ success: boolean; error?: string }> => {
    if (!userData.name.trim() || !userData.email.trim()) {
      return { success: false, error: 'Name and email are required.' };
    }
    const emailNormalized = userData.email.toLowerCase().trim();
    if (users.some((u) => u.email.toLowerCase() === emailNormalized)) {
      return { success: false, error: 'A user with this email address already exists.' };
    }
    const rawPass = userData.password?.trim() || 'align2026!';
    const salt = generateSalt();
    const passwordHash = await hashPassword(rawPass, salt);

    const newUser: AppUser = {
      ...userData,
      id: 'u-' + Math.random().toString(36).substring(2, 9),
      name: userData.name.trim(),
      email: emailNormalized,
      isActive: userData.isActive !== false,
      createdAt: todayStr,
      salt,
      passwordHash,
      mustChangePassword: true,
    };
    delete (newUser as any).password;
    setUsers((prev) => [...prev, newUser]);
    logActivity('user', newUser.id, 'create', 'user', null, newUser.name);
    addToast({
      message: `User "${newUser.name}" created with role ${newUser.role.toUpperCase()}.`,
      type: 'success',
    });
    return { success: true };
  };

  const updateUser = (id: string, updates: Partial<AppUser>) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const updated = { ...u, ...updates };
          if (currentUser.id === id) {
            setCurrentUser(updated);
          }
          return updated;
        }
        return u;
      })
    );
    logActivity('user', id, 'update', 'user', null, JSON.stringify(updates));
    addToast({ message: 'User profile updated.', type: 'success' });
  };

  const toggleUserStatus = (id: string) => {
    if (currentUser.id === id) {
      addToast({ message: 'Cannot deactivate the currently logged-in account.', type: 'warning' });
      return;
    }
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, isActive: !u.isActive } : u))
    );
    addToast({ message: 'User status toggled.', type: 'info' });
  };

  const deleteUser = (id: string) => {
    if (!isAdmin) {
      const err = 'Only administrators can delete user accounts.';
      addToast({ message: err, type: 'danger' });
      return { success: false, error: err };
    }
    if (currentUser.id === id) {
      const err = 'Cannot delete your own currently logged-in account.';
      addToast({ message: err, type: 'warning' });
      return { success: false, error: err };
    }
    const userToDelete = users.find((u) => u.id === id);
    if (!userToDelete) return { success: false, error: 'User not found.' };

    const remainingAdmins = users.filter((u) => u.role === 'admin' && u.id !== id);
    if (userToDelete.role === 'admin' && remainingAdmins.length === 0) {
      const err = 'Cannot delete this account. At least one administrator account must be present.';
      addToast({ message: err, type: 'danger' });
      return { success: false, error: err };
    }

    setUsers((prev) => prev.filter((u) => u.id !== id));
    logActivity('user', id, 'delete', 'user', userToDelete.name, null);
    addToast({ message: `User "${userToDelete.name}" deleted successfully.`, type: 'info' });
    return { success: true };
  };

  const switchUser = (id: string) => {
    const target = users.find((u) => u.id === id);
    if (!target) return;
    if (!target.isActive) {
      addToast({ message: 'This user account is currently deactivated.', type: 'warning' });
      return;
    }
    setCurrentUser(target);
    addToast({
      message: `Active session: ${target.name} (${target.role.toUpperCase()})`,
      type: 'info',
    });
  };

  const setAutoLockMinutes = (m: number) => {
    setAutoLockMinutesState(m);
    saveStorage('auto_lock_minutes', m);
  };

  const setLockOnTabBlur = (b: boolean) => {
    setLockOnTabBlurState(b);
    saveStorage('lock_on_tab_blur', b);
  };

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const emailNorm = email.trim().toLowerCase();
    const user = users.find((u) => u.email.toLowerCase() === emailNorm);
    if (!user) {
      return { success: false, error: 'User with this email not found.' };
    }
    if (!user.isActive) {
      return { success: false, error: 'This user account is inactive. Please contact an administrator.' };
    }
    const isValid = await verifyPassword(pass, user.passwordHash, user.salt, user.password);
    if (!isValid) {
      return { success: false, error: 'Incorrect password. Default password is admin' };
    }

    setCurrentUser(user);
    saveStorage('user', user);
    setIsAuthenticated(true);
    saveStorage('is_authenticated', true);

    if (user.mustChangePassword) {
      setIsChangePasswordRequired(true);
    } else {
      setIsChangePasswordRequired(false);
    }

    addToast({ message: `Signed in as ${user.name}`, type: 'success' });
    return { success: true };
  };

  const logout = () => {
    setIsAuthenticated(false);
    saveStorage('is_authenticated', false);
    setIsAppLocked(false);
    saveStorage('is_locked', false);
    addToast({ message: 'Signed out successfully.', type: 'info' });
  };

  const lockApp = () => {
    setIsAppLocked(true);
    saveStorage('is_locked', true);
  };

  const unlockApp = (pin: string): boolean => {
    const storedPin = loadStorage<string | null>('pin', null);
    if (!storedPin) {
      return false;
    }
    if (pin === storedPin) {
      setIsAppLocked(false);
      saveStorage('is_locked', false);
      addToast({ message: 'Session unlocked.', type: 'success' });
      return true;
    }
    return false;
  };

  const setupPin = (pin: string): boolean => {
    if (!/^\d{6}$/.test(pin)) {
      addToast({ message: 'PIN must be exactly 6 digits.', type: 'danger' });
      return false;
    }
    saveStorage('pin', pin);
    setHasPinConfigured(true);
    setIsAppLocked(false);
    saveStorage('is_locked', false);
    addToast({ message: '6-digit PIN set up successfully.', type: 'success' });
    return true;
  };

  const changePin = (oldPin: string, newPin: string): { success: boolean; error?: string } => {
    const storedPin = loadStorage<string | null>('pin', null);
    if (storedPin && oldPin !== storedPin) {
      return { success: false, error: 'Current PIN is incorrect.' };
    }
    if (!/^\d{6}$/.test(newPin)) {
      return { success: false, error: 'New PIN must be exactly 6 digits.' };
    }
    saveStorage('pin', newPin);
    setHasPinConfigured(true);
    addToast({ message: '6-digit PIN changed successfully.', type: 'success' });
    return { success: true };
  };

  const resetPin = () => {
    try {
      localStorage.removeItem(STORAGE_PREFIX + 'pin');
    } catch {}
    setHasPinConfigured(false);
    addToast({ message: 'PIN reset. You will be prompted on next lock.', type: 'info' });
  };

  const changeUserPassword = async (
    userId: string,
    oldPass: string,
    newPass: string
  ): Promise<{ success: boolean; error?: string }> => {
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return { success: false, error: 'User not found.' };

    const isValid = await verifyPassword(oldPass, targetUser.passwordHash, targetUser.salt, targetUser.password);
    if (!isValid) {
      return { success: false, error: 'Current password is incorrect.' };
    }
    if (newPass.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters.' };
    }
    if (newPass.toLowerCase() === 'admin') {
      return { success: false, error: 'New password cannot be "admin". Please choose a secure password.' };
    }

    const salt = generateSalt();
    const passwordHash = await hashPassword(newPass, salt);

    const updatedUser: AppUser = {
      ...targetUser,
      passwordHash,
      salt,
      password: undefined,
      mustChangePassword: false,
    };

    updateUser(userId, updatedUser);
    if (currentUser.id === userId) {
      setCurrentUser(updatedUser);
      setIsChangePasswordRequired(false);
    }

    addToast({ message: 'Password updated successfully. Account secured.', type: 'success' });
    return { success: true };
  };

  const addToast = (t: Omit<ToastInfo, 'id'>) => {
    const id = 'toast-' + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...t, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const logActivity = (
    entityType: string,
    entityId: string,
    action: string,
    fieldName?: string,
    oldValue?: any,
    newValue?: any,
    reason?: string,
    isAutomatic = false
  ) => {
    const newLog: ActivityLog = {
      id: 'act-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      entityType,
      entityId,
      action,
      fieldName,
      oldValue,
      newValue,
      reason,
      isAutomatic,
      actorName: isAutomatic ? 'System' : currentUser.name,
      createdAt: new Date().toISOString(),
    };
    setActivityLogs((prev) => [newLog, ...prev]);
  };

  // Helper to extend ancestors if child's due date is later
  const applyCascadeDueDates = (affectedAncestorIds: string[], newDueDate: string) => {
    setWorkItems((prev) =>
      prev.map((item) => {
        if (affectedAncestorIds.includes(item.id)) {
          logActivity(
            'work_item',
            item.id,
            'due_date_extended',
            'dueDate',
            item.dueDate,
            newDueDate,
            `Extended because child due date was set to ${newDueDate}`,
            true
          );
          return { ...item, dueDate: newDueDate, updatedAt: new Date().toISOString() };
        }
        return item;
      })
    );
    addToast({
      message: `Due date moved to ${newDueDate} across ${affectedAncestorIds.length} ancestor item(s).`,
      type: 'info',
    });
  };

  const createWorkItem = (
    itemData: Omit<WorkItem, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'isArchived'>
  ): WorkItem => {
    const newId = 'wi-' + Date.now();
    const now = new Date().toISOString();
    const newItem: WorkItem = {
      ...itemData,
      id: newId,
      isArchived: false,
      createdBy: currentUser.id,
      createdAt: now,
      updatedBy: currentUser.id,
      updatedAt: now,
    };

    // Check parent cascade
    if (newItem.dueDate && newItem.parentId) {
      const cascade = checkParentDueDateExtension(newItem.dueDate, newItem.parentId, workItems);
      if (cascade.needsCascade) {
        setCascadeWarning({
          childName: newItem.name,
          childDueDate: newItem.dueDate,
          affectedAncestors: cascade.affectedAncestors,
          onConfirm: () => {
            applyCascadeDueDates(cascade.affectedAncestors.map((a) => a.id), newItem.dueDate!);
            setWorkItems((prev) => [newItem, ...prev]);
            setCascadeWarning(null);
          },
          onCancel: () => {
            // Keep child date without extending ancestors or cancel
            setWorkItems((prev) => [newItem, ...prev]);
            setCascadeWarning(null);
          },
        });
        return newItem;
      }
    }

    setWorkItems((prev) => [newItem, ...prev]);
    logActivity('work_item', newId, 'created', undefined, undefined, newItem.name);
    addToast({ message: `${newItem.itemType === 'project' ? 'Project' : 'Task'} created.`, type: 'success' });
    return newItem;
  };

  const updateWorkItem = (id: string, updates: Partial<WorkItem>, reason?: string) => {
    const existing = workItems.find((i) => i.id === id);
    if (!existing) return;

    // Check if dueDate is updated and later than ancestors
    if (updates.dueDate && updates.dueDate !== existing.dueDate && existing.parentId) {
      const cascade = checkParentDueDateExtension(updates.dueDate, existing.parentId, workItems);
      if (cascade.needsCascade) {
        setCascadeWarning({
          childName: existing.name,
          childDueDate: updates.dueDate,
          affectedAncestors: cascade.affectedAncestors,
          onConfirm: () => {
            applyCascadeDueDates(cascade.affectedAncestors.map((a) => a.id), updates.dueDate!);
            commitItemUpdate(id, updates, reason);
            setCascadeWarning(null);
          },
          onCancel: () => {
            commitItemUpdate(id, updates, reason);
            setCascadeWarning(null);
          },
        });
        return;
      }
    }

    commitItemUpdate(id, updates, reason);
  };

  const commitItemUpdate = (id: string, updates: Partial<WorkItem>, reason?: string) => {
    setWorkItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        // If status changed to Blocked, set blockedSince
        let blockedSince = item.blockedSince;
        if (updates.statusId && updates.statusId !== item.statusId) {
          const newStatus = statusMap.get(updates.statusId);
          if (newStatus?.stateGroup === 'blocked' && !item.blockedSince) {
            blockedSince = todayStr;
          } else if (newStatus?.stateGroup !== 'blocked') {
            blockedSince = undefined;
          }
        }

        // If status changed to Completed, set completedOn
        let completedOn = item.completedOn;
        if (updates.statusId && updates.statusId !== item.statusId) {
          const newStatus = statusMap.get(updates.statusId);
          if (newStatus?.stateGroup === 'done') {
            completedOn = todayStr;
          }
        }

        // If status changed, clear manual progress override per spec 7.3
        let progressOverride = item.progressOverride;
        if (updates.statusId && updates.statusId !== item.statusId && item.progressOverride != null) {
          progressOverride = undefined;
        }

        return {
          ...item,
          ...updates,
          blockedSince,
          completedOn,
          progressOverride,
          updatedBy: currentUser.id,
          updatedAt: new Date().toISOString(),
        };
      })
    );

    // Log key changes
    if (updates.statusId) {
      const oldStatus = statusMap.get(existingItem(id)?.statusId ?? '')?.name;
      const newStatus = statusMap.get(updates.statusId)?.name;
      logActivity('work_item', id, 'status_changed', 'status', oldStatus, newStatus, reason);
    }
    if (updates.dueDate) {
      logActivity('work_item', id, 'due_date_changed', 'dueDate', existingItem(id)?.dueDate, updates.dueDate, reason);
    }
    if (updates.needsCeoAttention !== undefined) {
      logActivity(
        'work_item',
        id,
        updates.needsCeoAttention ? 'ceo_flag_set' : 'ceo_flag_cleared',
        'needsCeoAttention',
        existingItem(id)?.needsCeoAttention,
        updates.needsCeoAttention,
        reason
      );
    }

    addToast({ message: 'Changes saved.', type: 'success' });
  };

  const existingItem = (id: string) => workItems.find((i) => i.id === id);

  const inlineUpdateWorkItem = (id: string, field: keyof WorkItem, value: any, reason?: string) => {
    updateWorkItem(id, { [field]: value }, reason);
  };

  const archiveWorkItem = (id: string) => {
    const item = existingItem(id);
    if (!item) return;
    setWorkItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, isArchived: true, updatedAt: new Date().toISOString() } : i))
    );
    logActivity('work_item', id, 'archived', 'isArchived', false, true);
    addToast({
      message: `${item.itemType === 'project' ? 'Project' : 'Task'} archived.`,
      undoAction: () => restoreWorkItem(id),
    });
  };

  const restoreWorkItem = (id: string) => {
    setWorkItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, isArchived: false, updatedAt: new Date().toISOString() } : i))
    );
    logActivity('work_item', id, 'restored', 'isArchived', true, false);
    addToast({ message: 'Item restored.', type: 'success' });
  };

  const deleteWorkItem = (id: string) => {
    const item = existingItem(id);
    if (!item) return;

    // Collect all recursive descendants
    const idsToDelete = new Set<string>([id]);
    const collectDescendants = (parentId: string) => {
      workItems
        .filter((w) => w.parentId === parentId)
        .forEach((child) => {
          idsToDelete.add(child.id);
          collectDescendants(child.id);
        });
    };
    collectDescendants(id);

    setWorkItems((prev) => prev.filter((w) => !idsToDelete.has(w.id)));
    setItemLinks((prev) =>
      prev.filter((l) => !idsToDelete.has(l.sourceId) && !idsToDelete.has(l.targetId))
    );
    setFollowups((prev) => prev.filter((fu) => !idsToDelete.has(fu.workItemId)));

    if (selectedItemId && idsToDelete.has(selectedItemId)) {
      setSelectedItemId(null);
    }

    logActivity('work_item', id, 'deleted', item.itemType, item.name, null);
    addToast({
      message: `${item.itemType === 'project' ? 'Project' : 'Task'} "${item.name}" deleted.`,
      type: 'info',
    });
  };

  const toggleCeoAttention = (id: string, note?: string) => {
    if (!canEdit) {
      addToast({ message: 'Only EA and Admin roles can flag items for CEO Attention.', type: 'warning' });
      return;
    }
    const item = existingItem(id);
    if (!item) return;

    const nextFlag = !item.needsCeoAttention;
    updateWorkItem(id, {
      needsCeoAttention: nextFlag,
      ceoAttentionStatusId: nextFlag ? 'ceo-pending' : undefined,
      ceoNote: nextFlag ? (note ?? item.ceoNote) : undefined,
      ceoFlaggedBy: nextFlag ? currentUser.id : undefined,
      ceoFlaggedAt: nextFlag ? new Date().toISOString() : undefined,
    });
  };

  const setManualWeight = (id: string, weight: number) => {
    updateWorkItem(id, {
      weightMode: 'manual',
      weightManual: Math.min(100, Math.max(0, weight)),
    });
    logActivity('work_item', id, 'weight_manual_set', 'weightManual', undefined, weight);
  };

  const resetWeightToAuto = (id: string) => {
    updateWorkItem(id, {
      weightMode: 'auto',
      weightManual: undefined,
    });
    logActivity('work_item', id, 'weight_reset_auto', 'weightMode', 'manual', 'auto');
  };

  // Followups
  const createFollowup = (fuData: Omit<Followup, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => {
    const newId = 'fu-' + Date.now();
    const newFu: Followup = {
      ...fuData,
      id: newId,
      createdBy: currentUser.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setFollowups((prev) => [newFu, ...prev]);
    logActivity('followup', newId, 'created', undefined, undefined, fuData.remarks);
    addToast({ message: 'Follow-up scheduled.', type: 'success' });
  };

  const updateFollowup = (id: string, updates: Partial<Followup>) => {
    setFollowups((prev) =>
      prev.map((fu) => (fu.id === id ? { ...fu, ...updates, updatedAt: new Date().toISOString() } : fu))
    );
    addToast({ message: 'Follow-up updated.', type: 'success' });
  };

  const logFollowupOutcome = (id: string, outcomeRemarks: string, nextFollowupDate?: string) => {
    const fu = followups.find((f) => f.id === id);
    if (!fu) return;

    setFollowups((prev) =>
      prev.map((f) =>
        f.id === id
          ? {
              ...f,
              statusId: 'fstat-done',
              remarks: outcomeRemarks,
              outcomeLoggedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          : f
      )
    );

    logActivity('followup', id, 'outcome_logged', 'status', 'Scheduled', 'Done', outcomeRemarks);
    addToast({ message: 'Follow-up outcome logged.', type: 'success' });

    if (nextFollowupDate) {
      createFollowup({
        workItemId: fu.workItemId,
        followupDate: nextFollowupDate,
        statusId: 'fstat-scheduled',
        remarks: `Next step after: ${outcomeRemarks.slice(0, 60)}...`,
      });
    }
  };

  const postponeFollowup = (id: string, newDate: string) => {
    const fu = followups.find((f) => f.id === id);
    if (!fu) return;

    // Mark current as postponed
    setFollowups((prev) =>
      prev.map((f) =>
        f.id === id
          ? { ...f, statusId: 'fstat-postponed', updatedAt: new Date().toISOString() }
          : f
      )
    );

    // Create new scheduled linked to old
    const newId = 'fu-' + Date.now();
    const newFu: Followup = {
      id: newId,
      workItemId: fu.workItemId,
      followupDate: newDate,
      statusId: 'fstat-scheduled',
      remarks: fu.remarks,
      postponedFromId: fu.id,
      createdBy: currentUser.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setFollowups((prev) => [newFu, ...prev]);

    logActivity('followup', id, 'postponed', 'followupDate', fu.followupDate, newDate);
    addToast({ message: `Follow-up postponed to ${newDate}.`, type: 'info' });
  };

  const cancelFollowup = (id: string) => {
    setFollowups((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, statusId: 'fstat-cancelled', updatedAt: new Date().toISOString() } : f
      )
    );
    logActivity('followup', id, 'cancelled', 'status', 'Scheduled', 'Cancelled');
    addToast({ message: 'Follow-up cancelled.', type: 'info' });
  };

  const deleteFollowup = (id: string) => {
    const fu = followups.find((f) => f.id === id);
    setFollowups((prev) => prev.filter((f) => f.id !== id));
    logActivity('followup', id, 'deleted', undefined, fu?.remarks, null);
    addToast({ message: 'Follow-up deleted.', type: 'info' });
  };

  // Meetings
  const createMeeting = (
    meetingData: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'isArchived'>,
    actionItemTitle?: string
  ): Meeting => {
    const newId = 'meet-' + Date.now();
    const newMeeting: Meeting = {
      ...meetingData,
      id: newId,
      isArchived: false,
      createdBy: currentUser.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setMeetings((prev) => [newMeeting, ...prev]);
    logActivity('meeting', newId, 'created', undefined, undefined, newMeeting.title);
    addToast({ message: 'Meeting created.', type: 'success' });

    // If an action item was requested directly on meeting
    if (actionItemTitle && actionItemTitle.trim()) {
      const task = createWorkItem({
        itemType: 'task',
        parentId: null,
        name: actionItemTitle.trim(),
        description: `Action item generated from meeting: ${newMeeting.title}`,
        statusId: 'stat-not-started',
        priorityId: 'prio-med',
        categoryId: 'cat-plan',
        departmentIds: ['dept-ge'],
        subDomainIds: [],
        teamMemberIds: [],
        weightMode: 'auto',
        needsCeoAttention: false,
        taskKind: 'one_time',
      });
      addLink('meeting', newId, 'work_item', task.id);
    }

    return newMeeting;
  };

  const updateMeeting = (id: string, updates: Partial<Meeting>) => {
    setMeetings((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m))
    );
    addToast({ message: 'Meeting updated.', type: 'success' });
  };

  const deleteMeeting = (id: string) => {
    const meeting = meetings.find((m) => m.id === id);
    setMeetings((prev) => prev.filter((m) => m.id !== id));
    setItemLinks((prev) =>
      prev.filter((l) => !(l.sourceId === id || l.targetId === id))
    );
    if (selectedMeetingId === id) setSelectedMeetingId(null);
    logActivity('meeting', id, 'deleted', undefined, meeting?.title, null);
    addToast({ message: `Meeting "${meeting?.title || ''}" deleted.`, type: 'info' });
  };

  const createMeetingDeliverable = (meetingId: string, title: string, dueDate?: string): WorkItem => {
    const meeting = meetings.find((m) => m.id === meetingId);
    const task = createWorkItem({
      itemType: 'task',
      parentId: null,
      name: title.trim(),
      description: `Action item generated from meeting: ${meeting ? meeting.title : 'Executive Sync'}`,
      statusId: 'stat-not-started',
      priorityId: 'prio-med',
      categoryId: 'cat-plan',
      departmentIds: ['dept-ge'],
      subDomainIds: [],
      teamMemberIds: [],
      dueDate: dueDate || undefined,
      weightMode: 'auto',
      needsCeoAttention: false,
      taskKind: 'one_time',
    });
    addLink('meeting', meetingId, 'work_item', task.id);
    addToast({ message: `Deliverable "${title.trim()}" added to meeting.`, type: 'success' });
    return task;
  };

  // Links
  const addLink = (
    sourceType: 'work_item' | 'meeting',
    sourceId: string,
    targetType: 'work_item' | 'meeting',
    targetId: string
  ): { success: boolean; error?: string } => {
    if (checkLinkCycle(sourceType, sourceId, targetType, targetId, itemLinks)) {
      const err = 'This link would create a loop. Linking is refused.';
      addToast({ message: err, type: 'danger' });
      return { success: false, error: err };
    }

    const newLink: ItemLink = {
      id: 'link-' + Date.now(),
      sourceType,
      sourceId,
      targetType,
      targetId,
      createdAt: new Date().toISOString(),
    };
    setItemLinks((prev) => [...prev, newLink]);
    addToast({ message: 'Item link created.', type: 'success' });
    return { success: true };
  };

  const removeLink = (id: string) => {
    setItemLinks((prev) => prev.filter((l) => l.id !== id));
    addToast({ message: 'Link removed.', type: 'info' });
  };

  // Lists management
  const addListOption = (listName: string, data: any) => {
    const id = `${listName.slice(0, 3)}-` + Date.now();
    switch (listName) {
      case 'departments':
        setDepartments((prev) => [...prev, { ...data, id, isActive: true, sortOrder: prev.length + 1 }]);
        break;
      case 'subDomains':
        setSubDomains((prev) => [...prev, { ...data, id, isActive: true, sortOrder: prev.length + 1 }]);
        break;
      case 'teamMembers':
        setTeamMembers((prev) => [...prev, { ...data, id, isActive: true }]);
        break;
      case 'categories':
        setCategories((prev) => [...prev, { ...data, id, isActive: true, sortOrder: prev.length + 1 }]);
        break;
      case 'priorities':
        setPriorities((prev) => [...prev, { ...data, id, isActive: true }]);
        break;
      case 'statuses':
        setStatuses((prev) => [...prev, { ...data, id, isActive: true, sortOrder: prev.length + 1 }]);
        break;
      case 'ceoAttentionStatuses':
        setCeoAttentionStatuses((prev) => [...prev, { ...data, id, isActive: true, sortOrder: prev.length + 1 }]);
        break;
      case 'meetingTypes':
        setMeetingTypes((prev) => [...prev, { ...data, id, isActive: true, sortOrder: prev.length + 1 }]);
        break;
    }
    logActivity('list', id, 'option_added', listName, undefined, data.name);
    addToast({ message: `Added to ${listName}.`, type: 'success' });
  };

  const updateListOption = (listName: string, id: string, data: any) => {
    switch (listName) {
      case 'departments':
        setDepartments((prev) => prev.map((item) => (item.id === id ? { ...item, ...data } : item)));
        break;
      case 'subDomains':
        setSubDomains((prev) => prev.map((item) => (item.id === id ? { ...item, ...data } : item)));
        break;
      case 'teamMembers':
        setTeamMembers((prev) => prev.map((item) => (item.id === id ? { ...item, ...data } : item)));
        break;
      case 'categories':
        setCategories((prev) => prev.map((item) => (item.id === id ? { ...item, ...data } : item)));
        break;
      case 'priorities':
        setPriorities((prev) => prev.map((item) => (item.id === id ? { ...item, ...data } : item)));
        break;
      case 'statuses':
        setStatuses((prev) => prev.map((item) => (item.id === id ? { ...item, ...data } : item)));
        break;
      case 'ceoAttentionStatuses':
        setCeoAttentionStatuses((prev) => prev.map((item) => (item.id === id ? { ...item, ...data } : item)));
        break;
      case 'meetingTypes':
        setMeetingTypes((prev) => prev.map((item) => (item.id === id ? { ...item, ...data } : item)));
        break;
    }
    addToast({ message: 'Option updated.', type: 'success' });
  };

  const deactivateListOption = (listName: string, id: string) => {
    switch (listName) {
      case 'departments':
        setDepartments((prev) => prev.map((i) => (i.id === id ? { ...i, isActive: !i.isActive } : i)));
        break;
      case 'subDomains':
        setSubDomains((prev) => prev.map((i) => (i.id === id ? { ...i, isActive: !i.isActive } : i)));
        break;
      case 'teamMembers':
        setTeamMembers((prev) => prev.map((i) => (i.id === id ? { ...i, isActive: !i.isActive } : i)));
        break;
      case 'categories':
        setCategories((prev) => prev.map((i) => (i.id === id ? { ...i, isActive: !i.isActive } : i)));
        break;
      case 'priorities':
        setPriorities((prev) => prev.map((i) => (i.id === id ? { ...i, isActive: !i.isActive } : i)));
        break;
      case 'statuses':
        setStatuses((prev) => prev.map((i) => (i.id === id ? { ...i, isActive: !i.isActive } : i)));
        break;
      case 'ceoAttentionStatuses':
        setCeoAttentionStatuses((prev) => prev.map((i) => (i.id === id ? { ...i, isActive: !i.isActive } : i)));
        break;
      case 'meetingTypes':
        setMeetingTypes((prev) => prev.map((i) => (i.id === id ? { ...i, isActive: !i.isActive } : i)));
        break;
    }
    addToast({ message: 'Status updated.', type: 'info' });
  };

  const mergeListOption = (listName: string, sourceId: string, targetId: string) => {
    let affectedCount = 0;
    if (listName === 'departments') {
      setWorkItems((prev) =>
        prev.map((item) => {
          if (item.departmentIds.includes(sourceId)) {
            affectedCount++;
            const updated = item.departmentIds.filter((d) => d !== sourceId);
            if (!updated.includes(targetId)) updated.push(targetId);
            return { ...item, departmentIds: updated };
          }
          return item;
        })
      );
      deactivateListOption('departments', sourceId);
    } else if (listName === 'categories') {
      setWorkItems((prev) =>
        prev.map((item) => {
          if (item.categoryId === sourceId) {
            affectedCount++;
            return { ...item, categoryId: targetId };
          }
          return item;
        })
      );
      deactivateListOption('categories', sourceId);
    }
    logActivity('list', sourceId, 'merged', listName, sourceId, targetId, `${affectedCount} items moved`);
    addToast({ message: `Merged successfully. ${affectedCount} items migrated.`, type: 'success' });
  };

  const deleteListOption = (listName: string, id: string): { success: boolean; error?: string } => {
    switch (listName) {
      case 'departments': {
        setDepartments((prev) => prev.filter((d) => d.id !== id));
        setWorkItems((prev) =>
          prev.map((item) => ({
            ...item,
            departmentIds: item.departmentIds.filter((d) => d !== id),
          }))
        );
        setUsers((prev) =>
          prev.map((u) => (u.departmentId === id ? { ...u, departmentId: undefined } : u))
        );
        setSubDomains((prev) => prev.filter((s) => s.departmentId !== id));
        break;
      }
      case 'subDomains': {
        setSubDomains((prev) => prev.filter((s) => s.id !== id));
        setWorkItems((prev) =>
          prev.map((item) => ({
            ...item,
            subDomainIds: item.subDomainIds.filter((s) => s !== id),
          }))
        );
        break;
      }
      case 'teamMembers': {
        setTeamMembers((prev) => prev.filter((t) => t.id !== id));
        setWorkItems((prev) =>
          prev.map((item) => ({
            ...item,
            teamMemberIds: item.teamMemberIds.filter((t) => t !== id),
          }))
        );
        setMeetings((prev) =>
          prev.map((m) => ({
            ...m,
            attendeeIds: m.attendeeIds.filter((t) => t !== id),
          }))
        );
        break;
      }
      case 'categories': {
        const remaining = categories.filter((c) => c.id !== id);
        const fallbackId = remaining[0]?.id || '';
        setCategories(remaining);
        if (fallbackId) {
          setWorkItems((prev) =>
            prev.map((item) => (item.categoryId === id ? { ...item, categoryId: fallbackId } : item))
          );
        }
        break;
      }
      case 'priorities': {
        const remaining = priorities.filter((p) => p.id !== id);
        const fallbackId = remaining[0]?.id || '';
        setPriorities(remaining);
        if (fallbackId) {
          setWorkItems((prev) =>
            prev.map((item) => (item.priorityId === id ? { ...item, priorityId: fallbackId } : item))
          );
        }
        break;
      }
      case 'statuses': {
        const remaining = statuses.filter((s) => s.id !== id);
        const fallbackId = remaining[0]?.id || '';
        setStatuses(remaining);
        if (fallbackId) {
          setWorkItems((prev) =>
            prev.map((item) => (item.statusId === id ? { ...item, statusId: fallbackId } : item))
          );
        }
        break;
      }
      case 'ceoAttentionStatuses': {
        const remaining = ceoAttentionStatuses.filter((c) => c.id !== id);
        const fallbackId = remaining[0]?.id;
        setCeoAttentionStatuses(remaining);
        setWorkItems((prev) =>
          prev.map((item) =>
            item.ceoAttentionStatusId === id ? { ...item, ceoAttentionStatusId: fallbackId } : item
          )
        );
        break;
      }
      case 'meetingTypes': {
        const remaining = meetingTypes.filter((m) => m.id !== id);
        const fallbackId = remaining[0]?.id || '';
        setMeetingTypes(remaining);
        if (fallbackId) {
          setMeetings((prev) =>
            prev.map((m) => (m.meetingTypeId === id ? { ...m, meetingTypeId: fallbackId } : m))
          );
        }
        break;
      }
      default:
        return { success: false, error: 'Unknown list' };
    }

    logActivity('list', id, 'option_deleted', listName, null, null);
    addToast({ message: 'Option deleted successfully.', type: 'info' });
    return { success: true };
  };

  const updateSettings = (updates: Partial<SystemSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
    addToast({ message: 'System settings saved.', type: 'success' });
  };

  const resetAllData = () => {
    localStorage.clear();
    setUsers(initialUsers);
    setCurrentUser(initialUsers[0]);
    setDepartments(initialDepartments);
    setSubDomains(initialSubDomains);
    setTeamMembers(initialTeamMembers);
    setCategories(initialCategories);
    setPriorities(initialPriorities);
    setStatuses(initialStatuses);
    setCeoAttentionStatuses(initialCeoAttentionStatuses);
    setMeetingTypes(initialMeetingTypes);
    setWorkItems(initialWorkItems);
    setFollowups(initialFollowups);
    setMeetings(initialMeetings);
    setItemLinks(initialItemLinks);
    setActivityLogs(initialActivityLogs);
    setSettings(initialSettings);
    setRecurrenceSeries(initialSeries);
    addToast({ message: 'Reset to standard demo ledger.', type: 'info' });
  };

  // Calculate summary counts across active tasks
  const summaryCounts = useMemo(() => {
    let open = 0;
    let overdue = 0;
    let dueSoon = 0;
    let active = 0;
    let needsCeo = 0;

    const windowDays =
      dueSoonUnit === 'weeks' ? dueSoonWindow * 7 : dueSoonUnit === 'months' ? dueSoonWindow * 30 : dueSoonWindow;

    for (const item of workItems) {
      if (item.isArchived) continue;
      const status = statusMap.get(item.statusId);
      if (!status) continue;

      const isClosed = status.stateGroup === 'done' || status.stateGroup === 'cancelled';
      if (!isClosed) {
        open++;
        if (status.stateGroup === 'active') active++;

        const dl = getDeadlineInfo(item.dueDate, status, todayStr, windowDays);
        if (dl.flag === 'overdue') overdue++;
        else if (dl.flag === 'due_today' || dl.flag === 'due_soon') dueSoon++;

        if (item.needsCeoAttention) {
          const ceoStat = ceoStatusMap.get(item.ceoAttentionStatusId ?? '');
          if (!ceoStat?.isFinal) needsCeo++;
        }
      }
    }

    return { open, overdue, dueSoon, active, needsCeo };
  }, [workItems, statusMap, ceoStatusMap, todayStr, dueSoonWindow, dueSoonUnit]);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        users,
        canEdit,
        isAdmin,
        isEA,
        isCeoViewer,
        isViewer,
        addUser,
        updateUser,
        toggleUserStatus,
        deleteUser,
        switchUser,
        isAuthenticated,
        login,
        logout,
        isAppLocked,
        lockApp,
        unlockApp,
        hasPinConfigured,
        setupPin,
        changePin,
        resetPin,
        autoLockMinutes,
        setAutoLockMinutes,
        lockOnTabBlur,
        setLockOnTabBlur,
        changeUserPassword,
        activeNav,
        setActiveNav,
        density,
        setDensity,
        theme,
        setTheme,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        todayStr,
        dueSoonWindow,
        setDueSoonWindow,
        dueSoonUnit,
        setDueSoonUnit,
        departments,
        subDomains,
        teamMembers,
        categories,
        priorities,
        statuses,
        ceoAttentionStatuses,
        followupStatuses,
        meetingTypes,
        workItems,
        followups,
        meetings,
        itemLinks,
        activityLogs,
        settings,
        recurrenceSeries,
        departmentMap,
        categoryMap,
        priorityMap,
        statusMap,
        teamMemberMap,
        ceoStatusMap,
        createWorkItem,
        updateWorkItem,
        deleteWorkItem,
        inlineUpdateWorkItem,
        archiveWorkItem,
        restoreWorkItem,
        toggleCeoAttention,
        setManualWeight,
        resetWeightToAuto,
        createFollowup,
        updateFollowup,
        deleteFollowup,
        logFollowupOutcome,
        postponeFollowup,
        cancelFollowup,
        createMeeting,
        updateMeeting,
        deleteMeeting,
        createMeetingDeliverable,
        addLink,
        removeLink,
        addListOption,
        updateListOption,
        deactivateListOption,
        mergeListOption,
        deleteListOption,
        updateSettings,
        toasts,
        addToast,
        removeToast,
        cascadeWarning,
        setCascadeWarning,
        selectedItemId,
        setSelectedItemId,
        selectedMeetingId,
        setSelectedMeetingId,
        isNewItemOpen,
        setIsNewItemOpen,
        newItemDefaultType,
        setNewItemDefaultType,
        newItemDefaultParentId,
        setNewItemDefaultParentId,
        newItemMode,
        setNewItemMode,
        openCreateModal,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        isChangePasswordRequired,
        setIsChangePasswordRequired,
        isUpdateModalOpen,
        setIsUpdateModalOpen,
        updateInfo,
        isCheckingUpdates,
        checkUpdates,
        exportDatabaseBackup,
        restoreDatabaseBackup,
        summaryCounts,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
