"use client"

import type { ShowDetail, MediaType } from "~/lib/types"
import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Play, Info, Volume2, VolumeX, RotateCcw } from "lucide-react"
import { getYoutubeEmbedUrl, isDirectVideoUrl } from "~/lib/custom-videos"
import { useLocale } from "~/components/locale-provider"
import { ShowMetaLine } from "~/components/show-meta-line"
import { cn } from "~/lib/utils"

function ytCommand(iframe: HTMLIFrameElement | null, func: string) {
  iframe?.contentWindow?.postMessage(
    JSON.stringify({ event: "command", func, args: [] }),
    "*",
  )
}

export function ShowHero({
  show,
  mediaType,
  trailerKey,
  customUrl,
}: {
  show: ShowDetail
  mediaType: MediaType
  trailerKey: string | null
  customUrl: string | null
}) {
  const { dict } = useLocale()
  const [showTrailer, setShowTrailer] = useState(false)
  const [muted, setMuted] = useState(true)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const title = show.title ?? show.name ?? "Untitled"
  const backdrop = show.backdrop_path ?? show.poster_path
  const youtubeEmbed = customUrl
    ? getYoutubeEmbedUrl(customUrl)
    : trailerKey
      ? `https://www.youtube.com/embed/${trailerKey}`
      : null
  const directUrl = customUrl && isDirectVideoUrl(customUrl) ? customUrl : null
  const hasTrailer = Boolean(youtubeEmbed || directUrl)

  useEffect(() => {
    if (!hasTrailer) return
    const t = setTimeout(() => setShowTrailer(true), 2500)
    return () => clearTimeout(t)
  }, [hasTrailer])

  function toggleMute() {
    setMuted((m) => {
      const next = !m
      if (directUrl && videoRef.current) videoRef.current.muted = next
      else ytCommand(iframeRef.current, next ? "mute" : "unMute")
      return next
    })
  }

  function replay() {
    setShowTrailer(true)
    if (directUrl && videoRef.current) {
      videoRef.current.currentTime = 0
      void videoRef.current.play()
    } else {
      ytCommand(iframeRef.current, "seekTo")
      ytCommand(iframeRef.current, "playVideo")
    }
  }

  return (
    <section className="relative -mx-4 mb-2 md:-mx-12">
      <div className="relative h-[60vh] min-h-[420px] w-full overflow-hidden md:h-[80vh]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <Image
          src={`https://image.tmdb.org/t/p/original${backdrop}`}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-top"
        />

        {showTrailer && directUrl && (
          <video
            ref={videoRef}
            src={directUrl}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        {showTrailer && !directUrl && youtubeEmbed && (
          <iframe
            ref={iframeRef}
            src={`${youtubeEmbed}?autoplay=1&mute=1&controls=0&loop=1&playlist=${
              youtubeEmbed.split("/embed/")[1]
            }&modestbranding=1&playsinline=1&enablejsapi=1&rel=0&showinfo=0`}
            allow="autoplay; encrypted-media"
            className="pointer-events-none absolute left-1/2 top-1/2 h-[140%] w-[140%] -translate-x-1/2 -translate-y-1/2 md:h-[180%] md:w-[180%]"
          />
        )}

        <div className="absolute inset-0 netflix-gradient-hero" />
        <div className="absolute inset-0 netflix-gradient-bottom" />

        <div className="absolute inset-x-0 bottom-[12%] px-4 md:px-12">
          <div className="max-w-xl space-y-3 md:space-y-4">
            {show.logo_path ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`https://image.tmdb.org/t/p/w500${show.logo_path}`}
                alt={title}
                className="max-h-28 w-auto max-w-[70%] object-contain drop-shadow-lg md:max-h-40"
              />
            ) : (
              <h1 className="text-3xl font-bold drop-shadow-lg md:text-5xl lg:text-6xl">
                {title}
              </h1>
            )}

            <ShowMetaLine
              show={show}
              mediaType={mediaType}
              showYear
              showCertification
              showHd
            />

            <p className="line-clamp-2 max-w-lg text-sm text-white/90 drop-shadow-md md:line-clamp-3 md:text-lg">
              {show.overview}
            </p>

            <div className="flex items-center gap-3 pt-1">
              <Link
                href={`/watch/${show.id}?mediaType=${mediaType}`}
                className="flex items-center gap-2 rounded bg-white px-6 py-2 text-sm font-bold text-black transition hover:bg-white/80 md:px-8 md:py-2.5 md:text-base"
              >
                <Play className="h-5 w-5 fill-black" />
                {dict.common.play}
              </Link>
              <Link
                href={`/show/${show.id}?mediaType=${mediaType}`}
                scroll={false}
                className="flex items-center gap-2 rounded bg-white/30 px-5 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20 md:px-6 md:py-2.5 md:text-base"
              >
                <Info className="h-5 w-5" />
                {dict.common.moreInfo}
              </Link>
            </div>
          </div>
        </div>

        {hasTrailer && (
          <div className="absolute bottom-[12%] right-4 flex items-center gap-2 md:right-12">
            <button
              type="button"
              onClick={replay}
              aria-label="Yeniden oynat"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/50 text-white transition hover:border-white md:h-10 md:w-10"
            >
              <RotateCcw className="h-4 w-4 md:h-5 md:w-5" />
            </button>
            <button
              type="button"
              onClick={toggleMute}
              aria-label={muted ? "Sesi aç" : "Sesi kapat"}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full border border-white/50 text-white transition hover:border-white md:h-10 md:w-10",
              )}
            >
              {muted ? (
                <VolumeX className="h-4 w-4 md:h-5 md:w-5" />
              ) : (
                <Volume2 className="h-4 w-4 md:h-5 md:w-5" />
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
