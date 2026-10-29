import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';

const DB_FILE = process.env.DATABASE_PATH
  ? path.resolve(process.cwd(), process.env.DATABASE_PATH)
  : path.resolve(__dirname, 'citymind.db');

// Ensure parent directory exists
const dbDir = path.dirname(DB_FILE);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

let dbInstance: DatabaseSync | null = null;

export function getDatabase(): DatabaseSync {
  if (!dbInstance) {
    dbInstance = new DatabaseSync(DB_FILE);
    initTables(dbInstance);
  }
  return dbInstance;
}

function initTables(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      player_name TEXT NOT NULL,
      city_name TEXT NOT NULL,
      avatar TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      state_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS unlocked_levels (
      session_id TEXT NOT NULL,
      level_id TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      stars INTEGER NOT NULL DEFAULT 0,
      unlocked_at TEXT NOT NULL,
      PRIMARY KEY (session_id, level_id)
    );

    CREATE TABLE IF NOT EXISTS badges (
      session_id TEXT NOT NULL,
      badge_id TEXT NOT NULL,
      unlocked_at TEXT NOT NULL,
      PRIMARY KEY (session_id, badge_id)
    );

    CREATE TABLE IF NOT EXISTS leaderboard (
      id TEXT PRIMARY KEY,
      player_name TEXT NOT NULL,
      city_name TEXT NOT NULL,
      avatar TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      sustainability_index REAL NOT NULL,
      resilience_score REAL NOT NULL,
      stars_total INTEGER NOT NULL,
      credits INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS green_credits_log (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      month INTEGER NOT NULL,
      zone_id TEXT NOT NULL,
      metric TEXT NOT NULL,
      drop_amount REAL NOT NULL,
      credits_awarded INTEGER NOT NULL,
      reason TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS real_data_cache (
      city_query TEXT PRIMARY KEY,
      data_json TEXT NOT NULL,
      cached_at TEXT NOT NULL
    );
  `);
}

export function resetDatabase() {
  const db = getDatabase();
  db.exec(`
    DELETE FROM sessions;
    DELETE FROM unlocked_levels;
    DELETE FROM badges;
    DELETE FROM leaderboard;
    DELETE FROM green_credits_log;
    DELETE FROM real_data_cache;
  `);
}
