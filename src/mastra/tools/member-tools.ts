import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import {
  getDatabase,
  generateId,
  now,
  parseJson,
  toJson,
  CreateMemberInputSchema,
  UpdateMemberInputSchema,
  MemberSchema,
  FoodPreferences,
  CookingSkillLevel,
  Member,
  Birthdate,
} from '../../domain';

/**
 * Database row type - JSON fields are stored as strings in SQLite
 */
type MemberRow = Omit<Member, 'dietaryRestrictions' | 'allergies' | 'foodPreferences' | 'birthdate'> & {
  dietaryRestrictions: string;
  allergies: string;
  foodPreferences: string;
  birthdate: string | null;
};

function rowToMember(row: MemberRow) {
  return {
    id: row.id,
    familyId: row.familyId,
    name: row.name,
    type: row.type,
    birthdate: row.birthdate ? parseJson<Birthdate>(row.birthdate, undefined) : undefined,
    dietaryRestrictions: parseJson<string[]>(row.dietaryRestrictions, []),
    allergies: parseJson<string[]>(row.allergies, []),
    foodPreferences: parseJson<FoodPreferences>(row.foodPreferences, { likes: [], dislikes: [] }),
    cookingSkillLevel: row.cookingSkillLevel as (typeof CookingSkillLevel)[keyof typeof CookingSkillLevel],
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/**
 * Create a new family member
 */
export const createMemberTool = createTool({
  id: 'create-member',
  description: 'Add a new member to a family with their dietary info and preferences',
  inputSchema: CreateMemberInputSchema,
  outputSchema: MemberSchema,
  execute: async (input) => {
    const db = getDatabase();
    const id = generateId();
    const timestamp = now();

    const member = {
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
    };

    db.prepare(
      `INSERT INTO Member (id, familyId, name, type, birthdate, dietaryRestrictions, allergies, foodPreferences, cookingSkillLevel, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      member.id,
      member.familyId,
      member.name,
      member.type,
      member.birthdate ? toJson(member.birthdate) : null,
      toJson(member.dietaryRestrictions),
      toJson(member.allergies),
      toJson(member.foodPreferences),
      member.cookingSkillLevel,
      member.createdAt,
      member.updatedAt
    );

    return member;
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
    const db = getDatabase();
    const rows = db.prepare('SELECT * FROM Member WHERE familyId = ?').all(familyId) as MemberRow[];
    return rows.map(rowToMember);
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
    const db = getDatabase();
    const row = db.prepare('SELECT * FROM Member WHERE id = ?').get(id) as MemberRow | undefined;
    if (!row) return { found: false };
    return { found: true, member: rowToMember(row) };
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
    const db = getDatabase();
    // Use LIKE for partial matching, LOWER for case-insensitive
    const row = db.prepare('SELECT * FROM Member WHERE familyId = ? AND LOWER(name) LIKE LOWER(?)').get(familyId, `%${name}%`) as
      | MemberRow
      | undefined;
    if (!row) return { found: false };
    return { found: true, member: rowToMember(row) };
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
    const db = getDatabase();
    const timestamp = now();

    const updates: string[] = ['updatedAt = ?'];
    const values: unknown[] = [timestamp];

    if (input.name !== undefined) {
      updates.push('name = ?');
      values.push(input.name);
    }
    if (input.type !== undefined) {
      updates.push('type = ?');
      values.push(input.type);
    }
    if (input.birthdate !== undefined) {
      updates.push('birthdate = ?');
      values.push(input.birthdate ? toJson(input.birthdate) : null);
    }
    if (input.dietaryRestrictions !== undefined) {
      updates.push('dietaryRestrictions = ?');
      values.push(toJson(input.dietaryRestrictions));
    }
    if (input.allergies !== undefined) {
      updates.push('allergies = ?');
      values.push(toJson(input.allergies));
    }
    if (input.foodPreferences !== undefined) {
      updates.push('foodPreferences = ?');
      values.push(toJson(input.foodPreferences));
    }
    if (input.cookingSkillLevel !== undefined) {
      updates.push('cookingSkillLevel = ?');
      values.push(input.cookingSkillLevel);
    }

    values.push(input.id);
    db.prepare(`UPDATE Member SET ${updates.join(', ')} WHERE id = ?`).run(...values);

    const row = db.prepare('SELECT * FROM Member WHERE id = ?').get(input.id) as MemberRow | undefined;
    if (!row) return { found: false };
    return { found: true, member: rowToMember(row) };
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
    const db = getDatabase();
    const result = db.prepare('DELETE FROM Member WHERE id = ?').run(id);
    return { success: result.changes > 0, deletedId: id };
  },
});
