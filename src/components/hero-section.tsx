import type { Show, MediaType } from "~/lib/types"
import { getShowDetail } from "~/lib/server-fetchers"
import { getCustomVideoUrl } from "~/lib/custom-videos"
import { ShowHero } from "~/components/show-hero"

export async function HeroSection({
  show,
  mediaType,
}: {
  show: Show
  mediaType: MediaType
}) {
  const detail = await getShowDetail(show.id, mediaType).catch(() => null)
  const source = detail ?? {
    ...show,
    videos: { results: [] },
    genres: [],
    logo_path: null,
    certification: null,
  }
  const trailer =
    source.videos.results.find((v) => v.type === "Trailer") ??
    source.videos.results[0]
  const customUrl = getCustomVideoUrl(show.id, mediaType)

  return (
    <ShowHero
      show={source}
      mediaType={mediaType}
      trailerKey={trailer?.key ?? null}
      customUrl={customUrl}
    />
  )
}
