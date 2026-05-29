/**
 * MongoDB Sync Service
 * Syncs local data to MongoDB Atlas in the background.
 * The app continues to use SQLite for fast local operations,
 * and this service pushes changes to the cloud.
 */

import { projectsApi, tasksApi, progressLogsApi, dailyEntriesApi, healthDataApi, settingsApi, checkBackendConnection } from './mongoApi';

let isConnected = false;
let syncQueue: Array<() => Promise<void>> = [];
let isSyncing = false;

/**
 * Initialize the sync service - check if backend is reachable
 */
export async function initSync(): Promise<boolean> {
  isConnected = await checkBackendConnection();
  if (isConnected) {
    console.log('[Sync] Backend connected - MongoDB sync enabled');
    processSyncQueue();
  } else {
    console.log('[Sync] Backend unavailable - running offline (local SQLite only)');
  }
  return isConnected;
}

/**
 * Check if sync is available
 */
export function isSyncAvailable(): boolean {
  return isConnected;
}

/**
 * Queue a sync operation - won't block the caller
 */
function queueSync(operation: () => Promise<void>) {
  syncQueue.push(operation);
  if (!isSyncing) {
    processSyncQueue();
  }
}

async function processSyncQueue() {
  if (isSyncing || syncQueue.length === 0) return;
  isSyncing = true;

  while (syncQueue.length > 0) {
    const op = syncQueue.shift();
    if (op) {
      try {
        await op();
      } catch (err: any) {
        if (err.message === 'BACKEND_UNAVAILABLE') {
          isConnected = false;
          console.warn('[Sync] Backend went offline, pausing sync');
          break;
        }
        console.warn('[Sync] Operation failed:', err.message);
      }
    }
  }

  isSyncing = false;
}

// --- Sync helpers called after local operations ---

export function syncProjectCreated(project: any) {
  if (!isConnected) return;
  queueSync(async () => {
    await projectsApi.create(project);
  });
}

export function syncProjectUpdated(id: string, data: any) {
  if (!isConnected) return;
  queueSync(async () => {
    await projectsApi.update(id, data);
  });
}

export function syncProjectDeleted(id: string) {
  if (!isConnected) return;
  queueSync(async () => {
    await projectsApi.delete(id);
  });
}

export function syncTaskCreated(task: any) {
  if (!isConnected) return;
  queueSync(async () => {
    await tasksApi.create(task);
  });
}

export function syncTaskUpdated(id: string, data: any) {
  if (!isConnected) return;
  queueSync(async () => {
    await tasksApi.update(id, data);
  });
}

export function syncTaskDeleted(id: string) {
  if (!isConnected) return;
  queueSync(async () => {
    await tasksApi.delete(id);
  });
}

export function syncProgressLog(log: any) {
  if (!isConnected) return;
  queueSync(async () => {
    await progressLogsApi.create(log);
  });
}

export function syncDailyEntry(entry: any) {
  if (!isConnected) return;
  queueSync(async () => {
    await dailyEntriesApi.upsert(entry);
  });
}

export function syncHealthData(data: any) {
  if (!isConnected) return;
  const today = new Date().toISOString().split('T')[0];
  queueSync(async () => {
    await healthDataApi.save({ ...data, date: today });
  });
}

export function syncSettings(settings: any) {
  if (!isConnected) return;
  queueSync(async () => {
    await settingsApi.update(settings);
  });
}

/**
 * Full sync - push all local data to MongoDB (initial sync)
 */
export async function fullSync(projects: any[], tasks: any[]) {
  if (!isConnected) return;

  for (const project of projects) {
    queueSync(async () => {
      await projectsApi.create(project);
    });
  }

  for (const task of tasks) {
    queueSync(async () => {
      await tasksApi.create(task);
    });
  }
}
