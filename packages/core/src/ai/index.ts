import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
import { Observability } from '@mastra/observability';
import { onboardingAgent, familyEditorAgent, mealPlannerAgent } from './agents/index.js';

// Re-export RequestContext for use by apps
export { RequestContext } from '@mastra/core/request-context';

// Export utility functions
export { cronToHumanReadable } from './tools/planner-tools.js';

export const mastra = new Mastra({
  agents: { onboardingAgent, familyEditorAgent, mealPlannerAgent },
  storage: new LibSQLStore({
    id: 'mastra-storage',
    // stores observability, scores, ... into memory storage, if it needs to persist, change to file:../ai.db
    url: ':memory:',
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
