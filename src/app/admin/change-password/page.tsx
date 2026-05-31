import { requireAdminPasswordChange } from "~/lib/admin"
import { ChangePasswordForm } from "~/components/admin/change-password-form"

export const dynamic = "force-dynamic"

export default async function AdminChangePasswordPage() {
  await requireAdminPasswordChange()

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0b0b0b] px-4">
      <div className="w-full max-w-md space-y-6 rounded-xl border border-white/10 bg-[#181818] p-8">
        <div className="space-y-1 text-center">
          <h1 className="text-xl font-bold text-white">Şifre Değiştir</h1>
          <p className="text-sm text-white/50">
            Güvenlik için varsayılan şifreyi değiştirmeniz gerekiyor.
          </p>
        </div>
        <ChangePasswordForm />
      </div>
    </main>
  )
}
