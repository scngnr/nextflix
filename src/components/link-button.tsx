"use client"
import { useRouter } from "next/navigation"
import { cn } from "~/lib/utils"

export function LinkButton({
  children,
  href,
  className,
}: {
  children: React.ReactNode
  href: string
  className?: string
}) {
  const router = useRouter()
  return (
    <button
      className={cn(className)}
      onClick={() => {
        router.push(href)
        router.refresh()
      }}
    >
      {children}
    </button>
  )
}
