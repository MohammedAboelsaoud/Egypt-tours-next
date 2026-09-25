import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight, BedDouble, Car, MapPin } from "lucide-react"

import { PageHero } from "@/components/layout/page-hero"
import { CtaBanner } from "@/components/home/cta-banner"
import { getPublishedRegions } from "@/lib/queries"
import { getSettings } from "@/lib/settings"

export const revalidate = 3600

export const metadata: Metadata = {
  title: "Destinations",
  description:
    "The four regions of Egypt we plan trips around — Cairo & Giza, Luxor & Aswan, the North Coast, and Sinai & the Red Sea.",
  alternates: { canonical: "/destinations" },
}

export default async function DestinationsPage() {
  const [regions, settings] = await Promise.all([
    getPublishedRegions(),
    getSettings(),
  ])

  return (
    <>
      <PageHero
        eyebrow="Destinations"
        title="Four regions, one extraordinary country"
        description="Egypt is not one trip. The pharaonic south, the Mediterranean north, the Red Sea coast and the capital each have their own season and their own character — and most journeys combine at least two."
        crumbs={[{ label: "Destinations" }]}
      />

      <div className="container-page section-y space-y-8">
        {regions.map((region, index) => (
          <article
            key={region.id}
            className="group grid overflow-hidden rounded-3xl border border-border bg-papyrus lg:grid-cols-2"
          >
            <div
              className={`relative aspect-[16/11] lg:aspect-auto lg:min-h-[420px] ${
                index % 2 === 1 ? "lg:order-2" : ""
              }`}
            >
              <Image
                src={region.imageUrl}
                alt={region.name}
                fill
                priority={index === 0}
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>

            <div className="flex flex-col justify-center p-8 sm:p-12">
              <p className="eyebrow">Region {String(index + 1).padStart(2, "0")}</p>
              <h2 className="mt-4 font-heading text-3xl sm:text-4xl">
                {region.name}
              </h2>
              <p className="mt-2 text-lapis">{region.tagline}</p>

              <p className="mt-5 leading-relaxed text-muted-foreground">
                {region.summary}
              </p>

              <ul className="mt-6 flex flex-wrap gap-2">
                {region.cities.map((city) => (
                  <li
                    key={city}
                    className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs text-muted-foreground"
                  >
                    <MapPin className="size-3 text-lapis" />
                    {city}
                  </li>
                ))}
              </ul>

              <dl className="mt-7 flex flex-wrap gap-6 border-t border-border pt-6 text-sm">
                <div className="flex items-center gap-2">
                  <dt className="sr-only">Tours</dt>
                  <dd className="flex items-center gap-2 text-muted-foreground">
                    <ArrowUpRight className="size-4 text-lapis" />
                    {region._count.tours} tours
                  </dd>
                </div>
                <div className="flex items-center gap-2">
                  <dt className="sr-only">Hotels</dt>
                  <dd className="flex items-center gap-2 text-muted-foreground">
                    <BedDouble className="size-4 text-lapis" />
                    {region._count.hotels} hotels
                  </dd>
                </div>
                <div className="flex items-center gap-2">
                  <dt className="sr-only">Vehicles</dt>
                  <dd className="flex items-center gap-2 text-muted-foreground">
                    <Car className="size-4 text-lapis" />
                    {region._count.cars} vehicles
                  </dd>
                </div>
              </dl>

              <Link
                href={`/destinations/${region.slug}`}
                className="mt-8 inline-flex w-fit items-center gap-2 rounded-lg bg-lapis px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-lapis-deep"
              >
                Explore {region.name}
                <ArrowUpRight className="size-4" />
              </Link>
            </div>
          </article>
        ))}
      </div>

      <CtaBanner whatsapp={settings.whatsappNumber} />
    </>
  )
}
