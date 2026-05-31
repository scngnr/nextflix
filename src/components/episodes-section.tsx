"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import type { Episode, Season } from "~/lib/types"
import { getSeasonEpisodesAction } from "~/actions"
import { Loader2 } from "lucide-react"

export function EpisodesSection({
  tvId,
  seasons,
}: {
  tvId: number
  seasons: Season[]
}) {
  const realSeasons = seasons.filter((s) => s.season_number > 0)
  const [season, setSeason] = useState(
    realSeasons[0]?.season_number ?? 1,
  )
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)
    void getSeasonEpisodesAction(tvId, season).then((eps) => {
      if (!active) return
      setEpisodes(eps)
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [tvId, season])

  if (!realSeasons.length) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">Bölümler</h3>
        {realSeasons.length > 1 && (
          <select
            value={season}
            onChange={(e) => setSeason(Number(e.target.value))}
            className="rounded border border-white/30 bg-[#242424] px-3 py-1.5 text-sm text-white outline-none"
          >
            {realSeasons.map((s) => (
              <option key={s.id} value={s.season_number}>
                {s.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-white/60" />
        </div>
      ) : (
        <ul className="divide-y divide-white/10">
          {episodes.map((ep) => (
            <li
              key={ep.id}
              className="flex gap-4 py-4 transition hover:bg-white/5"
            >
              <span className="w-6 shrink-0 text-center text-lg font-semibold text-white/60">
                {ep.episode_number}
              </span>
              <div className="relative aspect-video w-32 shrink-0 overflow-hidden rounded bg-neutral-800 md:w-40">
                {ep.still_path && (
                  <Image
                    src={`https://image.tmdb.org/t/p/w300${ep.still_path}`}
                    alt={ep.name}
                    fill
                    sizes="160px"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate font-medium text-white">{ep.name}</p>
                  {ep.runtime && (
                    <span className="shrink-0 text-sm text-white/50">
                      {ep.runtime}dk
                    </span>
                  )}
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-white/60">
                  {ep.overview}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
