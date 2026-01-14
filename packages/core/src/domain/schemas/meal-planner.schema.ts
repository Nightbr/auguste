import { z } from 'zod';
import { createSelectSchema, createInsertSchema } from 'drizzle-zod';
import { mealPlanning, mealEvent } from '../db/schema.drizzle.js';

export const MealPlanningSchema = createSelectSchema(mealPlanning);
export type MealPlanning = z.infer<typeof MealPlanningSchema>;

export const CreateMealPlanningInputSchema = createInsertSchema(mealPlanning)
  .extend({
    status: z.enum(['draft', 'active', 'completed']).optional(),
  })
  .omit({ id: true, createdAt: true, updatedAt: true });
export type CreateMealPlanningInput = z.infer<typeof CreateMealPlanningInputSchema>;

export const MealEventSchema = createSelectSchema(mealEvent).extend({
  participants: z.array(z.string().uuid()).default([]),
});
export type MealEvent = z.infer<typeof MealEventSchema>;

export const CreateMealEventInputSchema = createInsertSchema(mealEvent)
  .extend({
    participants: z.array(z.string().uuid()).optional(),
    recipeName: z.string().optional(),
    planningId: z.string().uuid(), // Required - events must belong to a planning
  })
  .omit({ id: true, createdAt: true, updatedAt: true });
export type CreateMealEventInput = z.infer<typeof CreateMealEventInputSchema>;
