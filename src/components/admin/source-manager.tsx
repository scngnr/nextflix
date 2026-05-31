"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Search, Trash2, Plus, Loader2, Check } from "lucide-react"
import {
  adminSearchTmdb,
  adminUpsertSource,
  adminDeleteSource,
  type AdminSearchResult,
  type SourceKind,
} from "~/actions/admin"
import type { AdminSourceRow } from "~/lib/server-fetchers"
import { cn } from "~/lib/utils"

const KINDS: { value: SourceKind; label: string }[] = [
  { value: "mp4", label: "MP4 (R2/doğrudan)" },
  { value: "hls", label: "HLS (.m3u8 / Bunny)" },
  { value: "drive", label: "Google Drive" },
  { value: "youtube", label: "YouTube" },
]

export function SourceManager({
  items,
  total,
  page,
  pageSize,
  query,
}: {
  items: AdminSourceRow[]
  total: number
  page: number
  pageSize: number
  query: string
}) {
  const router = useRouter()
  const [filter, setFilter] = useState(query)
  const [isPending, startTransition] = useTransition()

  const pages = Math.max(1, Math.ceil(total / pageSize))

  function go(params: { page?: number; q?: string }) {
    const sp = new URLSearchParams()
    const q = params.q ?? query
    const p = params.page ?? page
    if (q) sp.set("q", q)
    if (p) sp.set("page", String(p))
    router.push(`/admin/sources${sp.toString() ? `?${sp.toString()}` : ""}`)
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Video Kaynakları</h1>
          <p className="text-sm text-white/50">Toplam {total} kayıt</p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            go({ q: filter, page: 0 })
          }}
          className="flex items-center gap-2"
        >
          <div className="flex items-center gap-2 rounded-md bg-white/10 px-3 py-2">
            <Search className="h-4 w-4 text-white/50" />
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Başlığa göre ara"
              className="w-48 bg-transparent text-sm outline-none placeholder:text-white/40"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-white/15 px-3 py-2 text-sm font-medium transition hover:bg-white/25"
          >
            Ara
          </button>
        </form>
      </div>

      <AddSourceForm onSaved={() => startTransition(() => router.refresh())} />

      <div className="overflow-hidden rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-left text-white/60">
            <tr>
              <th className="p-3 font-medium">İçerik</th>
              <th className="p-3 font-medium">Tür</th>
              <th className="p-3 font-medium">Kaynak</th>
              <th className="p-3 font-medium">URL</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-white/40">
                  Kayıt yok.
                </td>
              </tr>
            )}
            {items.map((item) => (
              <SourceRow
                key={`${item.mediaType}-${item.id}`}
                item={item}
                onDeleted={() =>
                  startTransition(() => router.refresh())
                }
              />
            ))}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            disabled={page <= 0}
            onClick={() => go({ page: page - 1 })}
            className="rounded-md bg-white/10 px-3 py-1.5 text-sm disabled:opacity-30"
          >
            Önceki
          </button>
          <span className="text-sm text-white/60">
            {page + 1} / {pages}
          </span>
          <button
            disabled={page + 1 >= pages}
            onClick={() => go({ page: page + 1 })}
            className="rounded-md bg-white/10 px-3 py-1.5 text-sm disabled:opacity-30"
          >
            Sonraki
          </button>
        </div>
      )}
      {isPending && (
        <div className="flex justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-white/50" />
        </div>
      )}
    </div>
  )
}

