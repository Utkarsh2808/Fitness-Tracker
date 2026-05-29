/**
 * Core domain types for the Progress Tracker application
 * These types represent the fundamental entities in the system
 */

/**
 * Task types supported by the application
 */
export enum TaskType {
  BINARY = 'binary',
  COUNTER = 'counter',
  HEALTH_SYNC = 'health_sync',
}

/**
 * Health metrics that can be synced from Android Health Connect
 */
export enum HealthMetricType {
  STEPS = 'steps',
  WALKING_DISTANCE = 'walking_distance',
  RUNNING_DISTANCE = 'running_distance',
  CALORIES_BURNED = 'calories_burned',
}

/**
 * Project - A collection of related tasks
 * Examples: Fitness, Learning, Work, Reading, Personal Development
 */
export interface Project {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Task - A trackable goal or activity within a project
 */
export interface Task {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  taskType: TaskType;
  targetValue: number; // For binary tasks: 1, For counter tasks: the target number
  unit?: string; // e.g., "pushups", "pages", "km", "steps"
  weight: number; // Used in scoring calculation (default: 1)
  icon?: string;
  color?: string;

  // Counter task specific
  allowMultipleUpdates?: boolean; // Default: true for counter tasks

  // Health sync specific
  healthSyncEnabled?: boolean;
  healthMetricType?: HealthMetricType;
  syncFrequencyMinutes?: number; // How often to sync (default: 60)

  // Streak tracking
  trackStreak?: boolean; // Default: true

  // Notification settings
  enableNotifications?: boolean;
  notificationTime?: string; // HH:mm format

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Progress Log - A record of progress towards a task
 * Each update creates a new log entry (never overwrite)
 */
export interface ProgressLog {
  id: string;
  taskId: string;
  timestamp: Date;
  incrementValue: number; // The amount added in this update
  note?: string;

  // Health sync specific
  source?: 'manual' | 'health_connect';
  externalId?: string; // ID from external source (e.g., Health Connect)
}

/**
 * Daily Entry - Aggregated progress for a task on a specific day
 */
export interface DailyEntry {
  id: string;
  taskId: string;
  date: Date; // Normalized to start of day
  achievedValue: number; // Total progress for this day
  completionPercentage: number; // 0-100
  isCompleted: boolean; // Reached 100%?
  streakActive: boolean; // Is streak continuing?
}

/**
 * Streak - Track consecutive days of task completion
 */
export interface Streak {
  id: string;
  taskId: string;
  currentStreak: number; // Days in current streak
  longestStreak: number; // Best ever streak
  lastCompletedDate: Date | null;
  startDate: Date;
  updatedAt: Date;
}

/**
 * Daily Score - Overall performance score for a day
 */
export interface DailyScore {
  id: string;
  date: Date;
  score: number; // 0-100
  maxScore: number;
  completedTasks: number;
  totalTasks: number;
  projectScores: Record<string, number>; // Score per project
}

/**
 * Analytics Data - Historical performance data
 */
export interface AnalyticsData {
  date: Date;
  score: number;
  completedTasks: number;
  totalTasks: number;
  completionRate: number;
}

/**
 * Streak Summary - Current and historical streak info
 */
export interface StreakSummary {
  taskId: string;
  taskName: string;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: Date | null;
}

/**
 * Weekly Review - Automated weekly insights
 */
export interface WeeklyReview {
  id: string;
  weekStartDate: Date;
  weekEndDate: Date;
  averageScore: number;
  bestDay: {
    date: Date;
    score: number;
  };
  worstDay: {
    date: Date;
    score: number;
  };
  mostConsistentTask: {
    taskId: string;
    taskName: string;
    completionRate: number;
  } | null;
  mostMissedTask: {
    taskId: string;
    taskName: string;
    completionRate: number;
  } | null;
  totalCompletions: number;
  totalMisses: number;
  trends: {
    taskId: string;
    taskName: string;
    trend: 'improving' | 'declining' | 'stable';
    completionRateChange: number;
  }[];
}

/**
 * User Preferences - App-level settings
 */
export interface UserPreferences {
  id: string;
  darkMode: boolean;
  notificationsEnabled: boolean;
  morningReminderTime?: string; // HH:mm
  afternoonReminderTime?: string; // HH:mm
  eveningReminderTime?: string; // HH:mm
  healthConnectAuthorized: boolean;
  timezone: string;
  weekStartDay: 'monday' | 'sunday'; // 0 = Sunday, 1 = Monday
}

/**
 * Health Connect Sync Status
 */
export interface HealthConnectSyncStatus {
  taskId: string;
  lastSyncTime: Date;
  isAuthorized: boolean;
  errorMessage?: string;
}
