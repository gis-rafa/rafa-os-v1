CREATE TABLE "documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"key" text NOT NULL,
	"content" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inbox_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roadmap_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"day" integer NOT NULL,
	"gis_task" text NOT NULL,
	"support_task" text NOT NULL,
	"deliverable" text NOT NULL,
	"week" integer NOT NULL,
	"phase" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inbox_entries" ADD CONSTRAINT "inbox_entries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "documents_user_key_idx" ON "documents" USING btree ("user_id","key");--> statement-breakpoint
CREATE INDEX "documents_user_id_idx" ON "documents" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "inbox_entries_user_id_idx" ON "inbox_entries" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "inbox_entries_created_at_idx" ON "inbox_entries" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "roadmap_tasks_day_idx" ON "roadmap_tasks" USING btree ("day");--> statement-breakpoint
CREATE INDEX "roadmap_tasks_week_idx" ON "roadmap_tasks" USING btree ("week");--> statement-breakpoint
CREATE INDEX "roadmap_tasks_phase_idx" ON "roadmap_tasks" USING btree ("phase");