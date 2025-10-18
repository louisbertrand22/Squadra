import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

let db: SQLite.SQLiteDatabase | null = null;
let initPromise: Promise<void> | null = null;
let isInitializing = false;

export const initDatabase = async () => {
  // If database is already initialized, return immediately
  if (db) {
    console.log('Database already initialized');
    return;
  }

  // If another initialization is in progress, wait for it
  if (initPromise) {
    console.log('Database initialization already in progress, waiting...');
    try {
      await initPromise;
      console.log('Database initialization completed (waited for ongoing initialization)');
      return;
    } catch (error) {
      console.error('Error while waiting for database initialization:', error);
      // Previous initialization failed, will fall through to retry
      console.log('Previous initialization failed, will retry...');
    }
  }

  // Double-check: prevent concurrent initialization attempts
  if (isInitializing) {
    console.log('Database initialization is starting, waiting...');
    // Wait a bit and check again
    await new Promise(resolve => setTimeout(resolve, 100));
    if (db) {
      console.log('Database became available while waiting');
      return;
    }
    if (initPromise) {
      await initPromise;
      console.log('Database initialization completed after wait');
      return;
    }
  }

  // Set flag to prevent concurrent calls
  isInitializing = true;

  // Start initialization
  initPromise = (async () => {
    try {
      console.log('Opening database...');
      
      // For web platform, ensure we handle database opening carefully
      // The File System Access API on web has stricter constraints
      if (Platform.OS === 'web') {
        console.log('Running on web platform - using careful database initialization');
        // On web, add a small delay to ensure any previous handles are released
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      db = await SQLite.openDatabaseAsync('squadra.db');

      console.log('Database opened, creating tables...');

      // Create local cache tables
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS cached_clubs (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          created_by TEXT NOT NULL,
          created_at TEXT NOT NULL,
          synced_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS cached_teams (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          club_id TEXT NOT NULL,
          created_at TEXT NOT NULL,
          synced_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS cached_memberships (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          club_id TEXT,
          team_id TEXT,
          role TEXT NOT NULL,
          created_at TEXT NOT NULL,
          synced_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS cached_user_profile (
          id TEXT PRIMARY KEY,
          email TEXT NOT NULL,
          name TEXT,
          phone_number TEXT,
          created_at TEXT NOT NULL,
          synced_at TEXT NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_clubs_created_by ON cached_clubs(created_by);
        CREATE INDEX IF NOT EXISTS idx_teams_club_id ON cached_teams(club_id);
        CREATE INDEX IF NOT EXISTS idx_memberships_user_id ON cached_memberships(user_id);
      `);

      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Error initializing database:', error);
      db = null; // Reset db if initialization fails
      initPromise = null; // Reset promise on error
      throw error;
    } finally {
      isInitializing = false; // Always reset the flag
    }
  })();

  try {
    await initPromise;
    console.log('Database initialization completed successfully');
  } catch (error) {
    // initPromise is already reset in the catch block above
    console.error('Database initialization failed:', error);
    throw error;
  }
};

export const getDatabase = () => {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase first.');
  }
  return db;
};

// Cache functions
export const cacheClubs = async (clubs: any[]) => {
  const database = getDatabase();
  const now = new Date().toISOString();

  for (const club of clubs) {
    await database.runAsync(
      'INSERT OR REPLACE INTO cached_clubs (id, name, created_by, created_at, synced_at) VALUES (?, ?, ?, ?, ?)',
      [club.id, club.name, club.created_by, club.created_at, now]
    );
  }
};

export const getCachedClubs = async () => {
  const database = getDatabase();
  return await database.getAllAsync('SELECT * FROM cached_clubs ORDER BY created_at DESC');
};

export const cacheUserProfile = async (user: any) => {
  const database = getDatabase();
  const now = new Date().toISOString();

  await database.runAsync(
    'INSERT OR REPLACE INTO cached_user_profile (id, email, name, phone_number, created_at, synced_at) VALUES (?, ?, ?, ?, ?, ?)',
    [user.id, user.email, user.name || null, user.phone_number || null, user.created_at, now]
  );
};

export const getCachedUserProfile = async (userId: string) => {
  const database = getDatabase();
  return await database.getFirstAsync(
    'SELECT * FROM cached_user_profile WHERE id = ?',
    [userId]
  );
};

export const clearCache = async () => {
  const database = getDatabase();
  await database.execAsync(`
    DELETE FROM cached_clubs;
    DELETE FROM cached_teams;
    DELETE FROM cached_memberships;
    DELETE FROM cached_user_profile;
  `);
};
