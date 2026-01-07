import { beforeAll, vi } from 'vitest';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { db } from '../domain/db';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

beforeAll(async () => {
  // Ensure the database is migrated before running tests
  const migrationsPath = join(__dirname, '../domain/db/migrations');

  try {
    migrate(db, { migrationsFolder: migrationsPath });
    console.log('Test database migrated successfully');
  } catch (error) {
    console.error('Failed to migrate test database:', error);
    throw error;
  }
});
