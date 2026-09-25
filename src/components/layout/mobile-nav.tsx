"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { LogOut, Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ButtonLink } from "@/components/ui/button-link"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { NAV_LINKS, SITE } from "@/lib/constants"
import { signOutTo } from "@/lib/sign-out"
import { cn } from "@/lib/utils"

const ACCOUNT_LINKS = [
  { href: "/account", label: "My profile" },
  { href: "/account/bookings", label: "My bookings" },
  { href: "/account/wishlist", label: "Wishlist" },
]

export function MobileNav({
  solid = true,
  isAuthed = false,
}: {
  solid?: boolean
  isAuthed?: boolean
}) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  // Close the drawer whenever navigation completes.
  useEffect(() => setOpen(false), [pathname])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open menu"
            className={cn(
              "size-10 lg:hidden",
              solid ? "text-basalt" : "text-white hover:bg-white/10 hover:text-white"
            )}
          />
        }
      >
        <Menu className="size-5" />
      </SheetTrigger>

      <SheetContent side="right" className="w-[85vw] max-w-sm bg-papyrus p-0">
        <SheetHeader className="border-b border-border px-6 py-5 text-left">
          <SheetTitle className="font-heading text-xl">
            Egypt <span className="text-lapis">Journeys</span>
          </SheetTitle>
          <SheetDescription className="text-xs tracking-[0.2em] uppercase">
            {SITE.tagline}
          </SheetDescription>
        </SheetHeader>

        <nav className="flex flex-col px-3 py-4">
          {NAV_LINKS.map((link) => {
            const active =
              pathname === link.href || pathname.startsWith(`${link.href}/`)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-lg px-3 py-3 font-heading text-lg transition-colors",
                  active ? "bg-lapis/10 text-lapis" : "text-basalt hover:bg-muted"
                )}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto border-t border-border px-6 py-5">
          {isAuthed ? (
            <div className="flex flex-col gap-1">
              {ACCOUNT_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-md px-2 py-2 text-sm text-basalt/80 hover:bg-muted"
                >
                  {link.label}
                </Link>
              ))}
              <button
                type="button"
                onClick={() => signOutTo()}
                className="mt-1 flex items-center gap-2 rounded-md px-2 py-2 text-left text-sm text-destructive hover:bg-destructive/10"
              >
                <LogOut className="size-4" /> Sign out
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <ButtonLink href="/contact" className="h-11 w-full bg-lapis text-white hover:bg-lapis-deep">
                Start Planning
              </ButtonLink>
              <ButtonLink href="/login" variant="outline"
                className="h-11 w-full">
                Sign in
              </ButtonLink>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
