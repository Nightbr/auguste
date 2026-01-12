import { createTool } from '@mastra/core/tools';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import {
  db,
  schema,
  generateId,
  now,
  CreatePlannerSettingsInputSchema,
  UpdatePlannerSettingsInputSchema,
  PlannerSettingsSchema,
  MealType,
} from '../../domain';

/**
 * Create planner settings for a family
 */
export const createPlannerSettingsTool = createTool({
  id: 'create-planner-settings',
  description:
    'Create meal planning settings for a family including meal types, active days, and notification schedule',
  inputSchema: CreatePlannerSettingsInputSchema,
  outputSchema: PlannerSettingsSchema,
  execute: async (input) => {
    const id = generateId();
    const timestamp = now();

    const [settings] = await db
      .insert(schema.plannerSettings)
      .values({
        id,
        familyId: input.familyId,
        mealTypes: input.mealTypes ?? [MealType.lunch, MealType.dinner],
        activeDays: input.activeDays ?? [0, 1, 2, 3, 4, 5, 6],
        defaultServings: input.defaultServings ?? 4,
        notificationCron: input.notificationCron ?? '0 18 * * 0',
        timezone: input.timezone ?? 'UTC',
        createdAt: timestamp,
        updatedAt: timestamp,
      })
      .returning();

    return settings;
  },
});

/**
 * Get planner settings for a family
 */
export const getPlannerSettingsTool = createTool({
  id: 'get-planner-settings',
  description: 'Get the meal planning settings for a family. Returns found=false if not found.',
  inputSchema: z.object({
    familyId: z.uuid().describe('The family ID'),
  }),
  outputSchema: z.object({
    found: z.boolean(),
    settings: PlannerSettingsSchema.optional(),
  }),
  execute: async ({ familyId }) => {
    const settings = await db.query.plannerSettings.findFirst({
      where: eq(schema.plannerSettings.familyId, familyId),
    });

    if (!settings) return { found: false };
    return { found: true, settings };
  },
});

/**
 * Update planner settings by ID
 */
export const updatePlannerSettingsTool = createTool({
  id: 'update-planner-settings',
  description:
    'Update meal planning settings by settings ID. Returns found=false if not found. Prefer updatePlannerSettingsByFamilyIdTool if you only have the familyId.',
  inputSchema: UpdatePlannerSettingsInputSchema,
  outputSchema: z.object({
    found: z.boolean(),
    settings: PlannerSettingsSchema.optional(),
  }),
  execute: async (input) => {
    const timestamp = now();

    const updates: Partial<typeof schema.plannerSettings.$inferInsert> = { updatedAt: timestamp };

    if (input.mealTypes !== undefined) updates.mealTypes = input.mealTypes;
    if (input.activeDays !== undefined) updates.activeDays = input.activeDays;
    if (input.defaultServings !== undefined) updates.defaultServings = input.defaultServings;
    if (input.notificationCron !== undefined) updates.notificationCron = input.notificationCron;
    if (input.timezone !== undefined) updates.timezone = input.timezone;

    const [updatedSettings] = await db
      .update(schema.plannerSettings)
      .set(updates)
      .where(eq(schema.plannerSettings.id, input.id))
      .returning();

    if (!updatedSettings) return { found: false };
    return { found: true, settings: updatedSettings };
  },
});

/**
 * Input schema for updating planner settings by family ID
 */
const UpdatePlannerSettingsByFamilyIdInputSchema = z.object({
  familyId: z.uuid().describe('The family ID whose planner settings to update'),
  mealTypes: z
    .array(z.any())
    .optional()
    .describe('Array of meal types to plan (breakfast, lunch, dinner)'),
  activeDays: z
    .array(z.number())
    .optional()
    .describe('Array of days (0=Sunday to 6=Saturday) to plan meals for'),
  defaultServings: z.number().int().optional().describe('Default number of servings per meal'),
  notificationCron: z.string().optional().describe('Cron expression for notification schedule'),
  timezone: z.string().optional().describe('Timezone for notifications (e.g., "America/New_York")'),
});

/**
 * Update planner settings by family ID (preferred for onboarding)
 */
export const updatePlannerSettingsByFamilyIdTool = createTool({
  id: 'update-planner-settings-by-family-id',
  description:
    'Update meal planning settings using the familyId. This is easier than updatePlannerSettingsTool because you do not need to know the settings ID. Returns found=false if no settings exist for this family.',
  inputSchema: UpdatePlannerSettingsByFamilyIdInputSchema,
  outputSchema: z.object({
    found: z.boolean(),
    settings: PlannerSettingsSchema.optional(),
  }),
  execute: async (input) => {
    const timestamp = now();

    const updates: Partial<typeof schema.plannerSettings.$inferInsert> = { updatedAt: timestamp };

    if (input.mealTypes !== undefined) updates.mealTypes = input.mealTypes;
    if (input.activeDays !== undefined) updates.activeDays = input.activeDays;
    if (input.defaultServings !== undefined) updates.defaultServings = input.defaultServings;
    if (input.notificationCron !== undefined) updates.notificationCron = input.notificationCron;
    if (input.timezone !== undefined) updates.timezone = input.timezone;

    const [updatedSettings] = await db
      .update(schema.plannerSettings)
      .set(updates)
      .where(eq(schema.plannerSettings.familyId, input.familyId))
      .returning();

    if (!updatedSettings) return { found: false };
    return { found: true, settings: updatedSettings };
  },
});

/**
 * Helper tool to convert natural language to cron expression
 */
export const parseCronScheduleTool = createTool({
  id: 'parse-cron-schedule',
  description:
    'Convert a natural language schedule description to a cron expression. Examples: "Sunday at 6pm" -> "0 18 * * 0", "Every morning at 7am" -> "0 7 * * *"',
  inputSchema: z.object({
    description: z.string().describe('Natural language description of the schedule'),
  }),
  outputSchema: z.object({
    cron: z.string(),
    humanReadable: z.string(),
  }),
  execute: async ({ description }) => {
    // Common patterns - the agent can use this as a reference
    const patterns: Record<string, { cron: string; humanReadable: string }> = {
      'sunday evening': { cron: '0 18 * * 0', humanReadable: 'Every Sunday at 6:00 PM' },
      'sunday at 6pm': { cron: '0 18 * * 0', humanReadable: 'Every Sunday at 6:00 PM' },
      'saturday morning': { cron: '0 9 * * 6', humanReadable: 'Every Saturday at 9:00 AM' },
      'friday at noon': { cron: '0 12 * * 5', humanReadable: 'Every Friday at 12:00 PM' },
      'every morning at 7am': { cron: '0 7 * * *', humanReadable: 'Every day at 7:00 AM' },
      'daily at 8am': { cron: '0 8 * * *', humanReadable: 'Every day at 8:00 AM' },
      'weekday mornings': { cron: '0 7 * * 1-5', humanReadable: 'Monday to Friday at 7:00 AM' },
    };

    const key = description.toLowerCase().trim();
    if (patterns[key]) {
      return patterns[key];
    }

    // Default to Sunday evening if not recognized
    return {
      cron: '0 18 * * 0',
      humanReadable: `Schedule for "${description}" - defaulting to Sunday at 6:00 PM`,
    };
  },
});
