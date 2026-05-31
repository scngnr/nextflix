DO $$ BEGIN
 CREATE TYPE "media_type" AS ENUM('movie', 'tv');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "membership" AS ENUM('free', 'basic', 'standard', 'premium');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "accounts" (
	"id" varchar(256) PRIMARY KEY NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"email" varchar(256) NOT NULL,
	"membership" "membership" DEFAULT 'free' NOT NULL,
	"stripe_customer_id" varchar(256),
	"active_profile_id" varchar(256) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "liked_shows" (
	"id" integer NOT NULL,
	"media_type" "media_type" NOT NULL,
	"profile_id" varchar(256) NOT NULL,
	CONSTRAINT liked_shows_id_profile_id PRIMARY KEY("id","profile_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "my_shows" (
	"id" integer NOT NULL,
	"media_type" "media_type" NOT NULL,
	"profile_id" varchar(256) NOT NULL,
	CONSTRAINT my_shows_id_profile_id PRIMARY KEY("id","profile_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "profiles" (
	"id" varchar(256) PRIMARY KEY NOT NULL,
	"account_id" varchar(256) NOT NULL,
	"profile_img_path" varchar(256) NOT NULL,
	"name" varchar(256) NOT NULL,
	CONSTRAINT "profiles_account_id_name_unique" UNIQUE("account_id","name")
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "active_profile_idx" ON "accounts" ("active_profile_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "liked_profile_id_idx" ON "liked_shows" ("profile_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "profile_id_idx" ON "my_shows" ("profile_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "account_id_idx" ON "profiles" ("account_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "liked_shows" ADD CONSTRAINT "liked_shows_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "my_shows" ADD CONSTRAINT "my_shows_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "profiles" ADD CONSTRAINT "profiles_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
