import { NetflixHeader } from "~/components/netflix-header"
import { MobileBottomNav } from "~/components/mobile-bottom-nav"
import { OverlayScrollbar } from "~/components/overlay-scrollbar"
import { MyListProvider } from "~/components/my-list-provider"
import { LibraryFilterProvider } from "~/components/library-filter-provider"
import { ProfileGate } from "~/components/profile-gate"
import Link from "next/link"

export default function ShowsLayout({
  children,
  modal,
}: {
  children: React.ReactNode
  modal: React.ReactNode
}) {
  return (
    <MyListProvider>
      <LibraryFilterProvider>
      <ProfileGate />
      <div className="relative flex min-h-screen flex-col bg-[#141414]">
        <NetflixHeader />
        <div className="flex-1 pb-[calc(4.25rem+env(safe-area-inset-bottom))] lg:pb-0">
          {children}
        </div>
        {modal}
        <Footer />
        <MobileBottomNav />
        <OverlayScrollbar />
      </div>
      </LibraryFilterProvider>
    </MyListProvider>
  )
}

function Footer() {
  return (
    <footer className="mt-16 mb-20 border-t border-white/10 px-4 py-10 text-sm text-white/50 lg:mb-0 lg:px-12">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="flex flex-col gap-3">
          <Link href="/" className="hover:underline">
            Audio Description
          </Link>
          <Link href="/" className="hover:underline">
            Investor Relations
          </Link>
          <Link href="/" className="hover:underline">
            Legal Notices
          </Link>
        </div>
        <div className="flex flex-col gap-3">
          <Link href="/" className="hover:underline">
            Help Center
          </Link>
          <Link href="/" className="hover:underline">
            Jobs
          </Link>
          <Link href="/" className="hover:underline">
            Cookie Preferences
          </Link>
        </div>
        <div className="flex flex-col gap-3">
          <Link href="/" className="hover:underline">
            Gift Cards
          </Link>
          <Link href="/" className="hover:underline">
            Terms of Use
          </Link>
          <Link href="/" className="hover:underline">
            Corporate Information
          </Link>
        </div>
        <div className="flex flex-col gap-3">
          <Link href="/" className="hover:underline">
            Media Center
          </Link>
          <Link href="/" className="hover:underline">
            Privacy
          </Link>
          <Link href="/" className="hover:underline">
            Contact Us
          </Link>
        </div>
      </div>
    </footer>
  )
}
