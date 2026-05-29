/**
 * Progress Store - Zustand store for progress tracking
 */

import { create } from 'zustand';
import { ProgressLog, DailyEntry } from '@/types';
import { progressLogRepository } from '@/services/progressLogRepository';
import { dailyEntryRepository } from '@/services/dailyEntryRepository';
import { scoringEngine } from '@/services/scoringEngine';

interface ProgressState {
  progressLogs: ProgressLog[];
  dailyEntries: Record<string, DailyEntry>; // taskId_date -> DailyEntry
  currentDayScore: number;
  loading: boolean;
  error: string | null;

  // Actions
  addProgressLog: (taskId: string, incrementValue: number, note?: string) => Promise<ProgressLog>;
  fetchProgressLogs: (taskId: string) => Promise<void>;
  getTotalProgressForTask: (taskId: string, date: Date) => Promise<number>;
  updateDailyEntry: (taskId: string, date: Date) => Promise<void>;
  calculateCurrentDayScore: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  progressLogs: [],
  dailyEntries: {},
  currentDayScore: 0,
  loading: false,
  error: null,

  addProgressLog: async (taskId, incrementValue, note) => {
    try {
      const log = await progressLogRepository.addProgressLog(taskId, {
        incrementValue,
        note,
        source: 'manual',
      });

      set((state) => ({
        progressLogs: [...state.progressLogs, log],
      }));

      // Update daily entry
      await get().updateDailyEntry(taskId, new Date());

      // Recalculate daily score
      await get().calculateCurrentDayScore();

      return log;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add progress';
      set({ error: errorMessage });
      throw error;
    }
  },

  fetchProgressLogs: async (taskId) => {
    set({ loading: true, error: null });
    try {
      const logs = await progressLogRepository.getProgressLogsByTaskId(taskId);
      set({
        progressLogs: logs,
        loading: false,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch progress logs';
      set({ error: errorMessage, loading: false });
    }
  },

  getTotalProgressForTask: async (taskId, date) => {
    try {
      return await progressLogRepository.getTotalProgressByTaskIdAndDate(taskId, date);
    } catch (error) {
      console.error('Error getting total progress:', error);
      return 0;
    }
  },

  updateDailyEntry: async (taskId, date) => {
    try {
      const totalProgress = await progressLogRepository.getTotalProgressByTaskIdAndDate(
        taskId,
        date
      );

      // Get target value from task (we'll need to pass this or fetch it)
      // For now, this is a simplified version
      const entry = await dailyEntryRepository.upsertDailyEntry({
        taskId,
        date,
        achievedValue: totalProgress,
        completionPercentage: 0, // Will be calculated based on target
        isCompleted: false,
        streakActive: false,
      });

      const key = `${taskId}_${date.toDateString()}`;
      set((state) => ({
        dailyEntries: {
          ...state.dailyEntries,
          [key]: entry,
        },
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to update daily entry';
      set({ error: errorMessage });
    }
  },

  calculateCurrentDayScore: async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const scoreData = await scoringEngine.calculateDailyScore(today);
      set({ currentDayScore: scoreData.score });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to calculate score';
      set({ error: errorMessage });
    }
  },

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));

interface SettingsState {
  darkMode: boolean;
  notificationsEnabled: boolean;
  morningReminderTime: string;
  afternoonReminderTime: string;
  eveningReminderTime: string;
  timezone: string;
  weekStartDay: 'monday' | 'sunday';

  // Actions
  toggleDarkMode: () => void;
  toggleNotifications: () => void;
  setMorningReminderTime: (time: string) => void;
  setAfternoonReminderTime: (time: string) => void;
  setEveningReminderTime: (time: string) => void;
  setTimezone: (timezone: string) => void;
  setWeekStartDay: (day: 'monday' | 'sunday') => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  darkMode: true,
  notificationsEnabled: true,
  morningReminderTime: '06:00',
  afternoonReminderTime: '12:00',
  eveningReminderTime: '20:00',
  timezone: 'UTC',
  weekStartDay: 'monday',

  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
  toggleNotifications: () => set((state) => ({ notificationsEnabled: !state.notificationsEnabled })),
  setMorningReminderTime: (time) => set({ morningReminderTime: time }),
  setAfternoonReminderTime: (time) => set({ afternoonReminderTime: time }),
  setEveningReminderTime: (time) => set({ eveningReminderTime: time }),
  setTimezone: (timezone) => set({ timezone }),
  setWeekStartDay: (day) => set({ weekStartDay: day }),
}));
