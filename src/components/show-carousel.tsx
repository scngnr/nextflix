"use client"
import type { Show } from "~/lib/types"
import { useCallback, useEffect, useRef, useState } from "react"
import { ChevronLeft, ChevronRight, Play, Plus, Check, ThumbsUp, ChevronDown } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { cn } from "~/lib/utils"
import { useMyList } from "~/components/my-list-provider"
import { fetchTrailerKey } from "~/lib/trailer"
import { useLocale } from "~/components/locale-provider"
import { ShowMetaLine } from "~/components/show-meta-line"

export function ShowsCarousel({
  title,
  shows,
}: {
  title: string
  shows: Show[]
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(true)

  const updateArrows = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanLeft(el.scrollLeft > 8)
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8)
  }, [])

  useEffect(() => {
    updateArrows()
    const el = scrollRef.current
    if (!el) return
    el.addEventListener("scroll", updateArrows, { passive: true })
    window.addEventListener("resize", updateArrows)
    return () => {
      el.removeEventListener("scroll", updateArrows)
      window.removeEventListener("resize", updateArrows)
    }
  }, [updateArrows])

  function page(dir: 1 | -1) {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: "smooth" })
  }

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
          className={cn(
            "absolute inset-y-0 left-0 z-30 flex w-10 items-center justify-center bg-gradient-to-r from-black/70 to-transparent text-white opacity-0 transition group-hover/row:opacity-100 hover:from-black/90 mobile:hidden",
            !canLeft && "pointer-events-none !opacity-0",
          )}
        >
          <ChevronLeft className="h-9 w-9 drop-shadow" />
        </button>
        <button
          type="button"
          aria-label="Sonraki"
          onClick={() => page(1)}
          className={cn(
            "absolute inset-y-0 right-0 z-30 flex w-10 items-center justify-center bg-gradient-to-l from-black/70 to-transparent text-white opacity-0 transition group-hover/row:opacity-100 hover:from-black/90 mobile:hidden",
            !canRight && "pointer-events-none !opacity-0",
          )}
        >
          <ChevronRight className="h-9 w-9 drop-shadow" />
        </button>

        <div
          ref={scrollRef}
          className="flex snap-x snap-mandatory gap-2 overflow-x-auto overflow-y-visible scroll-smooth py-10 scrollbar-none md:snap-none"
        >
          {shows.map((show, i) => (
            <CarouselTile
              key={show.id}
              show={show}
              isFirst={i === 0}
              isLast={i === shows.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function CarouselTile({
  show,
  isFirst,
  isLast,
}: {
  show: Show
  isFirst: boolean
  isLast: boolean
}) {
  const [hovered, setHovered] = useState(false)
  const [trailerKey, setTrailerKey] = useState<string | null>(null)
  const [showTrailer, setShowTrailer] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>()
  const trailerTimer = useRef<ReturnType<typeof setTimeout>>()
  const { dict } = useLocale()
  const { isSaved, toggle, isLiked, toggleLikeShow } = useMyList()

  const mediaType = show.title ? "movie" : "tv"
  const title = show.title ?? show.name ?? "Untitled"
  const poster = show.poster_path ?? show.backdrop_path
  const saved = isSaved(show.id)
  const liked = isLiked(show.id)

  function enter() {
    timer.current = setTimeout(() => {
      setHovered(true)
      void fetchTrailerKey(show.id, mediaType).then((key) => {
        if (!key) return
        setTrailerKey(key)
        trailerTimer.current = setTimeout(() => setShowTrailer(true), 600)
      })
    }, 350)
  }
  function leave() {
    if (timer.current) clearTimeout(timer.current)
    if (trailerTimer.current) clearTimeout(trailerTimer.current)
    setHovered(false)
    setShowTrailer(false)
  }

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
      if (trailerTimer.current) clearTimeout(trailerTimer.current)
    },
    [],
  )

  return (
    <div
      onMouseEnter={enter}
      onMouseLeave={leave}
      className="relative w-[30vw] shrink-0 snap-start sm:w-[22vw] md:w-[18vw] lg:w-[15vw] xl:w-[13vw]"
    >
      <div
        className={cn(
          "relative transition-transform duration-300 ease-out",
          hovered ? "z-40 scale-[1.22] drop-shadow-2xl" : "z-0 scale-100",
          isFirst ? "origin-left" : isLast ? "origin-right" : "origin-center",
        )}
      >
        <Link
          href={`/show/${show.id}?mediaType=${mediaType}`}
          scroll={false}
          aria-label={title}
          className="block overflow-hidden rounded-md bg-neutral-800 shadow-lg outline-none ring-white focus-visible:ring-2"
        >
          <div className="relative aspect-[2/3] w-full overflow-hidden">
            <Image
              src={`https://image.tmdb.org/t/p/w500${poster}`}
              alt={title}
              fill
              sizes="(max-width: 640px) 30vw, (max-width: 768px) 22vw, (max-width: 1024px) 18vw, (max-width: 1280px) 15vw, 13vw"
              className="object-cover"
              draggable={false}
            />
            {showTrailer && trailerKey && (
              <iframe
                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&controls=0&loop=1&playlist=${trailerKey}&modestbranding=1&rel=0&playsinline=1&disablekb=1`}
                allow="autoplay; encrypted-media"
                tabIndex={-1}
                className="pointer-events-none absolute left-1/2 top-1/2 h-full w-[267%] -translate-x-1/2 -translate-y-1/2"
              />
            )}
          </div>
        </Link>

        <div
          className={cn(
            "absolute inset-x-0 bottom-0 rounded-b-md bg-gradient-to-t from-black via-black/85 to-transparent p-2.5 transition-opacity duration-200",
            hovered ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        >
          <div className="mb-2 flex items-center gap-1.5">
            <Link
              href={`/watch/${show.id}?mediaType=${mediaType}`}
              aria-label={`${title} oynat`}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-black transition hover:bg-white/80"
            >
              <Play className="h-3.5 w-3.5 fill-black" />
            </Link>
            <button
              type="button"
              onClick={() => toggle(show.id, mediaType)}
              aria-label={
                saved ? dict.common.removeFromList : dict.common.addToList
              }
              className="flex h-7 w-7 items-center justify-center rounded-full border border-white/60 bg-black/40 text-white transition hover:border-white"
            >
              {saved ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Plus className="h-3.5 w-3.5" />
              )}
            </button>
            <button
              type="button"
              onClick={() => toggleLikeShow(show.id, mediaType)}
              aria-label={liked ? dict.common.unlike : dict.common.likeAria}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full border bg-black/40 transition hover:border-white",
                liked
                  ? "border-white bg-white text-black"
                  : "border-white/60 text-white",
              )}
            >
              <ThumbsUp className={cn("h-3.5 w-3.5", liked && "fill-black")} />
            </button>
            <Link
              href={`/show/${show.id}?mediaType=${mediaType}`}
              scroll={false}
              aria-label="Detaylar"
              className="ml-auto flex h-7 w-7 items-center justify-center rounded-full border border-white/60 bg-black/40 text-white transition hover:border-white"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </Link>
          </div>
          <p className="line-clamp-1 text-[11px] font-semibold text-white">
            {title}
          </p>
          <ShowMetaLine
            show={show}
            mediaType={mediaType}
            size="sm"
            showHd={false}
            showYear={false}
            showCertification={false}
            className="mt-0.5"
          />
        </div>
      </div>
    </div>
  )
}
