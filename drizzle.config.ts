import type { Config } from "drizzle-kit"
import { config } from "dotenv"

config({ path: ".env.local" })
config()

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
  schemaFilter: ["public"],
  verbose: true,
  strict: true,
} satisfies Config
