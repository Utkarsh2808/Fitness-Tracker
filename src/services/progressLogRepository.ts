/**
 * Progress Log Repository - Immutable append-only log for progress tracking
 */

import { v4 as uuidv4 } from 'uuid';
import { ProgressLog } from '@/types';
import { executeQuery, executeQueryFirst, executeMutation } from '@/lib/database';

export const progressLogRepository = {
  /**
   * Add a progress log entry (immutable)
   */
  async addProgressLog(taskId: string, data: {
    incrementValue: number;
    note?: string;
    source?: 'manual' | 'health_connect';
    externalId?: string;
  }): Promise<ProgressLog> {
    const id = uuidv4();
    const timestamp = Date.now();

    await executeMutation(
      `INSERT INTO progress_logs (id, task_id, timestamp, increment_value, note, source, external_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        taskId,
        timestamp,
        data.incrementValue,
        data.note || null,
        data.source || 'manual',
        data.externalId || null,
      ]
    );

    return {
      id,
      taskId,
      timestamp: new Date(timestamp),
      incrementValue: data.incrementValue,
      note: data.note,
      source: data.source,
      externalId: data.externalId,
    };
  },

  /**
   * Get all progress logs for a task
   */
  async getProgressLogsByTaskId(taskId: string): Promise<ProgressLog[]> {
    const rows = await executeQuery<any>(
      `SELECT * FROM progress_logs WHERE task_id = ? ORDER BY timestamp ASC`,
      [taskId]
    );

    return rows.map((row) => ({
      id: row.id,
      taskId: row.task_id,
      timestamp: new Date(row.timestamp),
      incrementValue: row.increment_value,
      note: row.note,
      source: row.source,
      externalId: row.external_id,
    }));
  },

  /**
   * Get progress logs for a task on a specific date
   */
  async getProgressLogsByTaskIdAndDate(taskId: string, date: Date): Promise<ProgressLog[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const rows = await executeQuery<any>(
      `SELECT * FROM progress_logs 
       WHERE task_id = ? AND timestamp >= ? AND timestamp <= ?
       ORDER BY timestamp ASC`,
      [taskId, startOfDay.getTime(), endOfDay.getTime()]
    );

    return rows.map((row) => ({
      id: row.id,
      taskId: row.task_id,
      timestamp: new Date(row.timestamp),
      incrementValue: row.increment_value,
      note: row.note,
      source: row.source,
      externalId: row.external_id,
    }));
  },

  /**
   * Get progress logs within a date range
   */
  async getProgressLogsByTaskIdAndDateRange(
    taskId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ProgressLog[]> {
    const rows = await executeQuery<any>(
      `SELECT * FROM progress_logs 
       WHERE task_id = ? AND timestamp >= ? AND timestamp <= ?
       ORDER BY timestamp ASC`,
      [taskId, startDate.getTime(), endDate.getTime()]
    );

    return rows.map((row) => ({
      id: row.id,
      taskId: row.task_id,
      timestamp: new Date(row.timestamp),
      incrementValue: row.increment_value,
      note: row.note,
      source: row.source,
      externalId: row.external_id,
    }));
  },

  /**
   * Get total progress for a task on a specific date
   */
  async getTotalProgressByTaskIdAndDate(taskId: string, date: Date): Promise<number> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const result = await executeQueryFirst<{ total: number }>(
      `SELECT SUM(increment_value) as total FROM progress_logs 
       WHERE task_id = ? AND timestamp >= ? AND timestamp <= ?`,
      [taskId, startOfDay.getTime(), endOfDay.getTime()]
    );

    return result?.total || 0;
  },

  /**
   * Get total progress for a task within a date range
   */
  async getTotalProgressByTaskIdAndDateRange(
    taskId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    const result = await executeQueryFirst<{ total: number }>(
      `SELECT SUM(increment_value) as total FROM progress_logs 
       WHERE task_id = ? AND timestamp >= ? AND timestamp <= ?`,
      [taskId, startDate.getTime(), endDate.getTime()]
    );

    return result?.total || 0;
  },

  /**
   * Get latest progress log for a task
   */
  async getLatestProgressLog(taskId: string): Promise<ProgressLog | null> {
    const row = await executeQueryFirst<any>(
      `SELECT * FROM progress_logs WHERE task_id = ? ORDER BY timestamp DESC LIMIT 1`,
      [taskId]
    );

    if (!row) return null;

    return {
      id: row.id,
      taskId: row.task_id,
      timestamp: new Date(row.timestamp),
      incrementValue: row.increment_value,
      note: row.note,
      source: row.source,
      externalId: row.external_id,
    };
  },

  /**
   * Delete all progress logs for a task (use with caution)
   */
  async deleteProgressLogsByTaskId(taskId: string): Promise<void> {
    await executeMutation(
      `DELETE FROM progress_logs WHERE task_id = ?`,
      [taskId]
    );
  },

  /**
   * Get count of progress logs
   */
  async getProgressLogCount(taskId?: string): Promise<number> {
    let query = `SELECT COUNT(*) as count FROM progress_logs`;
    const params: any[] = [];

    if (taskId) {
      query += ` WHERE task_id = ?`;
      params.push(taskId);
    }

    const result = await executeQueryFirst<{ count: number }>(query, params);
    return result?.count || 0;
  },
};

export default progressLogRepository;
