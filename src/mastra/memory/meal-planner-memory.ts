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
 * Memory-specific schemas that omit timestamp fields
 * These are used for agent working memory where timestamps aren't needed
 */
const FamilyMemorySchema = FamilySchema.omit({ createdAt: true, updatedAt: true });
const MemberMemorySchema = MemberSchema.omit({ createdAt: true, updatedAt: true });
const PlannerSettingsMemorySchema = PlannerSettingsSchema.omit({ createdAt: true, updatedAt: true });
const MealPlanningMemorySchema = MealPlanningSchema.omit({ createdAt: true, updatedAt: true });
const MealEventMemorySchema = MealEventSchema.omit({ createdAt: true, updatedAt: true });

/**
 * Meal Planner memory schema
 */
export const MealPlannerMemorySchema = z.object({
  family: FamilyMemorySchema.optional().describe('Family details'),
  members: z.array(MemberMemorySchema).default([]).describe('Family members and their profiles'),
  plannerSettings: PlannerSettingsMemorySchema.optional().describe('Configuration for meal planning'),
  memberAvailability: z.array(MemberAvailabilitySchema).default([]).describe('Availability schedule for all members'),

  // Current active plan state
  currentPlanning: MealPlanningMemorySchema.optional().describe('The meal planning cycle currently being worked on'),
  proposedEvents: z.array(MealEventMemorySchema).default([]).describe('List of proposed meal events for the cycle'),

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
        scope: 'resource', // Resource-scoped: memory persists across all threads for the same family
        schema: MealPlannerMemorySchema,
      },
    },
  });
};

export const mealPlannerMemory = createMealPlannerMemory();
