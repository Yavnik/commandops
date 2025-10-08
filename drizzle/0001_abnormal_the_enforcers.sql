CREATE TABLE "feedback" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_feedback_user" ON "feedback" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_feedback_created_at" ON "feedback" USING btree ("created_at" DESC NULLS LAST);