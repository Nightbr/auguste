/**
 * Meal Planner Agent Structured Memory
 *
 * Stores context for meal planning:
 * - Family details
 * - Members (with prefs/allergies)
 * - Planner settings
 * - Availability
 * - Current planning cycle state
 */

import { Memory } from '@mastra/memory';
import { z } from 'zod';
import { LibSQLStore } from '@mastra/libsql';
import {
  FamilySchema,
  MemberSchema,
  PlannerSettingsSchema,
  MemberAvailabilitySchema,
  MealPlanningSchema,
  MealEventSchema,
} from '../../domain/schemas';

/**
 * Meal Planner memory schema
 */
export const MealPlannerMemorySchema = z.object({
  family: FamilySchema.optional().describe('Family details'),
  members: z.array(MemberSchema).default([]).describe('Family members and their profiles'),
  plannerSettings: PlannerSettingsSchema.optional().describe('Configuration for meal planning'),
  memberAvailability: z.array(MemberAvailabilitySchema).default([]).describe('Availability schedule for all members'),

  // Current active plan state
  currentPlanning: MealPlanningSchema.optional().describe('The meal planning cycle currently being worked on'),
  proposedEvents: z.array(MealEventSchema).default([]).describe('List of proposed meal events for the cycle'),

  lastAction: z.string().optional().describe('Last action performed by the agent'),
  notes: z.array(z.string()).default([]).describe('Context notes'),
});

export type MealPlannerMemory = z.infer<typeof MealPlannerMemorySchema>;

export const createMealPlannerMemory = (storage?: LibSQLStore): Memory => {
  return new Memory({
    storage:
      storage ??
      new LibSQLStore({
        id: 'meal-planner-memory-storage',
        url: ':memory:',
      }),
    options: {
      workingMemory: {
        enabled: true,
        scope: 'thread',
        schema: MealPlannerMemorySchema,
      },
    },
  });
};

export const mealPlannerMemory = createMealPlannerMemory();
