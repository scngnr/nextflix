"use client"

import { useState } from "react"
import { adminChangePasswordAction } from "~/actions/admin-auth"
import { Loader2 } from "lucide-react"

export function ChangePasswordForm() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const fd = new FormData(e.currentTarget)
    const result = await adminChangePasswordAction({
      currentPassword: String(fd.get("currentPassword") ?? ""),
      newPassword: String(fd.get("newPassword") ?? ""),
      confirmPassword: String(fd.get("confirmPassword") ?? ""),
    })
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="currentPassword"
          className="mb-1 block text-sm text-white/70"
        >
          Mevcut şifre
        </label>
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
          className="w-full rounded-md bg-white/10 px-3 py-2.5 text-sm outline-none ring-netflix-red focus:ring-2"
        />
      </div>
      <div>
        <label
          htmlFor="newPassword"
          className="mb-1 block text-sm text-white/70"
        >
          Yeni şifre (en az 8 karakter)
        </label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          className="w-full rounded-md bg-white/10 px-3 py-2.5 text-sm outline-none ring-netflix-red focus:ring-2"
        />
      </div>
      <div>
        <label
          htmlFor="confirmPassword"
          className="mb-1 block text-sm text-white/70"
        >
          Yeni şifre (tekrar)
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          className="w-full rounded-md bg-white/10 px-3 py-2.5 text-sm outline-none ring-netflix-red focus:ring-2"
        />
      </div>
      {error && (
        <p className="rounded-md bg-red-500/20 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-netflix-red py-2.5 text-sm font-semibold transition hover:bg-netflix-red/90 disabled:opacity-60"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Şifreyi Güncelle
      </button>
    </form>
  )
}
