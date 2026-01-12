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
 * Day name to cron day number mapping
 */
const DAY_TO_CRON: Record<string, number> = {
  sunday: 0,
  sun: 0,
  monday: 1,
  mon: 1,
  tuesday: 2,
  tue: 2,
  tues: 2,
  wednesday: 3,
  wed: 3,
  thursday: 4,
  thu: 4,
  thur: 4,
  thurs: 4,
  friday: 5,
  fri: 5,
  saturday: 6,
  sat: 6,
};

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Parse time from natural language
 * Returns { hour, minute } or null if not found
 */
function parseTime(text: string): { hour: number; minute: number } | null {
  // Match patterns like "6pm", "6:30pm", "18:00", "6 pm", "noon", "midnight"
  const normalizedText = text.toLowerCase().trim();

  // Special times
  if (normalizedText.includes('noon') || normalizedText.includes('midday')) {
    return { hour: 12, minute: 0 };
  }
  if (normalizedText.includes('midnight')) {
    return { hour: 0, minute: 0 };
  }
  if (normalizedText.includes('morning')) {
    return { hour: 9, minute: 0 };
  }
  if (normalizedText.includes('evening')) {
    return { hour: 18, minute: 0 };
  }
  if (normalizedText.includes('afternoon')) {
    return { hour: 14, minute: 0 };
  }
  if (normalizedText.includes('night')) {
    return { hour: 20, minute: 0 };
  }

  // Match "6pm", "6:30pm", "6 pm", "6:30 pm"
  const timeRegex = /(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)?/i;
  const match = normalizedText.match(timeRegex);

  if (match) {
    let hour = parseInt(match[1], 10);
    const minute = match[2] ? parseInt(match[2], 10) : 0;
    const period = match[3]?.toLowerCase().replace(/\./g, '');

    if (period === 'pm' && hour < 12) {
      hour += 12;
    } else if (period === 'am' && hour === 12) {
      hour = 0;
    }

    // Sanity check
    if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
      return { hour, minute };
    }
  }

  return null;
}

/**
 * Parse day(s) from natural language
 * Returns array of cron day numbers or null
 */
function parseDays(text: string): number[] | null {
  const normalizedText = text.toLowerCase();

  // Check for day ranges/groups
  if (normalizedText.includes('weekday') || normalizedText.includes('week day')) {
    return [1, 2, 3, 4, 5];
  }
  if (normalizedText.includes('weekend')) {
    return [0, 6];
  }
  if (
    normalizedText.includes('every day') ||
    normalizedText.includes('daily') ||
    normalizedText.includes('everyday')
  ) {
    return [0, 1, 2, 3, 4, 5, 6];
  }

  // Check for specific days
  const foundDays: number[] = [];
  for (const [dayName, dayNum] of Object.entries(DAY_TO_CRON)) {
    // Use word boundary matching to avoid partial matches
    const regex = new RegExp(`\\b${dayName}s?\\b`, 'i');
    if (regex.test(normalizedText)) {
      if (!foundDays.includes(dayNum)) {
        foundDays.push(dayNum);
      }
    }
  }

  return foundDays.length > 0 ? foundDays.sort((a, b) => a - b) : null;
}

/**
 * Format hour to 12-hour format with AM/PM
 */
function formatTime(hour: number, minute: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const minuteStr = minute === 0 ? '' : `:${minute.toString().padStart(2, '0')}`;
  return `${displayHour}${minuteStr} ${period}`;
}

/**
 * Helper tool to convert natural language to cron expression
 */
export const parseCronScheduleTool = createTool({
  id: 'parse-cron-schedule',
  description:
    'Convert a natural language schedule description to a cron expression. Examples: "Sunday at 6pm" -> "0 18 * * 0", "Every morning at 7am" -> "0 7 * * *", "Friday evening" -> "0 18 * * 5"',
  inputSchema: z.object({
    description: z.string().describe('Natural language description of the schedule'),
  }),
  outputSchema: z.object({
    cron: z.string(),
    humanReadable: z.string(),
  }),
  execute: async ({ description }) => {
    const normalizedText = description.toLowerCase().trim();

    // Parse time and days from the description
    const time = parseTime(normalizedText);
    const days = parseDays(normalizedText);

    // Default time if not specified (6pm for evening-ish context)
    const hour = time?.hour ?? 18;
    const minute = time?.minute ?? 0;

    // Build cron expression
    let cronDays: string;
    let humanDays: string;

    if (!days || days.length === 7) {
      cronDays = '*';
      humanDays = 'Every day';
    } else if (days.length === 5 && days.join(',') === '1,2,3,4,5') {
      cronDays = '1-5';
      humanDays = 'Monday to Friday';
    } else if (days.length === 2 && days.join(',') === '0,6') {
      cronDays = '0,6';
      humanDays = 'Weekends';
    } else if (days.length === 1) {
      cronDays = days[0].toString();
      humanDays = `Every ${DAY_NAMES[days[0]]}`;
    } else {
      cronDays = days.join(',');
      humanDays = days.map((d) => DAY_NAMES[d]).join(', ');
    }

    const cron = `${minute} ${hour} * * ${cronDays}`;
    const humanReadable = `${humanDays} at ${formatTime(hour, minute)}`;

    return { cron, humanReadable };
  },
});

/**
 * Convert a cron expression to human-readable format
 */
export function cronToHumanReadable(cron: string): string {
  const parts = cron.split(' ');
  if (parts.length !== 5) {
    return cron; // Return as-is if invalid
  }

  const [minute, hour, , , dayOfWeek] = parts;
  const hourNum = parseInt(hour, 10);
  const minuteNum = parseInt(minute, 10);

  // Format time
  const timeStr = formatTime(hourNum, minuteNum);

  // Format days
  let dayStr: string;
  if (dayOfWeek === '*') {
    dayStr = 'Every day';
  } else if (dayOfWeek === '1-5') {
    dayStr = 'Monday to Friday';
  } else if (dayOfWeek === '0,6' || dayOfWeek === '6,0') {
    dayStr = 'Weekends';
  } else {
    const dayNums = dayOfWeek.split(',').map((d) => parseInt(d, 10));
    if (dayNums.length === 1) {
      dayStr = `Every ${DAY_NAMES[dayNums[0]]}`;
    } else {
      dayStr = dayNums.map((d) => DAY_NAMES[d]).join(', ');
    }
  }

  return `${dayStr} at ${timeStr}`;
}
