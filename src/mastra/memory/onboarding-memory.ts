/**
 * Onboarding Agent Structured Memory
 *
 * This module exports the structured working memory configuration for the onboarding agent.
 * The memory uses a Zod schema that matches the database structure, allowing the agent
 * to track family IDs, member IDs, and onboarding progress in a type-safe manner.
 */

import { Memory } from '@mastra/memory';
import { z } from 'zod';
import {
  MemberType,
  CookingSkillLevel,
  MealType,
} from '../../domain/schemas';
import { LibSQLStore } from '@mastra/libsql';

/**
 * Onboarding phase enum
 */
const OnboardingPhase = {
  initializing: 'initializing',
  familySetup: 'familySetup',
  memberOnboarding: 'memberOnboarding',
  availabilitySetup: 'availabilitySetup',
  plannerSetup: 'plannerSetup',
  completed: 'completed',
} as const;

/**
 * Family member memory schema
 * Supports incremental member creation during onboarding.
 * Fields can be added gradually: name first, then type, age, etc.
 * Matches the Member table structure but allows partial data before database creation.
 */
const OnboardingMemberSchema = z.object({
  id: z.uuid().optional().describe('Unique identifier for the member (assigned after database creation)'),
  name: z.string().describe('Member name'),
  type: z.enum([MemberType.adult, MemberType.child]).optional().describe('Adult or child'),
  age: z.number().int().positive().nullable().describe('Member age'),
  dietaryRestrictions: z.array(z.string()).default([]).describe('Dietary restrictions (e.g., vegetarian, gluten-free)'),
  allergies: z.array(z.string()).default([]).describe('Food allergies'),
  foodPreferences: z.object({
    likes: z.array(z.string()).default([]),
    dislikes: z.array(z.string()).default([]),
  }).default({ likes: [], dislikes: [] }).describe('Food preferences'),
  cookingSkillLevel: z.enum([
    CookingSkillLevel.none,
    CookingSkillLevel.beginner,
    CookingSkillLevel.intermediate,
    CookingSkillLevel.advanced,
  ]).default(CookingSkillLevel.none).describe('Cooking skill level for adults'),
  isOnboarded: z.boolean().default(false).describe('Whether all member info has been collected'),
  hasAvailabilitySet: z.boolean().default(false).describe('Whether member availability has been collected'),
});

/**
 * Family information memory schema
 * Matches the Family table structure in the database
 */
const OnboardingFamilySchema = z.object({
  id: z.uuid().describe('Unique identifier for the family'),
  name: z.string().describe('Family or household name'),
  country: z.string().length(2).describe('ISO 3166-1 alpha-2 country code (e.g., US, FR)'),
  language: z.string().min(2).describe('ISO 639-1 language code (e.g., en, fr)'),
});

/**
 * Planner settings memory schema
 * Matches the PlannerSettings table structure in the database
 */
const OnboardingPlannerSettingsSchema = z.object({
  id: z.uuid().optional().describe('Unique identifier for planner settings'),
  mealTypes: z.array(z.enum([MealType.breakfast, MealType.lunch, MealType.dinner])).default([MealType.lunch, MealType.dinner]).describe('Which meals to plan'),
  activeDays: z.array(z.number().int().min(0).max(6)).default([0, 1, 2, 3, 4, 5, 6]).describe('Days of the week for planning (0=Sunday, 6=Saturday)'),
  defaultServings: z.number().int().positive().default(4).describe('Default servings per meal'),
  notificationCron: z.string().default('0 18 * * 0').describe('Cron expression for notifications'),
  timezone: z.string().default('UTC').describe('Timezone for notifications'),
  isConfigured: z.boolean().default(false).describe('Whether planner settings have been configured'),
});

/**
 * Complete onboarding memory schema
 * This schema matches the database structure and tracks all onboarding state
 */
export const OnboardingMemorySchema = z.object({
  family: OnboardingFamilySchema.partial().optional().describe('Family information (partially populated during onboarding)'),
  members: z.array(OnboardingMemberSchema).default([]).describe('Family members added so far'),
  expectedMemberCount: z.number().int().min(1).optional().describe('Total number of members expected'),
  plannerSettings: OnboardingPlannerSettingsSchema.partial().default({}).describe('Planner configuration settings'),
  currentPhase: z.enum([
    OnboardingPhase.initializing,
    OnboardingPhase.familySetup,
    OnboardingPhase.memberOnboarding,
    OnboardingPhase.availabilitySetup,
    OnboardingPhase.plannerSetup,
    OnboardingPhase.completed,
  ]).default(OnboardingPhase.initializing).describe('Current onboarding phase'),
  lastAction: z.string().optional().describe('Last action taken'),
  nextRequired: z.string().optional().describe('Next required step or question'),
  notes: z.array(z.string()).default([]).describe('Important notes or context to remember'),
});

export type OnboardingMemory = z.infer<typeof OnboardingMemorySchema>;

/**
 * Create a new Memory instance configured for onboarding with structured schema.
 *
 * The working memory uses a Zod schema that matches the database structure,
 * ensuring the agent tracks family IDs, member IDs, and configuration data
 * in a type-safe and validated manner.
 *
 * @param storage - Optional storage instance. If not provided, uses in-memory LibSQL store.
 */
export const createOnboardingMemory = (storage?: LibSQLStore): Memory => {
  return new Memory({
    storage: storage ?? new LibSQLStore({
      id: 'onboarding-memory-storage',
      url: ':memory:',
    }),
    options: {
      workingMemory: {
        enabled: true,
        scope: 'thread', // Memory is isolated per onboarding conversation
        schema: OnboardingMemorySchema,
      },
    },
  });
};

/**
 * Default onboarding memory instance without storage.
 * Note: For production use, provide a LibSQLStore instance to createOnboardingMemory().
 */
export const onboardingMemory = createOnboardingMemory();
