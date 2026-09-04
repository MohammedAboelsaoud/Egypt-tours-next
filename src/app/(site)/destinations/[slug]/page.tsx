import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { MapPin } from "lucide-react"

import { CtaBanner } from "@/components/home/cta-banner"
import { BreadcrumbJsonLd } from "@/components/layout/breadcrumb"
import { PageHero } from "@/components/layout/page-hero"
import { CarCard } from "@/components/cars/car-card"
import { HotelCard } from "@/components/hotels/hotel-card"
import { RegionMap } from "@/components/maps/region-map"
import { TourCard } from "@/components/tours/tour-card"
import { EmptyState } from "@/components/ui/empty-state"
import { SectionHeading } from "@/components/ui/section-heading"
import { SITE } from "@/lib/constants"
import { prisma } from "@/lib/prisma"
import { getTourRatings } from "@/lib/queries"
import { getSettings } from "@/lib/settings"

export const revalidate = 3600

export async function generateStaticParams() {
  const regions = await prisma.region.findMany({
    where: { published: true },
    select: { slug: true },
  })
  return regions.map((region) => ({ slug: region.slug }))
}

async function getRegion(slug: string) {
  return prisma.region.findFirst({
    where: { slug, published: true },
    include: {
      tours: {
        where: { published: true },
        orderBy: { sortOrder: "asc" },
        include: { region: true },
      },
      hotels: {
        where: { published: true },
        orderBy: { pricePerNight: "asc" },
        include: { region: true },
      },
      cars: {
        where: { published: true },
        orderBy: { pricePerDay: "asc" },
        include: { region: true },
      },
    },
  })
}

export async function generateMetadata({
  params,
}: PageProps<"/destinations/[slug]">): Promise<Metadata> {
  const { slug } = await params
  const region = await prisma.region.findFirst({
    where: { slug, published: true },
    select: { name: true, summary: true, tagline: true, imageUrl: true },
  })

  if (!region) return { title: "Destination not found" }

  return {
    title: region.name,
    description: region.summary.slice(0, 160),
    alternates: { canonical: `/destinations/${slug}` },
    openGraph: {
      title: `${region.name} — ${region.tagline}`,
      description: region.summary.slice(0, 200),
      images: [{ url: region.imageUrl }],
    },
  }
}

