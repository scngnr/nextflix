import { Modal } from "./modal"
import type { MediaType } from "~/lib/types"
import {
  getShowDetail,
  getMovieSource,
  getUserRating,
} from "~/lib/server-fetchers"

export default async function ShowModal(props: {
  params: { id: number }
  searchParams: { mediaType: MediaType }
}) {
  const [show, source, userRating] = await Promise.all([
    getShowDetail(props.params.id, props.searchParams.mediaType),
    getMovieSource(props.params.id, props.searchParams.mediaType),
    getUserRating(props.params.id, props.searchParams.mediaType),
  ])
  return <Modal show={show} hasSource={!!source} userRating={userRating} />
}
