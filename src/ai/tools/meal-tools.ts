import { createTool } from '@mastra/core/tools';
import { eq, and, gte, lte, asc } from 'drizzle-orm';
import { z } from 'zod';
import { db, schema, generateId, now } from '../../domain';
import { CreateMealPlanningInputSchema, CreateMealEventInputSchema, MealPlanningSchema, MealEventSchema } from '../../domain/schemas';

export const createMealPlanning = createTool({
  id: 'create-meal-planning',
  description: 'Create a new weekly meal planning cycle',
  inputSchema: CreateMealPlanningInputSchema,
  outputSchema: MealPlanningSchema,
  execute: async ({ familyId, startDate, endDate, status }) => {
    const id = generateId();
    const timestamp = now();

    try {
      const [planning] = await db
        .insert(schema.mealPlanning)
        .values({
          id,
          familyId,
          startDate,
          endDate,
          status: status || 'draft',
          createdAt: timestamp,
          updatedAt: timestamp,
        })
        .returning();

      return planning;
    } catch (error) {
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
      return planning || null;
    } catch (error) {
      console.error('Error getting meal planning:', error);
      throw new Error('Failed to get meal planning');
    }
  },
});

export const createMealEvent = createTool({
  id: 'create-meal-event',
  description: 'Create a single meal event',
  inputSchema: CreateMealEventInputSchema,
  outputSchema: MealEventSchema,
  execute: async ({ familyId, planningId, date, mealType, recipeName, participants }) => {
    const id = generateId();
    const timestamp = now();

    try {
      const [event] = await db
        .insert(schema.mealEvent)
        .values({
          id,
          familyId,
          planningId,
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
      const [updatedEvent] = await db.update(schema.mealEvent).set(updates).where(eq(schema.mealEvent.id, id)).returning();

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
        where: and(eq(schema.mealEvent.familyId, familyId), gte(schema.mealEvent.date, startDate), lte(schema.mealEvent.date, endDate)),
        orderBy: [asc(schema.mealEvent.date)],
      });

      return rows;
    } catch (error) {
      console.error('Error getting meal events:', error);
      throw new Error('Failed to get meal events');
    }
  },
});
