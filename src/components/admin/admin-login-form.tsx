"use client"

import { useState } from "react"
import { adminLoginAction } from "~/actions/admin-auth"
import { Loader2 } from "lucide-react"

export function AdminLoginForm() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const fd = new FormData(e.currentTarget)
    const result = await adminLoginAction({
      username: String(fd.get("username") ?? ""),
      password: String(fd.get("password") ?? ""),
    })
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="username" className="mb-1 block text-sm text-white/70">
          Kullanıcı adı
        </label>
        <input
          id="username"
          name="username"
          defaultValue="admin"
          autoComplete="username"
          required
          className="w-full rounded-md bg-white/10 px-3 py-2.5 text-sm outline-none ring-netflix-red focus:ring-2"
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-sm text-white/70">
          Şifre
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
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
        Giriş Yap
      </button>
    </form>
  )
}
