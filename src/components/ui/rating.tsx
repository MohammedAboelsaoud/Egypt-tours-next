import { Star } from "lucide-react"

import { cn } from "@/lib/utils"

export function Rating({
  value,
  count,
  size = "sm",
  className,
  showValue = false,
}: {
  value: number
  count?: number
  size?: "sm" | "md"
  className?: string
  showValue?: boolean
}) {
  const rounded = Math.round(value * 2) / 2
  const starClass = size === "md" ? "size-4.5" : "size-3.5"

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="flex items-center gap-0.5" aria-hidden>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              starClass,
              star <= rounded
                ? "fill-sun text-ochre"
                : star - 0.5 === rounded
                  ? "fill-sun/50 text-ochre"
                  : "fill-transparent text-muted-foreground/40"
            )}
          />
        ))}
      </div>
      {showValue && (
        <span className="text-sm font-semibold">{value.toFixed(1)}</span>
      )}
      {typeof count === "number" && (
        <span className="text-xs text-muted-foreground">
          ({count} {count === 1 ? "review" : "reviews"})
        </span>
      )}
      <span className="sr-only">{value.toFixed(1)} out of 5</span>
    </div>
  )
}
