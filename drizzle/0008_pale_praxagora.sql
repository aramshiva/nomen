ALTER TABLE `actuary` MODIFY COLUMN `year` int NOT NULL;--> statement-breakpoint
ALTER TABLE `actuary` MODIFY COLUMN `age` int NOT NULL;--> statement-breakpoint
ALTER TABLE `actuary` MODIFY COLUMN `probability_of_death` int NOT NULL;--> statement-breakpoint
ALTER TABLE `names` MODIFY COLUMN `name` varchar(25) NOT NULL DEFAULT '';--> statement-breakpoint
ALTER TABLE `names` MODIFY COLUMN `amount` int NOT NULL;--> statement-breakpoint
ALTER TABLE `names` MODIFY COLUMN `year` int NOT NULL;--> statement-breakpoint
ALTER TABLE `namesbyarea` MODIFY COLUMN `name` varchar(25) NOT NULL DEFAULT '';--> statement-breakpoint
ALTER TABLE `namesbyarea` MODIFY COLUMN `amount` int NOT NULL;--> statement-breakpoint
ALTER TABLE `namesbyarea` MODIFY COLUMN `year` int NOT NULL;--> statement-breakpoint
ALTER TABLE `namesbyarea` MODIFY COLUMN `state` char(2) NOT NULL;--> statement-breakpoint
ALTER TABLE `unique_names` MODIFY COLUMN `amount` int NOT NULL;--> statement-breakpoint
ALTER TABLE `uniquenamesbyarea` MODIFY COLUMN `amount` int NOT NULL;--> statement-breakpoint
ALTER TABLE `uniquenamesbyarea` MODIFY COLUMN `state` char(2) NOT NULL;