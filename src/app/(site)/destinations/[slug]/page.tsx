import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowRight, CalendarDays, Heart } from "lucide-react"

import { Gallery } from "@/components/gallery"
import { HotelCard } from "@/components/hotel-card"
import { WhatsAppIcon } from "@/components/icons"
import { PageHero } from "@/components/page-hero"
import { SectionHeading } from "@/components/section-heading"
import { SiteCard } from "@/components/site-card"
import { DESTINATIONS, getDestination } from "@/data/destinations"
import { GUIDES } from "@/data/guides"
import { HOTELS } from "@/data/hotels"
import { SITES } from "@/data/sites"
import { whatsappLink } from "@/lib/whatsapp"

// Only the four areas exist; anything else is a 404.
export const dynamicParams = false

export function generateStaticParams() {
  return DESTINATIONS.map((d) => ({ slug: d.slug }))
}

export async function generateMetadata({ params }: PageProps<"/destinations/[slug]">): Promise<Metadata> {
  const d = getDestination((await params).slug)
  return d ? { title: d.name, description: d.tagline + " " + d.summary } : {}
}

export default async function DestinationPage({ params }: PageProps<"/destinations/[slug]">) {
  const destination = getDestination((await params).slug)
  if (!destination) notFound()

  const hotels = HOTELS.filter((h) => h.area === destination.slug)
  const guides = GUIDES.filter((g) => g.areas.includes(destination.slug))
  const sites = SITES.filter((s) => s.area === destination.slug)

  return (
    <>
      <PageHero eyebrow="Destination" title={destination.name} description={destination.tagline} image={destination.image}>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a
            href={whatsappLink(`Hello! I'd like to plan a trip to ${destination.name}.`)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-whatsapp px-6 font-semibold text-white hover:bg-whatsapp-dark"
          >
            <WhatsAppIcon className="size-5" />
            Plan a trip to {destination.name}
          </a>
        </div>
      </PageHero>

      <section className="container-page section-y grid gap-12 lg:grid-cols-[1fr_320px]">
        <div>
          <p className="text-lg leading-relaxed">{destination.summary}</p>

          <h2 className="mt-12 text-3xl">Highlights</h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {destination.highlights.map((h) => (
              <li key={h.title} className="card p-5">
                <h3 className="text-lg">{h.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{h.text}</p>
              </li>
            ))}
          </ul>

          {destination.gallery && destination.gallery.length > 0 && (
            <>
              <h2 className="mt-12 text-3xl">Photos</h2>
              <Gallery photos={destination.gallery} className="mt-6" />
            </>
          )}
        </div>

        <aside className="space-y-4 lg:pt-2">
          <div className="card p-6">
            <h2 className="flex items-center gap-2 font-sans text-sm font-semibold"><CalendarDays className="size-4 text-gold" /> Best time to visit</h2>
            <p className="mt-2 text-sm text-muted-foreground">{destination.bestTime}</p>
          </div>
          <div className="card p-6">
            <h2 className="flex items-center gap-2 font-sans text-sm font-semibold"><Heart className="size-4 text-gold" /> Ideal for</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {destination.idealFor.map((x) => (
                <li key={x} className="rounded-full bg-muted px-3 py-1 text-xs">{x}</li>
              ))}
            </ul>
          </div>
          {guides.length > 0 && (
            <div className="card p-6">
              <h2 className="font-sans text-sm font-semibold">Your guides here</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {guides.map((g) => (
                  <li key={g.id}>
                    <Link href={`/guides/#${g.id}`} className="flex items-center justify-between font-medium text-gold hover:underline">
                      {g.title} <ArrowRight className="size-4" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="card p-6">
            <h2 className="font-sans text-sm font-semibold">Getting around</h2>
            <p className="mt-2 text-sm text-muted-foreground">Private cars, minivans and buses with driver.</p>
            <Link href="/transport/" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-gold hover:underline">
              See transport prices <ArrowRight className="size-4" />
            </Link>
          </div>
        </aside>
      </section>

      {sites.length > 0 && (
        <section className="container-page pb-16 sm:pb-20 lg:pb-24">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading eyebrow="Read before you go" title={`Historic sites in ${destination.name}`} />
            <Link href={`/sites/#${destination.slug}`} className="flex items-center gap-2 text-sm font-semibold text-gold hover:underline">
              Full catalog <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sites.map((site) => <SiteCard key={site.slug} site={site} />)}
          </div>
        </section>
      )}

      {destination.spots && (
        <section className="bg-ivory">
          <div className="container-page section-y">
            <SectionHeading eyebrow="Where to stay and play" title={`${destination.spots.length} places in ${destination.name}`} />
            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              {destination.spots.map((spot) => (
                <article key={spot.name} className="card flex flex-col">
                  <div className="relative aspect-[16/10]">
                    <Image src={spot.image} alt={spot.name} fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl">{spot.name}</h3>
                    <p className="text-sm font-medium text-gold">{spot.tagline}</p>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{spot.text}</p>
                    <ul className="mt-4 space-y-1.5 text-sm">
                      {spot.highlights.map((h) => (
                        <li key={h} className="flex gap-2">
                          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-gold" />
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="container-page section-y">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading eyebrow="Where to stay" title={`Hotels in ${destination.name}`} />
          <Link href={`/hotels/#${destination.slug}`} className="flex items-center gap-2 text-sm font-semibold text-gold hover:underline">
            All hotels <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {hotels.map((h) => (
            <HotelCard key={h.id} hotel={h} />
          ))}
        </div>
      </section>
    </>
  )
}
