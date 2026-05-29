/**
 * MongoDB API Client
 * Connects to the backend Express server that talks to MongoDB Atlas
 * 
 * The backend runs on the same machine as the Expo dev server.
 * ADB reverse makes it reachable at 127.0.0.1:3001 from the phone.
 */

import { getAuthToken } from '@/stores/authStore';

// Auto-detect the dev server IP (same machine runs both Expo and backend)
function getApiBaseUrl(): string {
  // Use localhost which works on web, iOS simulator, and Android with adb reverse
  return 'http://localhost:3001/api';
}

const API_BASE_URL = getApiBaseUrl();

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const token = await getAuthToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      headers,
      ...options,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }
    return response.json();
  } catch (err: any) {
    // Network errors (backend not running) - return gracefully
    if (err.message?.includes('Network request failed')) {
      console.warn(`[MongoDB API] Backend unreachable: ${url}`);
      throw new Error('BACKEND_UNAVAILABLE');
    }
    throw err;
  }
}

// --- Projects ---
export const projectsApi = {
  getAll: () => request<any[]>('/projects'),
  create: (project: any) => request<any>('/projects', { method: 'POST', body: JSON.stringify(project) }),
  update: (id: string, data: any) => request<any>(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => request<any>(`/projects/${id}`, { method: 'DELETE' }),
};

// --- Tasks ---
export const tasksApi = {
  getAll: (projectId?: string) => request<any[]>(`/tasks${projectId ? `?projectId=${projectId}` : ''}`),
  create: (task: any) => request<any>('/tasks', { method: 'POST', body: JSON.stringify(task) }),
  update: (id: string, data: any) => request<any>(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => request<any>(`/tasks/${id}`, { method: 'DELETE' }),
};

// --- Progress Logs ---
export const progressLogsApi = {
  getAll: (taskId?: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (taskId) params.append('taskId', taskId);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return request<any[]>(`/progress-logs?${params.toString()}`);
  },
  create: (log: any) => request<any>('/progress-logs', { method: 'POST', body: JSON.stringify(log) }),
};

// --- Daily Entries ---
export const dailyEntriesApi = {
  getAll: (taskId?: string, date?: string) => {
    const params = new URLSearchParams();
    if (taskId) params.append('taskId', taskId);
    if (date) params.append('date', date);
    return request<any[]>(`/daily-entries?${params.toString()}`);
  },
  upsert: (entry: any) => request<any>('/daily-entries', { method: 'POST', body: JSON.stringify(entry) }),
};

// --- Health Data ---
export const healthDataApi = {
  getAll: (date?: string) => request<any[]>(`/health-data${date ? `?date=${date}` : ''}`),
  save: (data: any) => request<any>('/health-data', { method: 'POST', body: JSON.stringify(data) }),
};

// --- Settings ---
export const settingsApi = {
  get: () => request<any>('/settings'),
  update: (settings: any) => request<any>('/settings', { method: 'PUT', body: JSON.stringify(settings) }),
};

// --- Connection check ---
export async function checkBackendConnection(): Promise<boolean> {
  try {
    const result = await request<{ status: string }>('/health');
    return result.status === 'ok';
  } catch {
    return false;
  }
}
