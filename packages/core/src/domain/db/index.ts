import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import * as schema from './schema.drizzle.js';

// Export everything from schema for easy access
export * from './schema.drizzle.js';
export { schema };

import { findProjectRoot } from './root.js';

const PROJECT_ROOT = findProjectRoot();

// Default data directory - stored in .data folder at project root (gitignored)
const DATA_DIR = join(PROJECT_ROOT, '.data');

// Database file path - configurable via AUGUSTE_DB_PATH env variable
const DB_PATH = process.env.AUGUSTE_DB_PATH || join(DATA_DIR, 'auguste.db');

/**
 * Ensure the data directory exists
 */
function ensureDataDir(): void {
  const dir = process.env.AUGUSTE_DB_PATH ? dirname(process.env.AUGUSTE_DB_PATH) : DATA_DIR;

  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

// Ensure directory exists before creating connection
ensureDataDir();

// Create raw sqlite client
const sqlite = new Database(DB_PATH);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

// Initialize Drizzle ORM
export const db = drizzle(sqlite, { schema });

/**
 * Get the database instance (for backward compatibility if needed, but prefer 'db' export)
 * @deprecated Use 'db' export instead
 */
export function getDatabase(): Database.Database {
  return sqlite;
}

/**
 * Close the database connection
 */
export function closeDatabase(): void {
  sqlite.close();
}

/**
 * Generate a UUID v4
 */
export function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Get current ISO datetime string
 */
export function now(): string {
  return new Date().toISOString();
}

/**
 * Parse JSON from database column (handles null/undefined)
 * @deprecated Drizzle handles JSON parsing automatically
 */
export function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

/**
 * Stringify value for JSON column
 * @deprecated Drizzle handles JSON stringification automatically
 */
export function toJson(value: unknown): string {
  return JSON.stringify(value);
}

export { DB_PATH };
