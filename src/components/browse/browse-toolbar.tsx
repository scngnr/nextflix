"use client"

import Link from "next/link"
import type { MediaType } from "~/lib/types"
import { mapGenreToMediaType } from "~/lib/genres"
import { LibraryFilterSwitch } from "~/components/library-filter-switch"
import { useLocale } from "~/components/locale-provider"
import { cn } from "~/lib/utils"

export function BrowseToolbar({
  title,
  genreId,
  mediaType,
}: {
  title: string
  genreId: number
  mediaType: MediaType
}) {
  const { dict } = useLocale()
  const b = dict.pages.browse
  const movieGenreId = mapGenreToMediaType(genreId, mediaType, "movie")
  const tvGenreId = mapGenreToMediaType(genreId, mediaType, "tv")
  const movieHref = `/browse/${movieGenreId}?mediaType=movie`
  const tvHref = `/browse/${tvGenreId}?mediaType=tv`

  return (
    <header className="mb-5 space-y-4 md:mb-6">
      <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
        {title}
      </h1>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="grid w-full grid-cols-2 overflow-hidden rounded-lg bg-white/5 p-1 ring-1 ring-white/15 sm:w-auto sm:min-w-[220px]">
          <Link
            href={movieHref}
            scroll
            className={cn(
              "relative z-0 rounded-md px-4 py-2.5 text-center text-sm font-semibold transition",
              mediaType === "movie"
                ? "bg-white text-black shadow-sm"
                : "text-white/75 hover:text-white",
            )}
          >
            {b.moviesTab}
          </Link>
          <Link
            href={tvHref}
            scroll
            className={cn(
              "relative z-0 rounded-md px-4 py-2.5 text-center text-sm font-semibold transition",
              mediaType === "tv"
                ? "bg-white text-black shadow-sm"
                : "text-white/75 hover:text-white",
            )}
          >
            {b.tvTab}
          </Link>
        </div>

        <LibraryFilterSwitch className="w-full justify-between sm:w-auto sm:min-w-[240px]" />
      </div>
    </header>
  )
}
