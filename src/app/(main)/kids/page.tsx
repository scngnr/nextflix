import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import { Baby } from "lucide-react"
import {
  enabledTmdbKidsFeeds,
  KIDS_FEEDS,
} from "~/lib/kids-content"
import { getLocale } from "~/lib/i18n/get-locale"
import { getDictionary } from "~/lib/i18n/get-dictionary"
import { KidsCarouselRow } from "~/components/kids/kids-carousel-row"
import { KidsYoutubePlaceholder } from "~/components/kids/kids-youtube-placeholder"
import { RowSkeleton } from "~/components/skeletons"
import type { KidsFeed } from "~/lib/kids-content"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const dict = getDictionary(locale)
  return {
    title: `${dict.pages.kids.title} | Canflix`,
    description: dict.pages.kids.description,
  }
}

function localizedFeedTitle(
  feed: KidsFeed,
  feeds: Record<string, string>,
): string {
  return feeds[feed.id] ?? feed.title
}

export default async function KidsPage() {
  const locale = await getLocale()
  const dict = getDictionary(locale)
  const k = dict.pages.kids
  const tmdbFeeds = enabledTmdbKidsFeeds().map((feed) => ({
    ...feed,
    title: localizedFeedTitle(feed, k.feeds),
  }))
  const youtubeFeed = KIDS_FEEDS.find((f) => f.source === "youtube_kids")

  return (
    <main className="px-4 pb-12 pt-20 sm:pt-24 lg:px-12">
      <header className="mb-8 space-y-3">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-netflix-red/20">
            <Baby className="h-7 w-7 text-netflix-red" />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-white md:text-3xl">
              {k.title}
            </h1>
            <p className="text-sm text-white/50">{k.description}</p>
          </div>
        </div>
        <p className="text-xs text-white/40">{k.tmdbNote}</p>
      </header>

      <div className="space-y-2">
        {tmdbFeeds.map((feed) => (
          <Suspense key={feed.id} fallback={<RowSkeleton />}>
            {/* @ts-expect-error Async Server Component */}
            <KidsCarouselRow feed={feed} />
          </Suspense>
        ))}

        {youtubeFeed && (
          <KidsYoutubePlaceholder
            feed={youtubeFeed}
            soonText={k.youtubeSoon}
          />
        )}
      </div>

      <p className="mt-10 text-center text-sm text-white/40">
        <Link
          href="/browse/10762?mediaType=tv"
          className="text-white/70 underline"
        >
          {k.browseLink}
        </Link>
      </p>
    </main>
  )
}
