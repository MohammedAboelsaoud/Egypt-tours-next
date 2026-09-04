import { Skeleton } from "@/components/ui/skeleton"

export default function AdminLoading() {
  return (
    <div>
      <Skeleton className="h-9 w-48" />
      <Skeleton className="mt-3 h-4 w-72" />

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-32 rounded-2xl" />
        ))}
      </div>

      <Skeleton className="mt-8 h-96 rounded-2xl" />
    </div>
  )
}
