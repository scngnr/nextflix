"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useUser, SignOutButton } from "@clerk/nextjs"
import { getActiveProfileAction, canSeeAdminPanelAction } from "~/actions"
import type { Profile } from "~/lib/types"
import { Button } from "~/components/ui/button"
import { Skeleton } from "~/components/ui/skeleton"
import { useLocale } from "~/components/locale-provider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import {
  Pencil,
  ArrowLeftRight,
  User,
  BadgeCheck,
  Shield,
} from "lucide-react"

export function UserMenu() {
  const { dict } = useLocale()
  const { isLoaded, isSignedIn, user } = useUser()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [showAdminLink, setShowAdminLink] = useState(false)

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return
    let active = true
    void getActiveProfileAction().then((p) => {
      if (active) setProfile(p)
    })
    void canSeeAdminPanelAction().then((v) => {
      if (active) setShowAdminLink(v)
    })
    return () => {
      active = false
    }
  }, [isLoaded, isSignedIn])

  if (!isLoaded) {
    return <Skeleton className="h-8 w-8" />
  }

  if (!isSignedIn || !user) {
    return (
      <Button
        asChild
        className="bg-netflix-red font-semibold text-white hover:bg-netflix-red-dark active:bg-netflix-red-dark"
      >
        <Link href="/sign-in">{dict.auth.signIn}</Link>
      </Button>
    )
  }

  const displayName =
    profile?.name ??
    user.username ??
    user.firstName ??
    user.emailAddresses[0]?.emailAddress ??
    "User"
  const imageUrl = profile?.profileImgPath ?? user.imageUrl

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt="user-image"
          height="32"
          width="32"
          className="rounded-sm"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>{displayName}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link href="/manage-profile">
          <DropdownMenuItem className="gap-1.5">
            <Pencil className="w-5" />
            {dict.auth.manageProfile}
          </DropdownMenuItem>
        </Link>
        <Link href="/switch-profile">
          <DropdownMenuItem className="gap-1.5">
            <ArrowLeftRight className="w-5" />
            {dict.auth.switchProfile}
          </DropdownMenuItem>
        </Link>
        <Link href="/account">
          <DropdownMenuItem className="gap-1.5">
            <User className="w-5" />
            {dict.auth.account}
          </DropdownMenuItem>
        </Link>
        <Link href="/subscription">
          <DropdownMenuItem className="gap-1.5">
            <BadgeCheck className="w-5" />
            {dict.auth.subscription}
          </DropdownMenuItem>
        </Link>
        {showAdminLink && (
          <>
            <DropdownMenuSeparator />
            <Link href="/admin/login">
              <DropdownMenuItem className="gap-1.5 text-netflix-red">
                <Shield className="w-5" />
                {dict.auth.adminPanel}
              </DropdownMenuItem>
            </Link>
          </>
        )}
        <DropdownMenuItem>
          <SignOutButton>
            <Button className="w-full font-semibold">{dict.auth.signOut}</Button>
          </SignOutButton>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
