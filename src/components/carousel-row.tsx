import { tmdbFetch } from "~/lib/tmdb"
import type { Show } from "~/lib/types"
import { LibraryFilteredCarousel } from "~/components/library-filtered-carousel"

export async function CarouselRow({
  title,
  endpoint,
}: {
  title: string
  endpoint: string
}) {
  const res = await tmdbFetch(endpoint)
  if (!res.ok) return null
  const data = (await res.json()) as { results?: Show[] }
  const shows = (data.results ?? []).filter(
    (s) => s.poster_path ?? s.backdrop_path,
  )
  if (!shows.length) return null
  return <LibraryFilteredCarousel title={title} shows={shows} />
}
