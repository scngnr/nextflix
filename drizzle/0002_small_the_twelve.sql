CREATE TABLE IF NOT EXISTS "search_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"profile_id" varchar(256) NOT NULL,
	"query" varchar(256) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "watch_progress" (
	"id" integer NOT NULL,
	"media_type" "media_type" NOT NULL,
	"profile_id" varchar(256) NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT watch_progress_id_media_type_profile_id PRIMARY KEY("id","media_type","profile_id")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sh_profile_id_idx" ON "search_history" ("profile_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "wp_profile_id_idx" ON "watch_progress" ("profile_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "search_history" ADD CONSTRAINT "search_history_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "watch_progress" ADD CONSTRAINT "watch_progress_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
