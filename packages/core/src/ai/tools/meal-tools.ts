import { createTool } from '@mastra/core/tools';
import { eq, and, gte, lte, asc } from 'drizzle-orm';
import { z } from 'zod';
import { db, schema, generateId, now } from '../../domain';
import {
  CreateMealPlanningInputSchema,
  MealPlanningSchema,
  MealEventSchema,
} from '../../domain/schemas/meal-planner.schema';
import {
  createMealPlanning as createMealPlanningService,
  updateMealPlanning as updateMealPlanningService,
  findOrCreateMealPlanningForDate,
  MealPlanningOverlapError,
} from '../../domain/services/meal-planning-service';

// Input schema for createMealEvent - planningId is optional because we auto-find/create it
const CreateMealEventToolInputSchema = z.object({
  familyId: z.string().uuid().describe('The family ID'),
  date: z.string().describe('The date of the meal (YYYY-MM-DD)'),
  mealType: z.enum(['breakfast', 'lunch', 'dinner']).describe('The type of meal'),
  recipeName: z.string().optional().describe('The name of the recipe'),
  participants: z.array(z.string().uuid()).optional().describe('Array of member IDs participating'),
  planningId: z
    .string()
    .uuid()
    .optional()
    .describe('Optional: The meal planning ID. If not provided, will auto-find or create one.'),
});

export const createMealPlanning = createTool({
  id: 'create-meal-planning',
  description:
    'Create a new weekly meal planning cycle. Will fail if the date range overlaps with an existing planning for the same family.',
  inputSchema: CreateMealPlanningInputSchema,
  outputSchema: MealPlanningSchema,
  execute: async (input) => {
    try {
      return await createMealPlanningService(input);
    } catch (error) {
      if (error instanceof MealPlanningOverlapError) {
        // Provide a user-friendly error message for the AI agent
        const dates = error.conflictingPlannings
          .map((p) => `${p.startDate} to ${p.endDate}`)
          .join(', ');
        throw new Error(
          `Cannot create meal planning: date range overlaps with existing planning(s): ${dates}. Please choose different dates.`,
        );
      }
      console.error('Error creating meal planning:', error);
      throw new Error('Failed to create meal planning');
    }
  },
});

export const getMealPlanning = createTool({
  id: 'get-meal-planning',
  description: 'Get meal planning by ID',
  inputSchema: z.object({ id: z.string() }),
  outputSchema: MealPlanningSchema.nullable(),
  execute: async ({ id }) => {
    try {
      const planning = await db.query.mealPlanning.findFirst({
        where: eq(schema.mealPlanning.id, id),
      });
      return (planning || null) as any;
    } catch (error) {
      console.error('Error getting meal planning:', error);
      throw new Error('Failed to get meal planning');
    }
  },
});

export const createMealEvent = createTool({
  id: 'create-meal-event',
  description:
    'Create a single meal event. The event will be automatically associated with a meal planning. If no planning exists for the event date, a new weekly planning will be created.',
  inputSchema: CreateMealEventToolInputSchema,
  outputSchema: MealEventSchema,
  execute: async ({ familyId, planningId, date, mealType, recipeName, participants }) => {
    const id = generateId();
    const timestamp = now();

    try {
      // Find or create a meal planning for this date
      let effectivePlanningId = planningId;
      if (!effectivePlanningId) {
        const planning = await findOrCreateMealPlanningForDate(familyId, date);
        effectivePlanningId = planning.id;
      }

      const [event] = await db
        .insert(schema.mealEvent)
        .values({
          id,
          familyId,
          planningId: effectivePlanningId,
          date,
          mealType,
          recipeName,
          participants: participants || [],
          createdAt: timestamp,
          updatedAt: timestamp,
        })
        .returning();

      return event;
    } catch (error) {
      console.error('Error creating meal event:', error);
      throw new Error('Failed to create meal event');
    }
  },
});

export const updateMealEvent = createTool({
  id: 'update-meal-event',
  description: 'Update a meal event',
  inputSchema: z.object({
    id: z.string(),
    recipeName: z.string().optional(),
    participants: z.array(z.string()).optional(),
  }),
  outputSchema: MealEventSchema,
  execute: async ({ id, recipeName, participants }) => {
    const timestamp = now();

    const updates: Partial<typeof schema.mealEvent.$inferInsert> = { updatedAt: timestamp };

    if (recipeName !== undefined) updates.recipeName = recipeName;
    if (participants !== undefined) updates.participants = participants;

    try {
      const [updatedEvent] = await db
        .update(schema.mealEvent)
        .set(updates)
        .where(eq(schema.mealEvent.id, id))
        .returning();

      if (!updatedEvent) {
        throw new Error(`Meal event with id ${id} not found`);
      }

      return updatedEvent;
    } catch (error) {
      console.error('Error updating meal event:', error);
      throw new Error('Failed to update meal event');
    }
  },
});

export const getMealEvents = createTool({
  id: 'get-meal-events',
  description: 'Get meal events for a family within a date range',
  inputSchema: z.object({
    familyId: z.string(),
    startDate: z.string(),
    endDate: z.string(),
  }),
  outputSchema: z.array(MealEventSchema),
  execute: async ({ familyId, startDate, endDate }) => {
    try {
      const rows = await db.query.mealEvent.findMany({
        where: and(
          eq(schema.mealEvent.familyId, familyId),
          gte(schema.mealEvent.date, startDate),
          lte(schema.mealEvent.date, endDate),
        ),
        orderBy: [asc(schema.mealEvent.date)],
      });

      return rows;
    } catch (error) {
      console.error('Error getting meal events:', error);
      throw new Error('Failed to get meal events');
    }
  },
});

export const updateMealPlanning = createTool({
  id: 'update-meal-planning',
  description:
    'Update a meal planning cycle. Can update status (draft/active/completed) or dates. Will fail if new dates overlap with another planning.',
  inputSchema: z.object({
    id: z.string().describe('The meal planning ID'),
    status: z
      .enum(['draft', 'active', 'completed'])
      .optional()
      .describe('New status for the meal planning'),
    startDate: z.string().optional().describe('New start date (YYYY-MM-DD)'),
    endDate: z.string().optional().describe('New end date (YYYY-MM-DD)'),
  }),
  outputSchema: MealPlanningSchema,
  execute: async ({ id, status, startDate, endDate }) => {
    try {
      return await updateMealPlanningService(id, { status, startDate, endDate });
    } catch (error) {
      if (error instanceof MealPlanningOverlapError) {
        const dates = error.conflictingPlannings
          .map((p) => `${p.startDate} to ${p.endDate}`)
          .join(', ');
        throw new Error(
          `Cannot update meal planning: new date range overlaps with existing planning(s): ${dates}. Please choose different dates.`,
        );
      }
      console.error('Error updating meal planning:', error);
      throw error;
    }
  },
});

export const deleteMealEvent = createTool({
  id: 'delete-meal-event',
  description:
    'Delete a meal event. Used during the refinement phase when user wants to remove a planned meal.',
  inputSchema: z.object({
    id: z.string().describe('The meal event ID to delete'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    deletedId: z.string(),
  }),
  execute: async ({ id }) => {
    try {
      const result = await db.delete(schema.mealEvent).where(eq(schema.mealEvent.id, id));

      if (result.changes === 0) {
        throw new Error(`Meal event with id ${id} not found`);
      }

      return { success: true, deletedId: id };
    } catch (error) {
      console.error('Error deleting meal event:', error);
      throw new Error('Failed to delete meal event');
    }
  },
});
