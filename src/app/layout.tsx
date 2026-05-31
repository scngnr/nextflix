import "~/lib/globals.css"
import { Inter } from "next/font/google"
import { cn } from "~/lib/utils"
import { ThemeProvider } from "~/components/theme-provider"
import { LocaleProvider } from "~/components/locale-provider"
import { ClerkProvider } from "@clerk/nextjs"
import { trTR, enUS } from "@clerk/localizations"
import { Toaster } from "~/components/ui/toaster"
import { Analytics } from "@vercel/analytics/react"
import { getLocale } from "~/lib/i18n/get-locale"
import { getDictionary } from "~/lib/i18n/get-dictionary"

const inter = Inter({ subsets: ["latin"] })

const clerkSignInUrl = process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL ?? "/sign-in"
const clerkSignUpUrl = process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL ?? "/sign-up"
const clerkAfterSignInUrl =
  process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL ?? "/"
const clerkAfterSignUpUrl =
  process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL ?? "/"

const siteConfig = {
  title: "Netflix Clone",
  description:
    "Open source project using bleeding-edge stack. Drizzle ORM + Neon postgres + Clerk auth + Shadcn/ui + everything new in Next.js 13 (server components, server actions, streaming ui, parallel routes, intercepting routes).",
  url: "/",
  siteName: "Nextflix",
}
export const metadata = {
  metadataBase: new URL("https://nextflix.cangungor.tr"),
  title: siteConfig.title,
  description: siteConfig.description,
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.siteName,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()
  const dictionary = getDictionary(locale)
  const clerkLocalization = locale === "tr" ? trTR : enUS

  return (
    <ClerkProvider
      localization={clerkLocalization}
      signInUrl={clerkSignInUrl}
      signUpUrl={clerkSignUpUrl}
      afterSignInUrl={clerkAfterSignInUrl}
      afterSignUpUrl={clerkAfterSignUpUrl}
    >
      <html lang={locale} suppressHydrationWarning>
        <body
          className={cn(
            "bg-neutral-900 text-slate-50 antialiased scrollbar-none",
            inter.className,
          )}
        >
          <ThemeProvider attribute="class" defaultTheme="dark">
            <LocaleProvider locale={locale} dictionary={dictionary}>
              {children}
            </LocaleProvider>
          </ThemeProvider>
          <Toaster />
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  )
}
