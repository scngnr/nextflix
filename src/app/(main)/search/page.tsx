import { ERR } from "~/lib/utils"
import type { Show } from "~/lib/types"
import { SearchInput } from "./search-input"
import Link from "next/link"
import Image from "next/image"
import { Clock } from "lucide-react"
import { tmdbFetch } from "~/lib/tmdb"
import { getRecentSearches } from "~/lib/server-fetchers"
import { addSearchAction } from "~/actions"
import { getLocale } from "~/lib/i18n/get-locale"
import { getDictionary } from "~/lib/i18n/get-dictionary"

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { keyword: string }
}) {
  const locale = await getLocale()
  const dict = getDictionary(locale)
  const s = dict.pages.search

  if (!searchParams.keyword) {
    const recent = await getRecentSearches()
    return (
      <main className="px-4 pt-24 md:px-12">
        <SearchInput
          initialQuery=""
          placeholder={s.placeholder}
          className="my-8"
        />
        {recent.length > 0 && (
          <div className="mt-4">
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-white">
              <Clock className="h-5 w-5" /> {s.recent}
            </h2>
            <div className="flex flex-wrap gap-2">
              {recent.map((q) => (
                <Link
                  key={q}
                  href={`/search?keyword=${encodeURIComponent(q)}`}
                  className="rounded-full bg-white/10 px-4 py-1.5 text-sm text-white/90 transition hover:bg-white/20"
                >
                  {q}
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    )
  }
  await addSearchAction(searchParams.keyword)
  const shows = await searchShows(searchParams.keyword)
  return (
    <main className="px-4 pt-24 md:px-12">
      <SearchInput
        initialQuery={searchParams.keyword}
        placeholder={s.placeholder}
        className="my-8"
      />
      <div className="grid grid-cols-[repeat(auto-fill,_minmax(160px,_1fr))] gap-4 md:grid-cols-[repeat(auto-fill,_minmax(240px,_1fr))]">
        {shows.map((show) =>
          show.backdrop_path || show.poster_path ? (
            <Link
              href={`/show/${show.id}?mediaType=${show.title ? "movie" : "tv"}`}
              scroll={false}
              key={show.id}
              aria-label={show.title ?? show.name}
              className="overflow-hidden rounded-md outline-none ring-white transition hover:scale-105 focus-visible:ring-2"
            >
              <div className="relative aspect-video w-full">
                <Image
                  src={`https://image.tmdb.org/t/p/w500${
                    show.backdrop_path ?? show.poster_path
                  }`}
                  alt={show.title ?? show.name ?? "show"}
                  fill
                  sizes="(max-width: 768px) 50vw, 240px"
                  className="object-cover"
                />
              </div>
            </Link>
          ) : null,
        )}
      </div>
    </main>
  )
}

async function searchShows(query: string) {
  const res = await tmdbFetch(
    `/search/multi?query=${encodeURIComponent(query)}`,
  )
  if (!res.ok) throw new Error(ERR.fetch)
  const shows = (await res.json()) as { results: Show[] }
  const popularShows = shows.results.sort((a, b) => b.popularity - a.popularity)
  return popularShows
}
