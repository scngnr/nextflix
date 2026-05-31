import Link from "next/link"
import { requireAdminLoginPage } from "~/lib/admin"
import { ensureDefaultAdmin } from "~/lib/admin-auth"
import { AdminLoginForm } from "~/components/admin/admin-login-form"

export const dynamic = "force-dynamic"

export default async function AdminLoginPage() {
  await ensureDefaultAdmin()
  await requireAdminLoginPage()

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0b0b0b] px-4">
      <div className="w-full max-w-md space-y-6 rounded-xl border border-white/10 bg-[#181818] p-8">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold text-netflix-red">Nextflix Admin</h1>
          <p className="text-sm text-white/50">Yönetici girişi</p>
        </div>
        <AdminLoginForm />
        <p className="text-center text-xs text-white/40">
          Varsayılan: <span className="text-white/60">admin</span> /{" "}
          <span className="text-white/60">123456</span>
          <br />
          İlk girişte şifre değiştirmeniz istenir.
        </p>
        <Link
          href="/"
          className="block text-center text-sm text-white/50 transition hover:text-white"
        >
          ← Siteye dön
        </Link>
      </div>
    </main>
  )
}
