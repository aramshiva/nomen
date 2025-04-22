CREATE TABLE `namesbyarea` (
	`name` text NOT NULL,
	`sex` char NOT NULL,
	`amount` int NOT NULL,
	`year` int NOT NULL,
	`state` char NOT NULL,
	CONSTRAINT `namesbyarea_name` PRIMARY KEY(`name`)
);
