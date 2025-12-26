import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import {
  getDatabase,
  generateId,
  SetMemberAvailabilityInputSchema,
  MemberAvailabilitySchema,
  MealType,
  MemberAvailability,
  Member,
} from '../../domain';

/**
 * Database row type - boolean is stored as integer (0/1) in SQLite
 */
type AvailabilityRow = Omit<MemberAvailability, 'isAvailable'> & {
  isAvailable: number;
};

/**
 * Partial member row for lookups
 */
type MemberLookupRow = Pick<Member, 'id' | 'name'>;

function rowToAvailability(row: AvailabilityRow) {
  return {
    id: row.id,
    memberId: row.memberId,
    mealType: row.mealType as typeof MealType[keyof typeof MealType],
    dayOfWeek: row.dayOfWeek,
    isAvailable: row.isAvailable === 1,
  };
}

/**
 * Set member availability for a specific meal and day
 */
export const setMemberAvailabilityTool = createTool({
  id: 'set-member-availability',
  description: 'Set whether a member is available for a specific meal on a specific day of the week',
  inputSchema: SetMemberAvailabilityInputSchema,
  outputSchema: MemberAvailabilitySchema,
  execute: async ({ memberId, mealType, dayOfWeek, isAvailable }) => {
    const db = getDatabase();

    // Use UPSERT (INSERT OR REPLACE)
    const existing = db.prepare(
      'SELECT id FROM MemberAvailability WHERE memberId = ? AND mealType = ? AND dayOfWeek = ?'
    ).get(memberId, mealType, dayOfWeek) as { id: string } | undefined;

    const id = existing?.id ?? generateId();
    const isAvailableInt = isAvailable ? 1 : 0;

    db.prepare(
      `INSERT OR REPLACE INTO MemberAvailability (id, memberId, mealType, dayOfWeek, isAvailable)
       VALUES (?, ?, ?, ?, ?)`
    ).run(id, memberId, mealType, dayOfWeek, isAvailableInt);

    return {
      id,
      memberId,
      mealType,
      dayOfWeek,
      isAvailable,
    };
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
    const db = getDatabase();
    const rows = db.prepare(
      'SELECT * FROM MemberAvailability WHERE memberId = ? ORDER BY dayOfWeek, mealType'
    ).all(memberId) as AvailabilityRow[];

    return rows.map(rowToAvailability);
  },
});

/**
 * Bulk set availability for a member (set availability for all meals/days at once)
 */
export const bulkSetMemberAvailabilityTool = createTool({
  id: 'bulk-set-member-availability',
  description: 'Set availability for a member across multiple meals and days at once. Useful for setting up initial availability.',
  inputSchema: z.object({
    memberId: z.uuid().describe('The member ID'),
    availability: z.array(z.object({
      mealType: z.enum([MealType.breakfast, MealType.lunch, MealType.dinner]),
      dayOfWeek: z.number().int().min(0).max(6),
      isAvailable: z.boolean(),
    })).describe('Array of availability settings'),
  }),
  outputSchema: z.object({
    memberId: z.uuid(),
    recordsSet: z.number(),
  }),
  execute: async ({ memberId, availability }) => {
    const db = getDatabase();

    const stmt = db.prepare(
      `INSERT OR REPLACE INTO MemberAvailability (id, memberId, mealType, dayOfWeek, isAvailable)
       VALUES (?, ?, ?, ?, ?)`
    );

    const insertMany = db.transaction(() => {
      for (const item of availability) {
        const existing = db.prepare(
          'SELECT id FROM MemberAvailability WHERE memberId = ? AND mealType = ? AND dayOfWeek = ?'
        ).get(memberId, item.mealType, item.dayOfWeek) as { id: string } | undefined;

        const id = existing?.id ?? generateId();
        stmt.run(id, memberId, item.mealType, item.dayOfWeek, item.isAvailable ? 1 : 0);
      }
    });

    insertMany();

    return {
      memberId,
      recordsSet: availability.length,
    };
  },
});

/**
 * Helper to find member ID by name
 */
function findMemberByName(db: ReturnType<typeof getDatabase>, familyId: string, memberName: string): MemberLookupRow | undefined {
  return db.prepare(
    'SELECT id, name FROM Member WHERE familyId = ? AND LOWER(name) LIKE LOWER(?)'
  ).get(familyId, `%${memberName}%`) as MemberLookupRow | undefined;
}

