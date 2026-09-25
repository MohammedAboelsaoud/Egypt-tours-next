import type { Metadata } from "next"
import Link from "next/link"
import type { Prisma } from "@prisma/client"

import { FilterBar } from "@/components/filters/filter-bar"
import { PageHero } from "@/components/layout/page-hero"
import { TourCard } from "@/components/tours/tour-card"
import { EmptyState } from "@/components/ui/empty-state"
import { prisma } from "@/lib/prisma"
import { getTourRatings } from "@/lib/queries"

export const metadata: Metadata = {
  title: "Tours",
  description:
    "Private, tailor-made tours across Egypt — from three days in Cairo to a week of Red Sea diving. Filter by region, price and length.",
  alternates: { canonical: "/tours" },
}

const PRICE_BANDS = [
  { value: "0-200", label: "Under $200" },
  { value: "200-350", label: "$200 – $350" },
  { value: "350-550", label: "$350 – $550" },
  { value: "550-99999", label: "$550+" },
]

const DURATIONS = [
  { value: "1-2", label: "1 – 2 days" },
  { value: "3-4", label: "3 – 4 days" },
  { value: "5-99", label: "5+ days" },
]

const SORTS = [
  { value: "featured", label: "Featured first" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "duration-asc", label: "Shortest first" },
  { value: "duration-desc", label: "Longest first" },
]

function parseBand(value?: string) {
  if (!value) return null
  const [min, max] = value.split("-").map(Number)
  if (Number.isNaN(min) || Number.isNaN(max)) return null
  return { min, max }
}

function orderBy(sort?: string): Prisma.TourOrderByWithRelationInput[] {
  switch (sort) {
    case "price-asc":
      return [{ priceFrom: "asc" }]
    case "price-desc":
      return [{ priceFrom: "desc" }]
    case "duration-asc":
      return [{ durationDays: "asc" }]
    case "duration-desc":
      return [{ durationDays: "desc" }]
    default:
      return [{ featured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }]
  }
}

export default async function ToursPage({ searchParams }: PageProps<"/tours">) {
  const params = await searchParams
  const regionSlug = typeof params.region === "string" ? params.region : undefined
  const price = parseBand(typeof params.price === "string" ? params.price : undefined)
  const duration = parseBand(
    typeof params.duration === "string" ? params.duration : undefined
  )
  const query = typeof params.q === "string" ? params.q.trim() : ""
  const sort = typeof params.sort === "string" ? params.sort : "featured"

  const where: Prisma.TourWhereInput = {
    published: true,
    ...(regionSlug ? { region: { slug: regionSlug } } : {}),
    ...(price ? { priceFrom: { gte: price.min, lte: price.max } } : {}),
    ...(duration
      ? { durationDays: { gte: duration.min, lte: duration.max } }
      : {}),
    ...(query
      ? {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { summary: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
  }

  const [tours, regions] = await Promise.all([
    prisma.tour.findMany({
      where,
      orderBy: orderBy(sort),
      include: { region: true },
    }),
    prisma.region.findMany({
      where: { published: true },
      orderBy: { sortOrder: "asc" },
      select: { slug: true, name: true },
    }),
  ])

  const ratings = await getTourRatings(tours.map((tour) => tour.id))

  return (
    <>
      <PageHero
        eyebrow="Tours & itineraries"
        title="Journeys built around what you came to see"
        description="Every itinerary below is private and adjustable — change the length, swap a site, add a region. The price shown is the per-person starting point."
        crumbs={[{ label: "Tours" }]}
      />

      <div className="container-page section-y">
        <FilterBar
          basePath="/tours"
          resultCount={tours.length}
          searchPlaceholder="Search tours, sites or cities…"
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
            { name: "price", label: "Price", options: PRICE_BANDS },
            { name: "duration", label: "Length", options: DURATIONS },
          ]}
        />

        <div className="mt-10">
          {tours.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {tours.map((tour, index) => (
                <TourCard
                  key={tour.id}
                  priority={index < 3}
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
              title="No tours match those filters"
              description="Try widening the price range or clearing a filter — or tell us what you had in mind and we'll build it."
              action={
                <Link
                  href="/contact"
                  className="rounded-lg bg-lapis px-6 py-3 text-sm font-medium text-white hover:bg-lapis-deep"
                >
                  Request a custom itinerary
                </Link>
              }
            />
          )}
        </div>
      </div>
    </>
  )
}
