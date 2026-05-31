"use client"
import type { ShowDetail } from "~/lib/types"
import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { ModalCard } from "~/components/modal-card"
import { X } from "lucide-react"

export function Modal({
  show,
  hasSource,
  userRating,
}: {
  show: ShowDetail
  hasSource?: boolean
  userRating?: number
}) {
  const router = useRouter()
  const pathname = usePathname()
  // Paralel route slotu yumuşak gezinmede eski halini koruyor; başka bir
  // sayfaya (ör. /person/[id]) geçildiğinde modalı kendimiz gizliyoruz.
  const visible = pathname?.startsWith("/show/") ?? false

  useEffect(() => {
    if (!visible) return
    document.body.style.overflow = "hidden"
    const back = (e: KeyboardEvent) => e.key === "Escape" && router.back()
    document.addEventListener("keydown", back)
    return () => {
      document.body.style.overflow = ""
      document.removeEventListener("keydown", back)
    }
  }, [router, visible])

  if (!visible) return null

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && router.back()}
      className="fixed inset-0 z-[60] overflow-y-auto bg-black/70 backdrop-blur-sm"
      id="show-modal"
    >
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="Kapat"
        className="fixed right-4 top-4 z-[70] flex h-10 w-10 items-center justify-center rounded-full bg-[#181818] text-white transition hover:bg-white/20 md:right-8 md:top-8"
      >
        <X className="h-6 w-6" />
      </button>
      <div
        onClick={(e) => e.target === e.currentTarget && router.back()}
        className="mx-auto w-full max-w-4xl px-4 py-16 md:px-0"
      >
        <ModalCard show={show} hasSource={hasSource} userRating={userRating} />
      </div>
    </div>
  )
}
