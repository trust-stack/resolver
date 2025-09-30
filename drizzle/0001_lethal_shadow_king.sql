ALTER TABLE `links` ADD `tenant_id` text NOT NULL;--> statement-breakpoint
ALTER TABLE `links` ADD `organization_id` text NOT NULL;--> statement-breakpoint
ALTER TABLE `links` ADD `user_id` text;--> statement-breakpoint
CREATE INDEX `idx_links_path` ON `links` (`path`);--> statement-breakpoint
CREATE INDEX `idx_links_created_at` ON `links` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_links_tenant` ON `links` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `idx_links_org` ON `links` (`organization_id`);--> statement-breakpoint
CREATE INDEX `idx_links_tenant_path` ON `links` (`tenant_id`,`path`);--> statement-breakpoint
CREATE INDEX `idx_links_tenant_path_rel` ON `links` (`tenant_id`,`path`,`relation_type`);