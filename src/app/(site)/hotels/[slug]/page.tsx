import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { MapPin, Star, Users } from "lucide-react"

import { BookingCta } from "@/components/booking/booking-cta"
import { AmenityGrid } from "@/components/hotels/amenity-icons"
import { HotelCard } from "@/components/hotels/hotel-card"
import { BreadcrumbJsonLd } from "@/components/layout/breadcrumb"
import { PageHero } from "@/components/layout/page-hero"
import { RegionMap } from "@/components/maps/region-map-lazy"
import { Gallery } from "@/components/ui/gallery"
import { SectionHeading } from "@/components/ui/section-heading"
import { SITE } from "@/lib/constants"
import { applyMarkup } from "@/lib/markup"
import { getHotelMarkupPercent } from "@/lib/pricing-settings"
import { prisma } from "@/lib/prisma"
import { getSettings } from "@/lib/settings"
import { formatPrice, toNumber } from "@/lib/utils"
import type { RoomType } from "@/types"

export const revalidate = 3600

export async function generateStaticParams() {
  const hotels = await prisma.hotel.findMany({
    where: { published: true },
    select: { slug: true },
  })
  return hotels.map((hotel) => ({ slug: hotel.slug }))
}

export async function generateMetadata({
  params,
}: PageProps<"/hotels/[slug]">): Promise<Metadata> {
  const { slug } = await params
  const hotel = await prisma.hotel.findFirst({
    where: { slug, published: true },
    select: { name: true, description: true, imageUrl: true },
  })

  if (!hotel) return { title: "Hotel not found" }

  return {
    title: hotel.name,
    description: hotel.description.slice(0, 160),
    alternates: { canonical: `/hotels/${slug}` },
    openGraph: {
      title: hotel.name,
      description: hotel.description.slice(0, 200),
      images: [{ url: hotel.imageUrl }],
    },
  }
}

export default async function HotelPage({ params }: PageProps<"/hotels/[slug]">) {
  const { slug } = await params
  const [hotel, settings] = await Promise.all([
    prisma.hotel.findFirst({
      where: { slug, published: true },
      include: { region: true },
    }),
    getSettings(),
  ])

  if (!hotel) notFound()

  const nearby = await prisma.hotel.findMany({
    where: { published: true, regionId: hotel.regionId, NOT: { id: hotel.id } },
    include: { region: true },
    take: 3,
  })

  // Official rates plus the markup from Admin → Settings.
  const markup = await getHotelMarkupPercent()
  const rooms = ((hotel.roomTypes as unknown as RoomType[] | null) ?? []).map((room) => ({
    ...room,
    price: applyMarkup(toNumber(room.price), markup),
  }))
  const price = applyMarkup(toNumber(hotel.pricePerNight), markup)

  const crumbs = [{ label: "Hotels", href: "/hotels" }, { label: hotel.name }]

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Hotel",
    name: hotel.name,
    description: hotel.description,
    image: [hotel.imageUrl, ...hotel.galleryUrls],
    starRating: { "@type": "Rating", ratingValue: String(hotel.starRating) },
    priceRange: `${formatPrice(price, hotel.currency, { compact: true })} per night`,
    address: {
      "@type": "PostalAddress",
      streetAddress: hotel.address ?? hotel.region.name,
      addressRegion: hotel.region.name,
      addressCountry: "EG",
    },
    ...(hotel.lat && hotel.lng
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: hotel.lat,
            longitude: hotel.lng,
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
        eyebrow={hotel.region.name}
        title={hotel.name}
        image={hotel.imageUrl}
        crumbs={crumbs}
        size="tall"
      >
        <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm text-white/85">
          <span className="flex items-center gap-1">
            {Array.from({ length: hotel.starRating }).map((_, i) => (
              <Star key={i} className="size-4 fill-sun text-sun" />
            ))}
          </span>
          <span className="flex items-center gap-2">
            <Users className="size-4 text-sun" />
            Sleeps up to {hotel.maxGuests}
          </span>
          {hotel.address && (
            <span className="flex items-center gap-2">
              <MapPin className="size-4 text-sun" />
              {hotel.address}
            </span>
          )}
        </div>
      </PageHero>

      <div className="container-page section-y">
        <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
          <div className="min-w-0 space-y-14">
            <Gallery
              images={[hotel.imageUrl, ...hotel.galleryUrls]}
              alt={hotel.name}
            />

            <section>
              <p className="eyebrow">The property</p>
              <h2 className="mt-3 font-heading text-3xl">About this hotel</h2>
              <div className="mt-5 horizon-rule" />
              <div className="mt-6 space-y-4 text-lg leading-relaxed text-muted-foreground">
                {hotel.description.split("\n\n").map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </section>

            {hotel.amenities.length > 0 && (
              <section>
                <h2 className="font-heading text-2xl">Amenities</h2>
                <div className="mt-6">
                  <AmenityGrid amenities={hotel.amenities} />
                </div>
              </section>
            )}

            {rooms.length > 0 && (
              <section>
                <h2 className="font-heading text-2xl">Room types</h2>
                <ul className="mt-6 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-papyrus">
                  {rooms.map((room) => (
                    <li
                      key={room.name}
                      className="flex flex-wrap items-center justify-between gap-4 p-5"
                    >
                      <div>
                        <p className="font-heading text-lg">{room.name}</p>
                        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Users className="size-3.5" />
                          Sleeps {room.capacity}
                        </p>
                      </div>
                      <p className="text-right">
                        <span className="font-heading text-xl text-lapis">
                          {formatPrice(room.price, hotel.currency, { compact: true })}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          per night
                        </span>
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {hotel.lat && hotel.lng && (
              <section>
                <h2 className="font-heading text-2xl">Location</h2>
                <div className="mt-6">
                  <RegionMap
                    title={hotel.name}
                    center={{ lat: hotel.lat, lng: hotel.lng }}
                    zoom={13}
                    markers={[
                      {
                        id: hotel.id,
                        lat: hotel.lat,
                        lng: hotel.lng,
                        title: hotel.name,
                        kind: "hotel",
                      },
                    ]}
                  />
                </div>
              </section>
            )}
          </div>

          <BookingCta
            price={price}
            currency={hotel.currency}
            unit="per night"
            bookHref={`/book/hotel/${hotel.id}`}
            itemName={hotel.name}
            whatsapp={settings.whatsappNumber}
            facts={[
              { label: "Rating", value: `${hotel.starRating} stars` },
              { label: "Max guests", value: String(hotel.maxGuests) },
              { label: "Region", value: hotel.region.name },
              ...(rooms.length > 0
                ? [{ label: "Room types", value: String(rooms.length) }]
                : []),
            ]}
          />
        </div>
      </div>

      {nearby.length > 0 && (
        <section className="bg-papyrus">
          <div className="container-page section-y">
            <SectionHeading
              eyebrow="Nearby"
              title={`Other stays in ${hotel.region.name}`}
              className="mb-12"
            />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {nearby.map((item) => (
                <HotelCard
                  key={item.id}
                  hotel={{
                    slug: item.slug,
                    name: item.name,
                    description: item.description,
                    imageUrl: item.imageUrl,
                    starRating: item.starRating,
                    pricePerNight: applyMarkup(toNumber(item.pricePerNight), markup),
                    currency: item.currency,
                    maxGuests: item.maxGuests,
                    amenities: item.amenities,
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
