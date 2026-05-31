"use server"

import { revalidatePath } from "next/cache"
import { and, eq, desc } from "drizzle-orm"
import { db } from "~/db/client"
import { movieSources, accounts } from "~/db/schema"
import { tmdbFetch } from "~/lib/tmdb"
import { isAdmin } from "~/lib/admin"
import type { MediaType } from "~/lib/types"

export type SourceKind = "mp4" | "hls" | "drive" | "youtube"

export interface AdminSearchResult {
  id: number
  mediaType: MediaType
  title: string
  year: string | null
  poster_path: string | null
}

async function assertAdmin() {
  if (!(await isAdmin())) throw new Error("unauthorized")
}

export async function adminSearchTmdb(
  query: string,
): Promise<AdminSearchResult[]> {
  await assertAdmin()
  const q = query.trim()
  if (q.length < 2) return []
  const res = await tmdbFetch(`/search/multi?query=${encodeURIComponent(q)}`)
  if (!res.ok) return []
  const data = (await res.json()) as {
    results: {
      id: number
      media_type: string
      title?: string
      name?: string
      release_date?: string
      first_air_date?: string
      poster_path?: string | null
    }[]
  }
  return data.results
    .filter((r) => r.media_type === "movie" || r.media_type === "tv")
    .slice(0, 12)
    .map((r) => ({
      id: r.id,
      mediaType: r.media_type as MediaType,
      title: r.title ?? r.name ?? "İçerik",
      year: (r.release_date ?? r.first_air_date)?.slice(0, 4) ?? null,
      poster_path: r.poster_path ?? null,
    }))
}

export async function adminUpsertSource(input: {
  id: number
  mediaType: MediaType
  kind: SourceKind
  url: string
  title?: string | null
}) {
  await assertAdmin()
  const url = input.url.trim()
  if (!url) throw new Error("url-required")
  await db
    .insert(movieSources)
    .values({
      id: input.id,
      mediaType: input.mediaType,
      kind: input.kind,
      url,
      title: input.title ?? null,
    })
    .onConflictDoUpdate({
      target: [movieSources.id, movieSources.mediaType],
      set: { kind: input.kind, url, title: input.title ?? null },
    })
  revalidatePath("/admin/sources")
  return { ok: true }
}

export async function adminDeleteSource(id: number, mediaType: MediaType) {
  await assertAdmin()
  await db
    .delete(movieSources)
    .where(
      and(eq(movieSources.id, id), eq(movieSources.mediaType, mediaType)),
    )
  revalidatePath("/admin/sources")
  return { ok: true }
}

export interface PlatformAccountRow {
  id: string
  email: string
  createdAt: Date
  canAccessAdminPanel: boolean
}

export async function adminListPlatformAccounts(): Promise<
  PlatformAccountRow[]
> {
  await assertAdmin()
  return db
    .select({
      id: accounts.id,
      email: accounts.email,
      createdAt: accounts.createdAt,
      canAccessAdminPanel: accounts.canAccessAdminPanel,
    })
    .from(accounts)
    .orderBy(desc(accounts.createdAt))
}

export async function adminSetPlatformAdmin(
  accountId: string,
  enabled: boolean,
) {
  await assertAdmin()
  await db
    .update(accounts)
    .set({ canAccessAdminPanel: enabled })
    .where(eq(accounts.id, accountId))
  revalidatePath("/admin/users")
  return { ok: true }
}
