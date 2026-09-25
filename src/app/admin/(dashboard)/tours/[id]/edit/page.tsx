import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { TourForm } from "@/components/admin/tour-form"
import { AdminHeader } from "@/components/admin/ui"
import { prisma } from "@/lib/prisma"
import type { ItineraryDay } from "@/types"

export const metadata: Metadata = { title: "Edit tour" }

export default async function EditTourPage({
  params,
}: PageProps<"/admin/tours/[id]/edit">) {
  const { id } = await params

  const [tour, regions] = await Promise.all([
    prisma.tour.findUnique({ where: { id } }),
    prisma.region.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true },
    }),
  ])

  if (!tour) notFound()

  return (
    <>
      <AdminHeader
        title="Edit tour"
        description={tour.title}
        action={
          <Link
            href={`/tours/${tour.slug}`}
            target="_blank"
            className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:border-lapis hover:text-lapis"
          >
            View on site ↗
          </Link>
        }
      />

      <TourForm
        regions={regions}
        tour={{
          id: tour.id,
          slug: tour.slug,
          title: tour.title,
          summary: tour.summary,
          description: tour.description,
          durationDays: tour.durationDays,
          priceFrom: tour.priceFrom.toString(),
          currency: tour.currency,
          maxGroupSize: tour.maxGroupSize,
          highlights: tour.highlights,
          includes: tour.includes,
          excludes: tour.excludes,
          itinerary: (tour.itinerary as unknown as ItineraryDay[]) ?? [],
          imageUrl: tour.imageUrl,
          galleryUrls: tour.galleryUrls,
          featured: tour.featured,
          published: tour.published,
          sortOrder: tour.sortOrder,
          lat: tour.lat,
          lng: tour.lng,
          regionId: tour.regionId,
        }}
      />
    </>
  )
}
