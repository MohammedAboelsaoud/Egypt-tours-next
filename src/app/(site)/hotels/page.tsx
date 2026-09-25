import type { Metadata } from "next"
import Link from "next/link"
import type { Prisma } from "@prisma/client"

import { FilterBar } from "@/components/filters/filter-bar"
import { HotelCard } from "@/components/hotels/hotel-card"
import { PageHero } from "@/components/layout/page-hero"
import { EmptyState } from "@/components/ui/empty-state"
import { applyMarkup, removeMarkup } from "@/lib/markup"
import { getHotelMarkupPercent } from "@/lib/pricing-settings"
import { prisma } from "@/lib/prisma"
import { toNumber } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Hotels",
  description:
    "Hand-picked hotels, resorts and guesthouses across Egypt — from Nile-view boutiques in Cairo to dive resorts on the Red Sea.",
  alternates: { canonical: "/hotels" },
}

const PRICE_BANDS = [
  { value: "0-120", label: "Under $120" },
  { value: "120-200", label: "$120 – $200" },
  { value: "200-99999", label: "$200+" },
]

const STARS = [
  { value: "5", label: "5 stars" },
  { value: "4", label: "4 stars & up" },
  { value: "3", label: "3 stars & up" },
]

const SORTS = [
  { value: "recommended", label: "Recommended" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "stars-desc", label: "Star rating" },
]

function orderBy(sort?: string): Prisma.HotelOrderByWithRelationInput[] {
  switch (sort) {
    case "price-asc":
      return [{ pricePerNight: "asc" }]
    case "price-desc":
      return [{ pricePerNight: "desc" }]
    case "stars-desc":
      return [{ starRating: "desc" }, { pricePerNight: "asc" }]
    default:
      return [{ starRating: "desc" }, { createdAt: "desc" }]
  }
}

export default async function HotelsPage({ searchParams }: PageProps<"/hotels">) {
  const params = await searchParams
  const regionSlug = typeof params.region === "string" ? params.region : undefined
  const stars = typeof params.stars === "string" ? Number(params.stars) : undefined
  const query = typeof params.q === "string" ? params.q.trim() : ""
  const sort = typeof params.sort === "string" ? params.sort : "recommended"
  const markup = await getHotelMarkupPercent()

  let priceFilter: Prisma.HotelWhereInput = {}
  if (typeof params.price === "string") {
    const [min, max] = params.price.split("-").map(Number)
    if (!Number.isNaN(min) && !Number.isNaN(max)) {
      // The bands are travellers' prices; the database holds official rates.
      priceFilter = {
        pricePerNight: { gte: removeMarkup(min, markup), lte: removeMarkup(max, markup) },
      }
    }
  }

  const where: Prisma.HotelWhereInput = {
    published: true,
    ...(regionSlug ? { region: { slug: regionSlug } } : {}),
    ...(stars ? { starRating: { gte: stars } } : {}),
    ...priceFilter,
    ...(query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { address: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
  }

  const [hotels, regions] = await Promise.all([
    prisma.hotel.findMany({ where, orderBy: orderBy(sort), include: { region: true } }),
    prisma.region.findMany({
      where: { published: true },
      orderBy: { sortOrder: "asc" },
      select: { slug: true, name: true },
    }),
  ])

  return (
    <>
      <PageHero
        eyebrow="Where to stay"
        title="Hotels we would happily stay in ourselves"
        description="Every property here has been visited by someone on our team. No inventory dumps, no surprises on arrival — just places worth the night."
        crumbs={[{ label: "Hotels" }]}
      />

      <div className="container-page section-y">
        <FilterBar
          basePath="/hotels"
          resultCount={hotels.length}
          searchPlaceholder="Search hotels or areas…"
          sortOptions={SORTS}
          fields={[
            {
              name: "region",
              label: "Region",
              options: regions.map((region) => ({
                value: region.slug,
                label: region.name,
              })),
            },
            { name: "stars", label: "Rating", options: STARS },
            { name: "price", label: "Per night", options: PRICE_BANDS },
          ]}
        />

        <div className="mt-10">
          {hotels.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {hotels.map((hotel, index) => (
                <HotelCard
                  key={hotel.id}
                  priority={index < 3}
                  hotel={{
                    slug: hotel.slug,
                    name: hotel.name,
                    description: hotel.description,
                    imageUrl: hotel.imageUrl,
                    starRating: hotel.starRating,
                    pricePerNight: applyMarkup(toNumber(hotel.pricePerNight), markup),
                    currency: hotel.currency,
                    maxGuests: hotel.maxGuests,
                    amenities: hotel.amenities,
                    region: { name: hotel.region.name, slug: hotel.region.slug },
                  }}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No hotels match those filters"
              description="Try a different region or price band — or ask us and we'll suggest something that fits."
              action={
                <Link
                  href="/contact"
                  className="rounded-lg bg-lapis px-6 py-3 text-sm font-medium text-white hover:bg-lapis-deep"
                >
                  Ask for a recommendation
                </Link>
              }
            />
          )}
        </div>
      </div>
    </>
  )
}
