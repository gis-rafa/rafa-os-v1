ALTER TABLE "memories" ADD COLUMN "category" text;--> statement-breakpoint
UPDATE "memories" SET "category" = 'General' WHERE "category" IS NULL;--> statement-breakpoint
ALTER TABLE "memories" ALTER COLUMN "category" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "memories" ADD COLUMN "importance" integer DEFAULT 3 NOT NULL;--> statement-breakpoint
ALTER TABLE "memories" DROP COLUMN "source";--> statement-breakpoint
CREATE INDEX "memories_category_idx" ON "memories" USING btree ("category");
