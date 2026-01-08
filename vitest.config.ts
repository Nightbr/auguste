import { defineConfig } from 'vitest/config';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: [join(__dirname, './packages/core/src/test/setup.ts')],
    env: {
      AUGUSTE_DB_PATH: ':memory:',
    },
    include: [join(__dirname, './packages/core/src/**/*.test.ts')],
  },
});
