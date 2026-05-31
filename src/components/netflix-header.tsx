"use client"

import Image from "next/image"
import Link from "next/link"
import { Suspense, useEffect, useState } from "react"
import { Search, Bell } from "lucide-react"
import { Skeleton } from "~/components/ui/skeleton"
import { UserMenu } from "~/components/user-menu"
import { LinkButton } from "~/components/link-button"
import { KidsNavIcon } from "~/components/kids/kids-nav-icon"
import { LanguageSwitcher } from "~/components/language-switcher"
import { useLocale } from "~/components/locale-provider"
import { cn } from "~/lib/utils"

export function NetflixHeader() {
  const { dict } = useLocale()
  const [scrolled, setScrolled] = useState(false)

  const NAV = [
    { name: dict.nav.home, href: "/" },
    { name: dict.nav.tvShows, href: "/tv-shows" },
    { name: dict.nav.movies, href: "/movies" },
    { name: dict.nav.newPopular, href: "/new-and-popular" },
    { name: dict.nav.genres, href: "/browse/28?mediaType=movie" },
    { name: dict.nav.myList, href: "/my-list", protected: true },
  ] as const

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        scrolled ? "bg-[#141414]/95 shadow-lg" : "netflix-gradient-top",
      )}
    >
      <div className="mx-auto flex h-14 items-center justify-between px-4 sm:h-16 lg:h-[68px] lg:px-12">
        <div className="flex items-center gap-8 lg:gap-10">
          <Link href="/" className="shrink-0">
            <Image
              src="/canflix.png"
              alt="Canflix"
              width={140}
              height={40}
              priority
              className="h-7 w-auto sm:h-8 lg:h-9"
            />
          </Link>
          <nav className="hidden items-center gap-5 text-sm lg:flex">
            <Link
              href="/kids"
              aria-label={dict.nav.kids}
              title={dict.nav.kids}
              className="relative -my-3 flex h-14 w-[4.5rem] shrink-0 items-center justify-center lg:-my-4 lg:h-16 lg:w-20"
            >
              <KidsNavIcon
                variant="header"
                className="pointer-events-none"
              />
            </Link>
            {NAV.map((item) =>
              item.protected ? (
                <LinkButton
                  key={item.href}
                  href={item.href}
                  className="text-white/80 transition hover:text-white/60"
                >
                  {item.name}
                </LinkButton>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-white/80 transition hover:text-white/60"
                >
                  {item.name}
                </Link>
              ),
            )}
          </nav>
        </div>
        <div className="flex items-center gap-3 sm:gap-5">
          <LanguageSwitcher />
          <Link
            href="/search?keyword="
            aria-label={dict.nav.searchAria}
            className="hidden text-white transition hover:text-white/70 lg:block"
          >
            <Search className="h-5 w-5" />
          </Link>
          <button
            type="button"
            aria-label={dict.nav.notificationsAria}
            className="hidden text-white transition hover:text-white/70 lg:block"
          >
            <Bell className="h-5 w-5" />
          </button>
          <Suspense fallback={<Skeleton className="h-8 w-8 rounded" />}>
            <UserMenu />
          </Suspense>
        </div>
      </div>
    </header>
  )
}
