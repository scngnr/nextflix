"use client"

import type { Show } from "~/lib/types"
import { Top10Row } from "~/components/top10-row"
import { useLibraryFilter } from "~/components/library-filter-provider"

export function LibraryFilteredTop10({
  title,
  shows,
}: {
  title: string
  shows: Show[]
}) {
  const { filterShows, libraryOnly } = useLibraryFilter()
  const filtered = filterShows(shows)
  if (libraryOnly && !filtered.length) return null
  return <Top10Row title={title} shows={filtered} />
}
