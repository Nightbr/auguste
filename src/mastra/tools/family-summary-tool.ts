import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { getDatabase, Family, Member, PlannerSettings } from '../../domain';

/**
 * Database row types - JSON fields are stored as strings in SQLite
 */
type FamilyRow = Family;

type MemberRow = Omit<Member, 'dietaryRestrictions' | 'allergies' | 'foodPreferences'> & {
  dietaryRestrictions: string;
  allergies: string;
  foodPreferences: string;
};

type PlannerSettingsRow = Omit<PlannerSettings, 'mealTypes' | 'activeDays'> & {
  mealTypes: string;
  activeDays: string;
};

/**
 * Tool to get a complete summary of a family's setup
 */
export const getFamilySummaryTool = createTool({
  id: 'get-family-summary',
  description: 'Get a complete summary of a family including all members and planner settings',
  inputSchema: z.object({
    familyId: z.uuid().describe('The family ID to summarize'),
  }),
  outputSchema: z.object({
    familyFound: z.boolean(),
    familyName: z.string().optional(),
    memberCount: z.number(),
    memberNames: z.array(z.string()),
    settingsFound: z.boolean(),
    isComplete: z.boolean(),
    // Enhanced fields for Agent Context
    family: z.any().optional(),
    members: z.array(z.any()).optional(),
    plannerSettings: z.any().optional(),
    memberAvailability: z.array(z.any()).optional(),
  }),
  execute: async ({ familyId }) => {
    const db = getDatabase();

    const family = db.prepare('SELECT * FROM Family WHERE id = ?').get(familyId) as FamilyRow | undefined;
    const membersRows = db.prepare('SELECT * FROM Member WHERE familyId = ?').all(familyId) as MemberRow[];
    const settingsRow = db.prepare('SELECT * FROM PlannerSettings WHERE familyId = ?').get(familyId) as PlannerSettingsRow | undefined;

    const familyFound = family !== undefined;
    const settingsFound = settingsRow !== undefined;
    const isComplete = familyFound && membersRows.length > 0 && settingsFound;

    // Parse details for context usage
    const members = membersRows.map((m) => ({
      ...m,
      dietaryRestrictions: JSON.parse(m.dietaryRestrictions || '[]'),
      allergies: JSON.parse(m.allergies || '[]'),
      foodPreferences: JSON.parse(m.foodPreferences || '{}'),
    }));

    const plannerSettings = settingsRow
      ? {
          ...settingsRow,
          mealTypes: JSON.parse(settingsRow.mealTypes || '[]'),
          activeDays: JSON.parse(settingsRow.activeDays || '[]'),
        }
      : undefined;

    // Fetch availability
    let memberAvailability: any[] = [];
    if (membersRows.length > 0) {
      const ids = membersRows.map((m) => m.id);
      const placeholders = ids.map(() => '?').join(',');
      memberAvailability = db.prepare(`SELECT * FROM MemberAvailability WHERE memberId IN (${placeholders})`).all(ids);
    }

    return {
      familyFound,
      familyName: family?.name,
      memberCount: membersRows.length,
      memberNames: membersRows.map((m) => m.name),
      settingsFound,
      isComplete,

      // Full details
      family,
      members,
      plannerSettings,
      memberAvailability,
    };
  },
});
