import Database from 'better-sqlite3';
import { existsSync, mkdirSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

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
 * SQL Schema embedded directly to avoid file path issues when running via Mastra
 */
const SCHEMA = `
-- Auguste Database Schema
-- SQLite database for meal planning

-- Family table: Represents a household
CREATE TABLE IF NOT EXISTS Family (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    country TEXT NOT NULL,  -- ISO 3166-1 alpha-2 (e.g., 'US', 'FR')
    language TEXT NOT NULL, -- ISO 639-1 (e.g., 'en', 'fr')
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Member table: Individual family members
CREATE TABLE IF NOT EXISTS Member (
    id TEXT PRIMARY KEY,
    familyId TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('adult', 'child')),
    birthdate TEXT,
    dietaryRestrictions TEXT DEFAULT '[]',
    allergies TEXT DEFAULT '[]',
    foodPreferences TEXT DEFAULT '{"likes":[],"dislikes":[]}',
    cookingSkillLevel TEXT DEFAULT 'none'
        CHECK (cookingSkillLevel IN ('none', 'beginner', 'intermediate', 'advanced')),
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (familyId) REFERENCES Family(id) ON DELETE CASCADE
);

-- MemberAvailability table: Which meals each member attends
CREATE TABLE IF NOT EXISTS MemberAvailability (
    id TEXT PRIMARY KEY,
    memberId TEXT NOT NULL,
    mealType TEXT NOT NULL CHECK (mealType IN ('breakfast', 'lunch', 'dinner')),
    dayOfWeek INTEGER NOT NULL CHECK (dayOfWeek >= 0 AND dayOfWeek <= 6),
    isAvailable INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (memberId) REFERENCES Member(id) ON DELETE CASCADE,
    UNIQUE(memberId, mealType, dayOfWeek)
);

-- PlannerSettings table: Meal planning configuration
CREATE TABLE IF NOT EXISTS PlannerSettings (
    id TEXT PRIMARY KEY,
    familyId TEXT NOT NULL UNIQUE,
    mealTypes TEXT DEFAULT '["lunch", "dinner"]',
    activeDays TEXT DEFAULT '[0, 1, 2, 3, 4, 5, 6]',
    defaultServings INTEGER DEFAULT 4,
    notificationCron TEXT DEFAULT '0 18 * * 0',
    timezone TEXT DEFAULT 'UTC',
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (familyId) REFERENCES Family(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_member_familyId ON Member(familyId);
CREATE INDEX IF NOT EXISTS idx_availability_memberId ON MemberAvailability(memberId);
CREATE INDEX IF NOT EXISTS idx_settings_familyId ON PlannerSettings(familyId);
`;

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
