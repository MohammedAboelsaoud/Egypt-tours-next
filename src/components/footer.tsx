import Link from "next/link"
import { Clock, Mail, MapPin } from "lucide-react"

import { FacebookIcon, InstagramIcon, WhatsAppIcon } from "@/components/icons"
import { DESTINATIONS } from "@/data/destinations"
import { NAV_LINKS, SITE } from "@/data/site"
import { whatsappLink } from "@/lib/whatsapp"

export function Footer() {
  return (
    <footer className="mt-auto bg-ink text-white/70">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
        <div className="lg:pr-6">
          <p className="font-heading text-2xl text-white">
            {SITE.name.split(" ")[0]} <span className="text-gold-light">{SITE.name.split(" ").slice(1).join(" ")}</span>
          </p>
          <p className="mt-4 text-sm leading-relaxed">{SITE.description}</p>
          <div className="mt-5 flex gap-3">
            {SITE.facebook && (
              <a href={SITE.facebook} target="_blank" rel="noreferrer" aria-label="Facebook"
                className="rounded-full border border-white/15 p-2 hover:border-gold-light hover:text-gold-light">
                <FacebookIcon className="size-4" />
              </a>
            )}
            {SITE.instagram && (
              <a href={SITE.instagram} target="_blank" rel="noreferrer" aria-label="Instagram"
                className="rounded-full border border-white/15 p-2 hover:border-gold-light hover:text-gold-light">
                <InstagramIcon className="size-4" />
              </a>
            )}
          </div>
        </div>

        <FooterColumn title="Explore" links={NAV_LINKS.map((l) => ({ href: l.href, label: l.label }))} />
        <FooterColumn
          title="Destinations"
          links={DESTINATIONS.map((d) => ({ href: `/destinations/${d.slug}/`, label: d.name }))}
        />

        <div>
          <h3 className="font-sans text-[0.7rem] font-semibold tracking-[0.18em] text-gold-light uppercase">Get in touch</h3>
          <ul className="mt-5 space-y-3 text-sm">
            <li>
              <a href={whatsappLink("Hello! I'd like to plan a trip to Egypt.")} target="_blank" rel="noreferrer"
                className="flex gap-3 hover:text-white">
                <WhatsAppIcon className="mt-0.5 size-4 shrink-0 text-gold-light" />
                WhatsApp
              </a>
            </li>
            <li>
              <a href={`mailto:${SITE.email}`} className="flex gap-3 hover:text-white">
                <Mail className="mt-0.5 size-4 shrink-0 text-gold-light" />
                {SITE.email}
              </a>
            </li>
            {SITE.location && (
              <li className="flex gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-gold-light" />
                {SITE.location}
              </li>
            )}
            <li className="flex gap-3">
              <Clock className="mt-0.5 size-4 shrink-0 text-gold-light" />
              {SITE.hours}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-6 text-xs sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} {SITE.name}</p>
          <p>Prices are approximate, in USD, and confirmed on WhatsApp before booking.</p>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h3 className="font-sans text-[0.7rem] font-semibold tracking-[0.18em] text-gold-light uppercase">{title}</h3>
      <ul className="mt-5 space-y-2.5 text-sm">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="hover:text-white">{link.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
