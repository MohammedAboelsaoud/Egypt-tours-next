import Link from "next/link"
import { ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

export type Crumb = { label: string; href?: string }

export function Breadcrumb({
  items,
  light = false,
  className,
}: {
  items: Crumb[]
  light?: boolean
  className?: string
}) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol
        className={cn(
          "flex flex-wrap items-center gap-1 text-xs",
          light ? "text-white/70" : "text-muted-foreground"
        )}
      >
        <li>
          <Link
            href="/"
            className={cn(
              "transition-colors",
              light ? "hover:text-white" : "hover:text-lapis"
            )}
          >
            Home
          </Link>
        </li>
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-1">
            <ChevronRight className="size-3 opacity-60" />
            {item.href ? (
              <Link
                href={item.href}
                className={cn(
                  "transition-colors",
                  light ? "hover:text-white" : "hover:text-lapis"
                )}
              >
                {item.label}
              </Link>
            ) : (
              <span className={light ? "text-white" : "text-basalt"}>{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

/** JSON-LD breadcrumb trail, rendered next to the visual one. */
export function BreadcrumbJsonLd({
  items,
  baseUrl,
}: {
  items: Crumb[]
  baseUrl: string
}) {
  const list = [{ label: "Home", href: "/" }, ...items]
  const json = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: list.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: `${baseUrl}${item.href}` } : {}),
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  )
}
