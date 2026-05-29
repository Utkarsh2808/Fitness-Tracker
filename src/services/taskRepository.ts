/**
 * Task Repository - Data access layer for tasks
 */

import { v4 as uuidv4 } from 'uuid';
import { Task, TaskType, HealthMetricType } from '@/types';
import { executeQuery, executeQueryFirst, executeMutation } from '@/lib/database';

export const taskRepository = {
  /**
   * Create a new task
   */
  async createTask(projectId: string, data: {
    name: string;
    description?: string;
    taskType: TaskType;
    targetValue: number;
    unit?: string;
    weight?: number;
    icon?: string;
    color?: string;
    allowMultipleUpdates?: boolean;
    healthSyncEnabled?: boolean;
    healthMetricType?: HealthMetricType;
    trackStreak?: boolean;
    enableNotifications?: boolean;
    notificationTime?: string;
  }): Promise<Task> {
    const id = uuidv4();
    const now = Date.now();

    await executeMutation(
      `INSERT INTO tasks (
        id, project_id, name, description, task_type, target_value, unit,
        weight, icon, color, allow_multiple_updates, health_sync_enabled,
        health_metric_type, track_streak, enable_notifications, notification_time,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        projectId,
        data.name,
        data.description || null,
        data.taskType,
        data.targetValue,
        data.unit || null,
        data.weight || 1,
        data.icon || null,
        data.color || null,
        data.allowMultipleUpdates ? 1 : 0,
        data.healthSyncEnabled ? 1 : 0,
        data.healthMetricType || null,
        (data.trackStreak ?? true) ? 1 : 0,
        (data.enableNotifications ?? true) ? 1 : 0,
        data.notificationTime || null,
        now,
        now,
      ]
    );

    return {
      id,
      projectId,
      name: data.name,
      description: data.description,
      taskType: data.taskType,
      targetValue: data.targetValue,
      unit: data.unit,
      weight: data.weight || 1,
      icon: data.icon,
      color: data.color,
      allowMultipleUpdates: data.allowMultipleUpdates ?? true,
      healthSyncEnabled: data.healthSyncEnabled,
      healthMetricType: data.healthMetricType,
      trackStreak: data.trackStreak ?? true,
      enableNotifications: data.enableNotifications ?? true,
      notificationTime: data.notificationTime,
      createdAt: new Date(now),
      updatedAt: new Date(now),
    };
  },

  /**
   * Get all tasks for a project
   */
  async getTasksByProjectId(projectId: string): Promise<Task[]> {
    const rows = await executeQuery<any>(
      `SELECT * FROM tasks WHERE project_id = ? ORDER BY created_at ASC`,
      [projectId]
    );

    return rows.map((row) => this.mapRowToTask(row));
  },

  /**
   * Get task by ID
   */
  async getTaskById(id: string): Promise<Task | null> {
    const row = await executeQueryFirst<any>(
      `SELECT * FROM tasks WHERE id = ?`,
      [id]
    );

    if (!row) return null;
    return this.mapRowToTask(row);
  },

  /**
   * Get all tasks
   */
  async getAllTasks(): Promise<Task[]> {
    const rows = await executeQuery<any>(
      `SELECT * FROM tasks ORDER BY created_at DESC`
    );

    return rows.map((row) => this.mapRowToTask(row));
  },

  /**
   * Update task
   */
  async updateTask(id: string, data: Partial<Task>): Promise<Task | null> {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
    }
    if (data.description !== undefined) {
      updates.push('description = ?');
      values.push(data.description);
    }
    if (data.targetValue !== undefined) {
      updates.push('target_value = ?');
      values.push(data.targetValue);
    }
    if (data.weight !== undefined) {
      updates.push('weight = ?');
      values.push(data.weight);
    }
    if (data.unit !== undefined) {
      updates.push('unit = ?');
      values.push(data.unit);
    }
    if (data.icon !== undefined) {
      updates.push('icon = ?');
      values.push(data.icon);
    }
    if (data.color !== undefined) {
      updates.push('color = ?');
      values.push(data.color);
    }
    if (data.enableNotifications !== undefined) {
      updates.push('enable_notifications = ?');
      values.push(data.enableNotifications ? 1 : 0);
    }
    if (data.notificationTime !== undefined) {
      updates.push('notification_time = ?');
      values.push(data.notificationTime);
    }

    if (updates.length === 0) {
      return this.getTaskById(id);
    }

    updates.push('updated_at = ?');
    values.push(Date.now());
    values.push(id);

    await executeMutation(
      `UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    return this.getTaskById(id);
  },

  /**
   * Delete task
   */
  async deleteTask(id: string): Promise<void> {
    await executeMutation(
      `DELETE FROM tasks WHERE id = ?`,
      [id]
    );
  },

  /**
   * Get health sync enabled tasks
   */
  async getHealthSyncTasks(): Promise<Task[]> {
    const rows = await executeQuery<any>(
      `SELECT * FROM tasks WHERE health_sync_enabled = 1`
    );

    return rows.map((row) => this.mapRowToTask(row));
  },

  /**
   * Get tasks with notifications enabled
   */
  async getTasksWithNotifications(): Promise<Task[]> {
    const rows = await executeQuery<any>(
      `SELECT * FROM tasks WHERE enable_notifications = 1`
    );

    return rows.map((row) => this.mapRowToTask(row));
  },

  /**
   * Helper: Map database row to Task object
   */
  mapRowToTask(row: any): Task {
    return {
      id: row.id,
      projectId: row.project_id,
      name: row.name,
      description: row.description,
      taskType: row.task_type as TaskType,
      targetValue: row.target_value,
      unit: row.unit,
      weight: row.weight || 1,
      icon: row.icon,
      color: row.color,
      allowMultipleUpdates: row.allow_multiple_updates === 1,
      healthSyncEnabled: row.health_sync_enabled === 1,
      healthMetricType: row.health_metric_type as HealthMetricType | undefined,
      trackStreak: row.track_streak === 1,
      enableNotifications: row.enable_notifications === 1,
      notificationTime: row.notification_time,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  },
};

export default taskRepository;
