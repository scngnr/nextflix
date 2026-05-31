import { tmdbFetch } from "~/lib/tmdb"
import type { Show } from "~/lib/types"
import type { KidsFeed } from "~/lib/kids-content"
import { LibraryFilteredCarousel } from "~/components/library-filtered-carousel"

export async function KidsCarouselRow({ feed }: { feed: KidsFeed }) {
  const res = await tmdbFetch(feed.endpoint)
  if (!res.ok) return null
  const data = (await res.json()) as { results?: Show[] }
  const shows = (data.results ?? []).filter(
    (s) => s.poster_path ?? s.backdrop_path,
  )
  if (!shows.length) return null
  return <LibraryFilteredCarousel title={feed.title} shows={shows} />
}
