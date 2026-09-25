import Link from "next/link"
import { Plus } from "lucide-react"

import { cn } from "@/lib/utils"

export function AdminHeader({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: { href: string; label: string } | React.ReactNode
}) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-heading text-3xl">{title}</h1>
        {description && (
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        )}
      </div>

      {action &&
        (typeof action === "object" && action !== null && "href" in action ? (
          <Link
            href={(action as { href: string }).href}
            className="inline-flex items-center gap-2 rounded-lg bg-lapis px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-lapis-deep"
          >
            <Plus className="size-4" />
            {(action as { label: string }).label}
          </Link>
        ) : (
          action
        ))}
    </header>
  )
}

export function StatsCard({
  label,
  value,
  hint,
  icon,
  tone = "default",
}: {
  label: string
  value: string | number
  hint?: string
  icon?: React.ReactNode
  tone?: "default" | "gold" | "teal" | "amber"
}) {
  const tones = {
    default: "bg-muted text-muted-foreground",
    gold: "bg-lapis/12 text-lapis",
    teal: "bg-faience/12 text-faience",
    amber: "bg-amber-500/12 text-amber-700",
  }

  return (
    <div className="rounded-2xl border border-border bg-papyrus p-6">
      <div className="flex items-start justify-between gap-4">
        <p className="text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">
          {label}
        </p>
        {icon && (
          <span
            className={cn(
              "flex size-9 items-center justify-center rounded-lg",
              tones[tone]
            )}
          >
            {icon}
          </span>
        )}
      </div>
      <p className="mt-4 font-heading text-3xl">{value}</p>
      {hint && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

export function AdminCard({
  title,
  description,
  children,
  className,
}: {
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-papyrus",
        className
      )}
    >
      {(title || description) && (
        <div className="border-b border-border px-6 py-5">
          {title && <h2 className="font-heading text-xl">{title}</h2>}
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      {children}
    </section>
  )
}

export function TableEmpty({ message }: { message: string }) {
  return (
    <div className="px-6 py-16 text-center text-sm text-muted-foreground">
      {message}
    </div>
  )
}
