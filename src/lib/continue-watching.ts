"use client"

import type { MediaType } from "~/lib/types"

export interface ContinueItem {
  id: number
  mediaType: MediaType
  title: string
  poster: string | null
  backdrop: string | null
  progress: number
  updatedAt: number
}

const KEY = "np_continue_watching"
const MAX = 20

export function getContinueWatching(): ContinueItem[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return []
    const list = JSON.parse(raw) as ContinueItem[]
    return list.sort((a, b) => b.updatedAt - a.updatedAt)
  } catch {
    return []
  }
}

export function upsertContinueWatching(
  item: Omit<ContinueItem, "updatedAt">,
) {
  if (typeof window === "undefined") return
  const list = getContinueWatching().filter((el) => el.id !== item.id)
  list.unshift({ ...item, updatedAt: Date.now() })
  window.localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)))
}

export function removeContinueWatching(id: number) {
  if (typeof window === "undefined") return
  const list = getContinueWatching().filter((el) => el.id !== id)
  window.localStorage.setItem(KEY, JSON.stringify(list))
}
