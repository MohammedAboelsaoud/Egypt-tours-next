"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { CalendarDays, Inbox, LayoutDashboard, LogOut, Star, UserRound } from "lucide-react"

import { cn } from "@/lib/utils"

const LINKS = [
  { href: "/guide", label: "Overview", icon: LayoutDashboard },
  { href: "/guide/requests", label: "Requests", icon: Inbox },
  { href: "/guide/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/guide/profile", label: "Profile", icon: UserRound },
  { href: "/guide/reviews", label: "Reviews", icon: Star },
]

export function GuideNav({ pendingCount }: { pendingCount: number }) {
  const pathname = usePathname()

  return (
    <nav aria-label="Guide dashboard" className="flex gap-2 overflow-x-auto lg:flex-col lg:gap-1 lg:overflow-visible">
      {LINKS.map((link) => {
        const active = pathname === link.href
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-2.5 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
              active ? "bg-lapis/10 text-lapis" : "text-muted-foreground hover:bg-muted hover:text-basalt"
            )}
          >
            <link.icon className="size-4" />
            {link.label}
            {link.href === "/guide/requests" && pendingCount > 0 && (
              <span className="ml-auto rounded-full bg-lapis px-2 py-0.5 text-xs font-semibold text-white tabular-nums">
                {pendingCount}
              </span>
            )}
          </Link>
        )
      })}
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/guides/login" })}
        className="flex shrink-0 items-center gap-2.5 rounded-lg px-4 py-3 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-basalt"
      >
        <LogOut className="size-4" />
        Sign out
      </button>
    </nav>
  )
}
