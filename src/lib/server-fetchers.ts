import { tmdbFetch } from "~/lib/tmdb"
import { getLocale } from "~/lib/i18n/get-locale"
import { localeImageLanguages } from "~/lib/i18n/config"
import type {
  Show,
  MyShow,
  ShowWithVideoAndGenre,
  ShowDetail,
  Episode,
} from "~/lib/types"
import { ERR } from "~/lib/utils"
import { db } from "~/db/client"
import { eq, and, desc, sql, ilike } from "drizzle-orm"
import {
  accounts,
  profiles,
  myShows,
  likedShows,
  movieSources,
  watchProgress,
  searchHistory,
  ratings,
} from "~/db/schema"
import { currentUser } from "@clerk/nextjs/server"
import type { MediaType } from "~/lib/types"
import type { LibraryIds } from "~/lib/library-index"

async function getAuthenticatedUserId() {
  const user = await currentUser()
  if (!user) throw new Error(ERR.unauthenticated)
  return user.id
}

async function ensureAccountExists(userId: string) {
  const existing = await db.query.accounts.findFirst({
    where: eq(accounts.id, userId),
  })
  if (existing) return existing

  const user = await currentUser()
  if (!user) throw new Error(ERR.unauthenticated)

  const email = user.emailAddresses[0]!.emailAddress
  const displayName = user.username ?? user.firstName ?? email
  const profileId = `${user.id}-1`

  await db
    .insert(accounts)
    .values({
      id: user.id,
      email,
      activeProfileId: profileId,
    })
    .onConflictDoNothing()

  await db
    .insert(profiles)
    .values({
      id: profileId,
      accountId: user.id,
      profileImgPath: `https://api.dicebear.com/6.x/bottts-neutral/svg?seed=${displayName}`,
      name: displayName,
    })
    .onConflictDoNothing()

  const account = await db.query.accounts.findFirst({
    where: eq(accounts.id, userId),
  })
  if (!account) throw new Error(ERR.db)
  return account
}

export async function getAccount() {
  const userId = await getAuthenticatedUserId()
  return ensureAccountExists(userId)
}

export async function getAccountWithActiveProfile() {
  const userId = await getAuthenticatedUserId()
  await ensureAccountExists(userId)
  const account = await db.query.accounts.findFirst({
    where: eq(accounts.id, userId),
    columns: { activeProfileId: true },
    with: {
      activeProfile: true,
    },
  })
  if (!account) throw new Error(ERR.db)
  return account
}

export async function getAccountWithProfiles() {
  const userId = await getAuthenticatedUserId()
  await ensureAccountExists(userId)
  const account = await db.query.accounts.findFirst({
    where: eq(accounts.id, userId),
    with: {
      profiles: true,
    },
  })
  if (!account) throw new Error(ERR.db)
  return account
}

export async function getProfile(profileId: string) {
  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.id, profileId),
  })
  if (!profile) throw new Error(ERR.db)
  return profile
}

export async function getMyShows(limit: number) {
  const account = await getAccountWithActiveProfile()
  const shows = await db.query.myShows.findMany({
    where: eq(myShows.profileId, account.activeProfileId),
    limit: limit + 1,
  })
  const hasNextPage = shows.length > limit ? true : false
  if (hasNextPage) shows.pop()
  const filteredShows = await getMyShowsFromTmdb(shows)
  return { shows: filteredShows, hasNextPage }
}

export async function getMyShowsFromTmdb(shows: MyShow[]) {
  const data = await Promise.all<Show | null>(
    shows.map(async (show) => {
      const res = await tmdbFetch(`/${show.mediaType}/${show.id}`)
      if (!res.ok) return null
      return res.json()
    }),
  )
  const filteredShows = data.filter((el): el is Show => !!el)
  return filteredShows
}

export async function getShowVideoAndGenreWithStatus(
  showId: number,
  mediaType: MediaType,
) {
  const show = await tmdbFetch(
    `/${mediaType}/${showId}?append_to_response=videos,genres`,
  )
    .then((r) => r.json() as Promise<ShowWithVideoAndGenre>)
    .catch((err) => console.error(err))

  if (!show) throw new Error(ERR.fetch)

  return { show, isSaved: undefined as boolean | undefined }
}

