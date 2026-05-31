"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  Gauge,
} from "lucide-react"
import type { MediaType } from "~/lib/types"
import {
  getYoutubeEmbedUrl,
  isDirectVideoUrl,
  getDrivePreviewUrl,
} from "~/lib/custom-videos"
import { upsertContinueWatching } from "~/lib/continue-watching"
import { upsertWatchProgressAction } from "~/actions"
import { cn } from "~/lib/utils"

export type SourceKind = "mp4" | "hls" | "drive" | "youtube"

function fmt(sec: number) {
  if (!Number.isFinite(sec)) return "0:00"
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, "0")}`
}

export function WatchPlayer({
  showId,
  mediaType,
  title,
  poster,
  backdrop,
  customUrl,
  sourceKind,
  youtubeKey,
}: {
  showId: number
  mediaType: MediaType
  title: string
  poster: string | null
  backdrop: string | null
  customUrl: string | null
  sourceKind?: SourceKind | null
  youtubeKey: string | null
}) {
  const backHref = `/show/${showId}?mediaType=${mediaType}`

  const kind: SourceKind | null =
    sourceKind ??
    (customUrl
      ? isDirectVideoUrl(customUrl)
        ? "mp4"
        : "youtube"
      : youtubeKey
        ? "youtube"
        : null)

  useEffect(() => {
    upsertContinueWatching({
      id: showId,
      mediaType,
      title,
      poster,
      backdrop,
      progress: 0,
    })
    // Drive/iframe oynatıcılarda ilerleme olayı yok; en azından açıldı olarak
    // kaydet ki "İzlemeye Devam Et" satırı cihazlar arası dolsun.
    if (kind === "drive") {
      void upsertWatchProgressAction(showId, mediaType, 0)
    }
  }, [showId, mediaType, title, poster, backdrop, kind])

  if (customUrl && kind === "drive") {
    const preview = getDrivePreviewUrl(customUrl)
    return (
      <div className="fixed inset-0 z-[100] flex flex-col bg-black">
        <TopBar title={title} backHref={backHref} />
        <div className="flex flex-1 items-center justify-center">
          {preview ? (
            <iframe
              src={preview}
              allow="autoplay; encrypted-media"
              allowFullScreen
              className="h-full max-h-screen w-full"
            />
          ) : (
            <div className="text-xl font-semibold text-white/60">
              Video bulunamadı
            </div>
          )}
        </div>
      </div>
    )
  }

  if (customUrl && (kind === "mp4" || kind === "hls")) {
    return (
      <DirectVideoPlayer
        src={customUrl}
        isHls={kind === "hls"}
        title={title}
        backHref={backHref}
        onProgress={(progress) => {
          upsertContinueWatching({
            id: showId,
            mediaType,
            title,
            poster,
            backdrop,
            progress,
          })
          void upsertWatchProgressAction(showId, mediaType, progress)
        }}
      />
    )
  }

  const youtubeEmbed = customUrl
    ? getYoutubeEmbedUrl(customUrl)
    : youtubeKey
      ? `https://www.youtube.com/embed/${youtubeKey}`
      : null

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black">
      <TopBar title={title} backHref={backHref} />
      <div className="flex flex-1 items-center justify-center">
        {youtubeEmbed ? (
          <iframe
            src={`${youtubeEmbed}?autoplay=1&rel=0&modestbranding=1`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full max-h-screen w-full"
          />
        ) : (
          <div className="text-xl font-semibold text-white/60">
            Video bulunamadı
          </div>
        )}
      </div>
    </div>
  )
}

function TopBar({ title, backHref }: { title: string; backHref: string }) {
  const router = useRouter()
  return (
    <div className="absolute left-0 top-0 z-10 flex items-center gap-4 bg-gradient-to-b from-black/80 to-transparent p-4 md:p-6">
      <button
        type="button"
        onClick={() =>
          window.history.length > 1 ? router.back() : router.push(backHref)
        }
        className="flex items-center gap-2 text-sm font-medium text-white/80 transition hover:text-white"
      >
        <ArrowLeft className="h-6 w-6" />
        <span className="hidden sm:inline">Geri</span>
      </button>
      <h1 className="text-sm font-semibold text-white md:text-base">{title}</h1>
    </div>
  )
}

