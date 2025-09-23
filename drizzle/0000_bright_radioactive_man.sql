CREATE TABLE `links` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`path` text NOT NULL,
	`relation_type` text NOT NULL,
	`href` text,
	`title` text,
	`type` text,
	`is_default` integer DEFAULT false NOT NULL,
	`hreflang` text
);
