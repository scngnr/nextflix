"use client"

import { Film } from "lucide-react"
import { useLibraryFilter } from "~/components/library-filter-provider"
import { useLocale } from "~/components/locale-provider"
import { format } from "~/lib/i18n/format"
import { cn } from "~/lib/utils"

export function LibraryFilterSwitch({ className }: { className?: string }) {
  const { dict } = useLocale()
  const { libraryOnly, setLibraryOnly, ready, libraryCount } = useLibraryFilter()

  if (!ready || libraryCount === 0) return null

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border border-white/15 bg-white/[0.06] px-3 py-2.5 sm:rounded-full sm:px-4",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-netflix-red/15">
          <Film className="h-4 w-4 text-netflix-red" />
        </span>
        <div className="min-w-0 leading-tight">
          <p className="truncate text-sm font-medium text-white">
            {dict.library.title}
          </p>
          <p className="text-xs text-white/45">
            {format(dict.library.content, { count: libraryCount })}
          </p>
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={libraryOnly}
        aria-label={dict.library.aria}
        onClick={() => setLibraryOnly(!libraryOnly)}
        className={cn(
          "relative h-7 w-12 shrink-0 rounded-full transition-colors",
          libraryOnly ? "bg-netflix-red" : "bg-white/20",
        )}
      >
        <span
          className={cn(
            "absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform",
            libraryOnly ? "left-6" : "left-1",
          )}
        />
      </button>
    </div>
  )
}
