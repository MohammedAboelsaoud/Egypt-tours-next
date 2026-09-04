import { NextResponse } from "next/server"
import type { Prisma } from "@prisma/client"

import { prisma } from "@/lib/prisma"
import { toNumber } from "@/lib/utils"

/** GET /api/cars — published vehicles. Query: ?region=slug&type=SUV&seats=7 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const region = searchParams.get("region")
  const type = searchParams.get("type")
  const seats = Number(searchParams.get("seats"))
  const limit = Math.min(Number(searchParams.get("limit") ?? 50) || 50, 100)

  const where: Prisma.CarWhereInput = {
    published: true,
    ...(region ? { region: { slug: region } } : {}),
    ...(type ? { type } : {}),
    ...(seats ? { seats: { gte: seats } } : {}),
  }

  const cars = await prisma.car.findMany({
    where,
    orderBy: [{ available: "desc" }, { pricePerDay: "asc" }],
    take: limit,
    include: { region: { select: { name: true, slug: true } } },
  })

  return NextResponse.json({
    cars: cars.map((car) => ({
      id: car.id,
      slug: car.slug,
      name: car.name,
      brand: car.brand,
      model: car.model,
      year: car.year,
      type: car.type,
      seats: car.seats,
      transmission: car.transmission,
      fuelType: car.fuelType,
      pricePerDay: toNumber(car.pricePerDay),
      currency: car.currency,
      available: car.available,
      imageUrl: car.imageUrl,
      region: car.region,
    })),
  })
}
