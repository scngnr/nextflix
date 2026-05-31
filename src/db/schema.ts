import { relations } from "drizzle-orm"
import {
  pgTable,
  varchar,
  integer,
  serial,
  timestamp,
  boolean,
  pgEnum,
  primaryKey,
  uniqueIndex,
  index,
  unique,
} from "drizzle-orm/pg-core"
import { planTuple } from "~/lib/configs"

export const membershipEnum = pgEnum("membership", planTuple)
export const accounts = pgTable(
  "accounts",
  {
    id: varchar("id", { length: 256 }).primaryKey(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    email: varchar("email", { length: 256 }).notNull(),
    membership: membershipEnum("membership").notNull().default("free"),
    stripeCustomerId: varchar("stripe_customer_id", { length: 256 }),
    activeProfileId: varchar("active_profile_id", { length: 256 }).notNull(),
    canAccessAdminPanel: boolean("can_access_admin_panel")
      .notNull()
      .default(false),
  },
  (table) => {
    return {
      activeProfileIdx: uniqueIndex("active_profile_idx").on(
        table.activeProfileId,
      ),
    }
  },
)
export const accountsRelations = relations(accounts, ({ many, one }) => ({
  profiles: many(profiles),
  activeProfile: one(profiles, {
    fields: [accounts.activeProfileId],
    references: [profiles.id],
  }),
}))

export const profiles = pgTable(
  "profiles",
  {
    id: varchar("id", { length: 256 }).primaryKey(),
    accountId: varchar("account_id", { length: 256 })
      .references(() => accounts.id, { onDelete: "cascade" })
      .notNull(),
    profileImgPath: varchar("profile_img_path", { length: 256 }).notNull(),
    name: varchar("name", { length: 256 }).notNull(),
  },
  (table) => {
    return {
      unq: unique().on(table.accountId, table.name),
      accountIdIdx: index("account_id_idx").on(table.accountId),
    }
  },
)
export const profilesRelation = relations(profiles, ({ one, many }) => ({
  ownerAccount: one(accounts, {
    fields: [profiles.accountId],
    references: [accounts.id],
  }),
  savedShows: many(myShows),
}))

export const mediaTypeEnum = pgEnum("media_type", ["movie", "tv"])
export const myShows = pgTable(
  "my_shows",
  {
    id: integer("id").notNull(),
    mediaType: mediaTypeEnum("media_type").notNull(),
    profileId: varchar("profile_id", { length: 256 })
      .references(() => profiles.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => {
    return {
      profileIdIdx: index("profile_id_idx").on(table.profileId),
      pk: primaryKey(table.id, table.profileId),
    }
  },
)
export const myShowsRelation = relations(myShows, ({ one }) => ({
  profile: one(profiles, {
    fields: [myShows.profileId],
    references: [profiles.id],
  }),
}))

export const likedShows = pgTable(
  "liked_shows",
  {
    id: integer("id").notNull(),
    mediaType: mediaTypeEnum("media_type").notNull(),
    profileId: varchar("profile_id", { length: 256 })
      .references(() => profiles.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => {
    return {
      likedProfileIdIdx: index("liked_profile_id_idx").on(table.profileId),
      pk: primaryKey(table.id, table.profileId),
    }
  },
)
export const likedShowsRelation = relations(likedShows, ({ one }) => ({
  profile: one(profiles, {
    fields: [likedShows.profileId],
    references: [profiles.id],
  }),
}))

export const watchProgress = pgTable(
  "watch_progress",
  {
    id: integer("id").notNull(),
    mediaType: mediaTypeEnum("media_type").notNull(),
    profileId: varchar("profile_id", { length: 256 })
      .references(() => profiles.id, { onDelete: "cascade" })
      .notNull(),
    progress: integer("progress").notNull().default(0),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => {
    return {
      wpProfileIdIdx: index("wp_profile_id_idx").on(table.profileId),
      pk: primaryKey(table.id, table.mediaType, table.profileId),
    }
  },
)
export const watchProgressRelation = relations(watchProgress, ({ one }) => ({
  profile: one(profiles, {
    fields: [watchProgress.profileId],
    references: [profiles.id],
  }),
}))

export const ratings = pgTable(
  "ratings",
  {
    id: integer("id").notNull(),
    mediaType: mediaTypeEnum("media_type").notNull(),
    profileId: varchar("profile_id", { length: 256 })
      .references(() => profiles.id, { onDelete: "cascade" })
      .notNull(),
    rating: integer("rating").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => {
    return {
      rProfileIdIdx: index("r_profile_id_idx").on(table.profileId),
      pk: primaryKey(table.id, table.mediaType, table.profileId),
    }
  },
)

export const searchHistory = pgTable(
  "search_history",
  {
    id: serial("id").primaryKey(),
    profileId: varchar("profile_id", { length: 256 })
      .references(() => profiles.id, { onDelete: "cascade" })
      .notNull(),
    query: varchar("query", { length: 256 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => {
    return {
      shProfileIdIdx: index("sh_profile_id_idx").on(table.profileId),
    }
  },
)

export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 64 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 256 }).notNull(),
  mustChangePassword: boolean("must_change_password").notNull().default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
})

export const sourceKindEnum = pgEnum("source_kind", [
  "mp4",
  "hls",
  "drive",
  "youtube",
])
export const movieSources = pgTable(
  "movie_sources",
  {
    id: integer("id").notNull(),
    mediaType: mediaTypeEnum("media_type").notNull(),
    kind: sourceKindEnum("kind").notNull().default("mp4"),
    url: varchar("url", { length: 1024 }).notNull(),
    title: varchar("title", { length: 512 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => {
    return {
      pk: primaryKey(table.id, table.mediaType),
    }
  },
)
