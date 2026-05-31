import { cn } from "~/lib/utils"

const KIDS_NAV_IMAGE = "/kids-nav.svg"

/** Taban: header 40px, mobil 20px (diğer ikonlar) → 3× */
export const KIDS_ICON_PX = {
  header: 120,
  badge: 60,
} as const

type KidsNavIconProps = {
  className?: string
  active?: boolean
  variant?: "header" | "badge"
}

export function KidsNavIcon({
  className,
  active = false,
  variant = "badge",
}: KidsNavIconProps) {
  const px = KIDS_ICON_PX[variant]

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={KIDS_NAV_IMAGE}
      alt=""
      width={px}
      height={px}
      aria-hidden
      className={cn(
        "max-w-none shrink-0 object-contain transition duration-200",
        variant === "header" &&
          "h-[120px] w-[120px] -rotate-12 hover:-rotate-6 hover:brightness-110",
        variant === "badge" && "h-[60px] w-[60px] -rotate-12",
        active
          ? "opacity-100 brightness-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.35)]"
          : "opacity-90 hover:opacity-100",
        className,
      )}
    />
  )
}

export const KIDS_NAV = {
  href: "/kids",
  label: "Çocuk",
  image: KIDS_NAV_IMAGE,
}
