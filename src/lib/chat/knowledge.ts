import "server-only"

import { unstable_cache } from "next/cache"

import type { ChatKnowledge, ChatListing } from "@/lib/chat/engine"
import { FAQ_GROUPS } from "@/lib/faq"
import { prisma } from "@/lib/prisma"
import { getSettings } from "@/lib/settings"
import { toNumber } from "@/lib/utils"

async function loadCatalogue(): Promise<Pick<ChatKnowledge, "regions" | "listings">> {
  const published = { published: true, region: { published: true } }
  const region = { select: { slug: true, name: true } }

  const [regions, tours, hotels, cars] = await Promise.all([
    prisma.region.findMany({
      where: { published: true },
      orderBy: { sortOrder: "asc" },
      select: { slug: true, name: true, tagline: true, cities: true },
    }),
    prisma.tour.findMany({ where: published, include: { region } }),
    prisma.hotel.findMany({ where: published, include: { region } }),
    prisma.car.findMany({ where: { ...published, available: true }, include: { region } }),
  ])

  const listings: ChatListing[] = [
    ...tours.map((t) => ({
      kind: "tour" as const,
      slug: t.slug,
      title: t.title,
      href: `/tours/${t.slug}`,
      imageUrl: t.imageUrl,
      regionSlug: t.region.slug,
      regionName: t.region.name,
      price: toNumber(t.priceFrom),
      currency: t.currency,
      unit: "per person",
      detail: `${t.durationDays} ${t.durationDays === 1 ? "day" : "days"} · max ${t.maxGroupSize}`,
      durationDays: t.durationDays,
      capacity: t.maxGroupSize,
      featured: t.featured,
      searchText: `${t.title} ${t.summary} ${t.highlights.join(" ")}`.toLowerCase(),
    })),
    ...hotels.map((h) => ({
      kind: "hotel" as const,
      slug: h.slug,
      title: h.name,
      href: `/hotels/${h.slug}`,
      imageUrl: h.imageUrl,
      regionSlug: h.region.slug,
      regionName: h.region.name,
      price: toNumber(h.pricePerNight),
      currency: h.currency,
      unit: "per night",
      detail: `${h.starRating}-star · up to ${h.maxGuests} guests`,
      capacity: h.maxGuests,
      starRating: h.starRating,
      searchText: `${h.name} ${h.amenities.join(" ")}`.toLowerCase(),
    })),
    ...cars.map((c) => ({
      kind: "car" as const,
      slug: c.slug,
      title: c.name,
      href: `/car-rentals/${c.slug}`,
      imageUrl: c.imageUrl,
      regionSlug: c.region.slug,
      regionName: c.region.name,
      price: toNumber(c.pricePerDay),
      currency: c.currency,
      unit: "per day",
      detail: `${c.type} · ${c.seats} seats · with driver`,
      capacity: c.seats,
      carType: c.type,
      searchText: `${c.name} ${c.brand} ${c.model} ${c.type} ${c.features.join(" ")}`.toLowerCase(),
    })),
  ]

  return { regions, listings }
}

const getCatalogue = unstable_cache(
  async () => {
    try {
      return await loadCatalogue()
    } catch {
      // Database not reachable: the assistant still answers FAQ questions.
      return { regions: [], listings: [] }
    }
  },
  ["chat-catalogue"],
  { tags: ["chat-catalogue"], revalidate: 600 }
)

/** Everything the chat assistant knows, from the site's own content. */
export async function getChatKnowledge(): Promise<ChatKnowledge> {
  const [catalogue, settings] = await Promise.all([getCatalogue(), getSettings()])
  return {
    faq: FAQ_GROUPS,
    ...catalogue,
    contact: {
      phone: settings.contactPhone,
      email: settings.contactEmail,
      whatsapp: settings.whatsappNumber,
    },
  }
}
