import { z } from 'zod';

export const MealPlanningSchema = z.object({
  id: z.string().uuid(),
  familyId: z.string().uuid(),
  startDate: z.string().date(), // YYYY-MM-DD
  endDate: z.string().date(), // YYYY-MM-DD
  status: z.enum(['draft', 'active', 'completed']).default('draft'),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type MealPlanning = z.infer<typeof MealPlanningSchema>;

export const CreateMealPlanningInputSchema = MealPlanningSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateMealPlanningInput = z.infer<typeof CreateMealPlanningInputSchema>;

export const MealEventSchema = z.object({
  id: z.string().uuid(),
  familyId: z.string().uuid(),
  planningId: z.string().uuid().nullable().optional(),
  date: z.string().date(), // YYYY-MM-DD
  mealType: z.enum(['breakfast', 'lunch', 'dinner']),
  recipeName: z.string().nullable().optional(),
  participants: z.array(z.string().uuid()).default([]), // Member IDs
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type MealEvent = z.infer<typeof MealEventSchema>;

export const CreateMealEventInputSchema = MealEventSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateMealEventInput = z.infer<typeof CreateMealEventInputSchema>;
