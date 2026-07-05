CREATE TABLE "notification_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"email_notifications" integer DEFAULT 1 NOT NULL,
	"push_notifications" integer DEFAULT 0 NOT NULL,
	"daily_digest" integer DEFAULT 1 NOT NULL,
	"notify_on_memory_suggestions" integer DEFAULT 1 NOT NULL,
	"notify_on_task_reminders" integer DEFAULT 1 NOT NULL,
	"notify_on_project_updates" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "notification_preferences_user_id_idx" ON "notification_preferences" USING btree ("user_id");