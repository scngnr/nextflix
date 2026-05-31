"use client"

import type { MediaType } from "~/lib/types"
import { useLocale } from "~/components/locale-provider"
import {
  formatGenreLine,
  formatMatchPercent,
  formatTmdbScore,
  inferMediaType,
  type ShowMetaInput,
} from "~/lib/show-meta"
import { cn } from "~/lib/utils"

export function ShowMetaLine({
  show,
  mediaType: mediaTypeProp,
  size = "md",
  className,
  showYear,
  showCertification,
  showHd = true,
}: {
  show: ShowMetaInput & { certification?: string | null }
  mediaType?: MediaType
  size?: "sm" | "md"
  className?: string
  showYear?: boolean
  showCertification?: boolean
  showHd?: boolean
}) {
  const { locale, dict } = useLocale()
  const mediaType = mediaTypeProp ?? inferMediaType(show)
  const match = formatMatchPercent(show.vote_average)
  const tmdb = formatTmdbScore(show.vote_average)
  const genres = formatGenreLine(show, mediaType, locale)
  const year =
    show.release_date?.substring(0, 4) ??
    show.first_air_date?.substring(0, 4)

  const text = size === "sm" ? "text-[11px]" : "text-sm md:text-base"

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-2 gap-y-1 font-medium",
        text,
        className,
      )}
    >
      {match != null && (
        <span className="text-[#46d369]">
          {match}% {dict.meta.match}
        </span>
      )}
      {tmdb && (
        <span className="text-white/85">
          {dict.meta.tmdb}: <span className="text-white">{tmdb}</span>
        </span>
      )}
      {genres && (
        <span className="text-white/70" title={dict.meta.genre}>
          {genres}
        </span>
      )}
      {showYear && year && (
        <span className="text-white/80">{year}</span>
      )}
      {showCertification && show.certification && (
        <span className="rounded border border-white/40 px-1.5 py-0.5 text-xs text-white/80">
          {show.certification}
        </span>
      )}
      {showHd && (
        <span className="rounded border border-white/40 px-1.5 py-0.5 text-xs text-white/70">
          HD
        </span>
      )}
    </div>
  )
}
