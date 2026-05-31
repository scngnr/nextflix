"use client"

import { Input } from "~/components/ui/input"
import { useEffect, useState } from "react"
import { useDebouncedCallback } from "use-debounce"
import { useRouter } from "next/navigation"
import { useLocale } from "~/components/locale-provider"

interface PageProps extends React.HTMLAttributes<HTMLElement> {
  initialQuery: string
  placeholder?: string
}

export function SearchInput({
  initialQuery,
  placeholder,
  ...props
}: PageProps) {
  const { dict } = useLocale()
  const [query, setQuery] = useState("")
  const debounced = useDebouncedCallback((value: string) => {
    setQuery(value)
  }, 500)
  const router = useRouter()

  useEffect(() => {
    if (query) router.replace(`/search?keyword=${query}`)
  }, [query, router])

  return (
    <Input
      placeholder={placeholder ?? dict.pages.search.placeholder}
      defaultValue={initialQuery}
      onChange={(e) => debounced(e.target.value)}
      autoFocus
      aria-label={dict.nav.searchAria}
      {...props}
    />
  )
}
