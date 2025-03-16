ALTER TABLE `names` MODIFY COLUMN `name` varchar(255) NOT NULL DEFAULT '';--> statement-breakpoint
ALTER TABLE `names` MODIFY COLUMN `sex` char(1) NOT NULL DEFAULT '';--> statement-breakpoint
ALTER TABLE `names` MODIFY COLUMN `amount` int NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `names` MODIFY COLUMN `year` int NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `namesbyarea` MODIFY COLUMN `name` varchar(255) NOT NULL DEFAULT '';--> statement-breakpoint
ALTER TABLE `namesbyarea` MODIFY COLUMN `sex` char(1) NOT NULL DEFAULT '';--> statement-breakpoint
ALTER TABLE `namesbyarea` MODIFY COLUMN `amount` int NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `namesbyarea` MODIFY COLUMN `year` int NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `namesbyarea` MODIFY COLUMN `state` char(2) NOT NULL DEFAULT '';