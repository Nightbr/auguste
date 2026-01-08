import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './packages/core/src/domain/db/migrations',
  schema: './packages/core/src/domain/db/schema.drizzle.ts',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.AUGUSTE_DB_PATH || './.data/auguste.db',
  },
});
