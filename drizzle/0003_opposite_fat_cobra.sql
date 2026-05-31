CREATE TABLE IF NOT EXISTS "ratings" (
	"id" integer NOT NULL,
	"media_type" "media_type" NOT NULL,
	"profile_id" varchar(256) NOT NULL,
	"rating" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT ratings_id_media_type_profile_id PRIMARY KEY("id","media_type","profile_id")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "r_profile_id_idx" ON "ratings" ("profile_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ratings" ADD CONSTRAINT "ratings_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