function DirectVideoPlayer({
  src,
  isHls,
  title,
  backHref,
  onProgress,
}: {
  src: string
  isHls?: boolean
  title: string
  backHref: string
  onProgress: (progress: number) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const hideTimer = useRef<ReturnType<typeof setTimeout>>()
  const lastSaved = useRef(0)

  const [playing, setPlaying] = useState(true)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(1)
  const [rate, setRate] = useState(1)
  const [showRates, setShowRates] = useState(false)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)

  const RATES = [0.5, 0.75, 1, 1.25, 1.5, 2]

  const revealControls = useCallback(() => {
    setShowControls(true)
    if (hideTimer.current) clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => setShowControls(false), 3000)
  }, [])

  useEffect(() => {
    revealControls()
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current)
    }
  }, [revealControls])

  function togglePlay() {
    const v = videoRef.current
    if (!v) return
    if (v.paused) {
      void v.play()
      setPlaying(true)
    } else {
      v.pause()
      setPlaying(false)
    }
  }

  function seek(delta: number) {
    const v = videoRef.current
    if (!v) return
    v.currentTime = Math.min(
      duration || v.duration,
      Math.max(0, v.currentTime + delta),
    )
  }

  function toggleMute() {
    const v = videoRef.current
    if (!v) return
    v.muted = !v.muted
    setMuted(v.muted)
  }

  function changeVolume(value: number) {
    const v = videoRef.current
    const next = Math.min(1, Math.max(0, value))
    setVolume(next)
    if (v) {
      v.volume = next
      v.muted = next === 0
      setMuted(next === 0)
    }
  }

  function changeRate(value: number) {
    const v = videoRef.current
    setRate(value)
    if (v) v.playbackRate = value
    setShowRates(false)
  }

  function toggleFullscreen() {
    const el = containerRef.current
    if (!el) return
    if (document.fullscreenElement) {
      void document.exitFullscreen()
    } else {
      void el.requestFullscreen()
    }
  }

  useEffect(() => {
    const handler = () => setFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener("fullscreenchange", handler)
    return () => document.removeEventListener("fullscreenchange", handler)
  }, [])

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    if (!isHls) {
      v.src = src
      return
    }
    if (v.canPlayType("application/vnd.apple.mpegurl")) {
      v.src = src
      return
    }
    let cancelled = false
    let hls: { destroy: () => void } | undefined
    void import("hls.js").then(({ default: Hls }) => {
      if (cancelled || !videoRef.current) return
      if (Hls.isSupported()) {
        const instance = new Hls()
        instance.loadSource(src)
        instance.attachMedia(videoRef.current)
        hls = instance
      } else {
        videoRef.current.src = src
      }
    })
    return () => {
      cancelled = true
      hls?.destroy()
    }
  }, [src, isHls])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const v = videoRef.current
      if (!v) return
      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault()
          togglePlay()
          break
        case "ArrowRight":
          e.preventDefault()
          seek(10)
          break
        case "ArrowLeft":
          e.preventDefault()
          seek(-10)
          break
        case "ArrowUp":
          e.preventDefault()
          changeVolume(v.volume + 0.1)
          break
        case "ArrowDown":
          e.preventDefault()
          changeVolume(v.volume - 0.1)
          break
        case "f":
          toggleFullscreen()
          break
        case "m":
          toggleMute()
          break
      }
      revealControls()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function onTimeUpdate() {
    const v = videoRef.current
    if (!v) return
    setCurrent(v.currentTime)
    if (v.duration && v.currentTime - lastSaved.current > 5) {
      lastSaved.current = v.currentTime
      onProgress(Math.round((v.currentTime / v.duration) * 100))
    }
  }

  const pct = duration ? (current / duration) * 100 : 0

  return (
    <div
      ref={containerRef}
      onMouseMove={revealControls}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black"
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        onClick={togglePlay}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        className="h-full max-h-screen w-full object-contain"
      />

      <div
        className={cn(
          "pointer-events-none absolute inset-0 transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0",
        )}
      >
        <div className="pointer-events-auto">
          <TopBar title={title} backHref={backHref} />
        </div>

        <div className="pointer-events-auto absolute inset-x-0 bottom-0 space-y-3 bg-gradient-to-t from-black/90 to-transparent p-4 md:p-6">
          <div
            className="group h-1.5 w-full cursor-pointer rounded-full bg-white/30"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const ratio = (e.clientX - rect.left) / rect.width
              const v = videoRef.current
              if (v && duration) v.currentTime = ratio * duration
            }}
          >
            <div
              className="relative h-full rounded-full bg-netflix-red"
              style={{ width: `${pct}%` }}
            >
              <span className="absolute -right-1.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-netflix-red opacity-0 transition group-hover:opacity-100" />
            </div>
          </div>

          <div className="flex items-center gap-4 text-white">
            <button onClick={togglePlay} aria-label="Oynat/Duraklat">
              {playing ? (
                <Pause className="h-7 w-7 fill-white" />
              ) : (
                <Play className="h-7 w-7 fill-white" />
              )}
            </button>
            <button onClick={() => seek(-10)} aria-label="10 saniye geri">
              <RotateCcw className="h-6 w-6" />
            </button>
            <button onClick={() => seek(10)} aria-label="10 saniye ileri">
              <RotateCw className="h-6 w-6" />
            </button>
            <div className="group/vol flex items-center gap-2">
              <button onClick={toggleMute} aria-label="Ses">
                {muted || volume === 0 ? (
                  <VolumeX className="h-6 w-6" />
                ) : (
                  <Volume2 className="h-6 w-6" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={muted ? 0 : volume}
                onChange={(e) => changeVolume(Number(e.target.value))}
                aria-label="Ses seviyesi"
                className="h-1 w-0 cursor-pointer accent-netflix-red opacity-0 transition-all duration-200 group-hover/vol:w-20 group-hover/vol:opacity-100"
              />
            </div>
            <span className="text-sm tabular-nums text-white/80">
              {fmt(current)} / {fmt(duration)}
            </span>
            <div className="relative ml-auto">
              <button
                onClick={() => setShowRates((s) => !s)}
                aria-label="Oynatma hızı"
                className="flex items-center gap-1 text-sm font-semibold"
              >
                <Gauge className="h-6 w-6" />
                {rate}x
              </button>
              {showRates && (
                <div className="absolute bottom-9 right-0 flex w-24 flex-col overflow-hidden rounded-md bg-black/90 py-1 text-sm ring-1 ring-white/15">
                  {RATES.map((r) => (
                    <button
                      key={r}
                      onClick={() => changeRate(r)}
                      className={cn(
                        "px-3 py-1.5 text-left transition hover:bg-white/10",
                        r === rate ? "font-bold text-white" : "text-white/70",
                      )}
                    >
                      {r}x {r === 1 && "(Normal)"}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={toggleFullscreen} aria-label="Tam ekran">
              {fullscreen ? (
                <Minimize className="h-6 w-6" />
              ) : (
                <Maximize className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
