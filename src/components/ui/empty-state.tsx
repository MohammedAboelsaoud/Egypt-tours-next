import { SearchX } from "lucide-react"

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string
  description?: string
  action?: React.ReactNode
  icon?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-papyrus px-6 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-lapis/10 text-lapis">
        {icon ?? <SearchX className="size-5" />}
      </div>
      <h3 className="mt-5 font-heading text-xl">{title}</h3>
      {description && (
        <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
