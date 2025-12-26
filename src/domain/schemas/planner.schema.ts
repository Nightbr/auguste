import { z } from 'zod';
import { MealType } from './enums';

/**
 * Member availability schema - tracks which meals each member attends
 */
export const MemberAvailabilitySchema = z.object({
  id: z.uuid(),
  memberId: z.uuid(),
  mealType: z.enum([MealType.breakfast, MealType.lunch, MealType.dinner]),
  dayOfWeek: z.number().int().min(0).max(6),
  isAvailable: z.boolean().default(true),
});
export type MemberAvailability = z.infer<typeof MemberAvailabilitySchema>;

export const SetMemberAvailabilityInputSchema = z.object({
  memberId: z.uuid(),
  mealType: z.enum([MealType.breakfast, MealType.lunch, MealType.dinner]),
  dayOfWeek: z.number().int().min(0).max(6),
  isAvailable: z.boolean(),
});
export type SetMemberAvailabilityInput = z.infer<
  typeof SetMemberAvailabilityInputSchema
>;

/**
 * Planner settings schema - meal planning configuration
 */
export const PlannerSettingsSchema = z.object({
  id: z.uuid(),
  familyId: z.uuid(),
  mealTypes: z
    .array(z.enum([MealType.breakfast, MealType.lunch, MealType.dinner]))
    .default([MealType.lunch, MealType.dinner]),
  activeDays: z
    .array(z.number().int().min(0).max(6))
    .default([0, 1, 2, 3, 4, 5, 6]),
  defaultServings: z.number().int().positive().default(4),
  notificationCron: z.string().default('0 18 * * 0'), // Sunday 6pm
  timezone: z.string().default('UTC'),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export type PlannerSettings = z.infer<typeof PlannerSettingsSchema>;

export const CreatePlannerSettingsInputSchema = z.object({
  familyId: z.uuid(),
  mealTypes: z
    .array(z.enum([MealType.breakfast, MealType.lunch, MealType.dinner]))
    .optional(),
  activeDays: z.array(z.number().int().min(0).max(6)).optional(),
  defaultServings: z.number().int().positive().optional(),
  notificationCron: z.string().optional(),
  timezone: z.string().optional(),
});
export type CreatePlannerSettingsInput = z.infer<
  typeof CreatePlannerSettingsInputSchema
>;

export const UpdatePlannerSettingsInputSchema = z.object({
  id: z.uuid(),
  mealTypes: z
    .array(z.enum([MealType.breakfast, MealType.lunch, MealType.dinner]))
    .optional(),
  activeDays: z.array(z.number().int().min(0).max(6)).optional(),
  defaultServings: z.number().int().positive().optional(),
  notificationCron: z.string().optional(),
  timezone: z.string().optional(),
});
export type UpdatePlannerSettingsInput = z.infer<
  typeof UpdatePlannerSettingsInputSchema
>;

