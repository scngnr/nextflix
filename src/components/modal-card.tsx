"use client"
import { useState } from "react"
import type { ShowDetail, MediaType } from "~/lib/types"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { getCustomVideoUrl } from "~/lib/custom-videos"
import { ShowPlayer } from "~/components/show-player"
import { EpisodesSection } from "~/components/episodes-section"
import { useMyList } from "~/components/my-list-provider"
import { setRatingAction, removeRatingAction } from "~/actions"
import { Play, Plus, Check, ThumbsUp, ArrowLeft, Film, Star } from "lucide-react"
import { useLocale } from "~/components/locale-provider"
import { ShowMetaLine } from "~/components/show-meta-line"
import { cn } from "~/lib/utils"

interface ModalCardProps extends React.ComponentPropsWithoutRef<"div"> {
  show: ShowDetail
  hasSource?: boolean
  showBack?: boolean
  userRating?: number
}

export function ModalCard({
  show,
  hasSource = false,
  showBack = false,
  userRating = 0,
  className,
  ...props
}: ModalCardProps) {
  const { dict } = useLocale()
  const router = useRouter()
  const { isSaved, toggle, isLiked, toggleLikeShow } = useMyList()
  const mediaType: MediaType = show.title ? "movie" : "tv"
  const customVideoUrl = getCustomVideoUrl(show.id, mediaType)
  const trailer =
    show.videos?.results.find((el) => el.type === "Trailer") ??
    show.videos?.results[0]
  const title = show.title ?? show.name ?? "Untitled"
  const year =
    show.release_date?.substring(0, 4) ?? show.first_air_date?.substring(0, 4)
  const saved = isSaved(show.id)
  const liked = isLiked(show.id)

  const [rating, setRating] = useState(userRating)
  const [hoverStar, setHoverStar] = useState(0)
  function rate(value: number) {
    if (rating === value) {
      setRating(0)
      void removeRatingAction(show.id, mediaType)
    } else {
      setRating(value)
      void setRatingAction(show.id, mediaType, value)
    }
  }

  const cast = show.credits?.cast?.slice(0, 4) ?? []
  const director = show.credits?.crew?.find((c) => c.job === "Director")
  const creators = show.credits?.crew
    ?.filter((c) => c.job === "Creator" || c.job === "Executive Producer")
    .slice(0, 2)
  const similar = (show.similar?.results ?? show.recommendations?.results ?? [])
    .filter((s) => s.poster_path ?? s.backdrop_path)
    .slice(0, 9)

  const runtimeLabel =
    mediaType === "movie" && show.runtime
      ? `${Math.floor(show.runtime / 60)}s ${show.runtime % 60}dk`
      : show.number_of_seasons
        ? `${show.number_of_seasons} Sezon`
        : null

  return (
    <div
      {...props}
      className={cn(
        "overflow-hidden rounded-md bg-[#181818] text-white shadow-2xl",
        className,
      )}
    >
      <div className="relative aspect-video w-full">
        <ShowPlayer
          customUrl={customVideoUrl}
          youtubeKey={customVideoUrl ? null : trailer?.key}
          autoPlay
          className="h-full w-full rounded-none"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-transparent" />
        {showBack && (
          <button
            type="button"
            onClick={() =>
              window.history.length > 1 ? router.back() : router.push("/")
            }
            aria-label="Geri"
            className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-full bg-black/60 px-3 py-2 text-sm font-medium text-white transition hover:bg-black/80"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="hidden sm:inline">Geri</span>
          </button>
        )}
        <div className="absolute bottom-6 left-6 right-6 space-y-3">
          {show.logo_path ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`https://image.tmdb.org/t/p/w500${show.logo_path}`}
              alt={title}
              className="max-h-20 w-auto max-w-[60%] object-contain drop-shadow-lg"
            />
          ) : (
            <h1 className="text-2xl font-bold drop-shadow md:text-4xl">
              {title}
            </h1>
          )}
          <div className="flex items-center gap-3">
            <Link
              href={`/watch/${show.id}?mediaType=${mediaType}`}
              className={cn(
                "flex items-center gap-2 rounded px-6 py-2 text-sm font-bold transition",
                hasSource
                  ? "bg-white text-black hover:bg-white/80"
                  : "bg-white/20 text-white hover:bg-white/30",
              )}
            >
              {hasSource ? (
                <>
                  <Play className="h-5 w-5 fill-black" />
                  {dict.common.play}
                </>
              ) : (
                <>
                  <Film className="h-5 w-5" />
                  {dict.common.trailer}
                </>
              )}
            </Link>
            <button
              type="button"
              onClick={() => toggle(show.id, mediaType)}
              aria-label={
                saved ? dict.common.removeFromList : dict.common.addToList
              }
              className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/50 transition hover:border-white"
            >
              {saved ? (
                <Check className="h-5 w-5" />
              ) : (
                <Plus className="h-5 w-5" />
              )}
            </button>
            <button
              type="button"
              onClick={() => toggleLikeShow(show.id, mediaType)}
              aria-label={liked ? dict.common.unlike : dict.common.likeAria}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full border-2 transition hover:border-white",
                liked ? "border-white bg-white text-black" : "border-white/50",
              )}
            >
              <ThumbsUp className={cn("h-5 w-5", liked && "fill-black")} />
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-6 p-6 md:p-8">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-3 md:col-span-2">
            <ShowMetaLine
              show={show}
              mediaType={mediaType}
              showYear
              showCertification
              showHd
            />
            {runtimeLabel && (
              <p className="text-sm text-white/80">{runtimeLabel}</p>
            )}
            <p className="text-sm leading-relaxed text-white/90 md:text-base">
              {show.overview}
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className="text-sm text-white/50">Puanın:</span>
              <div
                className="flex items-center gap-0.5"
                onMouseLeave={() => setHoverStar(0)}
              >
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => rate(value)}
                    onMouseEnter={() => setHoverStar(value)}
                    aria-label={`${value} yıldız`}
                    className="transition hover:scale-110"
                  >
                    <Star
                      className={cn(
                        "h-6 w-6",
                        (hoverStar || rating) >= value
                          ? "fill-netflix-red text-netflix-red"
                          : "text-white/40",
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            {cast.length > 0 && (
              <p className="text-white/60">
                <span className="text-white/40">Oyuncular: </span>
                {cast.map((c, i) => (
                  <span key={c.id}>
                    <Link
                      href={`/person/${c.id}`}
                      className="transition hover:text-white hover:underline"
                    >
                      {c.name}
                    </Link>
                    {i < cast.length - 1 && ", "}
                  </span>
                ))}
              </p>
            )}
            {director && (
              <p className="text-white/60">
                <span className="text-white/40">Yönetmen: </span>
                {director.name}
              </p>
            )}
            {!director && creators && creators.length > 0 && (
              <p className="text-white/60">
                <span className="text-white/40">Yapımcı: </span>
                {creators.map((c) => c.name).join(", ")}
              </p>
            )}
            {show.genres.length > 0 && (
              <p className="text-white/60">
                <span className="text-white/40">Türler: </span>
                {show.genres.map((g) => g.name).join(", ")}
              </p>
            )}
          </div>
        </div>

        {mediaType === "tv" && show.seasons && (
          <EpisodesSection tvId={show.id} seasons={show.seasons} />
        )}

        {similar.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">
              Benzer İçerikler
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {similar.map((s) => (
                <Link
                  key={s.id}
                  href={`/show/${s.id}?mediaType=${s.title ? "movie" : "tv"}`}
                  scroll={false}
                  className="overflow-hidden rounded-md bg-[#242424] transition hover:brightness-110"
                >
                  <div className="relative aspect-video w-full">
                    <Image
                      src={`https://image.tmdb.org/t/p/w500${
                        s.backdrop_path ?? s.poster_path
                      }`}
                      alt={s.title ?? s.name ?? ""}
                      fill
                      sizes="(max-width: 640px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="p-2.5">
                    <ShowMetaLine
                      show={s}
                      mediaType={s.title ? "movie" : "tv"}
                      size="sm"
                      showHd={false}
                      showYear={false}
                      showCertification={false}
                    />
                    <p className="mt-1 line-clamp-1 text-sm font-medium text-white">
                      {s.title ?? s.name}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
