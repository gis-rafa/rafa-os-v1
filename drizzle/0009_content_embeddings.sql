CREATE TABLE "content_embeddings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"content_type" text NOT NULL,
	"content_id" text NOT NULL,
	"embedding" vector(1536) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "content_embeddings" ADD CONSTRAINT "content_embeddings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "content_embeddings_user_id_idx" ON "content_embeddings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "content_embeddings_content_type_idx" ON "content_embeddings" USING btree ("content_type");--> statement-breakpoint
CREATE INDEX "content_embeddings_content_id_idx" ON "content_embeddings" USING btree ("content_id");