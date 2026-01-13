import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
import { Observability } from '@mastra/observability';
import { join } from 'path';
import { onboardingAgent, familyEditorAgent, mealPlannerAgent } from './agents/index.js';
import { findProjectRoot } from '../domain/db/root.js';

// Re-export RequestContext for use by apps
export { RequestContext } from '@mastra/core/request-context';

// Export utility functions
export { cronToHumanReadable } from './tools/planner-tools.js';

// Resolve database path to project root (same pattern as main database)
const PROJECT_ROOT = findProjectRoot();
const AGENT_STORAGE_PATH = join(PROJECT_ROOT, '.data', 'agent-storage.db');

export const mastra = new Mastra({
  agents: { onboardingAgent, familyEditorAgent, mealPlannerAgent },
  storage: new LibSQLStore({
    id: 'mastra-storage',
    // stores observability, scores, ... into persistent file storage
    url: `file:${AGENT_STORAGE_PATH}`,
  }),
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
  observability: new Observability({
    // Enables DefaultExporter and CloudExporter for tracing
    default: { enabled: true },
  }),
  server: {
    port: 4111,
    studioBase: '/studio',
  },
});
