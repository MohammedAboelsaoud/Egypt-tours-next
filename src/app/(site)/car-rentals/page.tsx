import type { Metadata } from "next"
import Link from "next/link"
import type { Prisma } from "@prisma/client"

import { CarCard } from "@/components/cars/car-card"
import { FilterBar } from "@/components/filters/filter-bar"
import { PageHero } from "@/components/layout/page-hero"
import { EmptyState } from "@/components/ui/empty-state"
import { prisma } from "@/lib/prisma"

export const metadata: Metadata = {
  title: "Car Rentals",
  description:
    "Private cars, SUVs, minibuses and coaches across Egypt — every vehicle comes with a licensed English-speaking driver.",
  alternates: { canonical: "/car-rentals" },
}

const SEATS = [
  { value: "1-4", label: "Up to 4" },
  { value: "5-7", label: "5 – 7" },
  { value: "8-99", label: "8+" },
]

const SORTS = [
  { value: "recommended", label: "Recommended" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "seats-desc", label: "Most seats" },
]

function orderBy(sort?: string): Prisma.CarOrderByWithRelationInput[] {
  switch (sort) {
    case "price-asc":
      return [{ pricePerDay: "asc" }]
    case "price-desc":
      return [{ pricePerDay: "desc" }]
    case "seats-desc":
      return [{ seats: "desc" }]
    default:
      return [{ available: "desc" }, { pricePerDay: "asc" }]
  }
}

export default async function CarRentalsPage({
  searchParams,
}: PageProps<"/car-rentals">) {
  const params = await searchParams
  const regionSlug = typeof params.region === "string" ? params.region : undefined
  const type = typeof params.type === "string" ? params.type : undefined
  const query = typeof params.q === "string" ? params.q.trim() : ""
  const sort = typeof params.sort === "string" ? params.sort : "recommended"

  let seatsFilter: Prisma.CarWhereInput = {}
  if (typeof params.seats === "string") {
    const [min, max] = params.seats.split("-").map(Number)
    if (!Number.isNaN(min) && !Number.isNaN(max)) {
      seatsFilter = { seats: { gte: min, lte: max } }
    }
  }

  const where: Prisma.CarWhereInput = {
    published: true,
    ...(regionSlug ? { region: { slug: regionSlug } } : {}),
    ...(type ? { type } : {}),
    ...seatsFilter,
    ...(query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { brand: { contains: query, mode: "insensitive" } },
            { model: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
  }

  const [cars, regions, types] = await Promise.all([
    prisma.car.findMany({ where, orderBy: orderBy(sort), include: { region: true } }),
    prisma.region.findMany({
      where: { published: true },
      orderBy: { sortOrder: "asc" },
      select: { slug: true, name: true },
    }),
    prisma.car.findMany({
      where: { published: true },
      select: { type: true },
      distinct: ["type"],
      orderBy: { type: "asc" },
    }),
  ])

  return (
    <>
      <PageHero
        eyebrow="Getting around"
        title="A car, a driver, and someone who knows the road"
        description="Self-drive is rare in Egypt for good reason. Every vehicle below comes with a licensed driver who speaks English and knows the route, the checkpoints and the parking."
        crumbs={[{ label: "Car Rentals" }]}
      />

      <div className="container-page section-y">
        <FilterBar
          basePath="/car-rentals"
          resultCount={cars.length}
          searchPlaceholder="Search by brand, model or type…"
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
            {
              name: "type",
              label: "Vehicle",
              options: types.map((row) => ({ value: row.type, label: row.type })),
            },
            { name: "seats", label: "Seats", options: SEATS },
          ]}
        />

        <div className="mt-10">
          {cars.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {cars.map((car, index) => (
                <CarCard
                  key={car.id}
                  priority={index < 3}
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
          ) : (
            <EmptyState
              title="No vehicles match those filters"
              description="Tell us the group size and route and we'll find the right vehicle."
              action={
                <Link
                  href="/contact"
                  className="rounded-lg bg-lapis px-6 py-3 text-sm font-medium text-white hover:bg-lapis-deep"
                >
                  Request a vehicle
                </Link>
              }
            />
          )}
        </div>
      </div>
    </>
  )
}
