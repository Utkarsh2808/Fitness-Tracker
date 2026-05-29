/**
 * Daily Entry Repository - Aggregated daily progress data
 * Uses MongoDB via backend API
 */

import { v4 as uuidv4 } from 'uuid';
import { DailyEntry } from '@/types';
import { dailyEntriesApi } from './mongoApi';

export const dailyEntryRepository = {
  /**
   * Create or update a daily entry
   */
  async upsertDailyEntry(data: {
    taskId: string;
    date: Date;
    achievedValue: number;
    completionPercentage: number;
    isCompleted: boolean;
    streakActive: boolean;
  }): Promise<DailyEntry> {
    const id = uuidv4();
    const dateNormalized = new Date(data.date);
    dateNormalized.setHours(0, 0, 0, 0);

    // Check if entry exists
    const existing = await executeQueryFirst<any>(
      `SELECT id FROM daily_entries WHERE task_id = ? AND date = ?`,
      [data.taskId, dateNormalized.getTime()]
    );

    if (existing) {
      // Update existing entry
      await executeMutation(
        `UPDATE daily_entries 
         SET achieved_value = ?, completion_percentage = ?, is_completed = ?, streak_active = ?
         WHERE task_id = ? AND date = ?`,
        [
          data.achievedValue,
          data.completionPercentage,
          data.isCompleted ? 1 : 0,
          data.streakActive ? 1 : 0,
          data.taskId,
          dateNormalized.getTime(),
        ]
      );
    } else {
      // Create new entry
      await executeMutation(
        `INSERT INTO daily_entries (id, task_id, date, achieved_value, completion_percentage, is_completed, streak_active)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          data.taskId,
          dateNormalized.getTime(),
          data.achievedValue,
          data.completionPercentage,
          data.isCompleted ? 1 : 0,
          data.streakActive ? 1 : 0,
        ]
      );
    }

    return {
      id: existing?.id || id,
      taskId: data.taskId,
      date: dateNormalized,
      achievedValue: data.achievedValue,
      completionPercentage: data.completionPercentage,
      isCompleted: data.isCompleted,
      streakActive: data.streakActive,
    };
  },

  /**
   * Get daily entry for a task on a specific date
   */
  async getDailyEntry(taskId: string, date: Date): Promise<DailyEntry | null> {
    const dateNormalized = new Date(date);
    dateNormalized.setHours(0, 0, 0, 0);

    const row = await executeQueryFirst<any>(
      `SELECT * FROM daily_entries WHERE task_id = ? AND date = ?`,
      [taskId, dateNormalized.getTime()]
    );

    if (!row) return null;

    return this.mapRowToDailyEntry(row);
  },

  /**
   * Get daily entries for a task within a date range
   */
  async getDailyEntriesByTaskIdAndDateRange(
    taskId: string,
    startDate: Date,
    endDate: Date
  ): Promise<DailyEntry[]> {
    const rows = await executeQuery<any>(
      `SELECT * FROM daily_entries 
       WHERE task_id = ? AND date >= ? AND date <= ?
       ORDER BY date ASC`,
      [taskId, startDate.getTime(), endDate.getTime()]
    );

    return rows.map((row) => this.mapRowToDailyEntry(row));
  },

  /**
   * Get daily entries for all tasks on a specific date
   */
  async getDailyEntriesByDate(date: Date): Promise<DailyEntry[]> {
    const dateNormalized = new Date(date);
    dateNormalized.setHours(0, 0, 0, 0);

    const rows = await executeQuery<any>(
      `SELECT * FROM daily_entries WHERE date = ? ORDER BY task_id ASC`,
      [dateNormalized.getTime()]
    );

    return rows.map((row) => this.mapRowToDailyEntry(row));
  },

  /**
   * Get completed tasks count for a date
   */
  async getCompletedTasksCountByDate(date: Date): Promise<number> {
    const dateNormalized = new Date(date);
    dateNormalized.setHours(0, 0, 0, 0);

    const result = await executeQueryFirst<{ count: number }>(
      `SELECT COUNT(*) as count FROM daily_entries WHERE date = ? AND is_completed = 1`,
      [dateNormalized.getTime()]
    );

    return result?.count || 0;
  },

  /**
   * Get completion rate for a task within date range
   */
  async getCompletionRate(taskId: string, startDate: Date, endDate: Date): Promise<number> {
    const result = await executeQueryFirst<{ total: number; completed: number }>(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN is_completed = 1 THEN 1 ELSE 0 END) as completed
       FROM daily_entries 
       WHERE task_id = ? AND date >= ? AND date <= ?`,
      [taskId, startDate.getTime(), endDate.getTime()]
    );

    if (!result || result.total === 0) return 0;
    return (result.completed / result.total) * 100;
  },

  /**
   * Delete daily entries for a task
   */
  async deleteDailyEntriesByTaskId(taskId: string): Promise<void> {
    await executeMutation(
      `DELETE FROM daily_entries WHERE task_id = ?`,
      [taskId]
    );
  },

  /**
   * Helper: Map database row to DailyEntry object
   */
  mapRowToDailyEntry(row: any): DailyEntry {
    return {
      id: row.id,
      taskId: row.task_id,
      date: new Date(row.date),
      achievedValue: row.achieved_value,
      completionPercentage: row.completion_percentage,
      isCompleted: row.is_completed === 1,
      streakActive: row.streak_active === 1,
    };
  },
};

export default dailyEntryRepository;
