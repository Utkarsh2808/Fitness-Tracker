/**
 * Utility functions for the application
 */

import { formatDistanceToNow, format, startOfDay, endOfDay, startOfWeek, endOfWeek } from 'date-fns';

/**
 * Format date for display
 */
export const formatDate = (date: Date | number, formatStr: string = 'MMM dd, yyyy'): string => {
  return format(new Date(date), formatStr);
};

/**
 * Format date relative to now (e.g., "2 hours ago")
 */
export const formatDateRelative = (date: Date | number): string => {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

/**
 * Format time as HH:mm
 */
export const formatTime = (date: Date | number): string => {
  return format(new Date(date), 'HH:mm');
};

/**
 * Get start of day (midnight)
 */
export const getStartOfDay = (date: Date = new Date()): Date => {
  return startOfDay(date);
};

/**
 * Get end of day (11:59:59 PM)
 */
export const getEndOfDay = (date: Date = new Date()): Date => {
  return endOfDay(date);
};

/**
 * Get start of week
 */
export const getStartOfWeek = (date: Date = new Date(), weekStartsOnMonday: boolean = true): Date => {
  return startOfWeek(date, { weekStartsOn: weekStartsOnMonday ? 1 : 0 });
};

/**
 * Get end of week
 */
export const getEndOfWeek = (date: Date = new Date(), weekStartsOnMonday: boolean = true): Date => {
  return endOfWeek(date, { weekStartsOn: weekStartsOnMonday ? 1 : 0 });
};

/**
 * Generate a UUID v4
 */
export const generateId = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Clamp a number between min and max
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

/**
 * Calculate percentage
 */
export const calculatePercentage = (achieved: number, target: number): number => {
  if (target === 0) return 0;
  return clamp((achieved / target) * 100, 0, 100);
};

/**
 * Format large numbers with abbreviations (1000 -> 1K)
 */
export const formatNumber = (num: number, decimals: number = 1): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(decimals) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(decimals) + 'K';
  }
  return num.toString();
};

/**
 * Debounce function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;

  return function (...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Sleep function
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Deep clone an object
 */
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Check if two dates are on the same day
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

/**
 * Get days between two dates
 */
export const getDaysBetween = (startDate: Date, endDate: Date): number => {
  const timeDiff = Math.abs(endDate.getTime() - startDate.getTime());
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
};
