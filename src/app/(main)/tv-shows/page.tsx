import { ShowsCarousel } from "~/components/show-carousel"
import { getShows } from "~/lib/client-fetchers"
import { HeroSection } from "~/components/hero-section"
import { pickRandomShow } from "~/lib/utils"
import { getLocale } from "~/lib/i18n/get-locale"
import { getDictionary } from "~/lib/i18n/get-dictionary"

export default async function TvShows() {
  const locale = await getLocale()
  const dict = getDictionary(locale)
  const allShows = await getShows("tv")
  const randomShow = pickRandomShow(allShows.topRated)
  const p = dict.pages.tv

  return (
    <main className="relative px-4 md:px-12">
      <HeroSection show={randomShow} mediaType="tv" />
      <div className="relative z-10 space-y-2 pb-12">
        <ShowsCarousel title={p.trending} shows={allShows.trending} />
        <ShowsCarousel title={p.topRated} shows={allShows.topRated} />
        <ShowsCarousel title={p.action} shows={allShows.actionThriller} />
        <ShowsCarousel title={p.comedy} shows={allShows.comedy} />
        <ShowsCarousel title={p.horror} shows={allShows.horror} />
        <ShowsCarousel title={p.romance} shows={allShows.romance} />
        <ShowsCarousel title={p.documentary} shows={allShows.documentary} />
      </div>
    </main>
  )
}
