/**
 * Enum definitions using const objects (project convention)
 */

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
export type CookingSkillLevel =
  (typeof CookingSkillLevel)[keyof typeof CookingSkillLevel];

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

/**
 * Predefined options for UI/validation hints
 */
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

export const COMMON_ALLERGIES = [
  'peanuts',
  'tree-nuts',
  'milk',
  'eggs',
  'wheat',
  'soy',
  'fish',
  'shellfish',
  'sesame',
] as const;

