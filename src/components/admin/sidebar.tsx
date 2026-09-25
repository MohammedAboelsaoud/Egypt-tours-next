"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  BedDouble,
  CalendarCheck,
  Car,
  Globe,
  Inbox,
  LayoutDashboard,
  LogOut,
  Map,
  Menu,
  Settings,
  Star,
  UsersRound,
  X,
} from "lucide-react"

import { signOutTo } from "@/lib/sign-out"
import { cn } from "@/lib/utils"

const ITEMS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/admin/tours", label: "Tours", icon: Map },
  { href: "/admin/hotels", label: "Hotels", icon: BedDouble },
  { href: "/admin/cars", label: "Cars", icon: Car },
  { href: "/admin/regions", label: "Regions", icon: Globe },
  { href: "/admin/guides", label: "Guides", icon: UsersRound },
  { href: "/admin/inquiries", label: "Inquiries", icon: Inbox },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/settings", label: "Settings", icon: Settings },
]

export function AdminSidebar({
  pendingInquiries = 0,
  pendingReviews = 0,
}: {
  pendingInquiries?: number
  pendingReviews?: number
}) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const badge = (href: string) => {
    if (href === "/admin/inquiries" && pendingInquiries > 0) return pendingInquiries
    if (href === "/admin/reviews" && pendingReviews > 0) return pendingReviews
    return null
  }

  const nav = (
    <nav className="flex flex-col gap-1 p-4">
      {ITEMS.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href)
        const count = badge(item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-lapis/12 text-lapis"
                : "text-muted-foreground hover:bg-muted hover:text-basalt"
            )}
          >
            <item.icon className="size-4 shrink-0" />
            <span className="flex-1">{item.label}</span>
            {count !== null && (
              <span className="rounded-full bg-lapis px-1.5 py-0.5 text-[0.65rem] font-semibold text-white">
                {count}
              </span>
            )}
          </Link>
        )
      })}

      <button
        type="button"
        onClick={() => signOutTo()}
        className="mt-4 flex items-center gap-3 rounded-lg border-t border-border px-3.5 pt-5 pb-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-destructive"
      >
        <LogOut className="size-4" />
        Sign out
      </button>
    </nav>
  )

  return (
    <>
      {/* Mobile trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed top-4 left-4 z-50 flex size-10 items-center justify-center rounded-lg border border-border bg-papyrus lg:hidden"
        aria-label="Open admin menu"
      >
        <Menu className="size-5" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-basalt/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-papyrus transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-5">
          <Link href="/admin" className="flex flex-col leading-none">
            <span className="font-heading text-lg">
              Egypt <span className="text-lapis">Journeys</span>
            </span>
            <span className="mt-1 text-[0.6rem] tracking-[0.2em] text-muted-foreground uppercase">
              Admin
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="lg:hidden"
            aria-label="Close menu"
          >
            <X className="size-5" />
          </button>
        </div>

        {nav}

        <div className="mt-auto border-t border-border p-4">
          <Link
            href="/"
            className="block rounded-lg bg-muted px-3.5 py-2.5 text-center text-sm font-medium transition-colors hover:bg-lapis hover:text-white"
          >
            View website ↗
          </Link>
        </div>
      </aside>
    </>
  )
}
