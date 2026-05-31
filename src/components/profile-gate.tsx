"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"

export function ProfileGate() {
  const { isLoaded, isSignedIn } = useUser()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return
    if (typeof window === "undefined") return
    const chosen = window.sessionStorage.getItem("np_profile_chosen") === "1"
    if (chosen) return
    if (
      pathname.startsWith("/switch-profile") ||
      pathname.startsWith("/manage-profile")
    )
      return
    router.replace("/switch-profile")
  }, [isLoaded, isSignedIn, pathname, router])

  return null
}
