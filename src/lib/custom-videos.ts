import type { MediaType } from "~/lib/types"

/**
 * Kendi video adreslerinizi buraya ekleyin.
 * Key formatı: "movie:TMDB_ID" veya "tv:TMDB_ID"
 *
 * Örnek:
 * - public/videos/mario.mp4  →  "/videos/mario.mp4"
 * - Harici CDN               →  "https://site.com/film.mp4"
 * - YouTube                  →  "https://www.youtube.com/watch?v=VIDEO_ID"
 */
export const customVideos: Record<string, string> = {
  // "movie:1084244": "/videos/super-mario-galaxy.mp4",
  // "tv:1399": "/videos/game-of-thrones-pilot.mp4",
}

export function getCustomVideoUrl(
  id: number,
  mediaType: MediaType,
): string | null {
  return customVideos[`${mediaType}:${id}`] ?? null
}

export function getYoutubeEmbedUrl(urlOrKey: string): string | null {
  if (/^[a-zA-Z0-9_-]{11}$/.test(urlOrKey)) {
    return `https://www.youtube.com/embed/${urlOrKey}`
  }

  try {
    const url = new URL(urlOrKey)
    if (url.hostname.includes("youtu.be")) {
      const id = url.pathname.slice(1)
      return id ? `https://www.youtube.com/embed/${id}` : null
    }
    if (url.hostname.includes("youtube.com")) {
      const id = url.searchParams.get("v")
      return id ? `https://www.youtube.com/embed/${id}` : null
    }
  } catch {
    return null
  }

  return null
}

export function isDirectVideoUrl(url: string) {
  return /\.(mp4|webm|ogg|m3u8)(\?|$)/i.test(url) || url.startsWith("/videos/")
}

/**
 * Bir Google Drive paylaşım linkini ya da FILE_ID'sini gömülebilir
 * "preview" oynatıcı URL'sine çevirir.
 */
export function getDrivePreviewUrl(urlOrId: string): string | null {
  if (urlOrId.includes("/preview")) return urlOrId

  let fileId: string | null = null
  const byPath = /\/file\/d\/([a-zA-Z0-9_-]+)/.exec(urlOrId)
  if (byPath) fileId = byPath[1]!
  if (!fileId) {
    try {
      const id = new URL(urlOrId).searchParams.get("id")
      if (id) fileId = id
    } catch {
      // not a URL, maybe a bare id
    }
  }
  if (!fileId && /^[a-zA-Z0-9_-]{20,}$/.test(urlOrId)) fileId = urlOrId
  if (!fileId) return null

  return `https://drive.google.com/file/d/${fileId}/preview`
}
