/**
 * Application constants
 */

import { TaskType, HealthMetricType } from '@/types';

/**
 * Task type configurations
 */
export const TASK_TYPE_CONFIG = {
  [TaskType.BINARY]: {
    label: 'Binary Task',
    description: 'Complete or not complete (e.g., Read Book, Meditate)',
    icon: '✓',
    color: '#06B6D4',
  },
  [TaskType.COUNTER]: {
    label: 'Counter Task',
    description: 'Track numerical progress (e.g., Pushups, Pages Read)',
    icon: '#',
    color: '#10B981',
  },
  [TaskType.HEALTH_SYNC]: {
    label: 'Health Sync',
    description: 'Automatically sync from Health Connect (e.g., Steps)',
    icon: '❤️',
    color: '#EF4444',
  },
};

/**
 * Health metric configurations
 */
export const HEALTH_METRIC_CONFIG = {
  [HealthMetricType.STEPS]: {
    label: 'Steps',
    unit: 'steps',
    icon: '🚶',
    defaultTarget: 10000,
  },
  [HealthMetricType.WALKING_DISTANCE]: {
    label: 'Walking Distance',
    unit: 'km',
    icon: '🚶‍♂️',
    defaultTarget: 5,
  },
  [HealthMetricType.RUNNING_DISTANCE]: {
    label: 'Running Distance',
    unit: 'km',
    icon: '🏃',
    defaultTarget: 10,
  },
  [HealthMetricType.CALORIES_BURNED]: {
    label: 'Calories Burned',
    unit: 'kcal',
    icon: '🔥',
    defaultTarget: 500,
  },
};

/**
 * Predefined colors for projects/tasks
 */
export const COLORS = {
  primary: '#4F46E5',
  secondary: '#06B6D4',
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  purple: '#A855F7',
  pink: '#EC4899',
  indigo: '#6366F1',
  teal: '#14B8A6',
  cyan: '#06B6D4',
  lime: '#84CC16',
  amber: '#FBBF24',
};

/**
 * Project color options
 */
export const PROJECT_COLORS = [
  '#4F46E5', // Indigo
  '#06B6D4', // Cyan
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#A855F7', // Purple
  '#EC4899', // Pink
  '#6366F1', // Indigo
  '#14B8A6', // Teal
  '#84CC16', // Lime
];

/**
 * Predefined project icons
 */
export const PROJECT_ICONS = [
  '💪', // Fitness
  '📚', // Learning
  '💼', // Work
  '🎯', // Goals
  '❤️', // Health
  '🧘', // Wellness
  '🏃', // Sports
  '🎨', // Creative
  '📱', // Tech
  '🌱', // Growth
];

/**
 * Notification timing options (in HH:mm format)
 */
export const NOTIFICATION_TIMES = [
  '06:00',
  '07:00',
  '08:00',
  '09:00',
  '12:00',
  '13:00',
  '14:00',
  '18:00',
  '19:00',
  '20:00',
  '21:00',
  '22:00',
];

/**
 * Time zones
 */
export const TIMEZONES = [
  'UTC',
  'US/Eastern',
  'US/Central',
  'US/Mountain',
  'US/Pacific',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Hong_Kong',
  'Asia/Singapore',
  'Asia/Bangkok',
  'Asia/Kolkata',
  'Australia/Sydney',
];

/**
 * Performance score thresholds
 */
export const SCORE_THRESHOLDS = {
  excellent: 90,
  good: 75,
  fair: 50,
  poor: 25,
};

/**
 * Streak milestones
 */
export const STREAK_MILESTONES = [1, 3, 7, 14, 21, 30, 50, 100, 365];

/**
 * Default task weights
 */
export const DEFAULT_TASK_WEIGHT = 1;

/**
 * Default health sync frequency (minutes)
 */
export const DEFAULT_HEALTH_SYNC_FREQUENCY = 60;

/**
 * Analytics time ranges
 */
export const ANALYTICS_TIME_RANGES = {
  daily: 'Day',
  weekly: 'Week',
  monthly: 'Month',
  yearly: 'Year',
  all: 'All Time',
};

/**
 * Database schema version
 */
export const DB_VERSION = 1;

/**
 * App version
 */
export const APP_VERSION = '1.0.0';

/**
 * Storage keys for AsyncStorage/preferences
 */
export const STORAGE_KEYS = {
  PREFERENCES: 'pt_preferences',
  SYNC_STATUS: 'pt_sync_status',
  LAST_SYNC: 'pt_last_sync',
  THEME: 'pt_theme',
};
