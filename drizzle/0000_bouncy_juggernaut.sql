CREATE TABLE `member_tickets` (
	`id` text PRIMARY KEY NOT NULL,
	`member_id` text NOT NULL,
	`ticket_code` text NOT NULL,
	`ticket_price` integer NOT NULL,
	`draw_id` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`rank` integer,
	`prize_amount` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `member_tickets_ticket_code_unique` ON `member_tickets` (`ticket_code`);--> statement-breakpoint
CREATE TABLE `members` (
	`id` text PRIMARY KEY NOT NULL,
	`member_id` text NOT NULL,
	`email` text NOT NULL,
	`display_name` text NOT NULL,
	`phone` text,
	`email_verified` integer DEFAULT 1 NOT NULL,
	`phone_verified` integer DEFAULT 0 NOT NULL,
	`kyc_status` text DEFAULT 'not_started' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `members_member_id_unique` ON `members` (`member_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `members_email_unique` ON `members` (`email`);--> statement-breakpoint
CREATE TABLE `verification_challenges` (
	`id` text PRIMARY KEY NOT NULL,
	`member_id` text NOT NULL,
	`kind` text NOT NULL,
	`destination` text NOT NULL,
	`code_hash` text,
	`status` text NOT NULL,
	`expires_at` integer,
	`used_at` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE no action
);
