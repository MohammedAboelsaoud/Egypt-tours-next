import "server-only"

import { unstable_cache } from "next/cache"

import type { ChatKnowledge, ChatListing } from "@/lib/chat/engine"
import { FAQ_GROUPS } from "@/lib/faq"
import { applyMarkup } from "@/lib/markup"
import { getHotelMarkupPercent } from "@/lib/pricing-settings"
import { prisma } from "@/lib/prisma"
import { getSettings } from "@/lib/settings"
import { toNumber } from "@/lib/utils"

async function loadSites(): Promise<ChatListing[]> {
  const sites = await prisma.historicSite.findMany({
    where: { published: true, region: { published: true } },
    orderBy: { sortOrder: "asc" },
    include: { region: { select: { slug: true, name: true } } },
  })
  return sites.map((s) => ({
    kind: "site" as const,
    slug: s.slug,
    title: s.name,
    href: `/sites/${s.slug}`,
    imageUrl: s.imageUrl,
    regionSlug: s.region.slug,
    regionName: s.region.name,
    price: 0,
    currency: "USD",
    unit: "Read the history",
    detail: s.period,
    capacity: 0,
    summary: s.summary,
    keywords: s.keywords,
    searchText: `${s.name} ${s.summary}`.toLowerCase(),
  }))
}

async function loadCatalogue(): Promise<Pick<ChatKnowledge, "regions" | "listings" | "sites">> {
  const published = { published: true, region: { published: true } }
  const region = { select: { slug: true, name: true } }

  const [regions, tours, hotels, cars, guides, markup] = await Promise.all([
    prisma.region.findMany({
      where: { published: true },
      orderBy: { sortOrder: "asc" },
      select: { slug: true, name: true, tagline: true, cities: true },
    }),
    prisma.tour.findMany({ where: published, include: { region } }),
    prisma.hotel.findMany({ where: published, include: { region } }),
    prisma.car.findMany({ where: { ...published, available: true }, include: { region } }),
    prisma.guideProfile.findMany({
      where: { status: "APPROVED" },
      include: { regions: { select: { slug: true, name: true, imageUrl: true } } },
    }),
    getHotelMarkupPercent(),
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
      price: applyMarkup(toNumber(h.pricePerNight), markup),
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
    // A guide covering several regions is listed once per region, so a
    // region search finds them; the widget shows each card once.
    ...guides.flatMap((g) =>
      g.regions.map((r) => ({
        kind: "guide" as const,
        slug: g.slug,
        title: g.displayName,
        href: `/guides/${g.slug}`,
        imageUrl: g.photoUrl ?? r.imageUrl,
        regionSlug: r.slug,
        regionName: g.regions.map((x) => x.name).join(" · "),
        price: g.dayRate === null ? 0 : toNumber(g.dayRate),
        currency: g.currency,
        unit: g.dayRate === null ? "fee agreed per trip" : "per day",
        detail: `${g.guideType} · ${g.languages.join(", ")}`,
        capacity: 60,
        languages: g.languages,
        searchText: `${g.displayName} ${g.guideType} ${g.specialties.join(" ")} ${g.languages.join(" ")}`.toLowerCase(),
      }))
    ),
  ]

  // The catalog table appears on the first server start after deploying.
  const sites = await loadSites().catch(() => [])

  return { regions, listings, sites }
}

const getCatalogue = unstable_cache(
  async () => {
    try {
      return await loadCatalogue()
    } catch {
      // Database not reachable: the assistant still answers FAQ questions.
      return { regions: [], listings: [], sites: [] }
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
