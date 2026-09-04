import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"

/** GET /api/regions — published regions with listing counts. */
export async function GET() {
  const regions = await prisma.region.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { tours: true, hotels: true, cars: true } } },
  })

  return NextResponse.json({
    regions: regions.map((region) => ({
      id: region.id,
      slug: region.slug,
      name: region.name,
      tagline: region.tagline,
      summary: region.summary,
      cities: region.cities,
      imageUrl: region.imageUrl,
      coordinates:
        region.lat && region.lng ? { lat: region.lat, lng: region.lng } : null,
      counts: region._count,
    })),
  })
}
