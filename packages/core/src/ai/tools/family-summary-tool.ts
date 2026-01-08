import { createTool } from '@mastra/core/tools';
import { eq, inArray } from 'drizzle-orm';
import { z } from 'zod';
import { db, schema } from '../../domain';

/**
 * Tool to get a complete summary of a family's setup
 *
 * SECURITY: This tool requires familyId to be provided as a parameter.
 * The agent must pass the familyId from its requestContext.
 */
export const getFamilySummaryTool = createTool({
  id: 'get-family-summary',
  description:
    'Get a complete summary of a family including all members and planner settings. REQUIRED: You must provide the familyId parameter.',
  inputSchema: z.object({
    familyId: z.uuid().describe('The family ID - REQUIRED. Get this from your requestContext.'),
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
    const family = await db.query.family.findFirst({
      where: eq(schema.family.id, familyId),
    });

    const members = await db.query.member.findMany({
      where: eq(schema.member.familyId, familyId),
    });

    const plannerSettings = await db.query.plannerSettings.findFirst({
      where: eq(schema.plannerSettings.familyId, familyId),
    });

    const familyFound = family !== undefined;
    const settingsFound = plannerSettings !== undefined;
    const isComplete = familyFound && members.length > 0 && settingsFound;

    // Fetch availability
    let memberAvailability: (typeof schema.memberAvailability.$inferSelect)[] = [];
    if (members.length > 0) {
      const ids = members.map((m) => m.id);
      memberAvailability = await db.query.memberAvailability.findMany({
        where: inArray(schema.memberAvailability.memberId, ids),
      });
    }

    return {
      familyFound,
      familyName: family?.name,
      memberCount: members.length,
      memberNames: members.map((m) => m.name),
      settingsFound,
      isComplete,

      // Full details (Drizzle handles JSON parsing automatically)
      family,
      members,
      plannerSettings,
      memberAvailability,
    };
  },
});
