PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_MealEvent` (
	`id` text PRIMARY KEY NOT NULL,
	`familyId` text NOT NULL,
	`planningId` text,
	`date` text NOT NULL,
	`mealType` text NOT NULL,
	`recipeName` text,
	`participants` text DEFAULT '[]' NOT NULL,
	`createdAt` text DEFAULT (datetime('now')) NOT NULL,
	`updatedAt` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`familyId`) REFERENCES `Family`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`planningId`) REFERENCES `MealPlanning`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_MealEvent`("id", "familyId", "planningId", "date", "mealType", "recipeName", "participants", "createdAt", "updatedAt") SELECT "id", "familyId", "planningId", "date", "mealType", "recipeName", "participants", "createdAt", "updatedAt" FROM `MealEvent`;--> statement-breakpoint
DROP TABLE `MealEvent`;--> statement-breakpoint
ALTER TABLE `__new_MealEvent` RENAME TO `MealEvent`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `idx_event_familyId` ON `MealEvent` (`familyId`);--> statement-breakpoint
CREATE INDEX `idx_event_planningId` ON `MealEvent` (`planningId`);--> statement-breakpoint
CREATE INDEX `idx_event_date` ON `MealEvent` (`date`);--> statement-breakpoint
CREATE TABLE `__new_Member` (
	`id` text PRIMARY KEY NOT NULL,
	`familyId` text NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`birthdate` text,
	`dietaryRestrictions` text DEFAULT '[]' NOT NULL,
	`allergies` text DEFAULT '[]' NOT NULL,
	`foodPreferencesLikes` text DEFAULT '[]' NOT NULL,
	`foodPreferencesDislikes` text DEFAULT '[]' NOT NULL,
	`cookingSkillLevel` text DEFAULT 'none',
	`createdAt` text DEFAULT (datetime('now')) NOT NULL,
	`updatedAt` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`familyId`) REFERENCES `Family`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_Member`("id", "familyId", "name", "type", "birthdate", "dietaryRestrictions", "allergies", "foodPreferencesLikes", "foodPreferencesDislikes", "cookingSkillLevel", "createdAt", "updatedAt") SELECT "id", "familyId", "name", "type", "birthdate", "dietaryRestrictions", "allergies", "foodPreferencesLikes", "foodPreferencesDislikes", "cookingSkillLevel", "createdAt", "updatedAt" FROM `Member`;--> statement-breakpoint
DROP TABLE `Member`;--> statement-breakpoint
ALTER TABLE `__new_Member` RENAME TO `Member`;--> statement-breakpoint
CREATE INDEX `idx_member_familyId` ON `Member` (`familyId`);--> statement-breakpoint
CREATE TABLE `__new_PlannerSettings` (
	`id` text PRIMARY KEY NOT NULL,
	`familyId` text NOT NULL,
	`mealTypes` text DEFAULT '["lunch", "dinner"]' NOT NULL,
	`activeDays` text DEFAULT '[0, 1, 2, 3, 4, 5, 6]' NOT NULL,
	`notificationCron` text DEFAULT '0 18 * * 0',
	`timezone` text DEFAULT 'UTC',
	`createdAt` text DEFAULT (datetime('now')) NOT NULL,
	`updatedAt` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`familyId`) REFERENCES `Family`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_PlannerSettings`("id", "familyId", "mealTypes", "activeDays", "notificationCron", "timezone", "createdAt", "updatedAt") SELECT "id", "familyId", "mealTypes", "activeDays", "notificationCron", "timezone", "createdAt", "updatedAt" FROM `PlannerSettings`;--> statement-breakpoint
DROP TABLE `PlannerSettings`;--> statement-breakpoint
ALTER TABLE `__new_PlannerSettings` RENAME TO `PlannerSettings`;--> statement-breakpoint
CREATE UNIQUE INDEX `PlannerSettings_familyId_unique` ON `PlannerSettings` (`familyId`);--> statement-breakpoint
CREATE INDEX `idx_settings_familyId` ON `PlannerSettings` (`familyId`);