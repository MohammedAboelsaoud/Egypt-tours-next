import { NextResponse } from "next/server"
import type { Prisma } from "@prisma/client"

import { prisma } from "@/lib/prisma"
import { toNumber } from "@/lib/utils"

/**
 * GET /api/tours — published tours as JSON.
 * Query: ?region=slug&featured=true&limit=20
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const region = searchParams.get("region")
  const featured = searchParams.get("featured")
  const limit = Math.min(Number(searchParams.get("limit") ?? 50) || 50, 100)

  const where: Prisma.TourWhereInput = {
    published: true,
    ...(region ? { region: { slug: region } } : {}),
    ...(featured === "true" ? { featured: true } : {}),
  }

  const tours = await prisma.tour.findMany({
    where,
    orderBy: [{ featured: "desc" }, { sortOrder: "asc" }],
    take: limit,
    include: { region: { select: { name: true, slug: true } } },
  })

  return NextResponse.json({
    tours: tours.map((tour) => ({
      id: tour.id,
      slug: tour.slug,
      title: tour.title,
      summary: tour.summary,
      durationDays: tour.durationDays,
      priceFrom: toNumber(tour.priceFrom),
      currency: tour.currency,
      maxGroupSize: tour.maxGroupSize,
      imageUrl: tour.imageUrl,
      featured: tour.featured,
      region: tour.region,
    })),
  })
}
