CREATE TABLE "project_knowledge_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"file_path" text NOT NULL,
	"title" text NOT NULL,
	"tags" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "execution_projects" ADD COLUMN "description" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "execution_projects" ADD COLUMN "priority" text DEFAULT 'Medium' NOT NULL;--> statement-breakpoint
ALTER TABLE "execution_projects" ADD COLUMN "target_date" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "execution_projects" ADD COLUMN "color" text DEFAULT 'stone' NOT NULL;--> statement-breakpoint
ALTER TABLE "execution_projects" ADD COLUMN "icon" text DEFAULT 'folder' NOT NULL;--> statement-breakpoint
ALTER TABLE "memories" ADD COLUMN "project_id" uuid;--> statement-breakpoint
ALTER TABLE "project_knowledge_links" ADD CONSTRAINT "project_knowledge_links_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_knowledge_links" ADD CONSTRAINT "project_knowledge_links_project_id_execution_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."execution_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "project_knowledge_links_project_file_idx" ON "project_knowledge_links" USING btree ("project_id","file_path");--> statement-breakpoint
CREATE INDEX "project_knowledge_links_user_id_idx" ON "project_knowledge_links" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "project_knowledge_links_project_id_idx" ON "project_knowledge_links" USING btree ("project_id");--> statement-breakpoint
ALTER TABLE "memories" ADD CONSTRAINT "memories_project_id_execution_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."execution_projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "execution_projects_priority_idx" ON "execution_projects" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "execution_projects_target_date_idx" ON "execution_projects" USING btree ("target_date");--> statement-breakpoint
CREATE INDEX "memories_project_id_idx" ON "memories" USING btree ("project_id");