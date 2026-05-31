"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Languages } from "lucide-react"
import { setLocale } from "~/actions/locale"
import { LOCALES, LOCALE_LABELS, type Locale } from "~/lib/i18n/config"
import { useLocale } from "~/components/locale-provider"
import { cn } from "~/lib/utils"

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, dict } = useLocale()
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function change(next: Locale) {
    if (next === locale || pending) return
    startTransition(async () => {
      await setLocale(next)
      router.refresh()
    })
  }

  return (
    <div
      className={cn("flex items-center gap-1", className)}
      role="group"
      aria-label={dict.language.label}
    >
      <Languages className="hidden h-4 w-4 text-white/50 lg:block" aria-hidden />
      {LOCALES.map((code) => (
        <button
          key={code}
          type="button"
          disabled={pending}
          onClick={() => change(code)}
          className={cn(
            "rounded px-2 py-1 text-xs font-semibold uppercase tracking-wide transition",
            locale === code
              ? "bg-white/15 text-white"
              : "text-white/50 hover:bg-white/10 hover:text-white/80",
            pending && "opacity-60",
          )}
          aria-pressed={locale === code}
        >
          {code}
        </button>
      ))}
      <span className="sr-only">{LOCALE_LABELS[locale]}</span>
    </div>
  )
}
