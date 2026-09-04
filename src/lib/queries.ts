import { prisma } from "@/lib/prisma"

/** Average approved-review score per tour, keyed by tour id. */
export async function getTourRatings(tourIds: string[]) {
  if (tourIds.length === 0) return new Map<string, { average: number; count: number }>()

  const grouped = await prisma.review.groupBy({
    by: ["tourId"],
    where: { approved: true, tourId: { in: tourIds } },
    _avg: { rating: true },
    _count: { _all: true },
  })

  return new Map(
    grouped.map((row) => [
      row.tourId,
      { average: row._avg.rating ?? 0, count: row._count._all },
    ])
  )
}

export async function getPublishedRegions() {
  return prisma.region.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { tours: true, hotels: true, cars: true } } },
  })
}

export async function getFeaturedTours(limit = 6) {
  const tours = await prisma.tour.findMany({
    where: { published: true, featured: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    include: { region: true },
    take: limit,
  })

  // Fall back to the newest tours if nothing has been flagged as featured.
  if (tours.length > 0) return tours

  return prisma.tour.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    include: { region: true },
    take: limit,
  })
}

export async function getHomepageTestimonials(limit = 6) {
  const reviews = await prisma.review.findMany({
    where: { approved: true, rating: { gte: 4 } },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      user: { select: { name: true } },
      tour: { select: { title: true, slug: true } },
    },
  })

  return reviews.map((review) => ({
    id: review.id,
    rating: review.rating,
    comment: review.comment,
    author: review.user.name ?? "Traveller",
    tourTitle: review.tour.title,
    tourSlug: review.tour.slug,
  }))
}

export type BookableKind = "tour" | "hotel" | "car"

/** Loads a bookable item by id, whatever its type. */
export async function getBookableItem(kind: BookableKind, id: string) {
  if (kind === "tour") {
    return prisma.tour.findFirst({
      where: { id, published: true },
      include: { region: true },
    })
  }
  if (kind === "hotel") {
    return prisma.hotel.findFirst({
      where: { id, published: true },
      include: { region: true },
    })
  }
  return prisma.car.findFirst({
    where: { id, published: true, available: true },
    include: { region: true },
  })
}
