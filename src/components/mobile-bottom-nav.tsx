"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import type { LucideIcon } from "lucide-react"
import {
  Home,
  LayoutGrid,
  Search,
  ListVideo,
  User,
} from "lucide-react"
import { KidsNavIcon } from "~/components/kids/kids-nav-icon"
import { useLocale } from "~/components/locale-provider"
import { cn } from "~/lib/utils"

type NavItem = {
  name: string
  href: string
  match: (p: string) => boolean
  protected?: boolean
  icon?: LucideIcon
  kidsImage?: boolean
}

export function MobileBottomNav() {
  const pathname = usePathname()
  const { isSignedIn } = useUser()
  const { dict } = useLocale()

  const ITEMS: NavItem[] = [
    {
      name: dict.nav.home,
      href: "/",
      icon: Home,
      match: (p) => p === "/",
    },
    {
      name: dict.nav.genres,
      href: "/browse/28?mediaType=movie",
      icon: LayoutGrid,
      match: (p) => p.startsWith("/browse"),
    },
    {
      name: dict.nav.kids,
      href: "/kids",
      kidsImage: true,
      match: (p) => p.startsWith("/kids"),
    },
    {
      name: dict.nav.search,
      href: "/search?keyword=",
      icon: Search,
      match: (p) => p.startsWith("/search"),
    },
    {
      name: dict.nav.myList,
      href: "/my-list",
      icon: ListVideo,
      match: (p) => p.startsWith("/my-list"),
      protected: true,
    },
    {
      name: dict.nav.profile,
      href: "/account",
      icon: User,
      match: (p) =>
        p.startsWith("/account") ||
        p.startsWith("/manage-profile") ||
        p.startsWith("/switch-profile"),
    },
  ]

  if (pathname.startsWith("/watch")) return null

  return (
    <nav
      aria-label={dict.nav.mainMenu}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#141414] lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <ul className="mx-auto grid h-[4.25rem] max-w-lg grid-cols-6 items-end px-0.5 pb-1.5 pt-1">
        {ITEMS.map((item) => {
          const active = item.match(pathname)
          const href =
            item.protected && !isSignedIn ? "/sign-in" : item.href
          const Icon = item.icon

          return (
            <li key={item.href} className="min-w-0">
              <Link
                href={href}
                aria-label={item.name}
                className={cn(
                  "flex flex-col items-center justify-end gap-0.5 px-0.5 transition",
                  item.kidsImage ? "pb-0" : "pb-0.5",
                  active
                    ? "text-white"
                    : "text-white/50 hover:text-white/80",
                )}
              >
                {item.kidsImage ? (
                  <span
                    className={cn(
                      "flex h-11 w-full items-center justify-center",
                      active && "scale-105",
                    )}
                  >
                    <KidsNavIcon active={active} variant="badge" />
                  </span>
                ) : Icon ? (
                  <Icon
                    className={cn(
                      "h-5 w-5 shrink-0",
                      active && "text-netflix-red",
                    )}
                    strokeWidth={active ? 2.5 : 2}
                  />
                ) : null}
                {!item.kidsImage && (
                  <span className="w-full truncate text-center text-[9px] font-medium leading-none">
                    {item.name}
                  </span>
                )}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
