# Auguste - Data Models (TypeScript/Zod)

## Enum Definitions

```typescript
// Use const objects instead of TypeScript enums (project convention)

export const MemberType = {
  adult: 'adult',
  child: 'child',
} as const;
export type MemberType = (typeof MemberType)[keyof typeof MemberType];

export const CookingSkillLevel = {
  none: 'none',
  beginner: 'beginner',
  intermediate: 'intermediate',
  advanced: 'advanced',
} as const;
export type CookingSkillLevel = (typeof CookingSkillLevel)[keyof typeof CookingSkillLevel];

export const MealType = {
  breakfast: 'breakfast',
  lunch: 'lunch',
  dinner: 'dinner',
} as const;
export type MealType = (typeof MealType)[keyof typeof MealType];

export const DayOfWeek = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
} as const;
export type DayOfWeek = (typeof DayOfWeek)[keyof typeof DayOfWeek];
```

## Zod Schemas

### Family Schema

```typescript
import { z } from 'zod';

export const FamilySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  country: z.string().length(2), // ISO 3166-1 alpha-2
  language: z.string().min(2), // ISO 639-1 or BCP 47
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Family = z.infer<typeof FamilySchema>;

export const CreateFamilyInputSchema = z.object({
  name: z.string().min(1),
  country: z.string().length(2),
  language: z.string().min(2),
});

export type CreateFamilyInput = z.infer<typeof CreateFamilyInputSchema>;
```

### Member Schema

```typescript
export const BirthdateSchema = z
  .object({
    day: z.number().int().min(1).max(31).optional(),
    month: z.number().int().min(1).max(12).optional(),
    year: z.number().int().min(1900).max(2100).optional(),
  })
  .optional();

export type Birthdate = z.infer<typeof BirthdateSchema>;

export const FoodPreferencesSchema = z.object({
  likes: z.array(z.string()).default([]),
  dislikes: z.array(z.string()).default([]),
});

export type FoodPreferences = z.infer<typeof FoodPreferencesSchema>;

export const MemberSchema = z.object({
  id: z.string().uuid(),
  familyId: z.string().uuid(),
  name: z.string().min(1),
  type: z.enum(['adult', 'child']),
  birthdate: BirthdateSchema,
  dietaryRestrictions: z.array(z.string()).default([]),
  allergies: z.array(z.string()).default([]),
  foodPreferences: FoodPreferencesSchema.default({ likes: [], dislikes: [] }),
  cookingSkillLevel: z.enum(['none', 'beginner', 'intermediate', 'advanced']).default('none'),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Member = z.infer<typeof MemberSchema>;

export const CreateMemberInputSchema = MemberSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateMemberInput = z.infer<typeof CreateMemberInputSchema>;
```

### MemberAvailability Schema

```typescript
export const MemberAvailabilitySchema = z.object({
  id: z.string().uuid(),
  memberId: z.string().uuid(),
  mealType: z.enum(['breakfast', 'lunch', 'dinner']),
  dayOfWeek: z.number().int().min(0).max(6),
  isAvailable: z.boolean().default(true),
});

export type MemberAvailability = z.infer<typeof MemberAvailabilitySchema>;
```

### PlannerSettings Schema

```typescript
export const PlannerSettingsSchema = z.object({
  id: z.string().uuid(),
  familyId: z.string().uuid(),
  mealTypes: z.array(z.enum(['breakfast', 'lunch', 'dinner'])).default(['lunch', 'dinner']),
  activeDays: z.array(z.number().int().min(0).max(6)).default([0, 1, 2, 3, 4, 5, 6]),
  defaultServings: z.number().int().positive().default(4),
  notificationCron: z.string().default('0 18 * * 0'),
  timezone: z.string().default('UTC'),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type PlannerSettings = z.infer<typeof PlannerSettingsSchema>;

export const CreatePlannerSettingsInputSchema = PlannerSettingsSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreatePlannerSettingsInput = z.infer<typeof CreatePlannerSettingsInputSchema>;
```

## Common Dietary Restrictions & Allergies

```typescript
// Predefined options for UI/validation hints
export const COMMON_DIETARY_RESTRICTIONS = [
  'vegetarian',
  'vegan',
  'pescatarian',
  'keto',
  'paleo',
  'gluten-free',
  'dairy-free',
  'low-sodium',
  'low-sugar',
  'halal',
  'kosher',
  'whole30',
] as const;

export const COMMON_ALLERGIES = ['peanuts', 'tree-nuts', 'milk', 'eggs', 'wheat', 'soy', 'fish', 'shellfish', 'sesame'] as const;
```
