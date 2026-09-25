import { cn } from "@/lib/utils"

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
  action,
}: {
  eyebrow?: string
  title: string
  description?: string
  align?: "left" | "center"
  className?: string
  action?: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5",
        align === "center" && "items-center text-center",
        action && "sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 className="mt-3 font-heading text-3xl leading-tight text-balance sm:text-4xl">
          {title}
        </h2>
        <div
          className={cn("mt-5 horizon-rule", align === "center" && "mx-auto")}
          aria-hidden
        />
        {description && (
          <p className="mt-5 leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  )
}
