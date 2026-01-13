import { createTool } from '@mastra/core/tools';
import { eq, and, sql, inArray } from 'drizzle-orm';
import { z } from 'zod';
import {
  db,
  schema,
  generateId,
  SetMemberAvailabilityInputSchema,
  MemberAvailabilitySchema,
  MealType,
} from '../../domain';

/**
 * Set member availability for a specific meal and day
 */
export const setMemberAvailabilityTool = createTool({
  id: 'set-member-availability',
  description:
    'Set whether a member is available for a specific meal on a specific day of the week',
  inputSchema: SetMemberAvailabilityInputSchema,
  outputSchema: MemberAvailabilitySchema,
  execute: async ({ memberId, mealType, dayOfWeek, isAvailable }) => {
    const id = generateId();

    const [record] = await db
      .insert(schema.memberAvailability)
      .values({
        id,
        memberId,
        mealType,
        dayOfWeek,
        isAvailable,
      })
      .onConflictDoUpdate({
        target: [
          schema.memberAvailability.memberId,
          schema.memberAvailability.mealType,
          schema.memberAvailability.dayOfWeek,
        ],
        set: { isAvailable },
      })
      .returning();

    return record;
  },
});

/**
 * Get all availability records for a member
 */
export const getMemberAvailabilityTool = createTool({
  id: 'get-member-availability',
  description: 'Get all meal availability records for a family member',
  inputSchema: z.object({
    memberId: z.uuid().describe('The member ID'),
  }),
  outputSchema: z.array(MemberAvailabilitySchema),
  execute: async ({ memberId }) => {
    const rows = await db.query.memberAvailability.findMany({
      where: eq(schema.memberAvailability.memberId, memberId),
      orderBy: (table, { asc }) => [asc(table.dayOfWeek), asc(table.mealType)],
    });

    return rows;
  },
});

/**
 * Bulk set availability for a member (set availability for all meals/days at once)
 */
export const bulkSetMemberAvailabilityTool = createTool({
  id: 'bulk-set-member-availability',
  description:
    'Set availability for a member across multiple meals and days at once. Useful for setting up initial availability.',
  inputSchema: z.object({
    memberId: z.uuid().describe('The member ID'),
    availability: z
      .array(
        z.object({
          mealType: z.enum([MealType.breakfast, MealType.lunch, MealType.dinner]),
          dayOfWeek: z.number().int().min(0).max(6),
          isAvailable: z.boolean(),
        }),
      )
      .describe('Array of availability settings'),
  }),
  outputSchema: z.object({
    memberId: z.uuid(),
    recordsSet: z.number(),
  }),
  execute: async ({ memberId, availability }) => {
    if (availability.length === 0) {
      return { memberId, recordsSet: 0 };
    }

    db.transaction((tx) => {
      for (const item of availability) {
        const id = generateId();
        tx.insert(schema.memberAvailability)
          .values({
            id,
            memberId,
            mealType: item.mealType,
            dayOfWeek: item.dayOfWeek,
            isAvailable: item.isAvailable,
          })
          .onConflictDoUpdate({
            target: [
              schema.memberAvailability.memberId,
              schema.memberAvailability.mealType,
              schema.memberAvailability.dayOfWeek,
            ],
            set: { isAvailable: item.isAvailable },
          })
          .run();
      }
    });

    return {
      memberId,
      recordsSet: availability.length,
    };
  },
});

/**
 * Helper to find member ID by name
 */
async function findMemberByName(familyId: string, memberName: string) {
  return await db.query.member.findFirst({
    where: and(
      eq(schema.member.familyId, familyId),
      sql`lower(${schema.member.name}) LIKE lower(${`%${memberName}%`})`,
    ),
    columns: {
      id: true,
      name: true,
    },
  });
}

/**
 * Set availability for a member by name (more user-friendly)
 */
