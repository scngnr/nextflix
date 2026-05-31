import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  isLocale,
  localeToTmdb,
  type Locale,
} from "~/lib/i18n/config"

export function readLocaleFromDocumentCookie(): Locale {
  if (typeof document === "undefined") return DEFAULT_LOCALE
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]*)`),
  )
  const value = match?.[1] ? decodeURIComponent(match[1]) : undefined
  return isLocale(value) ? value : DEFAULT_LOCALE
}

export function buildTmdbUrl(path: string, locale: Locale): string {
  const base = path.startsWith("http")
    ? path
    : `https://api.themoviedb.org/3${path.startsWith("/") ? path : `/${path}`}`

  const url = new URL(base)
  const { language, region } = localeToTmdb(locale)
  url.searchParams.set("language", language)
  url.searchParams.set("region", region)
  return url.toString()
}
