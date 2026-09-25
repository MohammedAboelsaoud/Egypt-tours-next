import { cn } from "@/lib/utils"

export function SectionHeading({
  eyebrow,
  title,
  description,
  center = false,
  className,
}: {
  eyebrow?: string
  title: string
  description?: string
  center?: boolean
  className?: string
}) {
  return (
    <div className={cn("max-w-2xl", center && "mx-auto text-center", className)}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 className="mt-3 text-3xl leading-tight text-balance sm:text-4xl">{title}</h2>
      {description && (
        <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
          {description}
        </p>
      )}
    </div>
  )
}
