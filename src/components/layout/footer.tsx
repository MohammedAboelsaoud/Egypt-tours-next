import Link from "next/link"
import { Mail, MapPin, Phone } from "lucide-react"

import { FacebookIcon, InstagramIcon } from "@/components/ui/social-icons"
import type { SiteSettings } from "@/lib/settings"

const EXPLORE = [
  { href: "/destinations", label: "Destinations" },
  { href: "/tours", label: "Tours" },
  { href: "/hotels", label: "Hotels" },
  { href: "/car-rentals", label: "Car Rentals" },
]

const COMPANY = [
  { href: "/about", label: "About us" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
  { href: "/account/bookings", label: "My bookings" },
]

const REGIONS = [
  { href: "/destinations/cairo-giza", label: "Cairo & Giza" },
  { href: "/destinations/luxor-aswan", label: "Luxor & Aswan" },
  { href: "/destinations/north-coast", label: "North Coast" },
  { href: "/destinations/sinai-red-sea", label: "Sinai & the Red Sea" },
]

export function Footer({ settings }: { settings: SiteSettings }) {
  return (
    <footer className="mt-auto bg-ink text-white/70">
      <div className="container-page grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
        <div className="lg:pr-8">
          <div className="font-heading text-2xl text-white">
            Egypt <span className="text-gold-light">Journeys</span>
          </div>
          <div className="mt-4 h-px w-14 bg-gradient-to-r from-gold-light to-transparent" />
          <p className="mt-4 text-sm leading-relaxed">
            Tailor-made journeys through Egypt, built by people who live here.
            One planner from your first enquiry to your last transfer.
          </p>

          <div className="mt-6 flex gap-3">
            {settings.facebookUrl && (
              <a
                href={settings.facebookUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="rounded-full border border-white/15 p-2 transition-colors hover:border-gold-light hover:text-gold-light"
              >
                <FacebookIcon className="size-4" />
              </a>
            )}
            {settings.instagramUrl && (
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="rounded-full border border-white/15 p-2 transition-colors hover:border-gold-light hover:text-gold-light"
              >
                <InstagramIcon className="size-4" />
              </a>
            )}
          </div>
        </div>

        <FooterColumn title="Explore" links={EXPLORE} />
        <FooterColumn title="Regions" links={REGIONS} />

        <div>
          <h3 className="text-[0.7rem] font-semibold tracking-[0.18em] text-gold-light uppercase">
            Get in touch
          </h3>
          <ul className="mt-5 space-y-3 text-sm">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-gold-light" />
              <span>{settings.address}</span>
            </li>
            <li className="flex gap-3">
              <Phone className="mt-0.5 size-4 shrink-0 text-gold-light" />
              <a
                href={`tel:${settings.contactPhone.replace(/\s/g, "")}`}
                className="transition-colors hover:text-white"
              >
                {settings.contactPhone}
              </a>
            </li>
            <li className="flex gap-3">
              <Mail className="mt-0.5 size-4 shrink-0 text-gold-light" />
              <a
                href={`mailto:${settings.contactEmail}`}
                className="transition-colors hover:text-white"
              >
                {settings.contactEmail}
              </a>
            </li>
          </ul>

          <ul className="mt-6 space-y-2 text-sm">
            {COMPANY.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition-colors hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {settings.siteName}. All rights reserved.
          </p>
          <p>Licensed Egyptian tour operator · Ministry of Tourism #4412</p>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({
  title,
  links,
}: {
  title: string
  links: { href: string; label: string }[]
}) {
  return (
    <div>
      <h3 className="text-[0.7rem] font-semibold tracking-[0.18em] text-gold-light uppercase">
        {title}
      </h3>
      <ul className="mt-5 space-y-2.5 text-sm">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="transition-colors hover:text-white">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