export const setMemberAvailabilityByNameTool = createTool({
  id: 'set-member-availability-by-name',
  description:
    'Set whether a member is available for a specific meal on a specific day. Uses member NAME instead of ID for easier use.',
  inputSchema: z.object({
    familyId: z.uuid().describe('The family ID'),
    memberName: z.string().describe('The member name (case-insensitive search)'),
    mealType: z
      .enum([MealType.breakfast, MealType.lunch, MealType.dinner])
      .describe('The meal type'),
    dayOfWeek: z
      .number()
      .int()
      .min(0)
      .max(6)
      .describe('Day of week (0=Sunday, 1=Monday, ..., 6=Saturday)'),
    isAvailable: z.boolean().describe('Whether the member is available for this meal'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    memberName: z.string(),
    message: z.string(),
  }),
  execute: async ({ familyId, memberName, mealType, dayOfWeek, isAvailable }) => {
    const member = await findMemberByName(familyId, memberName);
    if (!member) {
      return {
        success: false,
        memberName,
        message: `Member "${memberName}" not found in this family`,
      };
    }

    const id = generateId();

    await db
      .insert(schema.memberAvailability)
      .values({
        id,
        memberId: member.id,
        mealType,
        dayOfWeek,
        isAvailable,
      })
      .onConflictDoUpdate({
        target: [
          schema.memberAvailability.memberId,
          schema.memberAvailability.mealType,
          schema.memberAvailability.dayOfWeek,
        ],
        set: { isAvailable },
      });

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return {
      success: true,
      memberName: member.name,
      message: `${member.name} is ${isAvailable ? 'available' : 'not available'} for ${mealType} on ${dayNames[dayOfWeek]}`,
    };
  },
});

/**
 * Bulk set availability for a member by name
 */
export const bulkSetMemberAvailabilityByNameTool = createTool({
  id: 'bulk-set-member-availability-by-name',
  description:
    'Set availability for a member across multiple meals and days at once. Uses member NAME instead of ID. Perfect for setting up initial availability.',
  inputSchema: z.object({
    familyId: z.uuid().describe('The family ID'),
    memberName: z.string().describe('The member name (case-insensitive search)'),
    availability: z
      .array(
        z.object({
          mealType: z.enum([MealType.breakfast, MealType.lunch, MealType.dinner]),
          dayOfWeek: z.number().int().min(0).max(6).describe('0=Sunday, 1=Monday, ..., 6=Saturday'),
          isAvailable: z.boolean(),
        }),
      )
      .describe('Array of availability settings'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    memberName: z.string(),
    recordsSet: z.number(),
    message: z.string(),
  }),
  execute: async ({ familyId, memberName, availability }) => {
    const member = await findMemberByName(familyId, memberName);
    if (!member) {
      return {
        success: false,
        memberName,
        recordsSet: 0,
        message: `Member "${memberName}" not found in this family`,
      };
    }

    if (availability.length > 0) {
      db.transaction((tx) => {
        for (const item of availability) {
          const id = generateId();
          tx.insert(schema.memberAvailability)
            .values({
              id,
              memberId: member.id,
              mealType: item.mealType,
              dayOfWeek: item.dayOfWeek,
              isAvailable: item.isAvailable,
            })
            .onConflictDoUpdate({
              target: [
                schema.memberAvailability.memberId,
                schema.memberAvailability.mealType,
                schema.memberAvailability.dayOfWeek,
              ],
              set: { isAvailable: item.isAvailable },
            })
            .run();
        }
      });
    }

    return {
      success: true,
      memberName: member.name,
      recordsSet: availability.length,
      message: `Set ${availability.length} availability records for ${member.name}`,
    };
  },
});

/**
 * Get availability for a specific meal across all family members
 */
export const getFamilyAvailabilityForMealTool = createTool({
  id: 'get-family-availability-for-meal',
  description: 'Get which family members are available for a specific meal on a specific day',
  inputSchema: z.object({
    familyId: z.uuid().describe('The family ID'),
    mealType: z.enum([MealType.breakfast, MealType.lunch, MealType.dinner]),
    dayOfWeek: z.number().int().min(0).max(6),
  }),
  outputSchema: z.array(
    z.object({
      memberId: z.uuid(),
      memberName: z.string(),
      isAvailable: z.boolean(),
    }),
  ),
  execute: async ({ familyId, mealType, dayOfWeek }) => {
    // We want members of the family and their availability for this slot
    // Defaults to available (true) if no record exists

    // 1. Get all family members with their availability for this specific slot
    const members = await db
      .select({
        memberId: schema.member.id,
        memberName: schema.member.name,
        isAvailable: schema.memberAvailability.isAvailable,
      })
      .from(schema.member)
      .leftJoin(
        schema.memberAvailability,
        and(
          eq(schema.memberAvailability.memberId, schema.member.id),
          eq(schema.memberAvailability.mealType, mealType),
          eq(schema.memberAvailability.dayOfWeek, dayOfWeek),
        ),
      )
      .where(eq(schema.member.familyId, familyId));

    return members.map((row) => ({
      memberId: row.memberId,
      memberName: row.memberName,
      isAvailable: row.isAvailable ?? true, // Default to true if no record
    }));
  },
});

/**
 * Get availability for a family within a date range.
 * Translates day-of-week availability to specific dates.
 */
export const getAvailabilityForDateRangeTool = createTool({
  id: 'get-availability-for-date-range',
  description:
    'Get member availability for each date in a range. Translates recurring day-of-week availability to specific calendar dates. Essential for meal planning to know who is available for each meal slot.',
  inputSchema: z.object({
    familyId: z.uuid().describe('The family ID'),
    startDate: z.string().describe('Start date in YYYY-MM-DD format'),
    endDate: z.string().describe('End date in YYYY-MM-DD format'),
    mealTypes: z
      .array(z.enum([MealType.breakfast, MealType.lunch, MealType.dinner]))
      .optional()
      .describe('Filter by specific meal types. If not provided, returns all meal types.'),
  }),
  outputSchema: z.array(
    z.object({
      date: z.string(),
      dayOfWeek: z.number(),
      mealType: z.string(),
      availableMembers: z.array(
        z.object({
          memberId: z.string(),
          memberName: z.string(),
        }),
      ),
      unavailableMembers: z.array(
        z.object({
          memberId: z.string(),
          memberName: z.string(),
        }),
      ),
    }),
  ),
  execute: async ({ familyId, startDate, endDate, mealTypes }) => {
    // Get all family members
    const members = await db.query.member.findMany({
      where: eq(schema.member.familyId, familyId),
      columns: { id: true, name: true },
    });

    if (members.length === 0) {
      return [];
    }

    // Get all availability records for these members
    const memberIds = members.map((m) => m.id);
    const availabilityRecords = await db.query.memberAvailability.findMany({
      where: inArray(schema.memberAvailability.memberId, memberIds),
    });

    // Create a lookup map: memberId -> mealType -> dayOfWeek -> isAvailable
    const availabilityMap = new Map<string, Map<string, Map<number, boolean>>>();
    for (const record of availabilityRecords) {
      if (!availabilityMap.has(record.memberId)) {
        availabilityMap.set(record.memberId, new Map());
      }
      const memberMap = availabilityMap.get(record.memberId)!;
      if (!memberMap.has(record.mealType)) {
        memberMap.set(record.mealType, new Map());
      }
      memberMap.get(record.mealType)!.set(record.dayOfWeek, record.isAvailable);
    }

    // Generate all dates in range
    const result: Array<{
      date: string;
      dayOfWeek: number;
      mealType: string;
      availableMembers: Array<{ memberId: string; memberName: string }>;
      unavailableMembers: Array<{ memberId: string; memberName: string }>;
    }> = [];

    const mealTypesToCheck = mealTypes ?? [MealType.breakfast, MealType.lunch, MealType.dinner];
    const start = new Date(startDate);
    const end = new Date(endDate);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const dayOfWeek = d.getDay(); // 0 = Sunday, 6 = Saturday

      for (const mealType of mealTypesToCheck) {
        const availableMembers: Array<{ memberId: string; memberName: string }> = [];
        const unavailableMembers: Array<{ memberId: string; memberName: string }> = [];

        for (const member of members) {
          // Default to available if no record exists
          const isAvailable = availabilityMap.get(member.id)?.get(mealType)?.get(dayOfWeek) ?? true;

          if (isAvailable) {
            availableMembers.push({ memberId: member.id, memberName: member.name });
          } else {
            unavailableMembers.push({ memberId: member.id, memberName: member.name });
          }
        }

        result.push({
          date: dateStr,
          dayOfWeek,
          mealType,
          availableMembers,
          unavailableMembers,
        });
      }
    }

    return result;
  },
});
