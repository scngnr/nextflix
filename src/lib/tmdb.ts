import { env } from "~/env.mjs"
import { getLocale } from "~/lib/i18n/get-locale"
import { buildTmdbUrl } from "~/lib/tmdb-shared"
import type { Locale } from "~/lib/i18n/config"

/** Sunucu bileşenleri ve server action'lar için. */
export async function tmdbFetch(
  path: string,
  init?: RequestInit,
  localeOverride?: Locale,
) {
  const locale = localeOverride ?? (await getLocale())
  const url = buildTmdbUrl(path, locale)

  return fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${env.NEXT_PUBLIC_TMDB_API}`,
      accept: "application/json",
      ...init?.headers,
    },
  })
}

export { buildTmdbUrl, readLocaleFromDocumentCookie } from "~/lib/tmdb-shared"
