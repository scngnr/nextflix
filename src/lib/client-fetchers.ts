import type { Show, MediaType } from "./types"
import { ERR } from "./utils"
import { tmdbFetchClient } from "./tmdb-client"

export async function getShows(mediaType: MediaType) {
  const [
    trendingRes,
    topRatedRes,
    actionThrillerRes,
    comedyRes,
    horrorRes,
    romanceRes,
    documentaryRes,
  ] = await Promise.all([
    tmdbFetchClient(`/trending/${mediaType}/week`),
    tmdbFetchClient(`/${mediaType}/top_rated`),
    tmdbFetchClient(`/discover/${mediaType}?with_genres=28`),
    tmdbFetchClient(`/discover/${mediaType}?with_genres=35`),
    tmdbFetchClient(`/discover/${mediaType}?with_genres=27`),
    tmdbFetchClient(`/discover/${mediaType}?with_genres=10749`),
    tmdbFetchClient(`/discover/${mediaType}?with_genres=99`),
  ])

  if (
    !trendingRes.ok ||
    !topRatedRes.ok ||
    !actionThrillerRes.ok ||
    !comedyRes.ok ||
    !horrorRes.ok ||
    !romanceRes.ok ||
    !documentaryRes.ok
  )
    throw new Error(ERR.fetch)

  const [
    trending,
    topRated,
    actionThriller,
    comedy,
    horror,
    romance,
    documentary,
  ] = await Promise.all<{ results: Show[] }>([
    trendingRes.json(),
    topRatedRes.json(),
    actionThrillerRes.json(),
    comedyRes.json(),
    horrorRes.json(),
    romanceRes.json(),
    documentaryRes.json(),
  ])

  if (
    !trending ||
    !topRated ||
    !actionThriller ||
    !comedy ||
    !horror ||
    !romance ||
    !documentary
  )
    throw new Error(ERR.fetch)

  return {
    trending: trending.results,
    topRated: topRated.results,
    actionThriller: actionThriller.results,
    comedy: comedy.results,
    horror: horror.results,
    romance: romance.results,
    documentary: documentary.results,
  }
}
