import type { Metadata } from "next"
import Link from "next/link"
import { Languages, MapPin, Mountain, ScrollText, Sailboat } from "lucide-react"

import { PageHero } from "@/components/page-hero"
import { WhatsAppRequest } from "@/components/whatsapp-request"
import { GUIDES } from "@/data/guides"
import { REQUEST_FORMS } from "@/lib/request-forms"

export const metadata: Metadata = {
  title: "Tour Guides",
  description: "Egyptologists in Cairo and Luxor, Nubian guides in Aswan and Bedouin guides in Sinai.",
}

const ICONS: Record<string, typeof ScrollText> = { egyptologist: ScrollText, nubian: Sailboat, bedouin: Mountain }

export default function GuidesPage() {
  return (
    <>
      <PageHero
        eyebrow="Tour guides"
        title="Local guides who make the place come alive"
        description="Every region has its own experts. Tell us your dates and what you'd like to see, and we'll match you with the right guide."
        image="/img/saint-catherine.jpg"
      />

      <section className="container-page section-y grid gap-8 lg:grid-cols-3">
        {GUIDES.map((g) => {
          const Icon = ICONS[g.id] ?? ScrollText
          return (
            <article key={g.id} id={g.id} className="card flex scroll-mt-24 flex-col p-7">
              <span className="flex size-16 items-center justify-center rounded-full bg-ink text-gold-light">
                <Icon className="size-8" />
              </span>
              <h2 className="mt-5 text-3xl">{g.title}</h2>
              <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-gold">
                <MapPin className="size-4" />
                {g.coverage}
              </p>
              <p className="mt-4 leading-relaxed text-muted-foreground">{g.description}</p>

              <h3 className="mt-6 font-sans text-xs font-semibold tracking-[0.15em] text-muted-foreground uppercase">Specialties</h3>
              <ul className="mt-3 space-y-2 text-sm">
                {g.specialties.map((s) => (
                  <li key={s} className="flex gap-2">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-gold" />
                    {s}
                  </li>
                ))}
              </ul>
              <p className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
                <Languages className="size-4 text-gold" />
                {g.languages.join(" · ")}
              </p>

              <div className="mt-auto pt-7">
                <p className="text-xs text-muted-foreground">Price depends on the day&apos;s programme — ask for a quote.</p>
                <WhatsAppRequest subject={`${g.title} guide — ${g.coverage}`} title={`Book a ${g.title.toLowerCase()}`} fields={REQUEST_FORMS.guide} className="mt-3 w-full" />
              </div>
            </article>
          )
        })}
      </section>

      <section className="container-page pb-20 text-center">
        <p className="text-muted-foreground">
          Planning a whole trip? We can combine guides, <Link href="/hotels/" className="font-medium text-gold hover:underline">hotels</Link> and{" "}
          <Link href="/transport/" className="font-medium text-gold hover:underline">transport</Link> in one request.
        </p>
      </section>
    </>
  )
}
