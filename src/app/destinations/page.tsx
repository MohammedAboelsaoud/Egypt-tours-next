import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, CalendarDays } from "lucide-react"

import { PageHero } from "@/components/page-hero"
import { DESTINATIONS } from "@/data/destinations"

export const metadata: Metadata = {
  title: "Destinations",
  description: "Cairo & Giza, Luxor & Aswan, the North Coast & El-Alamein, and Sinai — where to go in Egypt and what to see.",
}

export default function DestinationsPage() {
  return (
    <>
      <PageHero
        eyebrow="Destinations"
        title="Where would you like to go?"
        description="We arrange guides, hotels and transport in four regions. Most visitors combine two — our assistant or our team can help you choose."
        image="/img/luxor-aswan.jpg"
      />

      <section className="container-page section-y space-y-8">
        {DESTINATIONS.map((d, i) => (
          <article key={d.slug} className="card grid overflow-hidden lg:grid-cols-2">
            <div className={`relative aspect-[16/10] lg:aspect-auto lg:min-h-[380px] ${i % 2 ? "lg:order-2" : ""}`}>
              <Image src={d.image} alt={d.name} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
            </div>
            <div className="flex flex-col p-6 sm:p-10">
              <h2 className="text-3xl sm:text-4xl">{d.name}</h2>
              <p className="mt-2 text-lg text-gold">{d.tagline}</p>
              <p className="mt-4 leading-relaxed text-muted-foreground">{d.summary}</p>
              <ul className="mt-5 grid gap-2 text-sm sm:grid-cols-2">
                {(d.spots ? d.spots.map((s) => s.name + " — " + s.tagline) : d.highlights.slice(0, 4).map((h) => h.title)).map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-gold" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarDays className="size-4 text-gold" />
                {d.bestTime}
              </p>
              <Link
                href={`/destinations/${d.slug}/`}
                className="mt-7 inline-flex h-11 w-fit items-center gap-2 rounded-lg bg-ink px-5 text-sm font-semibold text-white hover:bg-ink/85"
              >
                Explore {d.name}
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </article>
        ))}
      </section>
    </>
  )
}
