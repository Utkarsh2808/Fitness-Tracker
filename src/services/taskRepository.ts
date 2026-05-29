/**
 * Task Repository - Data access layer for tasks
 * Uses MongoDB via backend API
 */

import { v4 as uuidv4 } from 'uuid';
import { Task, TaskType, HealthMetricType } from '@/types';
import { tasksApi } from './mongoApi';

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

    const taskData = {
      id,
      projectId,
      name: data.name,
      description: data.description || null,
      taskType: data.taskType,
      targetValue: data.targetValue,
      unit: data.unit || null,
      weight: data.weight || 1,
      icon: data.icon || null,
      color: data.color || null,
      allowMultipleUpdates: data.allowMultipleUpdates ?? true,
      healthSyncEnabled: data.healthSyncEnabled,
      healthMetricType: data.healthMetricType || null,
      trackStreak: data.trackStreak ?? true,
      enableNotifications: data.enableNotifications ?? true,
      notificationTime: data.notificationTime || null,
      createdAt: now,
      updatedAt: now,
    };

    const result = await tasksApi.create(taskData);

    return {
      id: result.id || id,
      projectId: result.projectId,
      name: result.name,
      description: result.description,
      taskType: result.taskType,
      targetValue: result.targetValue,
      unit: result.unit,
      weight: result.weight,
      icon: result.icon,
      color: result.color,
      allowMultipleUpdates: result.allowMultipleUpdates,
      healthSyncEnabled: result.healthSyncEnabled,
      healthMetricType: result.healthMetricType,
      trackStreak: result.trackStreak,
      enableNotifications: result.enableNotifications,
      notificationTime: result.notificationTime,
      createdAt: new Date(result.createdAt || now),
      updatedAt: new Date(result.updatedAt || now),
    };
  },

  /**
   * Get all tasks for a project
   */
  async getTasksByProjectId(projectId: string): Promise<Task[]> {
    const rows = await tasksApi.getAll(projectId);
    return rows.map((row) => this.mapRowToTask(row));
  },

  /**
   * Get task by ID
   */
  async getTaskById(id: string): Promise<Task | null> {
    try {
      const tasks = await tasksApi.getAll();
      const row = tasks.find(t => t.id === id);
      if (!row) return null;
      return this.mapRowToTask(row);
    } catch (error) {
      console.error('Error fetching task:', error);
      return null;
    }
  },

  /**
   * Get all tasks
   */
  async getAllTasks(): Promise<Task[]> {
    const rows = await tasksApi.getAll();
    return rows.map((row) => this.mapRowToTask(row));
  },

  /**
   * Update task
   */
  async updateTask(id: string, data: Partial<Task>): Promise<Task | null> {
    const updates: any = {};

    if (data.name !== undefined) updates.name = data.name;
    if (data.description !== undefined) updates.description = data.description;
    if (data.targetValue !== undefined) updates.targetValue = data.targetValue;
    if (data.weight !== undefined) updates.weight = data.weight;
    if (data.unit !== undefined) updates.unit = data.unit;
    if (data.icon !== undefined) updates.icon = data.icon;
    if (data.color !== undefined) updates.color = data.color;
    if (data.enableNotifications !== undefined) updates.enableNotifications = data.enableNotifications;
    if (data.notificationTime !== undefined) updates.notificationTime = data.notificationTime;

    updates.updatedAt = Date.now();

    try {
      const result = await tasksApi.update(id, updates);
      return this.mapRowToTask(result);
    } catch (error) {
      console.error('Error updating task:', error);
      return null;
    }
  },

  /**
   * Delete task
   */
  async deleteTask(id: string): Promise<void> {
    await tasksApi.delete(id);
  },

  /**
   * Get health sync enabled tasks
   */
  async getHealthSyncTasks(): Promise<Task[]> {
    const tasks = await tasksApi.getAll();
    return tasks.filter(t => t.healthSyncEnabled).map((row) => this.mapRowToTask(row));
  },

  /**
   * Get tasks with notifications enabled
   */
  async getTasksWithNotifications(): Promise<Task[]> {
    const tasks = await tasksApi.getAll();
    return tasks.filter(t => t.enableNotifications).map((row) => this.mapRowToTask(row));
  },

  /**
   * Helper: Map database row to Task object
   */
  mapRowToTask(row: any): Task {
    return {
      id: row.id,
      projectId: row.projectId,
      name: row.name,
      description: row.description,
      taskType: row.taskType as TaskType,
      targetValue: row.targetValue,
      unit: row.unit,
      weight: row.weight || 1,
      icon: row.icon,
      color: row.color,
      allowMultipleUpdates: row.allowMultipleUpdates,
      healthSyncEnabled: row.healthSyncEnabled,
      healthMetricType: row.healthMetricType as HealthMetricType | undefined,
      trackStreak: row.trackStreak,
      enableNotifications: row.enableNotifications,
      notificationTime: row.notificationTime,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  },
};

export default taskRepository;
