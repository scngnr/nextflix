import type { Locale } from "./config"
import type { Dictionary } from "./types"
import { tr } from "./dictionaries/tr"
import { en } from "./dictionaries/en"

const dictionaries: Record<Locale, Dictionary> = { tr, en }

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale]
}
