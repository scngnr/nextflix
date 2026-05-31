import type { MediaType } from "~/lib/types"

/**
 * Çocuk içerik kaynakları — ileride YouTube Kids birleşimi için `source` alanı.
 * Yeni kaynak eklemek: KIDS_FEEDS dizisine satır ekle, `enabled: true` yap.
 */
export type KidsContentSource = "tmdb" | "youtube_kids"

export interface KidsFeed {
  id: string
  title: string
  source: KidsContentSource
  mediaType: MediaType
  /** TMDB discover yolu veya (gelecek) YouTube playlist / kanal kimliği */
  endpoint: string
  enabled: boolean
}

/** TMDB: TV'de resmi "Çocuk" (10762); filmlerde Aile+Animasyon kombinasyonu. */
export const KIDS_FEEDS: KidsFeed[] = [
  {
    id: "tmdb-tv-kids",
    title: "Çocuk Dizileri",
    source: "tmdb",
    mediaType: "tv",
    endpoint:
      "/discover/tv?with_genres=10762&sort_by=popularity.desc&vote_count.gte=10",
    enabled: true,
  },
  {
    id: "tmdb-movie-family",
    title: "Aile & Animasyon Filmleri",
    source: "tmdb",
    mediaType: "movie",
    endpoint:
      "/discover/movie?with_genres=10751|16&sort_by=popularity.desc&vote_count.gte=50",
    enabled: true,
  },
  {
    id: "youtube-kids",
    title: "YouTube Kids",
    source: "youtube_kids",
    mediaType: "movie",
    endpoint: "",
    enabled: false,
  },
]

export function enabledKidsFeeds(): KidsFeed[] {
  return KIDS_FEEDS.filter((f) => f.enabled)
}

export function enabledTmdbKidsFeeds(): KidsFeed[] {
  return KIDS_FEEDS.filter((f) => f.enabled && f.source === "tmdb")
}

export const KIDS_HUB = {
  path: "/kids",
  title: "Çocuk",
  description:
    "Çocuklar için diziler ve filmler. İleride YouTube Kids içerikleri de burada birleştirilebilir.",
}

/** Dizi ↔ film geçişinde Çocuk türü eşlemesi */
export const TMDB_KIDS_GENRE_TV = 10762
export const TMDB_KIDS_MOVIE_GENRES = "10751|16"
