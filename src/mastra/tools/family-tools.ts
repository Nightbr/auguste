import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import {
  getDatabase,
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
  description: 'Create a new family/household. IMPORTANT: country must be a 2-letter ISO code (e.g., "US", "FR", "DE") NOT the full country name. Language must also be a 2-letter ISO code (e.g., "en", "fr").',
  inputSchema: CreateFamilyInputSchema,
  outputSchema: FamilySchema,
  execute: async ({ name, country, language }) => {
    const db = getDatabase();
    const id = generateId();
    const timestamp = now();

    db.prepare(
      `INSERT INTO Family (id, name, country, language, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(id, name, country.toUpperCase(), language.toLowerCase(), timestamp, timestamp);

    return {
      id,
      name,
      country: country.toUpperCase(),
      language: language.toLowerCase(),
      createdAt: timestamp,
      updatedAt: timestamp,
    };
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
    const db = getDatabase();
    const row = db.prepare('SELECT * FROM Family WHERE id = ?').get(id) as {
      id: string;
      name: string;
      country: string;
      language: string;
      createdAt: string;
      updatedAt: string;
    } | undefined;

    if (!row) return { found: false };

    return {
      found: true,
      family: {
        id: row.id,
        name: row.name,
        country: row.country,
        language: row.language,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      },
    };
  },
});

/**
 * Update a family
 */
export const updateFamilyTool = createTool({
  id: 'update-family',
  description: 'Update a family\'s name, country, or language. Returns found=false if not found.',
  inputSchema: UpdateFamilyInputSchema,
  outputSchema: z.object({
    found: z.boolean(),
    family: FamilySchema.optional(),
  }),
  execute: async ({ id, name, country, language }) => {
    const db = getDatabase();
    const timestamp = now();

    // Build dynamic update query
    const updates: string[] = ['updatedAt = ?'];
    const values: (string | undefined)[] = [timestamp];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (country !== undefined) {
      updates.push('country = ?');
      values.push(country.toUpperCase());
    }
    if (language !== undefined) {
      updates.push('language = ?');
      values.push(language.toLowerCase());
    }

    values.push(id);
    db.prepare(`UPDATE Family SET ${updates.join(', ')} WHERE id = ?`).run(...values);

    // Return updated family
    const row = db.prepare('SELECT * FROM Family WHERE id = ?').get(id) as {
      id: string;
      name: string;
      country: string;
      language: string;
      createdAt: string;
      updatedAt: string;
    } | undefined;

    if (!row) return { found: false };

    return {
      found: true,
      family: {
        id: row.id,
        name: row.name,
        country: row.country,
        language: row.language,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      },
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
    const db = getDatabase();
    const result = db.prepare('DELETE FROM Family WHERE id = ?').run(id);

    return {
      success: result.changes > 0,
      deletedId: id,
    };
  },
});

