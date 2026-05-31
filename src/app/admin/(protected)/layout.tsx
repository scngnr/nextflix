import Link from "next/link"
import { ArrowLeft, LayoutDashboard, Film, LogOut, Users } from "lucide-react"
import { requireAdmin } from "~/lib/admin"
import { adminLogoutAction } from "~/actions/admin-auth"

const NAV = [
  { name: "Genel Bakış", href: "/admin", icon: LayoutDashboard },
  { name: "Kaynaklar", href: "/admin/sources", icon: Film },
  { name: "Kullanıcılar", href: "/admin/users", icon: Users },
]

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAdmin()

  return (
    <div className="flex min-h-screen bg-[#0b0b0b] text-white">
      <aside className="sticky top-0 flex h-screen w-56 shrink-0 flex-col gap-1 border-r border-white/10 bg-[#141414] p-4">
        <Link
          href="/"
          className="mb-4 flex items-center gap-2 text-sm text-white/60 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Siteye dön
        </Link>
        <span className="mb-3 text-lg font-bold text-netflix-red">
          Nextflix Admin
        </span>
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </Link>
        ))}
        <form action={adminLogoutAction} className="mt-auto pt-4">
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-5 w-5" />
            Çıkış
          </button>
        </form>
      </aside>
      <main className="flex-1 p-6 md:p-8">{children}</main>
    </div>
  )
}
