import { sql } from 'drizzle-orm';
import { text, integer, sqliteTable, index, unique } from 'drizzle-orm/sqlite-core';
import type { Birthdate } from '../schemas/family.schema';
import { MemberType, CookingSkillLevel, MealType, MealPlanningStatus } from '../schemas/enums';

// --- Family ---
export const family = sqliteTable('Family', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  country: text('country').notNull(), // ISO 3166-1 alpha-2
  language: text('language').notNull(), // ISO 639-1
  createdAt: text('createdAt').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updatedAt').notNull().default(sql`(datetime('now'))`),
});

// --- Member ---
export const member = sqliteTable(
  'Member',
  {
    id: text('id').primaryKey(),
    familyId: text('familyId')
      .notNull()
      .references(() => family.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    type: text('type', { enum: Object.values(MemberType) as [string, ...string[]] }).notNull(),
    birthdate: text('birthdate', { mode: 'json' }).$type<Birthdate>(),
    dietaryRestrictions: text('dietaryRestrictions', { mode: 'json' })
      .notNull()
      .default(sql`'[]'`)
      .$type<string[]>(),
    allergies: text('allergies', { mode: 'json' }).notNull().default(sql`'[]'`).$type<string[]>(),
    foodPreferencesLikes: text('foodPreferencesLikes', { mode: 'json' })
      .notNull()
      .default(sql`'[]'`)
      .$type<string[]>(),
    foodPreferencesDislikes: text('foodPreferencesDislikes', { mode: 'json' })
      .notNull()
      .default(sql`'[]'`)
      .$type<string[]>(),
    cookingSkillLevel: text('cookingSkillLevel', {
      enum: Object.values(CookingSkillLevel) as [string, ...string[]],
    }).default(CookingSkillLevel.none),
    createdAt: text('createdAt').notNull().default(sql`(datetime('now'))`),
    updatedAt: text('updatedAt').notNull().default(sql`(datetime('now'))`),
  },
  (table) => ({
    familyIdIdx: index('idx_member_familyId').on(table.familyId),
  }),
);

// --- MemberAvailability ---
export const memberAvailability = sqliteTable(
  'MemberAvailability',
  {
    id: text('id').primaryKey(),
    memberId: text('memberId')
      .notNull()
      .references(() => member.id, { onDelete: 'cascade' }),
    mealType: text('mealType', {
      enum: Object.values(MealType) as [string, ...string[]],
    }).notNull(),
    dayOfWeek: integer('dayOfWeek').notNull(), // 0-6
    isAvailable: integer('isAvailable', { mode: 'boolean' }).notNull().default(true),
  },
  (table) => ({
    memberIdIdx: index('idx_availability_memberId').on(table.memberId),
    uniqueAvailability: unique().on(table.memberId, table.mealType, table.dayOfWeek),
  }),
);

// --- PlannerSettings ---
export const plannerSettings = sqliteTable(
  'PlannerSettings',
  {
    id: text('id').primaryKey(),
    familyId: text('familyId')
      .notNull()
      .unique()
      .references(() => family.id, { onDelete: 'cascade' }),
    mealTypes: text('mealTypes', { mode: 'json' })
      .notNull()
      .default(sql`'["lunch", "dinner"]'`)
      .$type<string[]>(),
    activeDays: text('activeDays', { mode: 'json' })
      .notNull()
      .default(sql`'[0, 1, 2, 3, 4, 5, 6]'`)
      .$type<number[]>(),
    notificationCron: text('notificationCron').default('0 18 * * 0'),
    timezone: text('timezone').default('UTC'),
    createdAt: text('createdAt').notNull().default(sql`(datetime('now'))`),
    updatedAt: text('updatedAt').notNull().default(sql`(datetime('now'))`),
  },
  (table) => ({
    familyIdIdx: index('idx_settings_familyId').on(table.familyId),
  }),
);

// --- MealPlanning ---
export const mealPlanning = sqliteTable(
  'MealPlanning',
  {
    id: text('id').primaryKey(),
    familyId: text('familyId')
      .notNull()
      .references(() => family.id, { onDelete: 'cascade' }),
    startDate: text('startDate').notNull(),
    endDate: text('endDate').notNull(),
    status: text('status', {
      enum: Object.values(MealPlanningStatus) as [string, ...string[]],
    }).default(MealPlanningStatus.draft),
    createdAt: text('createdAt').notNull().default(sql`(datetime('now'))`),
    updatedAt: text('updatedAt').notNull().default(sql`(datetime('now'))`),
  },
  (table) => ({
    familyIdIdx: index('idx_planning_familyId').on(table.familyId),
  }),
);

// --- MealEvent ---
export const mealEvent = sqliteTable(
  'MealEvent',
  {
    id: text('id').primaryKey(),
    familyId: text('familyId')
      .notNull()
      .references(() => family.id, { onDelete: 'cascade' }),
    planningId: text('planningId').references(() => mealPlanning.id, {
      onDelete: 'set null',
    }),
    date: text('date').notNull(), // YYYY-MM-DD
    mealType: text('mealType', {
      enum: Object.values(MealType) as [string, ...string[]],
    }).notNull(),
    recipeName: text('recipeName'),
    participants: text('participants', { mode: 'json' })
      .notNull()
      .default(sql`'[]'`)
      .$type<string[]>(),
    createdAt: text('createdAt').notNull().default(sql`(datetime('now'))`),
    updatedAt: text('updatedAt').notNull().default(sql`(datetime('now'))`),
  },
  (table) => ({
    familyIdIdx: index('idx_event_familyId').on(table.familyId),
    planningIdIdx: index('idx_event_planningId').on(table.planningId),
    dateIdx: index('idx_event_date').on(table.date),
  }),
);
