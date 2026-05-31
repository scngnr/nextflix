DO $$ BEGIN
 CREATE TYPE "source_kind" AS ENUM('mp4', 'hls', 'drive', 'youtube');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "movie_sources" (
	"id" integer NOT NULL,
	"media_type" "media_type" NOT NULL,
	"kind" "source_kind" DEFAULT 'mp4' NOT NULL,
	"url" varchar(1024) NOT NULL,
	"title" varchar(512),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT movie_sources_id_media_type PRIMARY KEY("id","media_type")
);
