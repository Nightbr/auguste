import { createTool } from '@mastra/core/tools';
import { eq, and, sql } from 'drizzle-orm';
import { z } from 'zod';
import {
  db,
  schema,
  generateId,
  now,
  CreateMemberInputSchema,
  UpdateMemberInputSchema,
  MemberSchema,
  CookingSkillLevel,
  MemberType,
  BirthdateSchema,
  FoodPreferencesLikesSchema,
  FoodPreferencesDislikesSchema,
} from '../../domain';

/**
 * Create a new family member
 */
export const createMemberTool = createTool({
  id: 'create-member',
  description: 'Add a new member to a family with their dietary info and preferences',
  inputSchema: CreateMemberInputSchema,
  outputSchema: MemberSchema,
  execute: async (input) => {
    const id = generateId();
    const timestamp = now();

    const [newMember] = await db
      .insert(schema.member)
      .values({
        id,
        familyId: input.familyId,
        name: input.name,
        type: input.type,
        birthdate: input.birthdate,
        dietaryRestrictions: input.dietaryRestrictions ?? [],
        allergies: input.allergies ?? [],
        foodPreferencesLikes: input.foodPreferencesLikes ?? [],
        foodPreferencesDislikes: input.foodPreferencesDislikes ?? [],
        cookingSkillLevel: input.cookingSkillLevel ?? CookingSkillLevel.none,
        createdAt: timestamp,
        updatedAt: timestamp,
      })
      .returning();

    return newMember;
  },
});

/**
 * Get all members of a family
 */
export const getMembersTool = createTool({
  id: 'get-members',
  description: 'Get all members of a family',
  inputSchema: z.object({
    familyId: z.uuid().describe('The family ID'),
  }),
  outputSchema: z.array(MemberSchema),
  execute: async ({ familyId }) => {
    const rows = await db.query.member.findMany({
      where: eq(schema.member.familyId, familyId),
    });
    return rows;
  },
});

/**
 * Get a single member by ID
 */
export const getMemberTool = createTool({
  id: 'get-member',
  description: 'Get a family member by their ID. Returns found=false if not found.',
  inputSchema: z.object({
    id: z.uuid().describe('The member ID'),
  }),
  outputSchema: z.object({
    found: z.boolean(),
    member: MemberSchema.optional(),
  }),
  execute: async ({ id }) => {
    const member = await db.query.member.findFirst({
      where: eq(schema.member.id, id),
    });
    if (!member) return { found: false };
    return { found: true, member };
  },
});

/**
 * Search for a member by name within a family
 */
export const getMemberByNameTool = createTool({
  id: 'get-member-by-name',
  description:
    'Find a family member by their name. Uses case-insensitive search. Returns the member if found.',
  inputSchema: z.object({
    familyId: z.uuid().describe('The family ID to search within'),
    name: z
      .string()
      .describe('The member name to search for (case-insensitive, partial match supported)'),
  }),
  outputSchema: z.object({
    found: z.boolean(),
    member: MemberSchema.optional(),
  }),
  execute: async ({ familyId, name }) => {
    const member = await db.query.member.findFirst({
      where: and(
        eq(schema.member.familyId, familyId),
        sql`lower(${schema.member.name}) LIKE lower(${`%${name}%`})`,
      ),
    });
    if (!member) return { found: false };
    return { found: true, member };
  },
});

/**
 * Update a family member by ID
 */
