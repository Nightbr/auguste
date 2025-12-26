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
  }),
  execute: async ({ familyId }) => {
    const db = getDatabase();

    const family = db.prepare('SELECT * FROM Family WHERE id = ?').get(familyId) as FamilyRow | undefined;
    const members = db.prepare('SELECT * FROM Member WHERE familyId = ?').all(familyId) as MemberRow[];
    const settings = db.prepare('SELECT * FROM PlannerSettings WHERE familyId = ?').get(familyId) as
      | PlannerSettingsRow
      | undefined;

    const familyFound = family !== undefined;
    const settingsFound = settings !== undefined;
    const isComplete = familyFound && members.length > 0 && settingsFound;

    return {
      familyFound,
      familyName: family?.name,
      memberCount: members.length,
      memberNames: members.map((m) => m.name),
      settingsFound,
      isComplete,
    };
  },
});

