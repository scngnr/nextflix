"use server"
import { z } from "zod"
import { authAction } from "./safe-action-client"
import { db } from "~/db/client"
import { eq, and } from "drizzle-orm"
import {
  accounts,
  profiles,
  myShows,
  likedShows,
  watchProgress,
  searchHistory,
  ratings,
} from "~/db/schema"
import { ERR } from "~/lib/utils"
import { revalidatePath } from "next/cache"
import {
  getAccount,
  getAccountWithProfiles,
  getProfile,
  getAccountWithActiveProfile,
  getMyShowsFromTmdb,
  getMyShowIds,
  getLikedShowIds,
  getSeasonEpisodes,
  getContinueWatching,
  getRecentSearches,
  getLibraryIds,
} from "~/lib/server-fetchers"
import { MediaTuple } from "~/lib/types"
import type { MediaType } from "~/lib/types"
import { isAdmin } from "~/lib/admin"
import { currentUser } from "@clerk/nextjs/server"

/** Admin panel oturumu açık mı (admin/123456 girişi). */
export async function isAdminAction(): Promise<boolean> {
  return isAdmin()
}

export async function getLibraryIdsAction() {
  return getLibraryIds()
}

/** Site menüsünde Admin Panel linki gösterilsin mi (admin panelden atanmış). */
export async function canSeeAdminPanelAction(): Promise<boolean> {
  const user = await currentUser()
  if (!user) return false
  const account = await db.query.accounts.findFirst({
    where: eq(accounts.id, user.id),
    columns: { canAccessAdminPanel: true },
  })
  return account?.canAccessAdminPanel ?? false
}

export async function getSavedShowIdsAction(): Promise<number[]> {
  return getMyShowIds()
}

export async function getLikedShowIdsAction(): Promise<number[]> {
  return getLikedShowIds()
}

export async function getSeasonEpisodesAction(
  tvId: number,
  seasonNumber: number,
) {
  return getSeasonEpisodes(tvId, seasonNumber)
}

export async function getActiveProfileAction() {
  const user = await currentUser()
  if (!user) return null
  try {
    const account = await getAccountWithActiveProfile()
    return account.activeProfile ?? null
  } catch {
    return null
  }
}

export const createProfile = authAction(
  z.object({
    name: z.string().min(2).max(20),
  }),
  async (input, { userId }) => {
    const account = await getAccountWithProfiles()
    if (account.profiles.length === 4) throw new Error(ERR.not_allowed)
    const takenProfileSlots = account.profiles.map((profile) =>
      Number(profile.id.at(-1)),
    )
    const openProfileSlot = [1, 2, 3, 4].find(
      (el) => !takenProfileSlots.includes(el),
    )
    if (!openProfileSlot) throw new Error(ERR.undefined)
    await db.insert(profiles).values({
      id: `${userId}-${openProfileSlot}`,
      accountId: userId,
      name: input.name,
      profileImgPath: `https://api.dicebear.com/6.x/bottts-neutral/svg?seed=${input.name}`,
    })
    revalidatePath("/manage-profile")
    return { message: "Profile Created" }
  },
)

export const deleteProfile = authAction(
  z.object({
    profileId: z.string(),
  }),
  async (input) => {
    const account = await getAccountWithProfiles()
    if (account.activeProfileId === input.profileId)
      return { message: "Cannot delete active profile" }
    if (!account.profiles.find((profile) => profile.id === input.profileId))
      throw new Error(ERR.unauthorized)
    await db.delete(profiles).where(eq(profiles.id, input.profileId))
    revalidatePath("/manage-profile")
    return { message: "Profile Deleted" }
  },
)

export const updateProfile = authAction(
  z.object({
    profileId: z.string(),
    name: z.string().min(2).max(20),
  }),
  async (input, { userId }) => {
    const profile = await getProfile(input.profileId)
    if (userId !== profile.accountId) throw new Error(ERR.unauthorized)
    await db
      .update(profiles)
      .set({
        name: input.name,
        profileImgPath: `https://api.dicebear.com/6.x/bottts-neutral/svg?seed=${input.name}`,
      })
      .where(eq(profiles.id, input.profileId))
    revalidatePath("/manage-profile")
    return { message: "Profile Updated" }
  },
)

export const switchProfile = authAction(
  z.object({
    profileId: z.string(),
  }),
  async (input, { userId }) => {
    const profile = await getProfile(input.profileId)
    if (profile.accountId !== userId) throw new Error(ERR.unauthorized)
    await db
      .update(accounts)
      .set({
        activeProfileId: input.profileId,
      })
      .where(eq(accounts.id, userId))
    revalidatePath("/")
    return { message: "You have switched active profile" }
  },
)