export const updateMemberTool = createTool({
  id: 'update-member',
  description:
    "Update a family member's information by member ID. Returns found=false if not found. Prefer updateMemberByNameTool if you only know the member name.",
  inputSchema: UpdateMemberInputSchema,
  outputSchema: z.object({
    found: z.boolean(),
    member: MemberSchema.optional(),
  }),
  execute: async (input) => {
    const timestamp = now();

    const updates: Partial<typeof schema.member.$inferInsert> = { updatedAt: timestamp };

    if (input.name !== undefined) updates.name = input.name;
    if (input.type !== undefined) updates.type = input.type;
    if (input.birthdate !== undefined) updates.birthdate = input.birthdate;
    if (input.dietaryRestrictions !== undefined)
      updates.dietaryRestrictions = input.dietaryRestrictions;
    if (input.allergies !== undefined) updates.allergies = input.allergies;
    if (input.foodPreferencesLikes !== undefined)
      updates.foodPreferencesLikes = input.foodPreferencesLikes;
    if (input.foodPreferencesDislikes !== undefined)
      updates.foodPreferencesDislikes = input.foodPreferencesDislikes;
    if (input.cookingSkillLevel !== undefined) updates.cookingSkillLevel = input.cookingSkillLevel;

    const [updatedMember] = await db
      .update(schema.member)
      .set(updates)
      .where(eq(schema.member.id, input.id))
      .returning();

    if (!updatedMember) return { found: false };
    return { found: true, member: updatedMember };
  },
});

/**
 * Array merge mode schema for smart updating of array fields
 * - 'add': Add new items to existing array without duplicates (default)
 * - 'remove': Remove specified items from existing array
 * - 'replace': Replace entire array with new values
 */
const ArrayMergeModeSchema = z.enum(['add', 'remove', 'replace']).default('add');

/**
 * Helper function to merge arrays based on mode
 */
function mergeArrays(
  existing: string[],
  newItems: string[],
  mode: 'add' | 'remove' | 'replace',
): string[] {
  switch (mode) {
    case 'add':
      // Add new items without duplicates (case-insensitive)
      const existingLower = existing.map((item) => item.toLowerCase());
      const itemsToAdd = newItems.filter((item) => !existingLower.includes(item.toLowerCase()));
      return [...existing, ...itemsToAdd];
    case 'remove':
      // Remove items (case-insensitive)
      const toRemoveLower = newItems.map((item) => item.toLowerCase());
      return existing.filter((item) => !toRemoveLower.includes(item.toLowerCase()));
    case 'replace':
      // Replace entirely
      return newItems;
    default:
      return existing;
  }
}

/**
 * Input schema for updating a member by name with smart merging
 */
const UpdateMemberByNameInputSchema = z.object({
  familyId: z.uuid().describe('The family ID the member belongs to'),
  memberName: z
    .string()
    .describe('The name of the member to update (case-insensitive, partial match supported)'),
  name: z.string().min(1).optional().describe('New name for the member'),
  type: z.nativeEnum(MemberType).optional().describe('Member type: adult or child'),
  birthdate: BirthdateSchema.optional().describe('Member birthdate with optional day, month, year'),
  dietaryRestrictions: z
    .array(z.string())
    .optional()
    .describe('Dietary restrictions to add/remove/replace (e.g., vegetarian, gluten-free)'),
  dietaryRestrictionsMode: ArrayMergeModeSchema.optional().describe(
    'How to merge dietary restrictions: add (default), remove, or replace',
  ),
  allergies: z.array(z.string()).optional().describe('Food allergies to add/remove/replace'),
  allergiesMode: ArrayMergeModeSchema.optional().describe(
    'How to merge allergies: add (default), remove, or replace',
  ),
  foodPreferencesLikes: FoodPreferencesLikesSchema.optional().describe(
    'Food likes to add/remove/replace',
  ),
  foodPreferencesLikesMode: ArrayMergeModeSchema.optional().describe(
    'How to merge food likes: add (default), remove, or replace',
  ),
  foodPreferencesDislikes: FoodPreferencesDislikesSchema.optional().describe(
    'Food dislikes to add/remove/replace',
  ),
  foodPreferencesDislikesMode: ArrayMergeModeSchema.optional().describe(
    'How to merge food dislikes: add (default), remove, or replace',
  ),
  cookingSkillLevel: z
    .nativeEnum(CookingSkillLevel)
    .optional()
    .describe('Cooking skill level: none, beginner, intermediate, advanced'),
});

