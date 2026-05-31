"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Shield, ShieldOff } from "lucide-react"
import {
  adminSetPlatformAdmin,
  type PlatformAccountRow,
} from "~/actions/admin"
import { cn } from "~/lib/utils"

export function UserManager({ accounts }: { accounts: PlatformAccountRow[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [pendingId, setPendingId] = useState<string | null>(null)

  function toggle(accountId: string, enabled: boolean) {
    setPendingId(accountId)
    void adminSetPlatformAdmin(accountId, enabled).then(() => {
      setPendingId(null)
      startTransition(() => router.refresh())
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">Kullanıcılar</h1>
        <p className="mt-1 text-sm text-white/50">
          &quot;Admin erişimi&quot; açılan kullanıcıların site menüsünde Admin
          Panel linki görünür. Panel girişi için ayrıca{" "}
          <span className="text-white/70">/admin/login</span> oturumu gerekir.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-left text-white/60">
            <tr>
              <th className="p-3 font-medium">E-posta</th>
              <th className="p-3 font-medium">Kayıt</th>
              <th className="p-3 font-medium">Admin menüsü</th>
              <th className="p-3 font-medium">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {accounts.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-white/40">
                  Henüz kayıtlı kullanıcı yok. Siteye giriş yapan ilk
                  kullanıcılar burada listelenir.
                </td>
              </tr>
            )}
            {accounts.map((acc) => {
              const busy = pendingId === acc.id
              return (
                <tr key={acc.id} className="border-t border-white/10">
                  <td className="p-3">
                    <p className="font-medium text-white">{acc.email}</p>
                    <p className="text-xs text-white/40">{acc.id}</p>
                  </td>
                  <td className="p-3 text-white/60">
                    {new Date(acc.createdAt).toLocaleDateString("tr-TR")}
                  </td>
                  <td className="p-3">
                    <span
                      className={cn(
                        "rounded px-2 py-0.5 text-xs font-medium",
                        acc.canAccessAdminPanel
                          ? "bg-[#46d369]/20 text-[#46d369]"
                          : "bg-white/10 text-white/50",
                      )}
                    >
                      {acc.canAccessAdminPanel ? "Açık" : "Kapalı"}
                    </span>
                  </td>
                  <td className="p-3">
                    <button
                      type="button"
                      disabled={busy || isPending}
                      onClick={() =>
                        toggle(acc.id, !acc.canAccessAdminPanel)
                      }
                      className={cn(
                        "flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition disabled:opacity-50",
                        acc.canAccessAdminPanel
                          ? "bg-white/10 text-white hover:bg-white/20"
                          : "bg-netflix-red/20 text-netflix-red hover:bg-netflix-red/30",
                      )}
                    >
                      {busy ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : acc.canAccessAdminPanel ? (
                        <>
                          <ShieldOff className="h-3.5 w-3.5" />
                          Kaldır
                        </>
                      ) : (
                        <>
                          <Shield className="h-3.5 w-3.5" />
                          Admin yap
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
