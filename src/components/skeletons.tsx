export function RowSkeleton({ tiles = 6 }: { tiles?: number }) {
  return (
    <div className="space-y-2">
      <div className="h-6 w-48 animate-pulse rounded bg-white/10" />
      <div className="flex gap-2 overflow-hidden py-2">
        {Array.from({ length: tiles }).map((_, i) => (
          <div
            key={i}
            className="aspect-[2/3] w-[30vw] shrink-0 animate-pulse rounded-md bg-white/10 sm:w-[22vw] md:w-[18vw] lg:w-[15vw] xl:w-[13vw]"
          />
        ))}
      </div>
    </div>
  )
}

export function HeroSkeleton() {
  return (
    <div className="relative -mx-4 mb-2 h-[60vh] min-h-[420px] w-full animate-pulse bg-white/5 md:-mx-12 md:h-[80vh]">
      <div className="absolute inset-x-0 bottom-[12%] space-y-4 px-4 md:px-12">
        <div className="h-12 w-64 rounded bg-white/10 md:h-20 md:w-96" />
        <div className="h-4 w-80 max-w-full rounded bg-white/10" />
        <div className="flex gap-3">
          <div className="h-10 w-28 rounded bg-white/10" />
          <div className="h-10 w-36 rounded bg-white/10" />
        </div>
      </div>
    </div>
  )
}
