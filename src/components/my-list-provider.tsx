"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import {
  getSavedShowIdsAction,
  getLikedShowIdsAction,
  toggleMyShow,
  toggleLike,
} from "~/actions"
import type { MediaType } from "~/lib/types"

interface MyListContextValue {
  isSaved: (id: number) => boolean
  toggle: (id: number, mediaType: MediaType) => void
  isLiked: (id: number) => boolean
  toggleLikeShow: (id: number, mediaType: MediaType) => void
  ready: boolean
}

const MyListContext = createContext<MyListContextValue | null>(null)

export function MyListProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useUser()
  const router = useRouter()
  const [saved, setSaved] = useState<Set<number>>(new Set())
  const [liked, setLiked] = useState<Set<number>>(new Set())
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!isLoaded) return
    if (!isSignedIn) {
      setReady(true)
      return
    }
    let active = true
    void Promise.all([
      getSavedShowIdsAction(),
      getLikedShowIdsAction(),
    ]).then(([savedIds, likedIds]) => {
      if (!active) return
      setSaved(new Set(savedIds))
      setLiked(new Set(likedIds))
      setReady(true)
    })
    return () => {
      active = false
    }
  }, [isLoaded, isSignedIn])

  const isSaved = useCallback((id: number) => saved.has(id), [saved])
  const isLiked = useCallback((id: number) => liked.has(id), [liked])

  const toggle = useCallback(
    (id: number, mediaType: MediaType) => {
      if (!isSignedIn) {
        router.push("/sign-in")
        return
      }
      const currentlySaved = saved.has(id)
      setSaved((prev) => {
        const next = new Set(prev)
        if (currentlySaved) next.delete(id)
        else next.add(id)
        return next
      })
      void toggleMyShow({ id, isSaved: currentlySaved, movieOrTv: mediaType })
    },
    [saved, isSignedIn, router],
  )

  const toggleLikeShow = useCallback(
    (id: number, mediaType: MediaType) => {
      if (!isSignedIn) {
        router.push("/sign-in")
        return
      }
      const currentlyLiked = liked.has(id)
      setLiked((prev) => {
        const next = new Set(prev)
        if (currentlyLiked) next.delete(id)
        else next.add(id)
        return next
      })
      void toggleLike({ id, isLiked: currentlyLiked, movieOrTv: mediaType })
    },
    [liked, isSignedIn, router],
  )

  return (
    <MyListContext.Provider
      value={{ isSaved, toggle, isLiked, toggleLikeShow, ready }}
    >
      {children}
    </MyListContext.Provider>
  )
}

export function useMyList() {
  const ctx = useContext(MyListContext)
  if (!ctx) {
    return {
      isSaved: () => false,
      toggle: () => undefined,
      isLiked: () => false,
      toggleLikeShow: () => undefined,
      ready: false,
    } satisfies MyListContextValue
  }
  return ctx
}
