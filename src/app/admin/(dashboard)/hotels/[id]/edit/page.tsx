import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { HotelForm } from "@/components/admin/hotel-form"
import { AdminHeader } from "@/components/admin/ui"
import { prisma } from "@/lib/prisma"
import type { RoomType } from "@/types"

export const metadata: Metadata = { title: "Edit hotel" }

export default async function EditHotelPage({
  params,
}: PageProps<"/admin/hotels/[id]/edit">) {
  const { id } = await params

  const [hotel, regions] = await Promise.all([
    prisma.hotel.findUnique({ where: { id } }),
    prisma.region.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true },
    }),
  ])

  if (!hotel) notFound()

  return (
    <>
      <AdminHeader
        title="Edit hotel"
        description={hotel.name}
        action={
          <Link
            href={`/hotels/${hotel.slug}`}
            target="_blank"
            className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:border-lapis hover:text-lapis"
          >
            View on site ↗
          </Link>
        }
      />

      <HotelForm
        regions={regions}
        hotel={{
          id: hotel.id,
          slug: hotel.slug,
          name: hotel.name,
          description: hotel.description,
          starRating: hotel.starRating,
          pricePerNight: hotel.pricePerNight.toString(),
          currency: hotel.currency,
          maxGuests: hotel.maxGuests,
          amenities: hotel.amenities,
          roomTypes: (hotel.roomTypes as unknown as RoomType[]) ?? [],
          address: hotel.address,
          imageUrl: hotel.imageUrl,
          galleryUrls: hotel.galleryUrls,
          published: hotel.published,
          lat: hotel.lat,
          lng: hotel.lng,
          regionId: hotel.regionId,
        }}
      />
    </>
  )
}
