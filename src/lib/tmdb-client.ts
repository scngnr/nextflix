import { env } from "~/env.mjs"
import { buildTmdbUrl, readLocaleFromDocumentCookie } from "~/lib/tmdb-shared"
import type { Locale } from "~/lib/i18n/config"

/** Yalnızca istemci bileşenlerinden çağırın. */
export async function tmdbFetchClient(
  path: string,
  init?: RequestInit,
  localeOverride?: Locale,
) {
  const locale = localeOverride ?? readLocaleFromDocumentCookie()
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
