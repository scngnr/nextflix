import {
  Users,
  UserCircle,
  Film,
  Star,
  PlayCircle,
  ThumbsUp,
} from "lucide-react"
import { getAdminStats } from "~/lib/server-fetchers"

export const dynamic = "force-dynamic"

export default async function AdminDashboard() {
  const stats = await getAdminStats()

  const cards = [
    { label: "Hesaplar", value: stats.accounts, icon: Users },
    { label: "Profiller", value: stats.profiles, icon: UserCircle },
    { label: "Video Kaynakları", value: stats.sources, icon: Film },
    { label: "Puanlamalar", value: stats.ratings, icon: Star },
    { label: "İzlemeye Devam", value: stats.inProgress, icon: PlayCircle },
    { label: "Beğeniler", value: stats.liked, icon: ThumbsUp },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold md:text-3xl">Genel Bakış</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-xl border border-white/10 bg-[#181818] p-5"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60">{c.label}</span>
              <c.icon className="h-5 w-5 text-netflix-red" />
            </div>
            <p className="mt-2 text-3xl font-bold tabular-nums">{c.value}</p>
          </div>
        ))}
      </div>
      <p className="text-sm text-white/50">
        Film kaynaklarını yönetmek için sol menüden{" "}
        <span className="text-white/80">Kaynaklar</span> bölümüne geç.
      </p>
    </div>
  )
}
