import Image from "next/image"
import Link from "next/link"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen bg-[#141414]">
      <div className="netflix-gradient-bottom pointer-events-none absolute inset-0 opacity-60" />
      <div className="netflix-gradient-top pointer-events-none absolute inset-0 h-32" />
      <header className="relative z-10 px-4 py-6 md:px-12">
        <Link href="/">
          <Image
            src="/canflix.png"
            alt="Canflix"
            width={140}
            height={40}
            priority
            className="h-9 w-auto"
          />
        </Link>
      </header>
      <div className="relative z-10 grid min-h-[calc(100vh-80px)] place-content-center px-4 pb-12">
        {children}
      </div>
    </div>
  )
}
