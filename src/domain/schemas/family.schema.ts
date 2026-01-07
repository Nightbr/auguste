import { z } from 'zod';
import { createSelectSchema, createInsertSchema } from 'drizzle-zod';
import { family, member } from '../db/schema.drizzle';
import { CookingSkillLevel, MemberType } from './enums';

/**
 * Birthdate schema - flexible birthdate with optional day, month, year
 */
export const BirthdateSchema = z
  .object({
    day: z.number().int().min(1).max(31).optional(),
    month: z.number().int().min(1).max(12).optional(),
    year: z.number().int().min(1).max(2100).optional(),
  })
  .nullish();
export type Birthdate = z.infer<typeof BirthdateSchema>;

/**
 * Food preferences schema - likes and dislikes
 */
export const FoodPreferencesSchema = z.object({
  likes: z.array(z.string()).default([]),
  dislikes: z.array(z.string()).default([]),
});
export type FoodPreferences = z.infer<typeof FoodPreferencesSchema>;

/**
 * Family schema - represents a household
 */
export const FamilySchema = createSelectSchema(family);
export type Family = z.infer<typeof FamilySchema>;

export const CreateFamilyInputSchema = createInsertSchema(family)
  .extend({
    name: z.string().min(1).describe('The family or household name (e.g., "The Smith Family", "Casa Garcia")'),
    country: z
      .string()
      .length(2)
      .describe(
        'ISO 3166-1 alpha-2 country code. MUST be exactly 2 letters. Examples: "US" for United States, "FR" for France, "DE" for Germany, "JP" for Japan, "GB" for United Kingdom'
      ),
    language: z
      .string()
      .min(2)
      .describe(
        'ISO 639-1 language code for meal suggestions. Examples: "en" for English, "fr" for French, "es" for Spanish, "de" for German'
      ),
  })
  .omit({ id: true, createdAt: true, updatedAt: true });
export type CreateFamilyInput = z.infer<typeof CreateFamilyInputSchema>;

export const UpdateFamilyInputSchema = z.object({
  id: z.uuid().describe('The family ID to update'),
  name: z.string().min(1).optional().describe('The new family name'),
  country: z.string().length(2).optional().describe('ISO 3166-1 alpha-2 country code (2 letters). Examples: "US", "FR", "DE", "JP"'),
  language: z.string().min(2).optional().describe('ISO 639-1 language code. Examples: "en", "fr", "es", "de"'),
});
export type UpdateFamilyInput = z.infer<typeof UpdateFamilyInputSchema>;

/**
 * Member schema - individual family members
 */
export const MemberSchema = createSelectSchema(member).extend({
  birthdate: BirthdateSchema,
  dietaryRestrictions: z.array(z.string()).default([]),
  allergies: z.array(z.string()).default([]),
  foodPreferences: FoodPreferencesSchema.default({ likes: [], dislikes: [] }),
});
export type Member = z.infer<typeof MemberSchema>;

export const CreateMemberInputSchema = createInsertSchema(member)
  .extend({
    name: z.string().min(1),
    birthdate: BirthdateSchema.optional(),
    dietaryRestrictions: z.array(z.string()).optional(),
    allergies: z.array(z.string()).optional(),
    foodPreferences: FoodPreferencesSchema.optional(),
    cookingSkillLevel: z.nativeEnum(CookingSkillLevel).optional(),
  })
  .omit({ id: true, createdAt: true, updatedAt: true });
export type CreateMemberInput = z.infer<typeof CreateMemberInputSchema>;

export const UpdateMemberInputSchema = createInsertSchema(member)
  .extend({
    name: z.string().min(1).optional(),
    type: z.nativeEnum(MemberType).optional(),
    birthdate: BirthdateSchema.optional(),
    dietaryRestrictions: z.array(z.string()).optional(),
    allergies: z.array(z.string()).optional(),
    foodPreferences: FoodPreferencesSchema.optional(),
    cookingSkillLevel: z.nativeEnum(CookingSkillLevel).optional(),
  })
  .omit({ familyId: true, createdAt: true, updatedAt: true });
export type UpdateMemberInput = z.infer<typeof UpdateMemberInputSchema>;
