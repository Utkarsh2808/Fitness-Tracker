/**
 * Project Repository - Data access layer for projects
 */

import { v4 as uuidv4 } from 'uuid';
import { Project } from '@/types';
import { executeQuery, executeQueryFirst, executeMutation, executeTransaction } from '@/lib/database';

export const projectRepository = {
  /**
   * Create a new project
   */
  async createProject(data: {
    name: string;
    description?: string;
    color?: string;
    icon?: string;
  }): Promise<Project> {
    const id = uuidv4();
    const now = Date.now();

    await executeMutation(
      `INSERT INTO projects (id, name, description, color, icon, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, data.name, data.description || null, data.color || null, data.icon || null, now, now]
    );

    return {
      id,
      name: data.name,
      description: data.description,
      color: data.color,
      icon: data.icon,
      createdAt: new Date(now),
      updatedAt: new Date(now),
    };
  },

  /**
   * Get all projects
   */
  async getProjects(): Promise<Project[]> {
    const rows = await executeQuery<any>(
      `SELECT * FROM projects ORDER BY created_at DESC`
    );

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      color: row.color,
      icon: row.icon,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }));
  },

  /**
   * Get project by ID
   */
  async getProjectById(id: string): Promise<Project | null> {
    const row = await executeQueryFirst<any>(
      `SELECT * FROM projects WHERE id = ?`,
      [id]
    );

    if (!row) return null;

    return {
      id: row.id,
      name: row.name,
      description: row.description,
      color: row.color,
      icon: row.icon,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  },

  /**
   * Update project
   */
  async updateProject(id: string, data: Partial<Project>): Promise<Project | null> {
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
    if (data.color !== undefined) {
      updates.push('color = ?');
      values.push(data.color);
    }
    if (data.icon !== undefined) {
      updates.push('icon = ?');
      values.push(data.icon);
    }

    if (updates.length === 0) {
      return this.getProjectById(id);
    }

    updates.push('updated_at = ?');
    values.push(Date.now());
    values.push(id);

    await executeMutation(
      `UPDATE projects SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    return this.getProjectById(id);
  },

  /**
   * Delete project and all its tasks
   */
  async deleteProject(id: string): Promise<void> {
    await executeTransaction([
      {
        query: `DELETE FROM progress_logs WHERE task_id IN (
          SELECT id FROM tasks WHERE project_id = ?
        )`,
        params: [id],
      },
      {
        query: `DELETE FROM daily_entries WHERE task_id IN (
          SELECT id FROM tasks WHERE project_id = ?
        )`,
        params: [id],
      },
      {
        query: `DELETE FROM streaks WHERE task_id IN (
          SELECT id FROM tasks WHERE project_id = ?
        )`,
        params: [id],
      },
      {
        query: `DELETE FROM tasks WHERE project_id = ?`,
        params: [id],
      },
      {
        query: `DELETE FROM projects WHERE id = ?`,
        params: [id],
      },
    ]);
  },

  /**
   * Get projects count
   */
  async getProjectCount(): Promise<number> {
    const result = await executeQueryFirst<{ count: number }>(
      `SELECT COUNT(*) as count FROM projects`
    );
    return result?.count || 0;
  },
};

export default projectRepository;
