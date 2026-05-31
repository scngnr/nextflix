"use client"

import { createContext, useContext, useMemo } from "react"
import type { Locale } from "~/lib/i18n/config"
import type { Dictionary } from "~/lib/i18n/types"

const LocaleContext = createContext<{
  locale: Locale
  dict: Dictionary
} | null>(null)

export function LocaleProvider({
  locale,
  dictionary,
  children,
}: {
  locale: Locale
  dictionary: Dictionary
  children: React.ReactNode
}) {
  const value = useMemo(
    () => ({ locale, dict: dictionary }),
    [locale, dictionary],
  )

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  )
}

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) {
    throw new Error("useLocale must be used within LocaleProvider")
  }
  return ctx
}
