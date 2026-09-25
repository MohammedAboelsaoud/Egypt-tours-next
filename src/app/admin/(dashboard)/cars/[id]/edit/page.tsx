import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { CarForm } from "@/components/admin/car-form"
import { AdminHeader } from "@/components/admin/ui"
import { prisma } from "@/lib/prisma"

export const metadata: Metadata = { title: "Edit vehicle" }

export default async function EditCarPage({
  params,
}: PageProps<"/admin/cars/[id]/edit">) {
  const { id } = await params

  const [car, regions] = await Promise.all([
    prisma.car.findUnique({ where: { id } }),
    prisma.region.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true },
    }),
  ])

  if (!car) notFound()

  return (
    <>
      <AdminHeader
        title="Edit vehicle"
        description={car.name}
        action={
          <Link
            href={`/car-rentals/${car.slug}`}
            target="_blank"
            className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:border-lapis hover:text-lapis"
          >
            View on site ↗
          </Link>
        }
      />

      <CarForm
        regions={regions}
        car={{
          id: car.id,
          slug: car.slug,
          name: car.name,
          description: car.description,
          brand: car.brand,
          model: car.model,
          year: car.year,
          type: car.type,
          seats: car.seats,
          transmission: car.transmission,
          fuelType: car.fuelType,
          pricePerDay: car.pricePerDay.toString(),
          currency: car.currency,
          features: car.features,
          imageUrl: car.imageUrl,
          galleryUrls: car.galleryUrls,
          available: car.available,
          published: car.published,
          regionId: car.regionId,
        }}
      />
    </>
  )
}
