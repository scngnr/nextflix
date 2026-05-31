import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import { config } from "dotenv"
import { movieSources } from "../src/db/schema"

config({ path: ".env.local" })
config()

type Kind = "mp4" | "hls" | "drive" | "youtube"
type MediaType = "movie" | "tv"

interface SourceInput {
  title: string
  year?: number
  mediaType?: MediaType
  kind?: Kind
  url: string
  tmdbId?: number
}

const TMDB_TOKEN = process.env.NEXT_PUBLIC_TMDB_API
const DB_URL = process.env.DATABASE_URL

async function searchTmdbId(
  title: string,
  mediaType: MediaType,
  year?: number,
): Promise<{ id: number; matchedTitle: string } | null> {
  const params = new URLSearchParams({ query: title, language: "tr-TR" })
  if (year) params.set(mediaType === "movie" ? "year" : "first_air_date_year", String(year))
  const res = await fetch(
    `https://api.themoviedb.org/3/search/${mediaType}?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${TMDB_TOKEN}`,
        accept: "application/json",
      },
    },
  )
  if (!res.ok) return null
  const data = (await res.json()) as {
    results?: { id: number; title?: string; name?: string }[]
  }
  const hit = data.results?.[0]
  if (!hit) return null
  return { id: hit.id, matchedTitle: hit.title ?? hit.name ?? title }
}

async function main() {
  if (!TMDB_TOKEN) throw new Error("NEXT_PUBLIC_TMDB_API tanımlı değil")
  if (!DB_URL) throw new Error("DATABASE_URL tanımlı değil")

  const fileArg = process.argv[2] ?? "data/sources.json"
  const path = resolve(process.cwd(), fileArg)
  const items = JSON.parse(readFileSync(path, "utf8")) as SourceInput[]
  console.log(`${items.length} kayıt okundu: ${fileArg}`)

  const pg = postgres(DB_URL, { max: 1 })
  const db = drizzle(pg, { schema: { movieSources } })

  let ok = 0
  const unmatched: string[] = []

  for (const item of items) {
    const mediaType = item.mediaType ?? "movie"
    const kind = item.kind ?? "mp4"
    let tmdbId = item.tmdbId

    if (!tmdbId) {
      const match = await searchTmdbId(item.title, mediaType, item.year)
      if (!match) {
        unmatched.push(item.title)
        console.warn(`  ✗ eşleşmedi: ${item.title}`)
        continue
      }
      tmdbId = match.id
      console.log(`  ✓ ${item.title} → #${tmdbId} (${match.matchedTitle})`)
    }

    await db
      .insert(movieSources)
      .values({
        id: tmdbId,
        mediaType,
        kind,
        url: item.url,
        title: item.title,
      })
      .onConflictDoUpdate({
        target: [movieSources.id, movieSources.mediaType],
        set: { kind, url: item.url, title: item.title },
      })
    ok++
  }

  await pg.end()

  console.log(`\nTamamlandı: ${ok} eklendi/güncellendi.`)
  if (unmatched.length) {
    console.log(`Eşleşmeyen ${unmatched.length} başlık (tmdbId elle eklenmeli):`)
    unmatched.forEach((t) => console.log(`  - ${t}`))
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
