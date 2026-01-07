import { defineConfig } from 'vitest/config';
import { join } from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./src/test/setup.ts'],
    env: {
      AUGUSTE_DB_PATH: ':memory:',
    },
    include: ['src/**/*.test.ts'],
  },
});
