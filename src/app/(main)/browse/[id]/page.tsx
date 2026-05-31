import type { Metadata } from "next"
import { redirect } from "next/navigation"
import type { MediaType } from "~/lib/types"
import {
  genresFor,
  genreName,
  isValidGenre,
  localizedGenres,
} from "~/lib/genres"
import { getLocale } from "~/lib/i18n/get-locale"
import { getDictionary } from "~/lib/i18n/get-dictionary"
import { format } from "~/lib/i18n/format"
import { BrowseGrid } from "~/components/browse-grid"
import { BrowseToolbar } from "~/components/browse/browse-toolbar"
import { GenreChipsRow } from "~/components/browse/genre-chips-row"

function resolveMediaType(value?: string): MediaType {
  return value === "tv" ? "tv" : "movie"
}

export async function generateMetadata(props: {
  params: { id: string }
  searchParams: { mediaType?: string }
}): Promise<Metadata> {
  const locale = await getLocale()
  const dict = getDictionary(locale)
  const mediaType = resolveMediaType(props.searchParams.mediaType)
  const name = genreName(Number(props.params.id), mediaType, locale)
  const typeLabel =
    mediaType === "tv"
      ? dict.pages.browse.typeTv
      : dict.pages.browse.typeMovies

  return {
    title: format(dict.pages.browse.metaTitle, { genre: name }),
    description: format(dict.pages.browse.metaDescription, {
      genre: name,
      type: typeLabel,
    }),
  }
}

export default async function BrowsePage(props: {
  params: { id: string }
  searchParams: { mediaType?: string }
}) {
  const locale = await getLocale()
  const mediaType = resolveMediaType(props.searchParams.mediaType)
  const genreId = Number(props.params.id)
  const genres = genresFor(mediaType)

  if (!isValidGenre(genreId, mediaType)) {
    redirect(`/browse/${genres[0]!.id}?mediaType=${mediaType}`)
  }

  const localized = localizedGenres(mediaType, locale)

  return (
    <main className="px-4 pb-12 pt-20 sm:pt-24 md:px-12">
      <BrowseToolbar
        title={genreName(genreId, mediaType, locale)}
        genreId={genreId}
        mediaType={mediaType}
      />

      <GenreChipsRow
        genres={localized}
        activeId={genreId}
        mediaType={mediaType}
      />

      <BrowseGrid genreId={genreId} mediaType={mediaType} />
    </main>
  )
}
