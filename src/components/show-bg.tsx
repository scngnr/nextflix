import { type Show } from "~/lib/types"
import Image from "next/image"

export function ShowBg({ show }: { show: Show }) {
  const backdrop = show.backdrop_path ?? show.poster_path
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[75vh] min-h-[480px] w-full"
    >
      <Image
        src={`https://image.tmdb.org/t/p/original/${backdrop}`}
        alt=""
        className="object-cover object-top"
        fill
        priority
      />
      <div className="absolute inset-0 netflix-gradient-hero" />
      <div className="absolute inset-0 netflix-gradient-bottom" />
    </div>
  )
}
