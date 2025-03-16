ALTER TABLE `names` MODIFY COLUMN `sex` char(1) NOT NULL;--> statement-breakpoint
ALTER TABLE `namesbyarea` MODIFY COLUMN `sex` char(1) NOT NULL;--> statement-breakpoint
ALTER TABLE `namesbyarea` MODIFY COLUMN `state` char(2) NOT NULL;