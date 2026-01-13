import { createTool } from '@mastra/core/tools';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import {
  db,
  schema,
  generateId,
  now,
  CreateFamilyInputSchema,
  UpdateFamilyInputSchema,
  FamilySchema,
} from '../../domain';

/**
 * Create a new family
 */
export const createFamilyTool = createTool({
  id: 'create-family',
  description:
    'Create a new family/household. IMPORTANT: country must be a 2-letter ISO code (e.g., "US", "FR", "DE") NOT the full country name. Language must also be a 2-letter ISO code (e.g., "en", "fr").',
  inputSchema: CreateFamilyInputSchema,
  outputSchema: FamilySchema,
  execute: async ({ name, country, language }) => {
    const id = generateId();
    const timestamp = now();

    const [newFamily] = await db
      .insert(schema.family)
      .values({
        id,
        name,
        country: country.toUpperCase(),
        language: language.toLowerCase(),
        createdAt: timestamp,
        updatedAt: timestamp,
      })
      .returning();

    // Create default planner settings for the new family
    await db.insert(schema.plannerSettings).values({
      id: generateId(),
      familyId: id,
      mealTypes: ['lunch', 'dinner'],
      activeDays: [0, 1, 2, 3, 4, 5, 6],
      notificationCron: '0 18 * * 0',
      timezone: 'UTC',
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    return newFamily;
  },
});

/**
 * Get a family by ID
 */
export const getFamilyTool = createTool({
  id: 'get-family',
  description: 'Get a family by its ID. Returns found=false if not found.',
  inputSchema: z.object({
    id: z.uuid().describe('The family ID'),
  }),
  outputSchema: z.object({
    found: z.boolean(),
    family: FamilySchema.optional(),
  }),
  execute: async ({ id }) => {
    const family = await db.query.family.findFirst({
      where: eq(schema.family.id, id),
    });

    if (!family) return { found: false };

    return {
      found: true,
      family,
    };
  },
});

/**
 * Update a family
 */
export const updateFamilyTool = createTool({
  id: 'update-family',
  description: "Update a family's name, country, or language. Returns found=false if not found.",
  inputSchema: UpdateFamilyInputSchema,
  outputSchema: z.object({
    found: z.boolean(),
    family: FamilySchema.optional(),
  }),
  execute: async ({ id, name, country, language }) => {
    const timestamp = now();
    const updates: Partial<typeof schema.family.$inferInsert> = { updatedAt: timestamp };

    if (name !== undefined) updates.name = name;
    if (country !== undefined) updates.country = country.toUpperCase();
    if (language !== undefined) updates.language = language.toLowerCase();

    const [updatedFamily] = await db
      .update(schema.family)
      .set(updates)
      .where(eq(schema.family.id, id))
      .returning();

    if (!updatedFamily) return { found: false };

    return {
      found: true,
      family: updatedFamily,
    };
  },
});

/**
 * Delete a family and all related data
 */
export const deleteFamilyTool = createTool({
  id: 'delete-family',
  description: 'Delete a family and all its members, settings, and availability data',
  inputSchema: z.object({
    id: z.uuid().describe('The family ID to delete'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    deletedId: z.uuid(),
  }),
  execute: async ({ id }) => {
    const result = await db
      .delete(schema.family)
      .where(eq(schema.family.id, id))
      .returning({ id: schema.family.id });

    return {
      success: result.length > 0,
      deletedId: id,
    };
  },
});
