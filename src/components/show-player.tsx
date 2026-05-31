import {
  getYoutubeEmbedUrl,
  isDirectVideoUrl,
  getCustomVideoUrl,
} from "~/lib/custom-videos"

export function ShowPlayer({
  customUrl,
  youtubeKey,
  autoPlay = false,
  className,
}: {
  customUrl?: string | null
  youtubeKey?: string | null
  autoPlay?: boolean
  className?: string
}) {
  const playerClass =
    className ?? "aspect-video w-full rounded-lg bg-black object-cover"

  if (customUrl) {
    const youtubeEmbed = getYoutubeEmbedUrl(customUrl)
    if (youtubeEmbed) {
      const src = autoPlay
        ? `${youtubeEmbed}${youtubeEmbed.includes("?") ? "&" : "?"}autoplay=1&mute=1`
        : youtubeEmbed
      return (
        <iframe
          src={src}
          className={playerClass}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )
    }

    if (isDirectVideoUrl(customUrl)) {
      return (
        <video
          src={customUrl}
          controls
          autoPlay={autoPlay}
          muted={autoPlay}
          playsInline
          className={playerClass}
        />
      )
    }

    return (
      <video
        src={customUrl}
        controls
        autoPlay={autoPlay}
        muted={autoPlay}
        playsInline
        className={playerClass}
      />
    )
  }

  if (youtubeKey) {
    const src = autoPlay
      ? `https://www.youtube.com/embed/${youtubeKey}?autoplay=1&mute=1`
      : `https://www.youtube.com/embed/${youtubeKey}`
    return (
      <iframe
        src={src}
        className={playerClass}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    )
  }

  return (
    <div
      className={`grid place-content-center bg-neutral-900 text-xl font-semibold text-white/60 ${playerClass}`}
    >
      Video bulunamadı
    </div>
  )
}

export function getWatchVideoSources(
  showId: number,
  mediaType: "movie" | "tv",
  trailerKey?: string | null,
) {
  const customUrl = getCustomVideoUrl(showId, mediaType)
  return { customUrl, youtubeKey: customUrl ? null : trailerKey ?? null }
}
