import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Calendar, Check, Fuel, MapPin, Settings2, Users } from "lucide-react"

import { BookingCta } from "@/components/booking/booking-cta"
import { CarCard } from "@/components/cars/car-card"
import { BreadcrumbJsonLd } from "@/components/layout/breadcrumb"
import { PageHero } from "@/components/layout/page-hero"
import { Gallery } from "@/components/ui/gallery"
import { SectionHeading } from "@/components/ui/section-heading"
import { SITE } from "@/lib/constants"
import { prisma } from "@/lib/prisma"
import { getSettings } from "@/lib/settings"
import { toNumber } from "@/lib/utils"

export const revalidate = 3600

export async function generateStaticParams() {
  const cars = await prisma.car.findMany({
    where: { published: true },
    select: { slug: true },
  })
  return cars.map((car) => ({ slug: car.slug }))
}

export async function generateMetadata({
  params,
}: PageProps<"/car-rentals/[slug]">): Promise<Metadata> {
  const { slug } = await params
  const car = await prisma.car.findFirst({
    where: { slug, published: true },
    select: { name: true, description: true, imageUrl: true },
  })

  if (!car) return { title: "Vehicle not found" }

  return {
    title: car.name,
    description: car.description.slice(0, 160),
    alternates: { canonical: `/car-rentals/${slug}` },
    openGraph: {
      title: car.name,
      description: car.description.slice(0, 200),
      images: [{ url: car.imageUrl }],
    },
  }
}

export default async function CarPage({
  params,
}: PageProps<"/car-rentals/[slug]">) {
  const { slug } = await params
  const [car, settings] = await Promise.all([
    prisma.car.findFirst({
      where: { slug, published: true },
      include: { region: true },
    }),
    getSettings(),
  ])

  if (!car) notFound()

  const alternatives = await prisma.car.findMany({
    where: { published: true, NOT: { id: car.id } },
    include: { region: true },
    take: 3,
    orderBy: { pricePerDay: "asc" },
  })

  const price = toNumber(car.pricePerDay)
  const crumbs = [{ label: "Car Rentals", href: "/car-rentals" }, { label: car.name }]

  const specs = [
    { icon: Users, label: "Seats", value: String(car.seats) },
    { icon: Settings2, label: "Transmission", value: car.transmission },
    { icon: Fuel, label: "Fuel", value: car.fuelType },
    { icon: Calendar, label: "Year", value: String(car.year) },
    { icon: MapPin, label: "Based in", value: car.region.name },
  ]

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: car.name,
    description: car.description,
    image: [car.imageUrl, ...car.galleryUrls],
    brand: { "@type": "Brand", name: car.brand },
    offers: {
      "@type": "Offer",
      price: price.toFixed(2),
      priceCurrency: car.currency,
      availability: car.available
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `${SITE.url}/car-rentals/${car.slug}`,
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BreadcrumbJsonLd items={crumbs} baseUrl={SITE.url} />

      <PageHero
        eyebrow={`${car.type} · ${car.region.name}`}
        title={car.name}
        description={car.description}
        crumbs={crumbs}
      />

      <div className="container-page section-y">
        <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
          <div className="min-w-0 space-y-12">
            <Gallery images={[car.imageUrl, ...car.galleryUrls]} alt={car.name} />

            <section>
              <h2 className="font-heading text-2xl">Specifications</h2>
              <dl className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {specs.map((spec) => (
                  <div
                    key={spec.label}
                    className="rounded-xl border border-border bg-ivory p-4"
                  >
                    <dt className="flex items-center gap-2 text-xs tracking-[0.1em] text-muted-foreground uppercase">
                      <spec.icon className="size-3.5 text-gold" />
                      {spec.label}
                    </dt>
                    <dd className="mt-1.5 font-medium">{spec.value}</dd>
                  </div>
                ))}
                <div className="rounded-xl border border-border bg-ivory p-4">
                  <dt className="text-xs tracking-[0.1em] text-muted-foreground uppercase">
                    Vehicle
                  </dt>
                  <dd className="mt-1.5 font-medium">
                    {car.brand} {car.model}
                  </dd>
                </div>
              </dl>
            </section>

            {car.features.length > 0 && (
              <section>
                <h2 className="font-heading text-2xl">What&apos;s included</h2>
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {car.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-3 rounded-xl border border-border bg-ivory px-4 py-3 text-sm"
                    >
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-teal/10 text-teal">
                        <Check className="size-3" />
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="rounded-2xl border border-border bg-ivory p-7">
              <h2 className="font-heading text-xl">Good to know</h2>
              <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-muted-foreground">
                <li>
                  All rentals are chauffeur-driven — the driver&apos;s fee, fuel
                  for the agreed itinerary and parking are included in the daily
                  rate.
                </li>
                <li>
                  Long-distance days (Cairo → Luxor, for example) may add a fuel
                  surcharge, quoted before you book.
                </li>
                <li>
                  Driver accommodation on overnight trips is arranged and paid by
                  us.
                </li>
              </ul>
            </section>
          </div>

          <BookingCta
            price={price}
            currency={car.currency}
            unit="per day"
            bookHref={`/book/car/${car.id}`}
            itemName={car.name}
            whatsapp={settings.whatsappNumber}
            disabled={!car.available}
            disabledLabel="Currently booked out"
            facts={[
              { label: "Type", value: car.type },
              { label: "Seats", value: String(car.seats) },
              { label: "Transmission", value: car.transmission },
              { label: "Driver", value: "Included" },
            ]}
          />
        </div>
      </div>

      {alternatives.length > 0 && (
        <section className="bg-ivory">
          <div className="container-page section-y">
            <SectionHeading
              eyebrow="Other options"
              title="More of the fleet"
              className="mb-12"
            />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {alternatives.map((item) => (
                <CarCard
                  key={item.id}
                  car={{
                    slug: item.slug,
                    name: item.name,
                    description: item.description,
                    imageUrl: item.imageUrl,
                    type: item.type,
                    seats: item.seats,
                    transmission: item.transmission,
                    fuelType: item.fuelType,
                    pricePerDay: item.pricePerDay.toString(),
                    currency: item.currency,
                    available: item.available,
                    region: { name: item.region.name, slug: item.region.slug },
                  }}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
