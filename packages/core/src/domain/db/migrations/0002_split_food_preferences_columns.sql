ALTER TABLE `Member` ADD `foodPreferencesLikes` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `Member` ADD `foodPreferencesDislikes` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
UPDATE `Member`
SET
  `foodPreferencesLikes` = COALESCE(json_extract(`foodPreferences`, '$.likes'), '[]'),
  `foodPreferencesDislikes` = COALESCE(json_extract(`foodPreferences`, '$.dislikes'), '[]')
WHERE `foodPreferences` IS NOT NULL;--> statement-breakpoint
ALTER TABLE `Member` DROP COLUMN `foodPreferences`;

