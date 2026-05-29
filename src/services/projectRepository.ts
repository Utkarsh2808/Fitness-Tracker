/**
 * Project Repository - Data access layer for projects
 * Uses MongoDB via backend API
 */

import { v4 as uuidv4 } from 'uuid';
import { Project } from '@/types';
import { projectsApi } from './mongoApi';

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

    const projectData = {
      id,
      name: data.name,
      description: data.description || null,
      color: data.color || null,
      icon: data.icon || null,
      createdAt: now,
      updatedAt: now,
    };

    const result = await projectsApi.create(projectData);
    
    return {
      id: result.id || id,
      name: result.name,
      description: result.description,
      color: result.color,
      icon: result.icon,
      createdAt: new Date(result.createdAt || now),
      updatedAt: new Date(result.updatedAt || now),
    };
  },

  /**
   * Get all projects
   */
  async getProjects(): Promise<Project[]> {
    const rows = await projectsApi.getAll();

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      color: row.color,
      icon: row.icon,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    }));
  },

  /**
   * Get project by ID
   */
  async getProjectById(id: string): Promise<Project | null> {
    try {
      const projects = await projectsApi.getAll();
      const row = projects.find(p => p.id === id);

      if (!row) return null;

      return {
        id: row.id,
        name: row.name,
        description: row.description,
        color: row.color,
        icon: row.icon,
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt),
      };
    } catch (error) {
      console.error('Error fetching project:', error);
      return null;
    }
  },

  /**
   * Update project
   */
  async updateProject(id: string, data: Partial<Project>): Promise<Project | null> {
    const updates: any = {};

    if (data.name !== undefined) updates.name = data.name;
    if (data.description !== undefined) updates.description = data.description;
    if (data.color !== undefined) updates.color = data.color;
    if (data.icon !== undefined) updates.icon = data.icon;

    updates.updatedAt = Date.now();
    updates.updatedAt = Date.now();

    try {
      const result = await projectsApi.update(id, updates);
      
      return {
        id: result.id,
        name: result.name,
        description: result.description,
        color: result.color,
        icon: result.icon,
        createdAt: new Date(result.createdAt),
        updatedAt: new Date(result.updatedAt),
      };
    } catch (error) {
      console.error('Error updating project:', error);
      return null;
    }
  },

  /**
   * Delete project and all its tasks
   */
  async deleteProject(id: string): Promise<void> {
    await projectsApi.delete(id);
  },

  /**
   * Get projects count
   */
  async getProjectCount(): Promise<number> {
    try {
      const projects = await projectsApi.getAll();
      return projects.length;
    } catch (error) {
      console.error('Error getting project count:', error);
      return 0;
    }
  },
};

export default projectRepository;
