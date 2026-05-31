import { HeroSkeleton, RowSkeleton } from "~/components/skeletons"

export default function Loading() {
  return (
    <main className="relative px-4 md:px-12">
      <HeroSkeleton />
      <div className="relative z-10 space-y-6 pb-12 pt-4">
        <RowSkeleton />
        <RowSkeleton />
        <RowSkeleton />
      </div>
    </main>
  )
}
