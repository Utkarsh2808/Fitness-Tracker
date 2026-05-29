/**
 * Project Store - Zustand store for project management
 */

import { create } from 'zustand';
import { Project, Task } from '@/types';
import { projectRepository } from '@/services/projectRepository';
import { taskRepository } from '@/services/taskRepository';
import { syncProjectCreated, syncProjectUpdated, syncProjectDeleted, syncTaskCreated, syncTaskUpdated, syncTaskDeleted } from '@/services/syncService';

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  loading: boolean;
  error: string | null;

  // Actions
  fetchProjects: () => Promise<void>;
  setCurrentProject: (project: Project | null) => void;
  createProject: (data: {
    name: string;
    description?: string;
    color?: string;
    icon?: string;
  }) => Promise<Project>;
  updateProject: (id: string, data: Partial<Project>) => Promise<Project | null>;
  deleteProject: (id: string) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: null,
  loading: false,
  error: null,

  fetchProjects: async () => {
    set({ loading: true, error: null });
    try {
      const projects = await projectRepository.getProjects();
      set({ projects, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch projects';
      set({ error: errorMessage, loading: false });
    }
  },

  setCurrentProject: (project) => {
    set({ currentProject: project });
  },

  createProject: async (data) => {
    try {
      const project = await projectRepository.createProject(data);
      set((state) => ({
        projects: [...state.projects, project],
      }));
      syncProjectCreated(project);
      return project;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create project';
      set({ error: errorMessage });
      throw error;
    }
  },

  updateProject: async (id, data) => {
    try {
      const project = await projectRepository.updateProject(id, data);
      if (project) {
        set((state) => ({
          projects: state.projects.map((p) => (p.id === id ? project : p)),
          currentProject: state.currentProject?.id === id ? project : state.currentProject,
        }));
        syncProjectUpdated(id, data);
      }
      return project;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update project';
      set({ error: errorMessage });
      throw error;
    }
  },

  deleteProject: async (id) => {
    try {
      await projectRepository.deleteProject(id);
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
        currentProject: state.currentProject?.id === id ? null : state.currentProject,
      }));
      syncProjectDeleted(id);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete project';
      set({ error: errorMessage });
      throw error;
    }
  },

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));

interface TaskState {
  tasks: Task[];
  tasksByProjectId: Record<string, Task[]>;
  currentTask: Task | null;
  loading: boolean;
  error: string | null;

  // Actions
  fetchTasksByProjectId: (projectId: string) => Promise<void>;
  fetchAllTasks: () => Promise<void>;
  setCurrentTask: (task: Task | null) => void;
  createTask: (projectId: string, data: any) => Promise<Task>;
  updateTask: (id: string, data: Partial<Task>) => Promise<Task | null>;
  deleteTask: (id: string) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  tasksByProjectId: {},
  currentTask: null,
  loading: false,
  error: null,

  fetchTasksByProjectId: async (projectId) => {
    set({ loading: true, error: null });
    try {
      const tasks = await taskRepository.getTasksByProjectId(projectId);
      set((state) => ({
        tasksByProjectId: {
          ...state.tasksByProjectId,
          [projectId]: tasks,
        },
        loading: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch tasks';
      set({ error: errorMessage, loading: false });
    }
  },

  fetchAllTasks: async () => {
    set({ loading: true, error: null });
    try {
      const tasks = await taskRepository.getAllTasks();
      set({ tasks, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch tasks';
      set({ error: errorMessage, loading: false });
    }
  },

  setCurrentTask: (task) => {
    set({ currentTask: task });
  },

  createTask: async (projectId, data) => {
    try {
      const task = await taskRepository.createTask(projectId, data);
      set((state) => ({
        tasks: [...state.tasks, task],
        tasksByProjectId: {
          ...state.tasksByProjectId,
          [projectId]: [...(state.tasksByProjectId[projectId] || []), task],
        },
      }));
      syncTaskCreated(task);
      return task;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create task';
      set({ error: errorMessage });
      throw error;
    }
  },

  updateTask: async (id, data) => {
    try {
      const task = await taskRepository.updateTask(id, data);
      if (task) {
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? task : t)),
          currentTask: state.currentTask?.id === id ? task : state.currentTask,
        }));
        syncTaskUpdated(id, data);
      }
      return task;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update task';
      set({ error: errorMessage });
      throw error;
    }
  },

  deleteTask: async (id) => {
    try {
      const task = await taskRepository.getTaskById(id);
      await taskRepository.deleteTask(id);
      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id),
        currentTask: state.currentTask?.id === id ? null : state.currentTask,
        tasksByProjectId: task
          ? {
              ...state.tasksByProjectId,
              [task.projectId]: state.tasksByProjectId[task.projectId]?.filter(
                (t) => t.id !== id
              ),
            }
          : state.tasksByProjectId,
      }));
      syncTaskDeleted(id);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete task';
      set({ error: errorMessage });
      throw error;
    }
  },

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));
