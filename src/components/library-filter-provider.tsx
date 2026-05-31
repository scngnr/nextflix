"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { getLibraryIdsAction } from "~/actions"
import {
  filterShowsByLibrary,
  toLibrarySets,
  type LibraryIds,
} from "~/lib/library-index"
import type { Show } from "~/lib/types"

const STORAGE_KEY = "canflix_library_only"

interface LibraryFilterContextValue {
  libraryOnly: boolean
  setLibraryOnly: (value: boolean) => void
  ready: boolean
  libraryCount: number
  filterShows: (shows: Show[]) => Show[]
}

const LibraryFilterContext = createContext<LibraryFilterContextValue | null>(
  null,
)

export function LibraryFilterProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [libraryOnly, setLibraryOnlyState] = useState(false)
  const [ids, setIds] = useState<LibraryIds>({ movies: [], tv: [] })
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === "1") setLibraryOnlyState(true)
    void getLibraryIdsAction().then((data) => {
      setIds(data)
      setReady(true)
    })
  }, [])

  const setLibraryOnly = useCallback((value: boolean) => {
    setLibraryOnlyState(value)
    window.localStorage.setItem(STORAGE_KEY, value ? "1" : "0")
  }, [])

  const sets = useMemo(() => toLibrarySets(ids), [ids])

  const filterShows = useCallback(
    (shows: Show[]) => filterShowsByLibrary(shows, libraryOnly, sets),
    [libraryOnly, sets],
  )

  const value = useMemo(
    () => ({
      libraryOnly,
      setLibraryOnly,
      ready,
      libraryCount: ids.movies.length + ids.tv.length,
      filterShows,
    }),
    [libraryOnly, setLibraryOnly, ready, ids, filterShows],
  )

  return (
    <LibraryFilterContext.Provider value={value}>
      {children}
    </LibraryFilterContext.Provider>
  )
}

export function useLibraryFilter() {
  const ctx = useContext(LibraryFilterContext)
  if (!ctx) {
    return {
      libraryOnly: false,
      setLibraryOnly: () => undefined,
      ready: false,
      libraryCount: 0,
      filterShows: (shows: Show[]) => shows,
    }
  }
  return ctx
}
