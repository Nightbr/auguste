import Database from 'better-sqlite3';
import { existsSync, mkdirSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { SCHEMA } from './schema.js';

/**
 * Find the project root by looking for package.json
 * This works regardless of where the code is bundled/executed from
 */
function findProjectRoot(): string {
  const __filename = fileURLToPath(import.meta.url);
  let currentDir = dirname(__filename);

  // Walk up the directory tree until we find package.json
  while (currentDir !== dirname(currentDir)) {
    const packageJsonPath = join(currentDir, 'package.json');
    if (existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
        // Verify it's the Auguste package
        if (packageJson.name === 'auguste') {
          return currentDir;
        }
      } catch {
        // Continue searching if package.json is invalid
      }
    }
    currentDir = dirname(currentDir);
  }

  // Fallback: assume we're in a standard location
  // This shouldn't happen in normal usage
  return join(dirname(__filename), '..', '..', '..');
}

const PROJECT_ROOT = findProjectRoot();

// Default data directory - stored in .data folder at project root (gitignored)
const DATA_DIR = join(PROJECT_ROOT, '.data');

// Database file path - configurable via AUGUSTE_DB_PATH env variable
const DB_PATH = process.env.AUGUSTE_DB_PATH || join(DATA_DIR, 'auguste.db');

let db: Database.Database | null = null;

/**
 * Ensure the data directory exists
 */
function ensureDataDir(): void {
  const dir = process.env.AUGUSTE_DB_PATH ? join(process.env.AUGUSTE_DB_PATH, '..') : DATA_DIR;

  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

/**
 * Get the database instance (singleton pattern)
 */
export function getDatabase(): Database.Database {
  if (!db) {
    ensureDataDir();
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initializeSchema();
  }
  return db;
}

/**
 * Initialize the database schema
 */
function initializeSchema(): void {
  if (!db) return;
  db.exec(SCHEMA);
}

/**
 * Close the database connection
 */
export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
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
 */
export function toJson(value: unknown): string {
  return JSON.stringify(value);
}

export { DB_PATH };
