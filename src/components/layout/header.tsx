"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Phone } from "lucide-react"

import { MobileNav } from "@/components/layout/mobile-nav"
import { UserMenu } from "@/components/layout/user-menu"
import { Button } from "@/components/ui/button"
import { ButtonLink } from "@/components/ui/button-link"
import { NAV_LINKS } from "@/lib/constants"
import { cn } from "@/lib/utils"

export function Header({ phone }: { phone: string }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [scrolled, setScrolled] = useState(false)

  // The homepage hero sits under a transparent header until the user scrolls.
  const overlay = pathname === "/"

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const solid = !overlay || scrolled

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        solid
          ? "border-b border-border/70 bg-ivory/90 backdrop-blur-md"
          : "bg-gradient-to-b from-black/45 to-transparent"
      )}
    >
      <div className="container-page flex h-18 items-center justify-between gap-4">
        <Link href="/" className="group flex flex-col leading-none">
          <span
            className={cn(
              "font-heading text-xl tracking-tight transition-colors sm:text-[1.35rem]",
              solid ? "text-ink" : "text-white"
            )}
          >
            Egypt <span className="text-gold">Journeys</span>
          </span>
          <span
            className={cn(
              "mt-1 text-[0.6rem] tracking-[0.22em] uppercase transition-colors",
              solid ? "text-muted-foreground" : "text-white/70"
            )}
          >
            Planned around you
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => {
            const active =
              pathname === link.href || pathname.startsWith(`${link.href}/`)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  solid
                    ? active
                      ? "text-gold"
                      : "text-ink/75 hover:text-gold"
                    : active
                      ? "text-white"
                      : "text-white/80 hover:text-white"
                )}
              >
                {link.label}
                {active && (
                  <span
                    className={cn(
                      "absolute inset-x-3 -bottom-0.5 h-px",
                      solid ? "bg-gold" : "bg-white/80"
                    )}
                  />
                )}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={`tel:${phone.replace(/\s/g, "")}`}
            className={cn(
              "hidden items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors xl:flex",
              solid ? "text-ink/75 hover:text-gold" : "text-white/85 hover:text-white"
            )}
          >
            <Phone className="size-4" />
            {phone}
          </a>

          <div className="hidden sm:block">
            <UserMenu solid={solid} />
          </div>

          <ButtonLink href="/contact" size="lg"
            className="hidden bg-gold text-white hover:bg-gold-light sm:inline-flex">
            Start Planning
          </ButtonLink>

          <MobileNav solid={solid} isAuthed={Boolean(session?.user)} />
        </div>
      </div>
    </header>
  )
}
