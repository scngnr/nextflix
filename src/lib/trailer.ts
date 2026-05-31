"use client"

const cache = new Map<string, string | null>()

interface TmdbVideo {
  key: string
  type: string
  site: string
  official?: boolean
}

export async function fetchTrailerKey(
  id: number,
  mediaType: string,
): Promise<string | null> {
  const cacheKey = `${mediaType}-${id}`
  if (cache.has(cacheKey)) return cache.get(cacheKey) ?? null

  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/${mediaType}/${id}/videos`,
      {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_API}`,
          accept: "application/json",
        },
      },
    )
    if (!res.ok) {
      cache.set(cacheKey, null)
      return null
    }
    const data = (await res.json()) as { results?: TmdbVideo[] }
    const youtube = (data.results ?? []).filter((v) => v.site === "YouTube")
    const pick =
      youtube.find((v) => v.type === "Trailer" && v.official) ??
      youtube.find((v) => v.type === "Trailer") ??
      youtube.find((v) => v.type === "Teaser") ??
      youtube[0]
    const key = pick?.key ?? null
    cache.set(cacheKey, key)
    return key
  } catch {
    cache.set(cacheKey, null)
    return null
  }
}
