"use client"
import type { Show } from "~/lib/types"
import { useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"

export function Top10Row({ title, shows }: { title: string; shows: Show[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const top10 = shows.slice(0, 10)

  function page(dir: 1 | -1) {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: "smooth" })
  }

  if (!top10.length) return null

  return (
    <section className="group/row relative">
      <h2 className="mb-2 text-lg font-semibold text-white md:text-xl">
        {title}
      </h2>
      <div className="relative">
        <button
          type="button"
          aria-label="Önceki"
          onClick={() => page(-1)}
          className="absolute inset-y-0 left-0 z-30 flex w-10 items-center justify-center bg-gradient-to-r from-black/70 to-transparent text-white opacity-0 transition group-hover/row:opacity-100 mobile:hidden"
        >
          <ChevronLeft className="h-9 w-9" />
        </button>
        <button
          type="button"
          aria-label="Sonraki"
          onClick={() => page(1)}
          className="absolute inset-y-0 right-0 z-30 flex w-10 items-center justify-center bg-gradient-to-l from-black/70 to-transparent text-white opacity-0 transition group-hover/row:opacity-100 mobile:hidden"
        >
          <ChevronRight className="h-9 w-9" />
        </button>

        <div
          ref={scrollRef}
          className="flex snap-x snap-mandatory gap-1 overflow-x-auto py-4 scrollbar-none md:snap-none"
        >
          {top10.map((show, i) => {
            const mediaType = show.title ? "movie" : "tv"
            const title = show.title ?? show.name ?? ""
            const poster = show.poster_path ?? show.backdrop_path
            return (
              <Link
                key={show.id}
                href={`/show/${show.id}?mediaType=${mediaType}`}
                scroll={false}
                aria-label={`${i + 1}. ${title}`}
                className="group/tile flex shrink-0 snap-start items-end outline-none"
              >
                <span className="netflix-rank shrink-0 select-none font-black leading-none text-[#141414]">
                  {i + 1}
                </span>
                <div className="relative -ml-4 aspect-[2/3] w-[26vw] shrink-0 overflow-hidden rounded-md bg-neutral-800 shadow-lg transition group-hover/tile:brightness-110 sm:w-[18vw] md:w-[14vw] lg:w-[11vw] xl:w-[9.5vw]">
                  <Image
                    src={`https://image.tmdb.org/t/p/w500${poster}`}
                    alt={title}
                    fill
                    sizes="(max-width: 640px) 26vw, (max-width: 1024px) 14vw, 10vw"
                    className="object-cover"
                  />
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
