export const LOCALE_COOKIE = "canflix_locale"

export const LOCALES = ["tr", "en"] as const
export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = "tr"

export function isLocale(value: string | undefined | null): value is Locale {
  return LOCALES.includes(value as Locale)
}

export const LOCALE_LABELS: Record<Locale, string> = {
  tr: "Türkçe",
  en: "English",
}

/** TMDB `language` ve `region` query parametreleri */
export function localeToTmdb(locale: Locale): {
  language: string
  region: string
} {
  return locale === "tr"
    ? { language: "tr-TR", region: "TR" }
    : { language: "en-US", region: "US" }
}

/** Logo / görsel dili (kısa kod) */
export function localeImageLanguages(locale: Locale): string {
  const short = locale === "tr" ? "tr" : "en"
  return `${short},en,null`
}
