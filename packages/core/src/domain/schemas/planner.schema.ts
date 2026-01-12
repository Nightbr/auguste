import { z } from 'zod';
import { createSelectSchema, createInsertSchema } from 'drizzle-zod';
import { memberAvailability, plannerSettings } from '../db/schema.drizzle.js';

/**
 * Member availability schema
 */
export const MemberAvailabilitySchema = createSelectSchema(memberAvailability);
export type MemberAvailability = z.infer<typeof MemberAvailabilitySchema>;

export const SetMemberAvailabilityInputSchema = createInsertSchema(memberAvailability).omit({
  id: true,
});
export type SetMemberAvailabilityInput = z.infer<typeof SetMemberAvailabilityInputSchema>;

/**
 * Planner settings schema
 */
export const PlannerSettingsSchema = createSelectSchema(plannerSettings).extend({
  mealTypes: z.array(z.any()),
  activeDays: z.array(z.number()),
});
export type PlannerSettings = z.infer<typeof PlannerSettingsSchema>;

export const CreatePlannerSettingsInputSchema = createInsertSchema(plannerSettings)
  .extend({
    mealTypes: z.array(z.any()).optional(),
    activeDays: z.array(z.number()).optional(),
    notificationCron: z.string().optional(),
    timezone: z.string().optional(),
  })
  .omit({ id: true, createdAt: true, updatedAt: true });
export type CreatePlannerSettingsInput = z.infer<typeof CreatePlannerSettingsInputSchema>;

export const UpdatePlannerSettingsInputSchema = createInsertSchema(plannerSettings)
  .extend({
    mealTypes: z.array(z.any()).optional(),
    activeDays: z.array(z.number()).optional(),
    notificationCron: z.string().optional(),
    timezone: z.string().optional(),
  })
  .omit({ familyId: true, createdAt: true, updatedAt: true });
export type UpdatePlannerSettingsInput = z.infer<typeof UpdatePlannerSettingsInputSchema>;
