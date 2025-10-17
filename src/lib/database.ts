import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;
let initPromise: Promise<void> | null = null;

export const initDatabase = async () => {
  // If database is already initialized, return immediately
  if (db) {
    console.log('Database already initialized');
    return;
  }

  // If another initialization is in progress, wait for it
  if (initPromise) {
    console.log('Database initialization already in progress, waiting...');
    await initPromise;
    return;
  }

  // Start initialization
  initPromise = (async () => {
    try {
      db = await SQLite.openDatabaseAsync('squadra.db');

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

        CREATE INDEX IF NOT EXISTS idx_clubs_created_by ON cached_clubs(created_by);
        CREATE INDEX IF NOT EXISTS idx_teams_club_id ON cached_teams(club_id);
        CREATE INDEX IF NOT EXISTS idx_memberships_user_id ON cached_memberships(user_id);
      `);

      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Error initializing database:', error);
      db = null; // Reset db if initialization fails
      throw error;
    }
  })();

  try {
    await initPromise;
  } catch (error) {
    // Reset promise on error so it can be retried
    initPromise = null;
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

export const clearCache = async () => {
  const database = getDatabase();
  await database.execAsync(`
    DELETE FROM cached_clubs;
    DELETE FROM cached_teams;
    DELETE FROM cached_memberships;
  `);
};
