CREATE TABLE `actuary` (
	`id` int NOT NULL,
	`gender` enum('M','F') NOT NULL,
	`year` int NOT NULL DEFAULT 0,
	`age` int NOT NULL DEFAULT 0,
	`probability_of_death` int NOT NULL DEFAULT 0,
	CONSTRAINT `actuary_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `uniquenamesbyarea` (
	`name` varchar(25) NOT NULL DEFAULT '',
	`amount` int NOT NULL DEFAULT 0,
	`sex` char(1) NOT NULL DEFAULT '',
	`state` char(2) NOT NULL DEFAULT '',
	CONSTRAINT `uniquenamesbyarea_name` PRIMARY KEY(`name`)
);
--> statement-breakpoint
ALTER TABLE `unique_names` DROP COLUMN `state`;