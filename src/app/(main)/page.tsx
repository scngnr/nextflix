import { Suspense } from "react"
import { tmdbFetch } from "~/lib/tmdb"
import type { Show } from "~/lib/types"
import { pickRandomShow } from "~/lib/utils"
import { getShowDetail, getLibraryIds } from "~/lib/server-fetchers"
import { getLocale } from "~/lib/i18n/get-locale"
import { getDictionary } from "~/lib/i18n/get-dictionary"
import { HomeHero } from "~/components/home-hero"
import { CarouselRow } from "~/components/carousel-row"
import { LibraryFilteredTop10 } from "~/components/library-filtered-top10"
import { LibraryFilteredCarousel } from "~/components/library-filtered-carousel"
import { ContinueWatchingSection } from "~/components/continue-watching-section"
import { BecauseYouWatchedRow } from "~/components/because-you-watched-row"
import { LibraryFilterSwitch } from "~/components/library-filter-switch"
import { RowSkeleton } from "~/components/skeletons"

export default async function Home() {
  const locale = await getLocale()
  const dict = getDictionary(locale)
  const rows = [
    { title: dict.home.rows.topRated, endpoint: "/movie/top_rated" },
    { title: dict.home.rows.upcoming, endpoint: "/movie/upcoming" },
    { title: dict.home.rows.nowPlaying, endpoint: "/movie/now_playing" },
    {
      title: dict.home.rows.action,
      endpoint: "/discover/movie?with_genres=28",
    },
    {
      title: dict.home.rows.comedy,
      endpoint: "/discover/movie?with_genres=35",
    },
    {
      title: dict.home.rows.horror,
      endpoint: "/discover/movie?with_genres=27",
    },
    {
      title: dict.home.rows.romance,
      endpoint: "/discover/movie?with_genres=10749",
    },
    {
      title: dict.home.rows.documentary,
      endpoint: "/discover/movie?with_genres=99",
    },
  ]

  const [res, libraryIds] = await Promise.all([
    tmdbFetch("/trending/movie/week"),
    getLibraryIds(),
  ])
  const trending = ((await res.json()) as { results: Show[] }).results
  const randomShow = pickRandomShow(trending)
  const mediaType = "movie" as const
  const defaultDetail = await getShowDetail(randomShow.id, mediaType).catch(
    () => ({
      ...randomShow,
      videos: { results: [] },
      genres: [],
      logo_path: null,
      certification: null,
    }),
  )

  return (
    <main className="relative px-4 lg:px-12">
      <HomeHero
        defaultShow={randomShow}
        defaultDetail={defaultDetail}
        mediaType={mediaType}
        libraryIds={libraryIds}
      />
      <div className="relative z-10 -mt-6 mb-4 px-0 sm:-mt-8 md:-mt-10">
        <LibraryFilterSwitch className="mx-auto w-full max-w-md sm:ml-auto sm:mr-0 sm:max-w-xs" />
      </div>
      <div className="relative z-10 space-y-2 pb-12">
        <Suspense fallback={null}>
          {/* @ts-expect-error Async Server Component */}
          <ContinueWatchingSection />
        </Suspense>
        <BecauseYouWatchedRow />
        <Suspense fallback={<RowSkeleton />}>
          {/* @ts-expect-error Async Server Component */}
          <CarouselRow
            title={dict.home.kidsRow}
            endpoint="/discover/tv?with_genres=10762&sort_by=popularity.desc&vote_count.gte=10"
          />
        </Suspense>
        <LibraryFilteredTop10 title={dict.home.top10} shows={trending} />
        <LibraryFilteredCarousel title={dict.home.trending} shows={trending} />
        {rows.map((row) => (
          <Suspense key={row.endpoint} fallback={<RowSkeleton />}>
            {/* @ts-expect-error Async Server Component */}
            <CarouselRow title={row.title} endpoint={row.endpoint} />
          </Suspense>
        ))}
      </div>
    </main>
  )
}
