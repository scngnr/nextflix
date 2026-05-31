"use client"

import Link from "next/link"
import type { Genre } from "~/lib/genres"
import type { MediaType } from "~/lib/types"
import { cn } from "~/lib/utils"

export function GenreChipsRow({
  genres,
  activeId,
  mediaType,
}: {
  genres: Genre[]
  activeId: number
  mediaType: MediaType
}) {
  return (
    <div className="relative isolate -mx-4 md:mx-0">
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-8 bg-gradient-to-r from-[#141414] via-[#141414]/80 to-transparent md:w-10"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-8 bg-gradient-to-r from-transparent via-[#141414]/80 to-[#141414] md:w-10"
        aria-hidden
      />
      <div
        className="relative z-[2] flex snap-x snap-mandatory gap-2 overflow-x-auto overscroll-x-contain px-4 pb-2 pt-1 scrollbar-none md:px-0"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {genres.map((g) => {
          const active = g.id === activeId
          return (
            <Link
              key={`${mediaType}-${g.id}`}
              href={`/browse/${g.id}?mediaType=${mediaType}`}
              scroll
              className={cn(
                "relative z-[3] shrink-0 snap-start rounded-full px-4 py-2.5 text-sm font-medium transition active:scale-95",
                active
                  ? "bg-white text-black shadow-md"
                  : "bg-white/10 text-white/85 ring-1 ring-white/10 hover:bg-white/20",
              )}
            >
              {g.name}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
