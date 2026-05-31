import { env } from "~/env.mjs"
import * as schema from "./schema"
import { neon, neonConfig } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import type { NeonHttpDatabase } from "drizzle-orm/neon-http"

neonConfig.fetchConnectionCache = true

let _db: NeonHttpDatabase<typeof schema> | undefined

function getDb() {
  if (!_db) {
    const sql = neon(env.DATABASE_URL)
    _db = drizzle(sql, { schema })
  }
  return _db
}

export const db = new Proxy({} as NeonHttpDatabase<typeof schema>, {
  get(_target, prop) {
    const database = getDb()
    const value = database[prop as keyof typeof database]
    return typeof value === "function" ? value.bind(database) : value
  },
})