/**
 * Set availability for a member by name (more user-friendly)
 */
export const setMemberAvailabilityByNameTool = createTool({
  id: 'set-member-availability-by-name',
  description: 'Set whether a member is available for a specific meal on a specific day. Uses member NAME instead of ID for easier use.',
  inputSchema: z.object({
    familyId: z.uuid().describe('The family ID'),
    memberName: z.string().describe('The member name (case-insensitive search)'),
    mealType: z.enum([MealType.breakfast, MealType.lunch, MealType.dinner]).describe('The meal type'),
    dayOfWeek: z.number().int().min(0).max(6).describe('Day of week (0=Sunday, 1=Monday, ..., 6=Saturday)'),
    isAvailable: z.boolean().describe('Whether the member is available for this meal'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    memberName: z.string(),
    message: z.string(),
  }),
  execute: async ({ familyId, memberName, mealType, dayOfWeek, isAvailable }) => {
    const db = getDatabase();

    const member = findMemberByName(db, familyId, memberName);
    if (!member) {
      return { success: false, memberName, message: `Member "${memberName}" not found in this family` };
    }

    const existing = db.prepare(
      'SELECT id FROM MemberAvailability WHERE memberId = ? AND mealType = ? AND dayOfWeek = ?'
    ).get(member.id, mealType, dayOfWeek) as { id: string } | undefined;

    const id = existing?.id ?? generateId();
    db.prepare(
      `INSERT OR REPLACE INTO MemberAvailability (id, memberId, mealType, dayOfWeek, isAvailable)
       VALUES (?, ?, ?, ?, ?)`
    ).run(id, member.id, mealType, dayOfWeek, isAvailable ? 1 : 0);

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
  description: 'Set availability for a member across multiple meals and days at once. Uses member NAME instead of ID. Perfect for setting up initial availability.',
  inputSchema: z.object({
    familyId: z.uuid().describe('The family ID'),
    memberName: z.string().describe('The member name (case-insensitive search)'),
    availability: z.array(z.object({
      mealType: z.enum([MealType.breakfast, MealType.lunch, MealType.dinner]),
      dayOfWeek: z.number().int().min(0).max(6).describe('0=Sunday, 1=Monday, ..., 6=Saturday'),
      isAvailable: z.boolean(),
    })).describe('Array of availability settings'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    memberName: z.string(),
    recordsSet: z.number(),
    message: z.string(),
  }),
  execute: async ({ familyId, memberName, availability }) => {
    const db = getDatabase();

    const member = findMemberByName(db, familyId, memberName);
    if (!member) {
      return { success: false, memberName, recordsSet: 0, message: `Member "${memberName}" not found in this family` };
    }

    const stmt = db.prepare(
      `INSERT OR REPLACE INTO MemberAvailability (id, memberId, mealType, dayOfWeek, isAvailable)
       VALUES (?, ?, ?, ?, ?)`
    );

    const insertMany = db.transaction(() => {
      for (const item of availability) {
        const existing = db.prepare(
          'SELECT id FROM MemberAvailability WHERE memberId = ? AND mealType = ? AND dayOfWeek = ?'
        ).get(member.id, item.mealType, item.dayOfWeek) as { id: string } | undefined;

        const id = existing?.id ?? generateId();
        stmt.run(id, member.id, item.mealType, item.dayOfWeek, item.isAvailable ? 1 : 0);
      }
    });

    insertMany();

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
  outputSchema: z.array(z.object({
    memberId: z.string().uuid(),
    memberName: z.string(),
    isAvailable: z.boolean(),
  })),
  execute: async ({ familyId, mealType, dayOfWeek }) => {
    const db = getDatabase();
    const rows = db.prepare(`
      SELECT m.id as memberId, m.name as memberName, COALESCE(a.isAvailable, 1) as isAvailable
      FROM Member m
      LEFT JOIN MemberAvailability a ON m.id = a.memberId AND a.mealType = ? AND a.dayOfWeek = ?
      WHERE m.familyId = ?
    `).all(mealType, dayOfWeek, familyId) as { memberId: string; memberName: string; isAvailable: number }[];

    return rows.map(row => ({
      memberId: row.memberId,
      memberName: row.memberName,
      isAvailable: row.isAvailable === 1,
    }));
  },
});

