import type { Show } from "~/lib/types"
import { ShowsCarousel } from "~/components/show-carousel"
import { ERR } from "~/lib/utils"
import { tmdbFetch } from "~/lib/tmdb"
import { HeroSection } from "~/components/hero-section"
import { pickRandomShow } from "~/lib/utils"
import { getLocale } from "~/lib/i18n/get-locale"
import { getDictionary } from "~/lib/i18n/get-dictionary"

export default async function NewAndPopular() {
  const locale = await getLocale()
  const dict = getDictionary(locale)
  const p = dict.pages.newPopular
  const newAndPopularShows = await getNewAndPopularShows()
  const randomShow = pickRandomShow(newAndPopularShows.trendingMovies)

  return (
    <main className="relative px-4 md:px-12">
      <HeroSection show={randomShow} mediaType="movie" />
      <div className="relative z-10 space-y-2 pb-12">
        <ShowsCarousel title={p.popularMovies} shows={newAndPopularShows.popularMovies} />
        <ShowsCarousel title={p.popularTv} shows={newAndPopularShows.popularTvs} />
        <ShowsCarousel title={p.trendingMovies} shows={newAndPopularShows.trendingMovies} />
        <ShowsCarousel title={p.trendingTv} shows={newAndPopularShows.trendingTvs} />
      </div>
    </main>
  )
}

async function getNewAndPopularShows() {
  const [popularTvRes, popularMovieRes, trendingTvRes, trendingMovieRes] =
    await Promise.all([
      tmdbFetch("/tv/popular"),
      tmdbFetch("/movie/popular"),
      tmdbFetch("/trending/tv/day"),
      tmdbFetch("/trending/movie/day"),
    ])

  if (
    !popularTvRes.ok ||
    !popularMovieRes.ok ||
    !trendingTvRes.ok ||
    !trendingMovieRes.ok
  ) {
    throw new Error(ERR.fetch)
  }

  const [popularTvs, popularMovies, trendingTvs, trendingMovies] =
    await Promise.all<{ results: Show[] }>([
      popularTvRes.json(),
      popularMovieRes.json(),
      trendingTvRes.json(),
      trendingMovieRes.json(),
    ])

  if (!popularTvs || !popularMovies || !trendingTvs || !trendingMovies)
    throw new Error(ERR.fetch)

  return {
    popularTvs: popularTvs.results,
    popularMovies: popularMovies.results,
    trendingTvs: trendingTvs.results,
    trendingMovies: trendingMovies.results,
  }
}
