CREATE TYPE "public"."mission_status" AS ENUM('ACTIVE', 'ARCHIVED');--> statement-breakpoint
CREATE TYPE "public"."quest_status" AS ENUM('PLANNING', 'ACTIVE', 'COMPLETED', 'ARCHIVED');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "missions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"objective" text,
	"status" "mission_status" DEFAULT 'ACTIVE' NOT NULL,
	"archived_at" timestamp,
	"after_action_report" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quests" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"mission_id" text,
	"title" text NOT NULL,
	"description" text,
	"is_critical" boolean,
	"status" "quest_status" DEFAULT 'PLANNING' NOT NULL,
	"deadline" timestamp,
	"estimated_time" integer,
	"actual_time" integer,
	"first_tactical_step" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"started_at" timestamp,
	"completed_at" timestamp,
	"debrief_notes" text,
	"debrief_satisfaction" integer,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rate_limit_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"action" text NOT NULL,
	"limit_value" integer NOT NULL,
	"current_count" integer NOT NULL,
	"window_ms" integer NOT NULL,
	"exceeded" boolean NOT NULL,
	"rate_limiter_enabled" boolean NOT NULL,
	"user_agent" text,
	"ip_address" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "standing_orders" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"mission_id" text,
	"title" text NOT NULL,
	"is_critical" boolean,
	"recurrence_rule" jsonb NOT NULL,
	"generation_time" time NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean NOT NULL,
	"image" text,
	"onboarding_completed" boolean NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "missions" ADD CONSTRAINT "missions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quests" ADD CONSTRAINT "quests_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quests" ADD CONSTRAINT "quests_mission_id_missions_id_fk" FOREIGN KEY ("mission_id") REFERENCES "public"."missions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rate_limit_logs" ADD CONSTRAINT "rate_limit_logs_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "standing_orders" ADD CONSTRAINT "standing_orders_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "standing_orders" ADD CONSTRAINT "standing_orders_mission_id_missions_id_fk" FOREIGN KEY ("mission_id") REFERENCES "public"."missions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_missions_archived_at" ON "missions" USING btree ("archived_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_missions_user_status" ON "missions" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "idx_missions_archive_lookup" ON "missions" USING btree ("user_id","status","updated_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_missions_search_title" ON "missions" USING btree (LOWER(LEFT("title", 100)));--> statement-breakpoint
CREATE INDEX "idx_missions_search_objective" ON "missions" USING btree (LOWER(LEFT("objective", 100)));--> statement-breakpoint
CREATE INDEX "idx_quests_completed_at" ON "quests" USING btree ("completed_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_quests_user_mission" ON "quests" USING btree ("user_id","mission_id");--> statement-breakpoint
CREATE INDEX "idx_quests_satisfaction" ON "quests" USING btree ("debrief_satisfaction");--> statement-breakpoint
CREATE INDEX "idx_quests_archive_lookup" ON "quests" USING btree ("user_id","status","completed_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_quests_search_title" ON "quests" USING btree (LOWER(LEFT("title", 100)));--> statement-breakpoint
CREATE INDEX "idx_quests_search_description" ON "quests" USING btree (LOWER(LEFT("description", 100)));--> statement-breakpoint
CREATE INDEX "idx_quests_search_debrief" ON "quests" USING btree (LOWER(LEFT("debrief_notes", 100)));--> statement-breakpoint
CREATE INDEX "idx_rate_limit_logs_user_action" ON "rate_limit_logs" USING btree ("user_id","action");--> statement-breakpoint
CREATE INDEX "idx_rate_limit_logs_created_at" ON "rate_limit_logs" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_rate_limit_logs_exceeded" ON "rate_limit_logs" USING btree ("exceeded","created_at" DESC NULLS LAST);