import { Skeleton } from "@/components/ui/skeleton"

/** Shared skeleton for public pages while their data resolves. */
export default function SiteLoading() {
  return (
    <div>
      <div className="border-b border-border bg-papyrus">
        <div className="container-page pt-28 pb-12 sm:pt-36 sm:pb-16">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-5 h-12 w-full max-w-2xl" />
          <Skeleton className="mt-4 h-5 w-full max-w-xl" />
        </div>
      </div>

      <div className="container-page section-y">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-2xl border border-border bg-papyrus"
            >
              <Skeleton className="aspect-[4/3] w-full rounded-none" />
              <div className="space-y-3 p-6">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="mt-4 h-8 w-28" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
