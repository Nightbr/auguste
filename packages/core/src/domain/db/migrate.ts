import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { db, closeDatabase } from './index.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to migrations folder relative to this file
const migrationsPath = join(__dirname, './migrations');

export async function runMigrations() {
  console.log('Running migrations...');
  try {
    await migrate(db, { migrationsFolder: migrationsPath });
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

// If run directly
if (process.argv[1] === __filename) {
  runMigrations()
    .then(() => {
      closeDatabase();
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