export default async function RegionPage({
  params,
}: PageProps<"/destinations/[slug]">) {
  const { slug } = await params
  const [region, settings] = await Promise.all([getRegion(slug), getSettings()])

  if (!region) notFound()

  const ratings = await getTourRatings(region.tours.map((tour) => tour.id))

  const markers = [
    ...region.tours
      .filter((tour) => tour.lat && tour.lng)
      .map((tour) => ({
        id: tour.id,
        lat: tour.lat!,
        lng: tour.lng!,
        title: tour.title,
        href: `/tours/${tour.slug}`,
        kind: "tour" as const,
      })),
    ...region.hotels
      .filter((hotel) => hotel.lat && hotel.lng)
      .map((hotel) => ({
        id: hotel.id,
        lat: hotel.lat!,
        lng: hotel.lng!,
        title: hotel.name,
        href: `/hotels/${hotel.slug}`,
        kind: "hotel" as const,
      })),
  ]

  const crumbs = [
    { label: "Destinations", href: "/destinations" },
    { label: region.name },
  ]

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    name: region.name,
    description: region.summary,
    url: `${SITE.url}/destinations/${region.slug}`,
    image: region.imageUrl,
    touristType: "Cultural and leisure travellers",
    includesAttraction: region.tours.slice(0, 6).map((tour) => ({
      "@type": "TouristAttraction",
      name: tour.title,
      url: `${SITE.url}/tours/${tour.slug}`,
    })),
    ...(region.lat && region.lng
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: region.lat,
            longitude: region.lng,
          },
        }
      : {}),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BreadcrumbJsonLd items={crumbs} baseUrl={SITE.url} />

      <PageHero
        eyebrow={region.tagline}
        title={region.name}
        image={region.imageUrl}
        crumbs={crumbs}
        size="tall"
      >
        <ul className="mt-8 flex flex-wrap gap-2">
          {region.cities.map((city) => (
            <li
              key={city}
              className="flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-sm text-white backdrop-blur-sm"
            >
              <MapPin className="size-3.5 text-gold-light" />
              {city}
            </li>
          ))}
        </ul>
      </PageHero>

      {/* Overview + map */}
      <section className="container-page section-y">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
          <div>
            <p className="eyebrow">The region</p>
            <h2 className="mt-3 font-heading text-3xl leading-tight sm:text-4xl">
              What {region.name} is like
            </h2>
            <div className="mt-5 gold-rule" />
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              {region.summary}
            </p>

            <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-border pt-8">
              <div>
                <dt className="text-xs tracking-[0.14em] text-muted-foreground uppercase">
                  Tours
                </dt>
                <dd className="mt-1.5 font-heading text-3xl text-gold">
                  {region.tours.length}
                </dd>
              </div>
              <div>
                <dt className="text-xs tracking-[0.14em] text-muted-foreground uppercase">
                  Hotels
                </dt>
                <dd className="mt-1.5 font-heading text-3xl text-gold">
                  {region.hotels.length}
                </dd>
              </div>
              <div>
                <dt className="text-xs tracking-[0.14em] text-muted-foreground uppercase">
                  Vehicles
                </dt>
                <dd className="mt-1.5 font-heading text-3xl text-gold">
                  {region.cars.length}
                </dd>
              </div>
            </dl>
          </div>

          <RegionMap
            title={region.name}
            center={
              region.lat && region.lng
                ? { lat: region.lat, lng: region.lng }
                : null
            }
            zoom={region.zoom}
            markers={markers}
          />
        </div>
      </section>

      {/* Tours */}
      <section className="bg-ivory">
        <div className="container-page section-y">
          <SectionHeading
            eyebrow="Itineraries"
            title={`Tours in ${region.name}`}
            description="Each one is a starting point — tell us your dates and we'll shape it around them."
            className="mb-12"
          />

          {region.tours.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {region.tours.map((tour) => (
                <TourCard
                  key={tour.id}
                  tour={{
                    slug: tour.slug,
                    title: tour.title,
                    summary: tour.summary,
                    imageUrl: tour.imageUrl,
                    durationDays: tour.durationDays,
                    priceFrom: tour.priceFrom.toString(),
                    currency: tour.currency,
                    maxGroupSize: tour.maxGroupSize,
                    featured: tour.featured,
                    region: { name: tour.region.name, slug: tour.region.slug },
                    rating: ratings.get(tour.id) ?? null,
                  }}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No tours listed here yet"
              description="Tell us what you'd like to see in this region and we'll build the itinerary from scratch."
              action={
                <Link
                  href="/contact"
                  className="rounded-lg bg-gold px-6 py-3 text-sm font-medium text-white hover:bg-gold-light"
                >
                  Request an itinerary
                </Link>
              }
            />
          )}
        </div>
      </section>

      {/* Hotels */}
      {region.hotels.length > 0 && (
        <section className="container-page section-y">
          <SectionHeading
            eyebrow="Where to stay"
            title={`Hotels in ${region.name}`}
            className="mb-12"
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {region.hotels.map((hotel) => (
              <HotelCard
                key={hotel.id}
                hotel={{
                  slug: hotel.slug,
                  name: hotel.name,
                  description: hotel.description,
                  imageUrl: hotel.imageUrl,
                  starRating: hotel.starRating,
                  pricePerNight: hotel.pricePerNight.toString(),
                  currency: hotel.currency,
                  maxGuests: hotel.maxGuests,
                  amenities: hotel.amenities,
                  region: { name: hotel.region.name, slug: hotel.region.slug },
                }}
              />
            ))}
          </div>
        </section>
      )}

      {/* Cars */}
      {region.cars.length > 0 && (
        <section className="bg-ivory">
          <div className="container-page section-y">
            <SectionHeading
              eyebrow="Getting around"
              title={`Vehicles in ${region.name}`}
              className="mb-12"
            />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {region.cars.map((car) => (
                <CarCard
                  key={car.id}
                  car={{
                    slug: car.slug,
                    name: car.name,
                    description: car.description,
                    imageUrl: car.imageUrl,
                    type: car.type,
                    seats: car.seats,
                    transmission: car.transmission,
                    fuelType: car.fuelType,
                    pricePerDay: car.pricePerDay.toString(),
                    currency: car.currency,
                    available: car.available,
                    region: { name: car.region.name, slug: car.region.slug },
                  }}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaBanner whatsapp={settings.whatsappNumber} />
    </>
  )
}