/**
 * Update a family member by name (preferred for onboarding)
 * Supports smart merging of array fields with add/remove/replace modes
 */
export const updateMemberByNameTool = createTool({
  id: 'update-member-by-name',
  description: `Update a family member's information using familyId and memberName. Supports smart merging for array fields (dietaryRestrictions, allergies, foodPreferencesLikes, foodPreferencesDislikes).

SMART MERGING: For each array field, you can specify a mode:
- 'add' (default): Add new items to existing array without duplicates
- 'remove': Remove specified items from existing array
- 'replace': Replace entire array with new values

Examples:
- Add a like: { foodPreferencesLikes: ["pasta"], foodPreferencesLikesMode: "add" }
- Remove a dislike: { foodPreferencesDislikes: ["mushrooms"], foodPreferencesDislikesMode: "remove" }
- Replace all allergies: { allergies: ["peanuts"], allergiesMode: "replace" }

Uses case-insensitive name matching. Returns found=false if no member with that name exists.`,
  inputSchema: UpdateMemberByNameInputSchema,
  outputSchema: z.object({
    found: z.boolean(),
    member: MemberSchema.optional(),
  }),
  execute: async (input) => {
    const timestamp = now();

    // First find the member by name
    const existingMember = await db.query.member.findFirst({
      where: and(
        eq(schema.member.familyId, input.familyId),
        sql`lower(${schema.member.name}) LIKE lower(${`%${input.memberName}%`})`,
      ),
    });

    if (!existingMember) return { found: false };

    const updates: Partial<typeof schema.member.$inferInsert> = { updatedAt: timestamp };

    // Simple field updates
    if (input.name !== undefined) updates.name = input.name;
    if (input.type !== undefined) updates.type = input.type;
    if (input.birthdate !== undefined) updates.birthdate = input.birthdate;
    if (input.cookingSkillLevel !== undefined) updates.cookingSkillLevel = input.cookingSkillLevel;

    // Smart merge for array fields
    if (input.dietaryRestrictions !== undefined) {
      const mode = input.dietaryRestrictionsMode ?? 'add';
      updates.dietaryRestrictions = mergeArrays(
        existingMember.dietaryRestrictions ?? [],
        input.dietaryRestrictions,
        mode,
      );
    }

    if (input.allergies !== undefined) {
      const mode = input.allergiesMode ?? 'add';
      updates.allergies = mergeArrays(existingMember.allergies ?? [], input.allergies, mode);
    }

    if (input.foodPreferencesLikes !== undefined) {
      const mode = input.foodPreferencesLikesMode ?? 'add';
      updates.foodPreferencesLikes = mergeArrays(
        existingMember.foodPreferencesLikes ?? [],
        input.foodPreferencesLikes,
        mode,
      );
    }

    if (input.foodPreferencesDislikes !== undefined) {
      const mode = input.foodPreferencesDislikesMode ?? 'add';
      updates.foodPreferencesDislikes = mergeArrays(
        existingMember.foodPreferencesDislikes ?? [],
        input.foodPreferencesDislikes,
        mode,
      );
    }

    const [updatedMember] = await db
      .update(schema.member)
      .set(updates)
      .where(eq(schema.member.id, existingMember.id))
      .returning();

    if (!updatedMember) return { found: false };
    return { found: true, member: updatedMember };
  },
});

/**
 * Delete a family member
 */
export const deleteMemberTool = createTool({
  id: 'delete-member',
  description: 'Remove a member from the family',
  inputSchema: z.object({ id: z.uuid().describe('The member ID to delete') }),
  outputSchema: z.object({ success: z.boolean(), deletedId: z.uuid() }),
  execute: async ({ id }) => {
    const result = await db
      .delete(schema.member)
      .where(eq(schema.member.id, id))
      .returning({ id: schema.member.id });
    return { success: result.length > 0, deletedId: id };
  },
});
