"use client"

import { useEffect, useState } from "react"
import type { Show } from "~/lib/types"
import { getContinueWatching } from "~/lib/continue-watching"
import { ShowsCarousel } from "~/components/show-carousel"

export function BecauseYouWatchedRow() {
  const [shows, setShows] = useState<Show[]>([])
  const [seedTitle, setSeedTitle] = useState("")

  useEffect(() => {
    const seed = getContinueWatching()[0]
    if (!seed) return
    setSeedTitle(seed.title)
    const ctrl = new AbortController()
    fetch(
      `https://api.themoviedb.org/3/${seed.mediaType}/${seed.id}/recommendations`,
      {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_API}`,
          accept: "application/json",
        },
        signal: ctrl.signal,
      },
    )
      .then((r) => (r.ok ? (r.json() as Promise<{ results?: Show[] }>) : null))
      .then((data) => {
        if (!data) return
        setShows(
          (data.results ?? []).filter((s) => s.poster_path ?? s.backdrop_path),
        )
      })
      .catch(() => undefined)
    return () => ctrl.abort()
  }, [])

  if (!shows.length) return null
  return <ShowsCarousel title={`Çünkü "${seedTitle}" izledin`} shows={shows} />
}
