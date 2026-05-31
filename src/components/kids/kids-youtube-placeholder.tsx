import { Youtube } from "lucide-react"
import type { KidsFeed } from "~/lib/kids-content"

/** YouTube Kids entegrasyonu açıldığında bu bileşen playlist/embed satırlarını gösterecek. */
export function KidsYoutubePlaceholder({
  feed,
  soonText,
}: {
  feed: KidsFeed
  soonText: string
}) {
  if (feed.enabled) return null

  return (
    <section className="rounded-xl border border-dashed border-white/15 bg-white/[0.03] p-6 text-center">
      <Youtube className="mx-auto mb-3 h-10 w-10 text-white/30" />
      <h3 className="text-lg font-semibold text-white/80">{feed.title}</h3>
      <p className="mt-1 text-sm text-white/45">{soonText}</p>
    </section>
  )
}
