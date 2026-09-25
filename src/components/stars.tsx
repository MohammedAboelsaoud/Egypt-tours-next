import { Star } from "lucide-react"

export function Stars({ count }: { count: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${count}-star hotel`} role="img">
      {Array.from({ length: count }, (_, i) => (
        <Star key={i} className="size-3.5 fill-gold-light text-gold-light" aria-hidden="true" />
      ))}
    </span>
  )
}