interface RawCertification {
  results?: {
    iso_3166_1: string
    rating?: string
    release_dates?: { certification: string }[]
  }[]
}

function pickCertification(
  mediaType: MediaType,
  movieRatings?: RawCertification,
  tvRatings?: RawCertification,
): string | null {
  if (mediaType === "movie") {
    const us = movieRatings?.results?.find((r) => r.iso_3166_1 === "US")
    const cert = us?.release_dates?.find((d) => d.certification)?.certification
    return cert || null
  }
  const us = tvRatings?.results?.find((r) => r.iso_3166_1 === "US")
  return us?.rating || null
}

export async function getShowDetail(
  showId: number,
  mediaType: MediaType,
): Promise<ShowDetail> {
  const locale = await getLocale()
  const langShort = locale === "tr" ? "tr" : "en"
  const ratingsField =
    mediaType === "movie" ? "release_dates" : "content_ratings"
  const res = await tmdbFetch(
    `/${mediaType}/${showId}?append_to_response=videos,credits,similar,recommendations,images,${ratingsField}&include_image_language=${localeImageLanguages(locale)}`,
  )
  if (!res.ok) throw new Error(ERR.fetch)
  const data = (await res.json()) as ShowDetail & {
    images?: { logos?: { file_path: string; iso_639_1: string | null }[] }
    release_dates?: RawCertification
    content_ratings?: RawCertification
    genres?: { id: number; name: string }[]
  }

  const logo =
    data.images?.logos?.find((l) => l.iso_639_1 === langShort) ??
    data.images?.logos?.find((l) => l.iso_639_1 === "en") ??
    data.images?.logos?.[0]
  const certification = pickCertification(
    mediaType,
    data.release_dates,
    data.content_ratings,
  )

  return {
    ...data,
    genres: data.genres ?? [],
    videos: data.videos ?? { results: [] },
    logo_path: logo?.file_path ?? null,
    certification,
  }
}

export interface PersonCredit {
  id: number
  mediaType: MediaType
  title: string
  poster_path: string | null
  backdrop_path: string | null
  character?: string
  vote_average: number
  date?: string
}

export interface PersonDetail {
  id: number
  name: string
  biography: string
  birthday: string | null
  deathday: string | null
  place_of_birth: string | null
  known_for_department: string | null
  profile_path: string | null
  credits: PersonCredit[]
}

interface RawPersonCredit {
  id: number
  media_type: string
  title?: string
  name?: string
  poster_path: string | null
  backdrop_path: string | null
  character?: string
  vote_average?: number
  release_date?: string
  first_air_date?: string
}

