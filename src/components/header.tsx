"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Menu, X } from "lucide-react"

import { WhatsAppIcon } from "@/components/icons"
import { NAV_LINKS, SITE } from "@/data/site"
import { cn } from "@/lib/utils"
import { whatsappLink } from "@/lib/whatsapp"

export function Header() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Close the mobile menu after navigating.
  useEffect(() => setMenuOpen(false), [pathname])

  // Every page opens with a dark image banner, so the header starts
  // transparent and turns solid on scroll or when the menu is open.
  const solid = scrolled || menuOpen

  const isActive = (href: string) => {
    const base = href.replace(/\/$/, "")
    return pathname === base || pathname.startsWith(`${base}/`)
  }

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-colors duration-300",
        solid ? "border-b border-border/70 bg-ivory/95 backdrop-blur-md" : "bg-gradient-to-b from-black/50 to-transparent"
      )}
    >
      <div className="container-page flex h-16 items-center justify-between gap-4 sm:h-18">
        <Link href="/" className="flex flex-col leading-none">
          <span className={cn("font-heading text-xl tracking-tight sm:text-[1.35rem]", solid ? "text-ink" : "text-white")}>
            {SITE.name.split(" ")[0]} <span className="text-gold">{SITE.name.split(" ").slice(1).join(" ")}</span>
          </span>
          <span className={cn("mt-1 text-[0.6rem] tracking-[0.2em] uppercase", solid ? "text-muted-foreground" : "text-white/70")}>
            Guides · Hotels · Transport
          </span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                solid
                  ? isActive(link.href) ? "text-gold" : "text-ink/75 hover:text-gold"
                  : isActive(link.href) ? "text-white underline underline-offset-8" : "text-white/80 hover:text-white"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={whatsappLink("Hello! I'd like to plan a trip to Egypt.")}
            target="_blank"
            rel="noreferrer"
            className="hidden h-10 items-center gap-2 rounded-lg bg-whatsapp px-4 text-sm font-semibold text-white transition-colors hover:bg-whatsapp-dark sm:inline-flex"
          >
            <WhatsAppIcon className="size-4" />
            WhatsApp us
          </a>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className={cn("rounded-md p-2 lg:hidden", solid ? "text-ink hover:bg-muted" : "text-white hover:bg-white/10")}
          >
            {menuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav id="mobile-menu" aria-label="Mobile" className="border-t border-border bg-ivory lg:hidden">
          <div className="container-page flex flex-col py-3">
            <Link href="/" className="rounded-lg px-3 py-3 font-heading text-lg text-ink hover:bg-muted">
              Home
            </Link>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={cn(
                  "rounded-lg px-3 py-3 font-heading text-lg",
                  isActive(link.href) ? "bg-gold/10 text-gold" : "text-ink hover:bg-muted"
                )}
              >
                {link.label}
              </Link>
            ))}
            <a
              href={whatsappLink("Hello! I'd like to plan a trip to Egypt.")}
              target="_blank"
              rel="noreferrer"
              className="mt-2 mb-1 inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-whatsapp font-semibold text-white"
            >
              <WhatsAppIcon className="size-5" />
              WhatsApp us
            </a>
          </div>
        </nav>
      )}
    </header>
  )
}
