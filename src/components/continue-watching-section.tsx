import { currentUser } from "@clerk/nextjs/server"
import { getContinueWatching } from "~/lib/server-fetchers"
import { ContinueWatchingRow } from "~/components/continue-watching-row"
import {
  ContinueWatchingDb,
  type DbContinueItem,
} from "~/components/continue-watching-db"

export async function ContinueWatchingSection() {
  const user = await currentUser()
  if (!user) return <ContinueWatchingRow />

  const items = await getContinueWatching()
  if (!items.length) return <ContinueWatchingRow />

  const mapped: DbContinueItem[] = items.map(({ show, mediaType, progress }) => ({
    id: show.id,
    mediaType,
    title: show.title ?? show.name ?? "İçerik",
    image: show.backdrop_path ?? show.poster_path ?? null,
    progress,
  }))

  return <ContinueWatchingDb items={mapped} />
}
