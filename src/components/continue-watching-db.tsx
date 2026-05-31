"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Play, X } from "lucide-react"
import type { MediaType } from "~/lib/types"
import { removeWatchProgressAction } from "~/actions"
import { useLocale } from "~/components/locale-provider"

export interface DbContinueItem {
  id: number
  mediaType: MediaType
  title: string
  image: string | null
  progress: number
}

export function ContinueWatchingDb({ items }: { items: DbContinueItem[] }) {
  const { dict } = useLocale()
  const [list, setList] = useState(items)

  function remove(id: number, mediaType: MediaType) {
    setList((prev) => prev.filter((el) => el.id !== id))
    void removeWatchProgressAction(id, mediaType)
  }

  if (!list.length) return null

  return (
    <section className="group/row relative">
      <h2 className="mb-2 text-lg font-semibold text-white md:text-xl">
        {dict.rows.continueWatching}
      </h2>
      <div className="flex gap-2 overflow-x-auto py-2 scrollbar-none">
        {list.map((item) => (
          <div
            key={`${item.mediaType}-${item.id}`}
            className="group/tile relative w-[44vw] shrink-0 overflow-hidden rounded-md bg-neutral-800 sm:w-[30vw] md:w-[23vw] lg:w-[18vw] xl:w-[15vw]"
          >
            <Link
              href={`/watch/${item.id}?mediaType=${item.mediaType}`}
              className="block"
            >
              <div className="relative aspect-video w-full">
                {item.image && (
                  <Image
                    src={`https://image.tmdb.org/t/p/w500${item.image}`}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 44vw, (max-width: 1024px) 23vw, 15vw"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition group-hover/tile:opacity-100">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-black">
                  <Play className="h-5 w-5 fill-black" />
                </span>
              </div>
            </Link>
            <button
              type="button"
              onClick={() => remove(item.id, item.mediaType)}
              aria-label="Listeden kaldır"
              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition group-hover/tile:opacity-100"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <div className="absolute bottom-0 h-1 w-full bg-white/25">
              <div
                className="h-full bg-netflix-red"
                style={{ width: `${Math.min(100, Math.max(2, item.progress))}%` }}
              />
            </div>
            <p className="line-clamp-1 px-2 py-1.5 text-xs font-medium text-white">
              {item.title}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
