import type { MetadataRoute } from "next"

import { SITE } from "@/lib/constants"
import { prisma } from "@/lib/prisma"

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url.replace(/\/$/, "")

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/destinations`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/tours`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/hotels`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/car-rentals`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/sites`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/faq`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/contact`, changeFrequency: "monthly", priority: 0.6 },
  ]

  try {
    const [regions, tours, hotels, cars, sites] = await Promise.all([
      prisma.region.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true },
      }),
      prisma.tour.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true },
      }),
      prisma.hotel.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true },
      }),
      prisma.car.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true },
      }),
      // Its table appears on the first server start after deploying.
      prisma.historicSite
        .findMany({ where: { published: true }, select: { slug: true, updatedAt: true } })
        .catch(() => []),
    ])

    return [
      ...staticRoutes,
      ...regions.map((region) => ({
        url: `${base}/destinations/${region.slug}`,
        lastModified: region.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
      ...tours.map((tour) => ({
        url: `${base}/tours/${tour.slug}`,
        lastModified: tour.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
      ...hotels.map((hotel) => ({
        url: `${base}/hotels/${hotel.slug}`,
        lastModified: hotel.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
      ...cars.map((car) => ({
        url: `${base}/car-rentals/${car.slug}`,
        lastModified: car.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
      ...sites.map((site) => ({
        url: `${base}/sites/${site.slug}`,
        lastModified: site.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })),
    ]
  } catch {
    // Database unreachable at build time — ship the static routes at least.
    return staticRoutes
  }
}
