import { Prisma, type PrismaClient } from "@prisma/client"

import { CATALOG_HOTELS, RETIRED_HOTEL_SLUGS } from "./hotels"
import { CATALOG_VEHICLES, RETIRED_VEHICLE_SLUGS } from "./vehicles"

type Db = PrismaClient | Prisma.TransactionClient

async function regionIds(db: Db): Promise<Map<string, string>> {
  const regions = await db.region.findMany({ select: { id: true, slug: true } })
  return new Map(regions.map((r) => [r.slug, r.id]))
}

/**
 * Adds or updates the real hotels (matched by slug) and hides the demo hotels
 * they replace. Hidden, not deleted: bookings that point at them stay intact.
 */
export async function loadCatalogHotels(db: Db) {
  const regions = await regionIds(db)
  let loaded = 0
  for (const { regionSlug, officialRate, ...hotel } of CATALOG_HOTELS) {
    const regionId = regions.get(regionSlug)
    if (!regionId) continue
    const data = {
      ...hotel,
      pricePerNight: officialRate,
      currency: "USD",
      roomTypes: Prisma.DbNull,
      published: true,
      regionId,
    }
    await db.hotel.upsert({ where: { slug: hotel.slug }, update: data, create: data })
    loaded++
  }
  const { count: retired } = await db.hotel.updateMany({
    where: { slug: { in: RETIRED_HOTEL_SLUGS }, published: true },
    data: { published: false },
  })
  return { loaded, retired }
}

/** Same for vehicles: add or update the fleet, hide the demo cars it replaces. */
export async function loadCatalogVehicles(db: Db) {
  const regions = await regionIds(db)
  let loaded = 0
  for (const { regionSlug, ...vehicle } of CATALOG_VEHICLES) {
    const regionId = regions.get(regionSlug)
    if (!regionId) continue
    const data = { ...vehicle, currency: "USD", available: true, published: true, regionId }
    await db.car.upsert({ where: { slug: vehicle.slug }, update: data, create: data })
    loaded++
  }
  const { count: retired } = await db.car.updateMany({
    where: { slug: { in: RETIRED_VEHICLE_SLUGS }, published: true },
    data: { published: false },
  })
  return { loaded, retired }
}
