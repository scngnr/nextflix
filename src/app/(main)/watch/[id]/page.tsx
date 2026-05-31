import type { MediaType } from "~/lib/types"
import { getShowDetail, getMovieSource } from "~/lib/server-fetchers"
import { getCustomVideoUrl, isDirectVideoUrl } from "~/lib/custom-videos"
import { WatchPlayer, type SourceKind } from "~/components/watch-player"

export default async function WatchPage(props: {
  params: { id: string }
  searchParams: { mediaType?: MediaType }
}) {
  const mediaType = props.searchParams.mediaType ?? "movie"
  const showId = Number(props.params.id)
  const [show, dbSource] = await Promise.all([
    getShowDetail(showId, mediaType),
    getMovieSource(showId, mediaType),
  ])
  const trailer =
    show.videos?.results.find((el) => el.type === "Trailer") ??
    show.videos?.results[0]
  const title = show.title ?? show.name ?? "İzle"

  let customUrl: string | null = null
  let sourceKind: SourceKind | null = null

  if (dbSource) {
    customUrl = dbSource.url
    sourceKind = dbSource.kind
  } else {
    const legacy = getCustomVideoUrl(showId, mediaType)
    if (legacy) {
      customUrl = legacy
      sourceKind = isDirectVideoUrl(legacy)
        ? /\.m3u8(\?|$)/i.test(legacy)
          ? "hls"
          : "mp4"
        : "youtube"
    }
  }

  return (
    <WatchPlayer
      showId={showId}
      mediaType={mediaType}
      title={title}
      poster={show.poster_path ?? null}
      backdrop={show.backdrop_path ?? null}
      customUrl={customUrl}
      sourceKind={sourceKind}
      youtubeKey={customUrl ? null : trailer?.key ?? null}
    />
  )
}