function SourceRow({
  item,
  onDeleted,
}: {
  item: AdminSourceRow
  onDeleted: () => void
}) {
  const [deleting, setDeleting] = useState(false)
  return (
    <tr className="border-t border-white/10">
      <td className="p-3">
        <div className="flex items-center gap-3">
          <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded bg-white/10">
            {item.poster_path && (
              <Image
                src={`https://image.tmdb.org/t/p/w92${item.poster_path}`}
                alt={item.title ?? ""}
                fill
                sizes="40px"
                className="object-cover"
              />
            )}
          </div>
          <div>
            <Link
              href={`/show/${item.id}?mediaType=${item.mediaType}`}
              className="font-medium hover:underline"
            >
              {item.title ?? `#${item.id}`}
            </Link>
            <p className="text-xs text-white/40">ID: {item.id}</p>
          </div>
        </div>
      </td>
      <td className="p-3 text-white/70">
        {item.mediaType === "movie" ? "Film" : "Dizi"}
      </td>
      <td className="p-3">
        <span className="rounded bg-white/10 px-2 py-0.5 text-xs uppercase">
          {item.kind}
        </span>
      </td>
      <td className="max-w-[280px] truncate p-3 text-white/50" title={item.url}>
        {item.url}
      </td>
      <td className="p-3 text-right">
        <button
          disabled={deleting}
          onClick={() => {
            if (!confirm("Bu kaynak silinsin mi?")) return
            setDeleting(true)
            void adminDeleteSource(item.id, item.mediaType).then(onDeleted)
          }}
          aria-label="Sil"
          className="text-white/50 transition hover:text-netflix-red disabled:opacity-40"
        >
          {deleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </button>
      </td>
    </tr>
  )
}

function AddSourceForm({ onSaved }: { onSaved: () => void }) {
  const [q, setQ] = useState("")
  const [results, setResults] = useState<AdminSearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [selected, setSelected] = useState<AdminSearchResult | null>(null)
  const [kind, setKind] = useState<SourceKind>("mp4")
  const [url, setUrl] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function search() {
    if (q.trim().length < 2) return
    setSearching(true)
    try {
      setResults(await adminSearchTmdb(q))
    } finally {
      setSearching(false)
    }
  }

  async function save() {
    if (!selected || !url.trim()) return
    setSaving(true)
    try {
      await adminUpsertSource({
        id: selected.id,
        mediaType: selected.mediaType,
        kind,
        url: url.trim(),
        title: selected.title,
      })
      setSaved(true)
      setUrl("")
      setSelected(null)
      setResults([])
      setQ("")
      onSaved()
      setTimeout(() => setSaved(false), 2500)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4 rounded-xl border border-white/10 bg-[#181818] p-5">
      <h2 className="flex items-center gap-2 text-lg font-semibold">
        <Plus className="h-5 w-5 text-netflix-red" /> Kaynak Ekle / Güncelle
      </h2>

      <div className="flex flex-wrap gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && void search()}
          placeholder="TMDB'de film/dizi ara (ör. Matrix)"
          className="min-w-[240px] flex-1 rounded-md bg-white/10 px-3 py-2 text-sm outline-none placeholder:text-white/40"
        />
        <button
          onClick={() => void search()}
          disabled={searching}
          className="flex items-center gap-2 rounded-md bg-white/15 px-4 py-2 text-sm font-medium transition hover:bg-white/25 disabled:opacity-50"
        >
          {searching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          Ara
        </button>
      </div>

      {results.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {results.map((r) => (
            <button
              key={`${r.mediaType}-${r.id}`}
              onClick={() => setSelected(r)}
              className={cn(
                "flex items-center gap-2 rounded-md border p-2 text-left transition",
                selected?.id === r.id && selected?.mediaType === r.mediaType
                  ? "border-netflix-red bg-netflix-red/10"
                  : "border-white/10 hover:bg-white/5",
              )}
            >
              <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded bg-white/10">
                {r.poster_path && (
                  <Image
                    src={`https://image.tmdb.org/t/p/w92${r.poster_path}`}
                    alt={r.title}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="min-w-0">
                <p className="line-clamp-2 text-xs font-medium">{r.title}</p>
                <p className="text-[11px] text-white/40">
                  {r.mediaType === "movie" ? "Film" : "Dizi"}
                  {r.year ? ` · ${r.year}` : ""}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div className="space-y-3 rounded-lg bg-black/30 p-4">
          <p className="text-sm">
            Seçili:{" "}
            <span className="font-semibold">{selected.title}</span>{" "}
            <span className="text-white/40">
              ({selected.mediaType === "movie" ? "Film" : "Dizi"} · ID{" "}
              {selected.id})
            </span>
          </p>
          <div className="flex flex-wrap gap-2">
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as SourceKind)}
              className="rounded-md bg-white/10 px-3 py-2 text-sm outline-none"
            >
              {KINDS.map((k) => (
                <option key={k.value} value={k.value} className="bg-[#181818]">
                  {k.label}
                </option>
              ))}
            </select>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Video URL'si veya Drive bağlantısı"
              className="min-w-[260px] flex-1 rounded-md bg-white/10 px-3 py-2 text-sm outline-none placeholder:text-white/40"
            />
            <button
              onClick={() => void save()}
              disabled={saving || !url.trim()}
              className="flex items-center gap-2 rounded-md bg-netflix-red px-4 py-2 text-sm font-semibold transition hover:bg-netflix-red/90 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Kaydet
            </button>
          </div>
        </div>
      )}

      {saved && (
        <p className="flex items-center gap-2 text-sm text-[#46d369]">
          <Check className="h-4 w-4" /> Kaydedildi.
        </p>
      )}
    </div>
  )
}
