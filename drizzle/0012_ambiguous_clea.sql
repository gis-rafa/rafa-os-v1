CREATE TABLE "workout_exercise_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"log_date" timestamp with time zone NOT NULL,
	"exercise_name" text NOT NULL,
	"sets_completed" integer DEFAULT 0 NOT NULL,
	"total_sets" integer DEFAULT 3 NOT NULL,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "workout_exercise_log" ADD CONSTRAINT "workout_exercise_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "workout_exercise_log_user_date_exercise_idx" ON "workout_exercise_log" USING btree ("user_id","log_date","exercise_name");--> statement-breakpoint
CREATE INDEX "workout_exercise_log_user_id_idx" ON "workout_exercise_log" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "workout_exercise_log_date_idx" ON "workout_exercise_log" USING btree ("log_date");