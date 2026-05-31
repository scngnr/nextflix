"use client"

import { useEffect, useState } from "react"
import type { Show, MediaType, ShowDetail } from "~/lib/types"
import { ShowHero } from "~/components/show-hero"
import { useLibraryFilter } from "~/components/library-filter-provider"
import { useLocale } from "~/components/locale-provider"
import { getCustomVideoUrl } from "~/lib/custom-videos"
import { buildTmdbUrl } from "~/lib/tmdb-shared"

export function HomeHero({
  defaultShow,
  defaultDetail,
  mediaType,
  libraryIds,
}: {
  defaultShow: Show
  defaultDetail: ShowDetail
  mediaType: MediaType
  libraryIds: { movies: number[]; tv: number[] }
}) {
  const { libraryOnly, ready } = useLibraryFilter()
  const { locale } = useLocale()
  const [detail, setDetail] = useState(defaultDetail)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!ready || !libraryOnly) {
      setDetail(defaultDetail)
      return
    }
    const pool = mediaType === "movie" ? libraryIds.movies : libraryIds.tv
    if (!pool.length) {
      setDetail(defaultDetail)
      return
    }

    let cancelled = false
    const id = pool[Math.floor(Math.random() * pool.length)]!
    setLoading(true)

    const url = buildTmdbUrl(
      `/${mediaType}/${id}?append_to_response=videos`,
      locale,
    )
    void fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_API}`,
        accept: "application/json",
      },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: ShowDetail | null) => {
        if (!cancelled && data) setDetail(data)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [libraryOnly, ready, defaultDetail, mediaType, libraryIds, locale])

  const trailer =
    detail.videos?.results.find((v) => v.type === "Trailer") ??
    detail.videos?.results[0]
  const customUrl = getCustomVideoUrl(detail.id, mediaType)

  if (loading && libraryOnly) {
    return (
      <div className="relative aspect-[16/9] w-full max-h-[85vh] animate-pulse bg-neutral-900" />
    )
  }

  return (
    <ShowHero
      show={detail}
      mediaType={mediaType}
      trailerKey={trailer?.key ?? null}
      customUrl={customUrl}
    />
  )
}
