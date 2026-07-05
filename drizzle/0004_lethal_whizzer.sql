CREATE TABLE "execution_priorities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"priority_date" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "execution_projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"current_phase" text DEFAULT 'Planning' NOT NULL,
	"status" text DEFAULT 'Active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "execution_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"project_id" uuid,
	"title" text NOT NULL,
	"task_date" timestamp with time zone DEFAULT now() NOT NULL,
	"status" text DEFAULT 'Todo' NOT NULL,
	"priority" text DEFAULT 'Medium' NOT NULL,
	"estimated_minutes" integer DEFAULT 30 NOT NULL,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "execution_priorities" ADD CONSTRAINT "execution_priorities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "execution_projects" ADD CONSTRAINT "execution_projects_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "execution_tasks" ADD CONSTRAINT "execution_tasks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "execution_tasks" ADD CONSTRAINT "execution_tasks_project_id_execution_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."execution_projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "execution_priorities_user_date_idx" ON "execution_priorities" USING btree ("user_id","priority_date");--> statement-breakpoint
CREATE INDEX "execution_priorities_completed_at_idx" ON "execution_priorities" USING btree ("completed_at");--> statement-breakpoint
CREATE INDEX "execution_projects_user_status_idx" ON "execution_projects" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "execution_projects_updated_at_idx" ON "execution_projects" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "execution_tasks_user_date_idx" ON "execution_tasks" USING btree ("user_id","task_date");--> statement-breakpoint
CREATE INDEX "execution_tasks_status_idx" ON "execution_tasks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "execution_tasks_project_id_idx" ON "execution_tasks" USING btree ("project_id");