CREATE TABLE "study_task_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"roadmap_day" integer NOT NULL,
	"status" text DEFAULT 'Todo' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "study_task_progress" ADD CONSTRAINT "study_task_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "study_task_progress_user_day_idx" ON "study_task_progress" USING btree ("user_id","roadmap_day");--> statement-breakpoint
CREATE INDEX "study_task_progress_user_id_idx" ON "study_task_progress" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "study_task_progress_status_idx" ON "study_task_progress" USING btree ("status");