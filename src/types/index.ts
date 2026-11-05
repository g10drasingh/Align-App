/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'ea' | 'admin' | 'ceo_viewer' | 'viewer';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  departmentId?: string;
  isActive: boolean;
  avatar?: string;
  createdAt?: string;
  password?: string;
  passwordHash?: string;
  salt?: string;
  mustChangePassword?: boolean;
}

export interface SecuritySettings {
  autoLockMinutes: number; // 0 for Never, 1, 5, 15, 30
  lockOnTabBlur: boolean;
  hasPin: boolean;
}

export interface Department {
  id: string;
  name: string;
  color: string;
  sortOrder: number;
  isActive: boolean;
}

export interface SubDomain {
  id: string;
  departmentId: string;
  name: string;
  color?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  departmentIds: string[];
  subDomainIds: string[];
  isActive: boolean;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  sortOrder: number;
  isActive: boolean;
}

export interface Priority {
  id: string;
  name: string;
  rank: number; // 1 to 4+
  weightCap: number; // 25, 50, 75, 100
  color?: string;
  isActive: boolean;
}

export type StateGroup = 'not_started' | 'active' | 'blocked' | 'done' | 'cancelled';
export type ProgressRule = 'fixed' | 'keep_last' | 'exclude';

export interface Status {
  id: string;
  name: string;
  stateGroup: StateGroup;
  progressRule: ProgressRule;
  progressValue: number | null; // e.g., 0, 50, 80, 100
  color?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface CeoAttentionStatus {
  id: string;
  name: string;
  isFinal: boolean; // true for "Completed"
  color?: string;
  sortOrder: number;
  isActive: boolean;
}

export type FollowupStateGroup = 'scheduled' | 'done' | 'missed' | 'postponed' | 'cancelled';

export interface FollowupStatus {
  id: string;
  name: string;
  stateGroup: FollowupStateGroup;
  color?: string;
  isActive: boolean;
}

export interface MeetingType {
  id: string;
  name: string;
  color?: string;
  sortOrder: number;
  isActive: boolean;
}

export type ItemType = 'project' | 'task';
export type WeightMode = 'auto' | 'manual';
export type TaskKind = 'one_time' | 'recurring';
export type RecurrenceRuleType = 'daily' | 'weekly' | 'monthly' | 'every_x_days';

export interface RecurrenceSeries {
  id: string;
  kind: 'task' | 'meeting';
  ruleType: RecurrenceRuleType;
  intervalDays?: number;
  weekdays?: number[]; // 1=Mon ... 7=Sun
  dayOfMonth?: number;
  skipNonWorking: boolean;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  lastScheduledDate?: string;
  isWaitingOnPrevious?: boolean;
}

export type DeadlineFlag = 'overdue' | 'due_today' | 'due_soon' | 'on_track' | 'completed' | 'cancelled' | 'no_due_date';

export interface WorkItem {
  id: string;
  itemType: ItemType;
  parentId: string | null;
  name: string;
  description?: string;
  statusId: string;
  blockedReason?: string;
  blockedSince?: string;
  priorityId: string;
  categoryId: string;
  departmentIds: string[];
  subDomainIds: string[];
  teamMemberIds: string[];
  startDate?: string;
  dueDate?: string;
  completedOn?: string;

  progressOverride?: number; // Manual override for leaf
  progressCached?: number | null; // Calculated or overridden %

  weightMode: WeightMode;
  weightManual?: number; // 0-100 when manual
  weightCached?: number; // Share of parent

  needsCeoAttention: boolean;
  ceoAttentionStatusId?: string;
  ceoNote?: string;
  ceoFlaggedBy?: string;
  ceoFlaggedAt?: string;

  taskKind: TaskKind;
  seriesId?: string;
  occurrenceNo?: number;

  isArchived: boolean;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
}

export interface Followup {
  id: string;
  workItemId: string;
  followupDate: string; // YYYY-MM-DD
  statusId: string;
  remarks?: string; // Rich text
  postponedFromId?: string;
  outcomeLoggedAt?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Meeting {
  id: string;
  title: string;
  meetingTypeId: string;
  scheduledAt: string; // ISO date-time
  status: 'scheduled' | 'held' | 'cancelled';
  agenda?: string;
  notes?: string;
  attendeeIds: string[]; // TeamMember IDs
  seriesId?: string;
  occurrenceNo?: number;
  isArchived: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ItemLink {
  id: string;
  sourceType: 'work_item' | 'meeting';
  sourceId: string;
  targetType: 'work_item' | 'meeting';
  targetId: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  fieldName?: string;
  oldValue?: any;
  newValue?: any;
  reason?: string;
  isAutomatic: boolean;
  actorName: string; // "EA", "Admin", or "System"
  createdAt: string;
}

export interface SystemSettings {
  workingDays: number[]; // e.g. [1, 2, 3, 4, 5] (1=Mon ... 7=Sun)
  dueSoonDays: number; // default 7
  maxNestingDepth: number; // default 5
  timezone: string; // default "Asia/Kathmandu"
  defaultPriorityId: string;
}

export type ViewScope = 'all' | 'project' | 'task';
export type TimeFilter = 'all' | 'open' | 'overdue' | 'due_soon' | 'active' | 'ceo';
export type DensityMode = 'comfortable' | 'compact';
export type ThemeMode = 'light' | 'dark' | 'system';
