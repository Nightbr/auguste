CREATE TABLE `Family` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`country` text NOT NULL,
	`language` text NOT NULL,
	`createdAt` text DEFAULT (datetime('now')) NOT NULL,
	`updatedAt` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `MealEvent` (
	`id` text PRIMARY KEY NOT NULL,
	`familyId` text NOT NULL,
	`planningId` text,
	`date` text NOT NULL,
	`mealType` text NOT NULL,
	`recipeName` text,
	`participants` text DEFAULT '[]',
	`createdAt` text DEFAULT (datetime('now')) NOT NULL,
	`updatedAt` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`familyId`) REFERENCES `Family`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`planningId`) REFERENCES `MealPlanning`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_event_familyId` ON `MealEvent` (`familyId`);--> statement-breakpoint
CREATE INDEX `idx_event_planningId` ON `MealEvent` (`planningId`);--> statement-breakpoint
CREATE INDEX `idx_event_date` ON `MealEvent` (`date`);--> statement-breakpoint
CREATE TABLE `MealPlanning` (
	`id` text PRIMARY KEY NOT NULL,
	`familyId` text NOT NULL,
	`startDate` text NOT NULL,
	`endDate` text NOT NULL,
	`status` text DEFAULT 'draft',
	`createdAt` text DEFAULT (datetime('now')) NOT NULL,
	`updatedAt` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`familyId`) REFERENCES `Family`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_planning_familyId` ON `MealPlanning` (`familyId`);--> statement-breakpoint
CREATE TABLE `Member` (
	`id` text PRIMARY KEY NOT NULL,
	`familyId` text NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`birthdate` text,
	`dietaryRestrictions` text DEFAULT '[]',
	`allergies` text DEFAULT '[]',
	`foodPreferences` text DEFAULT '{"likes":[],"dislikes":[]}',
	`cookingSkillLevel` text DEFAULT 'none',
	`createdAt` text DEFAULT (datetime('now')) NOT NULL,
	`updatedAt` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`familyId`) REFERENCES `Family`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_member_familyId` ON `Member` (`familyId`);--> statement-breakpoint
CREATE TABLE `MemberAvailability` (
	`id` text PRIMARY KEY NOT NULL,
	`memberId` text NOT NULL,
	`mealType` text NOT NULL,
	`dayOfWeek` integer NOT NULL,
	`isAvailable` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`memberId`) REFERENCES `Member`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_availability_memberId` ON `MemberAvailability` (`memberId`);--> statement-breakpoint
CREATE TABLE `PlannerSettings` (
	`id` text PRIMARY KEY NOT NULL,
	`familyId` text NOT NULL,
	`mealTypes` text DEFAULT '["lunch", "dinner"]',
	`activeDays` text DEFAULT '[0, 1, 2, 3, 4, 5, 6]',
	`defaultServings` integer DEFAULT 4,
	`notificationCron` text DEFAULT '0 18 * * 0',
	`timezone` text DEFAULT 'UTC',
	`createdAt` text DEFAULT (datetime('now')) NOT NULL,
	`updatedAt` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`familyId`) REFERENCES `Family`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `PlannerSettings_familyId_unique` ON `PlannerSettings` (`familyId`);--> statement-breakpoint
CREATE INDEX `idx_settings_familyId` ON `PlannerSettings` (`familyId`);