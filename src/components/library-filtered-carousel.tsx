"use client"

import type { Show } from "~/lib/types"
import { ShowsCarousel } from "~/components/show-carousel"
import { useLibraryFilter } from "~/components/library-filter-provider"

export function LibraryFilteredCarousel({
  title,
  shows,
}: {
  title: string
  shows: Show[]
}) {
  const { filterShows, libraryOnly } = useLibraryFilter()
  const filtered = filterShows(shows)
  if (libraryOnly && !filtered.length) return null
  return <ShowsCarousel title={title} shows={filtered} />
}
