import type { Metadata } from "next"
import { ModalCard } from "~/components/modal-card"
import type { MediaType } from "~/lib/types"
import {
  getShowDetail,
  getMovieSource,
  getUserRating,
} from "~/lib/server-fetchers"

export async function generateMetadata(props: {
  params: { id: number }
  searchParams: { mediaType: MediaType }
}): Promise<Metadata> {
  try {
    const show = await getShowDetail(
      props.params.id,
      props.searchParams.mediaType,
    )
    const title = show.title ?? show.name ?? "İçerik"
    const description =
      show.overview?.slice(0, 200) ?? "Nextflix'te izle."
    const image = show.backdrop_path
      ? `https://image.tmdb.org/t/p/w1280${show.backdrop_path}`
      : undefined

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "video.other",
        images: image ? [{ url: image }] : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: image ? [image] : undefined,
      },
    }
  } catch {
    return { title: "İçerik" }
  }
}

export default async function ShowPage(props: {
  params: { id: number }
  searchParams: { mediaType: MediaType }
}) {
  const [show, source, userRating] = await Promise.all([
    getShowDetail(props.params.id, props.searchParams.mediaType),
    getMovieSource(props.params.id, props.searchParams.mediaType),
    getUserRating(props.params.id, props.searchParams.mediaType),
  ])
  return (
    <main className="px-4 py-24 md:px-12">
      <ModalCard
        show={show}
        hasSource={!!source}
        userRating={userRating}
        showBack
        className="mx-auto w-full max-w-4xl"
      />
    </main>
  )
}
