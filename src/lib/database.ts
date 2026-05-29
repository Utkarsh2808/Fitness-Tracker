/**
 * Database initialization and schema management
 * Uses Expo SQLite for offline-first data persistence
 */

import { Platform } from 'react-native';

let SQLite: any = null;
if (Platform.OS !== 'web') {
  SQLite = require('expo-sqlite');
}

const DB_NAME = 'progress-tracker.db';
const DB_VERSION = 1;

let db: any | null = null;

/**
 * Initialize the database connection
 */
export const initDatabase = async (): Promise<any> => {
  if (Platform.OS === 'web') {
    console.warn('SQLite is not supported on web. Running in online-only mode.');
    return null as any;
  }

  if (db) {
    return db;
  }

  try {
    db = await SQLite.openDatabaseAsync(DB_NAME);
    await db.withExclusiveTransactionAsync(async () => {
      await createTables(db!);
    });
    return db;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
};

/**
 * Get database instance
 */
export const getDatabase = (): any => {
  if (Platform.OS === 'web') {
    return null as any;
  }
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
};

/**
 * Create all necessary tables
 */
const createTables = async (database: any): Promise<void> => {
  const createTablesSQL = `
    -- Projects table
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      color TEXT,
      icon TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    -- Tasks table
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      task_type TEXT NOT NULL,
      target_value REAL NOT NULL,
      unit TEXT,
      weight REAL DEFAULT 1.0,
      icon TEXT,
      color TEXT,
      allow_multiple_updates INTEGER DEFAULT 1,
      health_sync_enabled INTEGER DEFAULT 0,
      health_metric_type TEXT,
      sync_frequency_minutes INTEGER DEFAULT 60,
      track_streak INTEGER DEFAULT 1,
      enable_notifications INTEGER DEFAULT 1,
      notification_time TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    -- Progress logs table - immutable append-only log
    CREATE TABLE IF NOT EXISTS progress_logs (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      increment_value REAL NOT NULL,
      note TEXT,
      source TEXT DEFAULT 'manual',
      external_id TEXT,
      created_at INTEGER DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
    );

    -- Daily entries table - aggregated daily data
    CREATE TABLE IF NOT EXISTS daily_entries (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      date INTEGER NOT NULL,
      achieved_value REAL NOT NULL,
      completion_percentage REAL NOT NULL,
      is_completed INTEGER DEFAULT 0,
      streak_active INTEGER DEFAULT 0,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
      UNIQUE(task_id, date)
    );

    -- Streaks table
    CREATE TABLE IF NOT EXISTS streaks (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      current_streak INTEGER DEFAULT 0,
      longest_streak INTEGER DEFAULT 0,
      last_completed_date INTEGER,
      start_date INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
      UNIQUE(task_id)
    );

    -- Daily scores table
    CREATE TABLE IF NOT EXISTS daily_scores (
      id TEXT PRIMARY KEY,
      date INTEGER NOT NULL,
      score REAL NOT NULL,
      max_score REAL NOT NULL,
      completed_tasks INTEGER NOT NULL,
      total_tasks INTEGER NOT NULL,
      project_scores TEXT,
      created_at INTEGER DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(date)
    );

    -- Weekly reviews table
    CREATE TABLE IF NOT EXISTS weekly_reviews (
      id TEXT PRIMARY KEY,
      week_start_date INTEGER NOT NULL,
      week_end_date INTEGER NOT NULL,
      average_score REAL NOT NULL,
      best_day_date INTEGER,
      best_day_score REAL,
      worst_day_date INTEGER,
      worst_day_score REAL,
      most_consistent_task_id TEXT,
      most_consistent_completion_rate REAL,
      most_missed_task_id TEXT,
      most_missed_completion_rate REAL,
      total_completions INTEGER NOT NULL,
      total_misses INTEGER NOT NULL,
      trends TEXT,
      created_at INTEGER DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(week_start_date, week_end_date)
    );

    -- User preferences table
    CREATE TABLE IF NOT EXISTS user_preferences (
      id TEXT PRIMARY KEY,
      dark_mode INTEGER DEFAULT 1,
      notifications_enabled INTEGER DEFAULT 1,
      morning_reminder_time TEXT,
      afternoon_reminder_time TEXT,
      evening_reminder_time TEXT,
      health_connect_authorized INTEGER DEFAULT 0,
      timezone TEXT DEFAULT 'UTC',
      week_start_day TEXT DEFAULT 'monday',
      created_at INTEGER DEFAULT CURRENT_TIMESTAMP,
      updated_at INTEGER DEFAULT CURRENT_TIMESTAMP
    );

    -- Health Connect sync status table
    CREATE TABLE IF NOT EXISTS health_connect_sync_status (
      task_id TEXT PRIMARY KEY,
      last_sync_time INTEGER,
      is_authorized INTEGER DEFAULT 0,
      error_message TEXT,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
    );

    -- Indices for common queries
    CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
    CREATE INDEX IF NOT EXISTS idx_progress_logs_task_id ON progress_logs(task_id);
    CREATE INDEX IF NOT EXISTS idx_progress_logs_timestamp ON progress_logs(timestamp);
    CREATE INDEX IF NOT EXISTS idx_daily_entries_task_id ON daily_entries(task_id);
    CREATE INDEX IF NOT EXISTS idx_daily_entries_date ON daily_entries(date);
    CREATE INDEX IF NOT EXISTS idx_daily_scores_date ON daily_scores(date);
  `;

  const statements = createTablesSQL.split(';').filter((sql) => sql.trim());

  for (const statement of statements) {
    if (statement.trim()) {
      try {
        await database.execAsync(statement);
      } catch (error: any) {
        // Ignore "table already exists" errors
        if (!error.message?.includes('already exists')) {
          console.error('Error executing SQL:', statement, error);
          throw error;
        }
      }
    }
  }
};

/**
 * Clear all data (use with caution)
 */
export const clearDatabase = async (): Promise<void> => {
  const database = getDatabase();
  await database.execAsync(`
    DELETE FROM progress_logs;
    DELETE FROM daily_entries;
    DELETE FROM streaks;
    DELETE FROM daily_scores;
    DELETE FROM weekly_reviews;
    DELETE FROM tasks;
    DELETE FROM projects;
  `);
};

/**
 * Execute a query
 */
export const executeQuery = async <T>(
  query: string,
  params?: (string | number | null)[]
): Promise<T[]> => {
  const database = getDatabase();
  try {
    const result = await database.getAllAsync<T>(query, params);
    return result || [];
  } catch (error) {
    console.error('Query error:', error, query);
    throw error;
  }
};

/**
 * Execute a single query and get first result
 */
export const executeQueryFirst = async <T>(
  query: string,
  params?: (string | number | null)[]
): Promise<T | null> => {
  const database = getDatabase();
  try {
    const result = await database.getFirstAsync<T>(query, params);
    return result || null;
  } catch (error) {
    console.error('Query error:', error, query);
    throw error;
  }
};

/**
 * Execute a mutation (insert, update, delete)
 */
export const executeMutation = async (
  query: string,
  params?: (string | number | null)[]
): Promise<number> => {
  const database = getDatabase();
  try {
    const result = await database.runAsync(query, params);
    return result.changes;
  } catch (error) {
    console.error('Mutation error:', error, query);
    throw error;
  }
};

/**
 * Execute multiple statements in a transaction
 */
export const executeTransaction = async (
  queries: Array<{ query: string; params?: (string | number | null)[] }>
): Promise<void> => {
  const database = getDatabase();
  try {
    await database.withTransactionAsync(async () => {
      for (const { query, params } of queries) {
        await database.runAsync(query, params);
      }
    });
  } catch (error) {
    console.error('Transaction error:', error);
    throw error;
  }
};

export default {
  initDatabase,
  getDatabase,
  clearDatabase,
  executeQuery,
  executeQueryFirst,
  executeMutation,
  executeTransaction,
};
