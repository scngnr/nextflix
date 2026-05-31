"use client"

import { useEffect, useState } from "react"
import type { Show } from "~/lib/types"
import { getContinueWatching } from "~/lib/continue-watching"
import { ShowsCarousel } from "~/components/show-carousel"
import { useLocale } from "~/components/locale-provider"
import { buildTmdbUrl } from "~/lib/tmdb-shared"
import { format } from "~/lib/i18n/format"

export function BecauseYouWatchedRow() {
  const { locale, dict } = useLocale()
  const [shows, setShows] = useState<Show[]>([])
  const [seedTitle, setSeedTitle] = useState("")

  useEffect(() => {
    const seed = getContinueWatching()[0]
    if (!seed) return
    setSeedTitle(seed.title)
    const ctrl = new AbortController()
    const url = buildTmdbUrl(
      `/${seed.mediaType}/${seed.id}/recommendations`,
      locale,
    )
    fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_API}`,
        accept: "application/json",
      },
      signal: ctrl.signal,
    })
      .then((r) => (r.ok ? (r.json() as Promise<{ results?: Show[] }>) : null))
      .then((data) => {
        if (!data) return
        setShows(
          (data.results ?? []).filter((s) => s.poster_path ?? s.backdrop_path),
        )
      })
      .catch(() => undefined)
    return () => ctrl.abort()
  }, [locale])

  if (!shows.length) return null

  const title = format(dict.rows.becauseYouWatchedTitle, { title: seedTitle })
  return <ShowsCarousel title={title} shows={shows} />
}