export const toggleMyShow = authAction(
  z.object({
    id: z.number(),
    isSaved: z.boolean(),
    movieOrTv: z.enum(MediaTuple),
  }),
  async (input) => {
    const account = await getAccount()
    if (!input.isSaved) {
      await db.insert(myShows).values({
        id: input.id,
        mediaType: input.movieOrTv,
        profileId: account.activeProfileId,
      })
      return { isSaved: true }
    } else {
      await db.delete(myShows).where(eq(myShows.id, input.id))
      return { isSaved: false }
    }
  },
)

export const toggleLike = authAction(
  z.object({
    id: z.number(),
    isLiked: z.boolean(),
    movieOrTv: z.enum(MediaTuple),
  }),
  async (input) => {
    const account = await getAccount()
    if (!input.isLiked) {
      await db
        .insert(likedShows)
        .values({
          id: input.id,
          mediaType: input.movieOrTv,
          profileId: account.activeProfileId,
        })
        .onConflictDoNothing()
      return { isLiked: true }
    } else {
      await db
        .delete(likedShows)
        .where(
          and(
            eq(likedShows.id, input.id),
            eq(likedShows.profileId, account.activeProfileId),
          ),
        )
      return { isLiked: false }
    }
  },
)

export async function upsertWatchProgressAction(
  id: number,
  mediaType: MediaType,
  progress: number,
) {
  const user = await currentUser()
  if (!user) return
  try {
    const account = await getAccount()
    await db
      .insert(watchProgress)
      .values({
        id,
        mediaType,
        profileId: account.activeProfileId,
        progress: Math.max(0, Math.round(progress)),
      })
      .onConflictDoUpdate({
        target: [
          watchProgress.id,
          watchProgress.mediaType,
          watchProgress.profileId,
        ],
        set: { progress: Math.max(0, Math.round(progress)), updatedAt: new Date() },
      })
  } catch (err) {
    console.error("upsertWatchProgress", err)
  }
}

export async function removeWatchProgressAction(
  id: number,
  mediaType: MediaType,
) {
  const user = await currentUser()
  if (!user) return
  try {
    const account = await getAccount()
    await db
      .delete(watchProgress)
      .where(
        and(
          eq(watchProgress.id, id),
          eq(watchProgress.mediaType, mediaType),
          eq(watchProgress.profileId, account.activeProfileId),
        ),
      )
  } catch (err) {
    console.error("removeWatchProgress", err)
  }
}

export async function getContinueWatchingAction() {
  return getContinueWatching()
}

export async function addSearchAction(query: string) {
  const user = await currentUser()
  if (!user) return
  const trimmed = query.trim().slice(0, 256)
  if (trimmed.length < 2) return
  try {
    const account = await getAccount()
    await db.insert(searchHistory).values({
      profileId: account.activeProfileId,
      query: trimmed,
    })
  } catch (err) {
    console.error("addSearch", err)
  }
}

export async function getRecentSearchesAction() {
  return getRecentSearches()
}

export async function setRatingAction(
  id: number,
  mediaType: MediaType,
  rating: number,
) {
  const user = await currentUser()
  if (!user) return
  const value = Math.min(5, Math.max(1, Math.round(rating)))
  try {
    const account = await getAccount()
    await db
      .insert(ratings)
      .values({ id, mediaType, profileId: account.activeProfileId, rating: value })
      .onConflictDoUpdate({
        target: [ratings.id, ratings.mediaType, ratings.profileId],
        set: { rating: value, createdAt: new Date() },
      })
  } catch (err) {
    console.error("setRating", err)
  }
}

export async function removeRatingAction(id: number, mediaType: MediaType) {
  const user = await currentUser()
  if (!user) return
  try {
    const account = await getAccount()
    await db
      .delete(ratings)
      .where(
        and(
          eq(ratings.id, id),
          eq(ratings.mediaType, mediaType),
          eq(ratings.profileId, account.activeProfileId),
        ),
      )
  } catch (err) {
    console.error("removeRating", err)
  }
}

export const getMyShowsInfinite = authAction(
  z.object({
    index: z.number().min(0),
    limit: z.number().min(2).max(50),
  }),
  async (input) => {
    const account = await getAccountWithActiveProfile()
    const shows = await db.query.myShows.findMany({
      where: eq(myShows.profileId, account.activeProfileId),
      limit: input.limit + 1,
      offset: input.index * input.limit,
    })
    const hasNextPage = shows.length > input.limit ? true : false
    if (hasNextPage) shows.pop()
    const filteredShows = await getMyShowsFromTmdb(shows)
    return { shows: filteredShows, hasNextPage }
  },
)
