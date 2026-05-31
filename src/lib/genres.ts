import type { MediaType } from "~/lib/types"
import type { Locale } from "~/lib/i18n/config"
import { getDictionary } from "~/lib/i18n/get-dictionary"

export interface Genre {
  id: number
  name: string
}

export const MOVIE_GENRES: Genre[] = [
  { id: 28, name: "Aksiyon" },
  { id: 12, name: "Macera" },
  { id: 16, name: "Animasyon" },
  { id: 35, name: "Komedi" },
  { id: 80, name: "Suç" },
  { id: 99, name: "Belgesel" },
  { id: 18, name: "Dram" },
  { id: 10751, name: "Aile" },
  { id: 14, name: "Fantastik" },
  { id: 36, name: "Tarih" },
  { id: 27, name: "Korku" },
  { id: 10402, name: "Müzik" },
  { id: 9648, name: "Gizem" },
  { id: 10749, name: "Romantik" },
  { id: 878, name: "Bilim Kurgu" },
  { id: 53, name: "Gerilim" },
  { id: 10752, name: "Savaş" },
  { id: 37, name: "Western" },
]

export const TV_GENRES: Genre[] = [
  { id: 10759, name: "Aksiyon & Macera" },
  { id: 16, name: "Animasyon" },
  { id: 35, name: "Komedi" },
  { id: 80, name: "Suç" },
  { id: 99, name: "Belgesel" },
  { id: 18, name: "Dram" },
  { id: 10751, name: "Aile" },
  { id: 10762, name: "Çocuk" },
  { id: 9648, name: "Gizem" },
  { id: 10764, name: "Reality" },
  { id: 10765, name: "Bilim Kurgu & Fantastik" },
  { id: 10768, name: "Savaş & Politika" },
  { id: 37, name: "Western" },
]

export function genresFor(mediaType: MediaType): Genre[] {
  return mediaType === "tv" ? TV_GENRES : MOVIE_GENRES
}

export function genreName(
  id: number,
  mediaType: MediaType,
  locale?: Locale,
): string {
  if (locale) {
    const localized = getDictionary(locale).genres[mediaType][id]
    if (localized) return localized
  }
  return genresFor(mediaType).find((g) => g.id === id)?.name ?? "Tür"
}

export function localizedGenres(mediaType: MediaType, locale: Locale): Genre[] {
  return genresFor(mediaType).map((g) => ({
    id: g.id,
    name: genreName(g.id, mediaType, locale),
  }))
}

export function isValidGenre(id: number, mediaType: MediaType): boolean {
  return genresFor(mediaType).some((g) => g.id === id)
}

/** Film ↔ dizi geçişinde mümkünse aynı / benzer türü koru. */
export function mapGenreToMediaType(
  genreId: number,
  from: MediaType,
  to: MediaType,
): number {
  if (from === to && isValidGenre(genreId, to)) return genreId

  const fromList = genresFor(from)
  const toList = genresFor(to)
  const current = fromList.find((g) => g.id === genreId)

  if (!current) return toList[0]!.id

  const sameId = toList.find((g) => g.id === genreId)
  if (sameId) return sameId.id

  if (genreId === 10762 && to === "movie") {
    return 10751
  }
  if (genreId === 10751 && from === "movie" && to === "tv") {
    return 10762
  }

  const needle = current.name.toLowerCase().split(/[^a-zçğıöşü0-9]+/)[0]
  if (needle && needle.length >= 3) {
    const byName = toList.find((g) =>
      g.name.toLowerCase().includes(needle),
    )
    if (byName) return byName.id
  }

  return toList[0]!.id
}
