import { NextResponse } from "next/server"
import type { Prisma } from "@prisma/client"

import { prisma } from "@/lib/prisma"
import { toNumber } from "@/lib/utils"

/** GET /api/hotels — published hotels. Query: ?region=slug&stars=4&limit=20 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const region = searchParams.get("region")
  const stars = Number(searchParams.get("stars"))
  const limit = Math.min(Number(searchParams.get("limit") ?? 50) || 50, 100)

  const where: Prisma.HotelWhereInput = {
    published: true,
    ...(region ? { region: { slug: region } } : {}),
    ...(stars ? { starRating: { gte: stars } } : {}),
  }

  const hotels = await prisma.hotel.findMany({
    where,
    orderBy: [{ starRating: "desc" }, { pricePerNight: "asc" }],
    take: limit,
    include: { region: { select: { name: true, slug: true } } },
  })

  return NextResponse.json({
    hotels: hotels.map((hotel) => ({
      id: hotel.id,
      slug: hotel.slug,
      name: hotel.name,
      starRating: hotel.starRating,
      pricePerNight: toNumber(hotel.pricePerNight),
      currency: hotel.currency,
      maxGuests: hotel.maxGuests,
      amenities: hotel.amenities,
      imageUrl: hotel.imageUrl,
      region: hotel.region,
    })),
  })
}
