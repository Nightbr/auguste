import { z } from 'zod';
import { CookingSkillLevel, MemberType } from './enums';

/**
 * Birthdate schema - flexible birthdate with optional day, month, year
 */
export const BirthdateSchema = z
  .object({
    day: z.number().int().min(1).max(31).optional(),
    month: z.number().int().min(1).max(12).optional(),
    year: z.number().int().min(1900).max(2100).optional(),
  })
  .optional();
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
export const FamilySchema = z.object({
  id: z.uuid(),
  name: z.string().min(1),
  country: z.string().length(2), // ISO 3166-1 alpha-2
  language: z.string().min(2), // ISO 639-1 or BCP 47
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export type Family = z.infer<typeof FamilySchema>;

export const CreateFamilyInputSchema = z.object({
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
});
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
export const MemberSchema = z.object({
  id: z.uuid(),
  familyId: z.uuid(),
  name: z.string().min(1),
  type: z.enum([MemberType.adult, MemberType.child]),
  birthdate: BirthdateSchema,
  dietaryRestrictions: z.array(z.string()).default([]),
  allergies: z.array(z.string()).default([]),
  foodPreferences: FoodPreferencesSchema.default({ likes: [], dislikes: [] }),
  cookingSkillLevel: z
    .enum([CookingSkillLevel.none, CookingSkillLevel.beginner, CookingSkillLevel.intermediate, CookingSkillLevel.advanced])
    .default(CookingSkillLevel.none),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export type Member = z.infer<typeof MemberSchema>;

export const CreateMemberInputSchema = z.object({
  familyId: z.uuid(),
  name: z.string().min(1),
  type: z.enum([MemberType.adult, MemberType.child]),
  birthdate: BirthdateSchema,
  dietaryRestrictions: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
  foodPreferences: FoodPreferencesSchema.optional(),
  cookingSkillLevel: z
    .enum([CookingSkillLevel.none, CookingSkillLevel.beginner, CookingSkillLevel.intermediate, CookingSkillLevel.advanced])
    .optional(),
});
export type CreateMemberInput = z.infer<typeof CreateMemberInputSchema>;

export const UpdateMemberInputSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1).optional(),
  type: z.enum([MemberType.adult, MemberType.child]).optional(),
  birthdate: BirthdateSchema,
  dietaryRestrictions: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
  foodPreferences: FoodPreferencesSchema.optional(),
  cookingSkillLevel: z
    .enum([CookingSkillLevel.none, CookingSkillLevel.beginner, CookingSkillLevel.intermediate, CookingSkillLevel.advanced])
    .optional(),
});
export type UpdateMemberInput = z.infer<typeof UpdateMemberInputSchema>;
