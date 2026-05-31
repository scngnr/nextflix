import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js"
import { migrate } from "drizzle-orm/postgres-js/migrator"
import postgres from "postgres"
import { config } from "dotenv"

config({ path: ".env.local" })
config()

async function main() {
  const sql = postgres(process.env.DATABASE_URL!, {
    max: 1,
  })
  const db: PostgresJsDatabase = drizzle(sql)
  await migrate(db, { migrationsFolder: "drizzle" })
  console.log("migration completed")
  await sql.end()
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
