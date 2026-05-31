import type { MediaType, Show } from "~/lib/types"

export interface LibraryIds {
  movies: number[]
  tv: number[]
}

export function toLibrarySets(ids: LibraryIds) {
  return {
    movies: new Set(ids.movies),
    tv: new Set(ids.tv),
  }
}

export function showMediaType(show: Show): MediaType {
  return show.title ? "movie" : "tv"
}

export function hasInLibrary(
  id: number,
  mediaType: MediaType,
  sets: { movies: Set<number>; tv: Set<number> },
): boolean {
  return mediaType === "movie" ? sets.movies.has(id) : sets.tv.has(id)
}

export function filterShowsByLibrary(
  shows: Show[],
  libraryOnly: boolean,
  sets: { movies: Set<number>; tv: Set<number> },
): Show[] {
  if (!libraryOnly) return shows
  return shows.filter((s) =>
    hasInLibrary(s.id, showMediaType(s), sets),
  )
}
