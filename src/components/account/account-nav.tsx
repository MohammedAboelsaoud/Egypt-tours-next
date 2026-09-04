"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import {
  CalendarCheck,
  Heart,
  LayoutDashboard,
  LogOut,
  User,
} from "lucide-react"

import { cn } from "@/lib/utils"

const LINKS = [
  { href: "/account", label: "Profile", icon: User },
  { href: "/account/bookings", label: "My bookings", icon: CalendarCheck },
  { href: "/account/wishlist", label: "Wishlist", icon: Heart },
]

export function AccountNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname()

  return (
    <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:gap-1 lg:overflow-visible">
      {LINKS.map((link) => {
        const active = pathname === link.href
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex shrink-0 items-center gap-2.5 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
              active
                ? "bg-gold/10 text-gold"
                : "text-muted-foreground hover:bg-muted hover:text-ink"
            )}
          >
            <link.icon className="size-4" />
            {link.label}
          </Link>
        )
      })}

      {isAdmin && (
        <Link
          href="/admin"
          className="flex shrink-0 items-center gap-2.5 rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-ink"
        >
          <LayoutDashboard className="size-4" />
          Admin dashboard
        </Link>
      )}

      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        className="flex shrink-0 items-center gap-2.5 rounded-lg px-4 py-3 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive lg:mt-4 lg:border-t lg:border-border lg:pt-4"
      >
        <LogOut className="size-4" />
        Sign out
      </button>
    </nav>
  )
}
