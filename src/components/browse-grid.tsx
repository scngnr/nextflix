"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Loader2 } from "lucide-react"
import type { Show, MediaType } from "~/lib/types"
import { useLibraryFilter } from "~/components/library-filter-provider"
import { useLocale } from "~/components/locale-provider"
import { localeToTmdb } from "~/lib/i18n/config"

export function BrowseGrid({
  genreId,
  mediaType,
}: {
  genreId: number
  mediaType: MediaType
}) {
  const [shows, setShows] = useState<Show[]>([])
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const sentinel = useRef<HTMLDivElement>(null)
  const seen = useRef(new Set<number>())
  const { libraryOnly, filterShows } = useLibraryFilter()
  const { locale, dict } = useLocale()
  const { language, region } = localeToTmdb(locale)

  const load = useCallback(async () => {
    setLoading(true)
    const next = page + 1
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/discover/${mediaType}?with_genres=${genreId}&page=${next}&sort_by=popularity.desc&vote_count.gte=50&language=${encodeURIComponent(language)}&region=${encodeURIComponent(region)}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_API}`,
            accept: "application/json",
          },
        },
      )
      if (!res.ok) {
        setDone(true)
        return
      }
      const data = (await res.json()) as {
        results?: Show[]
        total_pages?: number
      }
      let results = (data.results ?? []).filter(
        (s) => (s.poster_path ?? s.backdrop_path) && !seen.current.has(s.id),
      )
      results.forEach((s) => seen.current.add(s.id))
      results = filterShows(results)
      setShows((prev) => [...prev, ...results])
      if (libraryOnly && results.length === 0 && next < (data.total_pages ?? next)) {
        setLoading(false)
        return
      }
      setPage(next)
      if (next >= (data.total_pages ?? next)) setDone(true)
    } catch {
      setDone(true)
    } finally {
      setLoading(false)
    }
  }, [page, genreId, mediaType, libraryOnly, filterShows, language, region])

  useEffect(() => {
    setShows([])
    setPage(0)
    setDone(false)
    seen.current = new Set()
  }, [genreId, mediaType, libraryOnly])

  useEffect(() => {
    const el = sentinel.current
    if (!el || done) return
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !loading) void load()
      },
      { rootMargin: "600px" },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [load, loading, done])

  return (
    <div>
      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
        {shows.map((show) => {
          const title = show.title ?? show.name ?? "Untitled"
          const poster = show.poster_path ?? show.backdrop_path
          return (
            <li key={show.id}>
              <Link
                href={`/show/${show.id}?mediaType=${mediaType}`}
                scroll={false}
                aria-label={title}
                className="group block overflow-hidden rounded-md bg-neutral-800 outline-none ring-white transition focus-visible:ring-2"
              >
                <div className="relative aspect-[2/3] w-full">
                  <Image
                    src={`https://image.tmdb.org/t/p/w500${poster}`}
                    alt={title}
                    fill
                    sizes="(max-width: 640px) 33vw, (max-width: 1024px) 20vw, 14vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              </Link>
            </li>
          )
        })}
      </ul>

      <div ref={sentinel} className="flex justify-center py-10">
        {loading && <Loader2 className="h-7 w-7 animate-spin text-white/60" />}
        {done && !shows.length && (
          <p className="text-white/60">
            {libraryOnly
              ? dict.pages.browse.emptyLibrary
              : dict.pages.browse.empty}
          </p>
        )}
        {done && shows.length > 0 && (
          <p className="text-sm text-white/40">{dict.pages.browse.allLoaded}</p>
        )}
      </div>
    </div>
  )
}
