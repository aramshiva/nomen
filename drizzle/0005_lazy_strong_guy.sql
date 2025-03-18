CREATE TABLE `unique_names` (
	`name` varchar(25) NOT NULL DEFAULT '',
	`amount` int NOT NULL DEFAULT 0,
	`sex` char(1) NOT NULL DEFAULT '',
	CONSTRAINT `unique_names_name` PRIMARY KEY(`name`)
);
--> statement-breakpoint
CREATE TABLE `uniquenames` (
	`name` varchar(25) NOT NULL DEFAULT '',
	CONSTRAINT `uniquenames_name` PRIMARY KEY(`name`)
);
