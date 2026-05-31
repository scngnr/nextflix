import type { MediaType } from "~/lib/types"
import type { Locale } from "~/lib/i18n/config"
import { getDictionary } from "~/lib/i18n/get-dictionary"

type GenreLike = { id: number; name: string }

export type ShowMetaInput = {
  title?: string
  name?: string
  vote_average?: number
  genre_ids?: number[]
  genres?: GenreLike[]
  release_date?: string
  first_air_date?: string
}

export function inferMediaType(show: ShowMetaInput): MediaType {
  return show.title ? "movie" : "tv"
}

export function formatGenreLine(
  show: ShowMetaInput,
  mediaType: MediaType,
  locale: Locale,
  max = 2,
): string | null {
  if (show.genres?.length) {
    return show.genres
      .slice(0, max)
      .map((g) => g.name)
      .join(" · ")
  }
  const ids = show.genre_ids
  if (!ids?.length) return null
  const dict = getDictionary(locale)
  const names = ids
    .map((id) => dict.genres[mediaType][id])
    .filter(Boolean)
    .slice(0, max)
  return names.length ? names.join(" · ") : null
}

export function formatTmdbScore(voteAverage?: number): string | null {
  if (voteAverage == null || Number.isNaN(voteAverage) || voteAverage <= 0) {
    return null
  }
  return voteAverage.toFixed(1)
}

export function formatMatchPercent(voteAverage?: number): number | null {
  if (voteAverage == null || Number.isNaN(voteAverage)) return null
  return Math.round(voteAverage * 10)
}
