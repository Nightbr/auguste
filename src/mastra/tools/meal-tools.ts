import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { getDatabase, toJson, parseJson } from '../../domain/db';
import { CreateMealPlanningInputSchema, CreateMealEventInputSchema, MealPlanningSchema, MealEventSchema } from '../../domain/schemas';

export const createMealPlanning = createTool({
  id: 'create-meal-planning',
  description: 'Create a new weekly meal planning cycle',
  inputSchema: CreateMealPlanningInputSchema,
  outputSchema: MealPlanningSchema,
  execute: async ({ familyId, startDate, endDate, status }) => {
    const db = getDatabase();
    const now = new Date().toISOString();
    const id = crypto.randomUUID();

    const planning = {
      id,
      familyId,
      startDate,
      endDate,
      status: status || 'draft',
      createdAt: now,
      updatedAt: now,
    };

    try {
      db.prepare(
        `INSERT INTO MealPlanning (id, familyId, startDate, endDate, status, createdAt, updatedAt)
              VALUES (?, ?, ?, ?, ?, ?, ?)`
      ).run(planning.id, planning.familyId, planning.startDate, planning.endDate, planning.status, planning.createdAt, planning.updatedAt);
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
    const db = getDatabase();
    try {
      const row = db.prepare('SELECT * FROM MealPlanning WHERE id = ?').get(id);
      return (row as any) || null;
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
    const db = getDatabase();
    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    const participantsJson = JSON.stringify(participants || []);

    const event = {
      id,
      familyId,
      planningId,
      date,
      mealType,
      recipeName,
      participants: participants || [],
      createdAt: now,
      updatedAt: now,
    };

    try {
      db.prepare(
        `INSERT INTO MealEvent (id, familyId, planningId, date, mealType, recipeName, participants, createdAt, updatedAt)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        event.id,
        event.familyId,
        event.planningId,
        event.date,
        event.mealType,
        event.recipeName,
        participantsJson,
        event.createdAt,
        event.updatedAt
      );
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
    const db = getDatabase();
    const now = new Date().toISOString();

    // Check if event exists
    const currentEvent = db.prepare('SELECT * FROM MealEvent WHERE id = ?').get(id);

    if (!currentEvent) {
      throw new Error(`Meal event with id ${id} not found`);
    }

    const updates: string[] = [];
    const args: any[] = [];

    if (recipeName !== undefined) {
      updates.push('recipeName = ?');
      args.push(recipeName);
    }
    if (participants !== undefined) {
      updates.push('participants = ?');
      args.push(JSON.stringify(participants));
    }

    if (updates.length > 0) {
      updates.push('updatedAt = ?');
      args.push(now);
      args.push(id);

      try {
        db.prepare(`UPDATE MealEvent SET ${updates.join(', ')} WHERE id = ?`).run(...args);

        // Fetch updated
        const updatedEvent = db.prepare('SELECT * FROM MealEvent WHERE id = ?').get(id) as any;
        updatedEvent.participants = JSON.parse(updatedEvent.participants);
        return updatedEvent;
      } catch (error) {
        console.error('Error updating meal event:', error);
        throw new Error('Failed to update meal event');
      }
    }

    // Return existing if no updates
    const event = currentEvent as any;
    event.participants = JSON.parse(event.participants);
    return event;
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
    const db = getDatabase();
    try {
      const rows = db
        .prepare('SELECT * FROM MealEvent WHERE familyId = ? AND date >= ? AND date <= ? ORDER BY date ASC')
        .all(familyId, startDate, endDate);

      return rows.map((row: any) => ({
        ...row,
        participants: JSON.parse(row.participants),
      }));
    } catch (error) {
      console.error('Error getting meal events:', error);
      throw new Error('Failed to get meal events');
    }
  },
});
