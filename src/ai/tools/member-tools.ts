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
        foodPreferences: input.foodPreferences ?? { likes: [], dislikes: [] },
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
  description: 'Find a family member by their name. Uses case-insensitive search. Returns the member if found.',
  inputSchema: z.object({
    familyId: z.uuid().describe('The family ID to search within'),
    name: z.string().describe('The member name to search for (case-insensitive, partial match supported)'),
  }),
  outputSchema: z.object({
    found: z.boolean(),
    member: MemberSchema.optional(),
  }),
  execute: async ({ familyId, name }) => {
    const member = await db.query.member.findFirst({
      where: and(eq(schema.member.familyId, familyId), sql`lower(${schema.member.name}) LIKE lower(${`%${name}%`})`),
    });
    if (!member) return { found: false };
    return { found: true, member };
  },
});

/**
 * Update a family member
 */
export const updateMemberTool = createTool({
  id: 'update-member',
  description: "Update a family member's information. Returns found=false if not found.",
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
    if (input.dietaryRestrictions !== undefined) updates.dietaryRestrictions = input.dietaryRestrictions;
    if (input.allergies !== undefined) updates.allergies = input.allergies;
    if (input.foodPreferences !== undefined) updates.foodPreferences = input.foodPreferences;
    if (input.cookingSkillLevel !== undefined) updates.cookingSkillLevel = input.cookingSkillLevel;

    const [updatedMember] = await db.update(schema.member).set(updates).where(eq(schema.member.id, input.id)).returning();

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
    const result = await db.delete(schema.member).where(eq(schema.member.id, id)).returning({ id: schema.member.id });
    return { success: result.length > 0, deletedId: id };
  },
});
