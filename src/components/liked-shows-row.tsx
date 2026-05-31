import { getLikedShowsForCarousel } from "~/lib/server-fetchers"
import { getLocale } from "~/lib/i18n/get-locale"
import { getDictionary } from "~/lib/i18n/get-dictionary"
import { LibraryFilteredCarousel } from "~/components/library-filtered-carousel"

export async function LikedShowsRow() {
  const [shows, locale] = await Promise.all([
    getLikedShowsForCarousel(),
    getLocale(),
  ])
  if (!shows.length) return null

  const dict = getDictionary(locale)
  return <LibraryFilteredCarousel title={dict.rows.liked} shows={shows} />
}