export async function getPersonDetail(
  personId: number,
): Promise<PersonDetail | null> {
  const res = await tmdbFetch(
    `/person/${personId}?append_to_response=combined_credits`,
  )
  if (!res.ok) return null
  const data = (await res.json()) as {
    id: number
    name: string
    biography?: string
    birthday?: string | null
    deathday?: string | null
    place_of_birth?: string | null
    known_for_department?: string | null
    profile_path?: string | null
    combined_credits?: { cast?: RawPersonCredit[] }
  }

  const seen = new Set<string>()
  const credits: PersonCredit[] = (data.combined_credits?.cast ?? [])
    .filter((c) => c.media_type === "movie" || c.media_type === "tv")
    .filter((c) => c.poster_path ?? c.backdrop_path)
    .map((c) => ({
      id: c.id,
      mediaType: c.media_type as MediaType,
      title: c.title ?? c.name ?? "İçerik",
      poster_path: c.poster_path,
      backdrop_path: c.backdrop_path,
      character: c.character,
      vote_average: c.vote_average ?? 0,
      date: c.release_date ?? c.first_air_date,
    }))
    .filter((c) => {
      const key = `${c.mediaType}-${c.id}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .sort((a, b) => b.vote_average - a.vote_average)

  return {
    id: data.id,
    name: data.name,
    biography: data.biography ?? "",
    birthday: data.birthday ?? null,
    deathday: data.deathday ?? null,
    place_of_birth: data.place_of_birth ?? null,
    known_for_department: data.known_for_department ?? null,
    profile_path: data.profile_path ?? null,
    credits,
  }
}

export async function getSeasonEpisodes(
  tvId: number,
  seasonNumber: number,
): Promise<Episode[]> {
  const res = await tmdbFetch(`/tv/${tvId}/season/${seasonNumber}`)
  if (!res.ok) return []
  const data = (await res.json()) as { episodes?: Episode[] }
  return data.episodes ?? []
}

export async function getMyShowIds(): Promise<number[]> {
  const user = await currentUser()
  if (!user) return []
  await ensureAccountExists(user.id)
  const account = await db.query.accounts.findFirst({
    where: eq(accounts.id, user.id),
    columns: { activeProfileId: true },
  })
  if (!account) return []
  const rows = await db.query.myShows.findMany({
    where: eq(myShows.profileId, account.activeProfileId),
    columns: { id: true },
  })
  return rows.map((r) => r.id)
}

export interface MovieSource {
  kind: "mp4" | "hls" | "drive" | "youtube"
  url: string
}

export async function getMovieSource(
  id: number,
  mediaType: MediaType,
): Promise<MovieSource | null> {
  try {
    const row = await db.query.movieSources.findFirst({
      where: and(eq(movieSources.id, id), eq(movieSources.mediaType, mediaType)),
      columns: { kind: true, url: true },
    })
    return row ?? null
  } catch {
    return null
  }
}

export async function getLibraryIds(): Promise<LibraryIds> {
  try {
    const rows = await db.query.movieSources.findMany({
      columns: { id: true, mediaType: true },
    })
    const movies: number[] = []
    const tv: number[] = []
    for (const row of rows) {
      if (row.mediaType === "movie") movies.push(row.id)
      else tv.push(row.id)
    }
    return { movies, tv }
  } catch {
    return { movies: [], tv: [] }
  }
}

export interface ContinueWatchingItem {
  show: Show
  mediaType: MediaType
  progress: number
}

async function getActiveProfileId(): Promise<string | null> {
  const user = await currentUser()
  if (!user) return null
  await ensureAccountExists(user.id)
  const account = await db.query.accounts.findFirst({
    where: eq(accounts.id, user.id),
    columns: { activeProfileId: true },
  })
  return account?.activeProfileId ?? null
}

export async function getContinueWatching(
  limit = 12,
): Promise<ContinueWatchingItem[]> {
  const profileId = await getActiveProfileId()
  if (!profileId) return []
  const rows = await db.query.watchProgress.findMany({
    where: eq(watchProgress.profileId, profileId),
    orderBy: [desc(watchProgress.updatedAt)],
    limit,
  })
  const items = await Promise.all(
    rows.map(async (row) => {
      const res = await tmdbFetch(`/${row.mediaType}/${row.id}`)
      if (!res.ok) return null
      const show = (await res.json()) as Show
      return {
        show,
        mediaType: row.mediaType as MediaType,
        progress: row.progress,
      }
    }),
  )
  return items.filter((el): el is ContinueWatchingItem => !!el)
}

export async function getRecentSearches(limit = 6): Promise<string[]> {
  const profileId = await getActiveProfileId()
  if (!profileId) return []
  const rows = await db.query.searchHistory.findMany({
    where: eq(searchHistory.profileId, profileId),
    orderBy: [desc(searchHistory.createdAt)],
    limit: 30,
    columns: { query: true },
  })
  const seen = new Set<string>()
  const result: string[] = []
  for (const r of rows) {
    const q = r.query.trim()
    const key = q.toLowerCase()
    if (q && !seen.has(key)) {
      seen.add(key)
      result.push(q)
      if (result.length >= limit) break
    }
  }
  return result
}

export async function getUserRating(
  id: number,
  mediaType: MediaType,
): Promise<number> {
  const profileId = await getActiveProfileId()
  if (!profileId) return 0
  const row = await db.query.ratings.findFirst({
    where: and(
      eq(ratings.id, id),
      eq(ratings.mediaType, mediaType),
      eq(ratings.profileId, profileId),
    ),
    columns: { rating: true },
  })
  return row?.rating ?? 0
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function countRows(table: any): Promise<number> {
  const rows = await db.select({ value: sql<number>`count(*)` }).from(table)
  return Number(rows[0]?.value ?? 0)
}

export interface AdminStats {
  accounts: number
  profiles: number
  sources: number
  ratings: number
  inProgress: number
  liked: number
}

export async function getAdminStats(): Promise<AdminStats> {
  const [acc, prof, src, rat, prog, lik] = await Promise.all([
    countRows(accounts),
    countRows(profiles),
    countRows(movieSources),
    countRows(ratings),
    countRows(watchProgress),
    countRows(likedShows),
  ])
  return {
    accounts: acc,
    profiles: prof,
    sources: src,
    ratings: rat,
    inProgress: prog,
    liked: lik,
  }
}

export interface AdminSourceRow {
  id: number
  mediaType: MediaType
  kind: string
  url: string
  title: string | null
  poster_path: string | null
}

export async function listMovieSources({
  page = 0,
  query = "",
  pageSize = 24,
}: {
  page?: number
  query?: string
  pageSize?: number
}): Promise<{ items: AdminSourceRow[]; total: number; pageSize: number }> {
  const where = query.trim()
    ? ilike(movieSources.title, `%${query.trim()}%`)
    : undefined

  const [rows, totalRows] = await Promise.all([
    db.query.movieSources.findMany({
      where,
      orderBy: [desc(movieSources.createdAt)],
      limit: pageSize,
      offset: page * pageSize,
    }),
    db
      .select({ value: sql<number>`count(*)` })
      .from(movieSources)
      .where(where),
  ])

  const items = await Promise.all(
    rows.map(async (row) => {
      let title = row.title
      let poster: string | null = null
      try {
        const res = await tmdbFetch(`/${row.mediaType}/${row.id}`)
        if (res.ok) {
          const d = (await res.json()) as {
            title?: string
            name?: string
            poster_path?: string | null
          }
          title = title ?? d.title ?? d.name ?? null
          poster = d.poster_path ?? null
        }
      } catch {
        /* TMDB hatası önemsiz */
      }
      return {
        id: row.id,
        mediaType: row.mediaType as MediaType,
        kind: row.kind,
        url: row.url,
        title,
        poster_path: poster,
      }
    }),
  )

  return {
    items,
    total: Number(totalRows[0]?.value ?? 0),
    pageSize,
  }
}

export async function getLikedShowIds(): Promise<number[]> {
  const user = await currentUser()
  if (!user) return []
  await ensureAccountExists(user.id)
  const account = await db.query.accounts.findFirst({
    where: eq(accounts.id, user.id),
    columns: { activeProfileId: true },
  })
  if (!account) return []
  const rows = await db.query.likedShows.findMany({
    where: eq(likedShows.profileId, account.activeProfileId),
    columns: { id: true },
  })
  return rows.map((r) => r.id)
}

export async function getLikedShowsForCarousel(limit = 24): Promise<Show[]> {
  const user = await currentUser()
  if (!user) return []
  await ensureAccountExists(user.id)
  const account = await db.query.accounts.findFirst({
    where: eq(accounts.id, user.id),
    columns: { activeProfileId: true },
  })
  if (!account) return []

  const rows = await db.query.likedShows.findMany({
    where: eq(likedShows.profileId, account.activeProfileId),
    limit,
  })

  const data = await Promise.all<Show | null>(
    rows.map(async (row) => {
      const res = await tmdbFetch(`/${row.mediaType}/${row.id}`)
      if (!res.ok) return null
      return res.json() as Promise<Show>
    }),
  )

  return data.filter((s): s is Show => !!s && !!(s.poster_path ?? s.backdrop_path))
}
