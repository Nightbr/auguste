PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_MealEvent` (
	`id` text PRIMARY KEY NOT NULL,
	`familyId` text NOT NULL,
	`planningId` text NOT NULL,
	`date` text NOT NULL,
	`mealType` text NOT NULL,
	`recipeName` text,
	`participants` text DEFAULT '[]' NOT NULL,
	`createdAt` text DEFAULT (datetime('now')) NOT NULL,
	`updatedAt` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`familyId`) REFERENCES `Family`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`planningId`) REFERENCES `MealPlanning`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_MealEvent`("id", "familyId", "planningId", "date", "mealType", "recipeName", "participants", "createdAt", "updatedAt") SELECT "id", "familyId", "planningId", "date", "mealType", "recipeName", "participants", "createdAt", "updatedAt" FROM `MealEvent`;--> statement-breakpoint
DROP TABLE `MealEvent`;--> statement-breakpoint
ALTER TABLE `__new_MealEvent` RENAME TO `MealEvent`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `idx_event_familyId` ON `MealEvent` (`familyId`);--> statement-breakpoint
CREATE INDEX `idx_event_planningId` ON `MealEvent` (`planningId`);--> statement-breakpoint
CREATE INDEX `idx_event_date` ON `MealEvent` (`date`);