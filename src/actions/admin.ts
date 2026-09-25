"use server"

import { revalidatePath, updateTag } from "next/cache"
import { redirect } from "next/navigation"
import type { BookingStatus, PaymentStatus } from "@prisma/client"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { linesToArray, slugify } from "@/lib/utils"
import {
  carSchema,
  historicSiteSchema,
  hotelSchema,
  regionSchema,
  settingsSchema,
  tourSchema,
} from "@/lib/validations"

export type AdminState = { ok: boolean; message: string } | null

async function requireAdmin() {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Not authorised")
  }
  return session.user
}

function str(formData: FormData, key: string): string {
  const value = formData.get(key)
  return typeof value === "string" ? value.trim() : ""
}

function bool(formData: FormData, key: string): boolean {
  const value = formData.get(key)
  return value === "on" || value === "true"
}

function json<T>(formData: FormData, key: string, fallback: T): T {
  const raw = str(formData, key)
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function num(formData: FormData, key: string): number | null {
  const raw = str(formData, key)
  if (!raw) return null
  const parsed = Number(raw)
  return Number.isNaN(parsed) ? null : parsed
}

/** Makes a slug unique within its table by appending -2, -3, … */
async function uniqueSlug(
  table: "tour" | "hotel" | "car" | "region" | "historicSite",
  base: string,
  currentId?: string
): Promise<string> {
  let slug = base
  let suffix = 2

  for (;;) {
    const existing = await (
      prisma[table] as { findUnique: (args: unknown) => Promise<{ id: string } | null> }
    ).findUnique({ where: { slug }, select: { id: true } })

    if (!existing || existing.id === currentId) return slug
    slug = `${base}-${suffix++}`
  }
}

// ---------------------------------------------------------------- tours

export async function saveTour(
  id: string | null,
  _prev: AdminState,
  formData: FormData
): Promise<AdminState> {
  await requireAdmin()

  const parsed = tourSchema.safeParse({
    title: str(formData, "title"),
    slug: str(formData, "slug"),
    regionId: str(formData, "regionId"),
    summary: str(formData, "summary"),
    description: str(formData, "description"),
    durationDays: str(formData, "durationDays"),
    priceFrom: str(formData, "priceFrom"),
    currency: str(formData, "currency") || "USD",
    maxGroupSize: str(formData, "maxGroupSize"),
    highlights: linesToArray(str(formData, "highlights")),
    includes: linesToArray(str(formData, "includes")),
    excludes: linesToArray(str(formData, "excludes")),
    itinerary: json(formData, "itinerary", []),
    imageUrl: str(formData, "imageUrl"),
    galleryUrls: linesToArray(str(formData, "galleryUrls")),
    featured: bool(formData, "featured"),
    published: bool(formData, "published"),
    sortOrder: str(formData, "sortOrder") || "0",
    lat: num(formData, "lat"),
    lng: num(formData, "lng"),
  })

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid tour" }
  }

  const data = parsed.data
  const slug = await uniqueSlug(
    "tour",
    slugify(data.slug || data.title),
    id ?? undefined
  )

  const payload = {
    slug,
    title: data.title,
    summary: data.summary,
    description: data.description,
    durationDays: data.durationDays,
    priceFrom: data.priceFrom,
    currency: data.currency,
    maxGroupSize: data.maxGroupSize,
    highlights: data.highlights,
    includes: data.includes,
    excludes: data.excludes,
    itinerary: data.itinerary,
    imageUrl: data.imageUrl,
    galleryUrls: data.galleryUrls,
    featured: data.featured,
    published: data.published,
    sortOrder: data.sortOrder,
    lat: data.lat ?? null,
    lng: data.lng ?? null,
    regionId: data.regionId,
  }

  if (id) {
    await prisma.tour.update({ where: { id }, data: payload })
  } else {
    await prisma.tour.create({ data: payload })
  }

  revalidatePath("/admin/tours")
  revalidatePath("/tours")
  revalidatePath(`/tours/${slug}`)
  revalidatePath("/")
  redirect("/admin/tours")
}

export async function deleteTour(id: string) {
  await requireAdmin()
  await prisma.tour.delete({ where: { id } })
  revalidatePath("/admin/tours")
  revalidatePath("/tours")
}

export async function toggleTourPublished(id: string, published: boolean) {
  await requireAdmin()
  await prisma.tour.update({ where: { id }, data: { published } })
  revalidatePath("/admin/tours")
  revalidatePath("/tours")
}

export async function toggleTourFeatured(id: string, featured: boolean) {
  await requireAdmin()
  await prisma.tour.update({ where: { id }, data: { featured } })
  revalidatePath("/admin/tours")
  revalidatePath("/")
}

// --------------------------------------------------------------- hotels

export async function saveHotel(
  id: string | null,
  _prev: AdminState,
  formData: FormData
): Promise<AdminState> {
  await requireAdmin()

  const parsed = hotelSchema.safeParse({
    name: str(formData, "name"),
    slug: str(formData, "slug"),
    regionId: str(formData, "regionId"),
    description: str(formData, "description"),
    starRating: str(formData, "starRating"),
    pricePerNight: str(formData, "pricePerNight"),
    currency: str(formData, "currency") || "USD",
    maxGuests: str(formData, "maxGuests"),
    amenities: linesToArray(str(formData, "amenities")),
    roomTypes: json(formData, "roomTypes", []),
    address: str(formData, "address"),
    imageUrl: str(formData, "imageUrl"),
    galleryUrls: linesToArray(str(formData, "galleryUrls")),
    published: bool(formData, "published"),
    lat: num(formData, "lat"),
    lng: num(formData, "lng"),
  })

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid hotel" }
  }

  const data = parsed.data
  const slug = await uniqueSlug(
    "hotel",
    slugify(data.slug || data.name),
    id ?? undefined
  )

  const payload = {
    slug,
    name: data.name,
    description: data.description,
    starRating: data.starRating,
    pricePerNight: data.pricePerNight,
    currency: data.currency,
    maxGuests: data.maxGuests,
    amenities: data.amenities,
    roomTypes: data.roomTypes,
    address: data.address || null,
    imageUrl: data.imageUrl,
    galleryUrls: data.galleryUrls,
    published: data.published,
    lat: data.lat ?? null,
    lng: data.lng ?? null,
    regionId: data.regionId,
  }

  if (id) {
    await prisma.hotel.update({ where: { id }, data: payload })
  } else {
    await prisma.hotel.create({ data: payload })
  }

  revalidatePath("/admin/hotels")
  revalidatePath("/hotels")
  revalidatePath(`/hotels/${slug}`)
  redirect("/admin/hotels")
}

export async function deleteHotel(id: string) {
  await requireAdmin()
  await prisma.hotel.delete({ where: { id } })
  revalidatePath("/admin/hotels")
  revalidatePath("/hotels")
}

export async function toggleHotelPublished(id: string, published: boolean) {
  await requireAdmin()
  await prisma.hotel.update({ where: { id }, data: { published } })
  revalidatePath("/admin/hotels")
  revalidatePath("/hotels")
}

// ----------------------------------------------------------------- cars

export async function saveCar(
  id: string | null,
  _prev: AdminState,
  formData: FormData
): Promise<AdminState> {
  await requireAdmin()

  const parsed = carSchema.safeParse({
    name: str(formData, "name"),
    slug: str(formData, "slug"),
    regionId: str(formData, "regionId"),
    description: str(formData, "description"),
    brand: str(formData, "brand"),
    model: str(formData, "model"),
    year: str(formData, "year"),
    type: str(formData, "type"),
    seats: str(formData, "seats"),
    transmission: str(formData, "transmission"),
    fuelType: str(formData, "fuelType"),
    pricePerDay: str(formData, "pricePerDay"),
    currency: str(formData, "currency") || "USD",
    features: linesToArray(str(formData, "features")),
    imageUrl: str(formData, "imageUrl"),
    galleryUrls: linesToArray(str(formData, "galleryUrls")),
    available: bool(formData, "available"),
    published: bool(formData, "published"),
  })

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid vehicle" }
  }

  const data = parsed.data
  const slug = await uniqueSlug(
    "car",
    slugify(data.slug || data.name),
    id ?? undefined
  )

  const payload = {
    slug,
    name: data.name,
    description: data.description,
    brand: data.brand,
    model: data.model,
    year: data.year,
    type: data.type,
    seats: data.seats,
    transmission: data.transmission,
    fuelType: data.fuelType,
    pricePerDay: data.pricePerDay,
    currency: data.currency,
    features: data.features,
    imageUrl: data.imageUrl,
    galleryUrls: data.galleryUrls,
    available: data.available,
    published: data.published,
    regionId: data.regionId,
  }

  if (id) {
    await prisma.car.update({ where: { id }, data: payload })
  } else {
    await prisma.car.create({ data: payload })
  }

  revalidatePath("/admin/cars")
  revalidatePath("/car-rentals")
  revalidatePath(`/car-rentals/${slug}`)
  redirect("/admin/cars")
}

export async function deleteCar(id: string) {
  await requireAdmin()
  await prisma.car.delete({ where: { id } })
  revalidatePath("/admin/cars")
  revalidatePath("/car-rentals")
}

export async function toggleCarAvailable(id: string, available: boolean) {
  await requireAdmin()
  await prisma.car.update({ where: { id }, data: { available } })
  revalidatePath("/admin/cars")
  revalidatePath("/car-rentals")
}

// -------------------------------------------------------------- regions

export async function saveRegion(
  id: string | null,
  _prev: AdminState,
  formData: FormData
): Promise<AdminState> {
  await requireAdmin()

  const parsed = regionSchema.safeParse({
    name: str(formData, "name"),
    slug: str(formData, "slug"),
    tagline: str(formData, "tagline"),
    summary: str(formData, "summary"),
    cities: linesToArray(str(formData, "cities")),
    imageUrl: str(formData, "imageUrl"),
    lat: num(formData, "lat"),
    lng: num(formData, "lng"),
    zoom: str(formData, "zoom") || "7",
    sortOrder: str(formData, "sortOrder") || "0",
    published: bool(formData, "published"),
  })

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid region" }
  }

  const data = parsed.data
  const slug = await uniqueSlug(
    "region",
    slugify(data.slug || data.name),
    id ?? undefined
  )

  const payload = {
    slug,
    name: data.name,
    tagline: data.tagline,
    summary: data.summary,
    cities: data.cities,
    imageUrl: data.imageUrl,
    lat: data.lat ?? null,
    lng: data.lng ?? null,
    zoom: data.zoom,
    sortOrder: data.sortOrder,
    published: data.published,
  }

  if (id) {
    await prisma.region.update({ where: { id }, data: payload })
  } else {
    await prisma.region.create({ data: payload })
  }

  revalidatePath("/admin/regions")
  revalidatePath("/destinations")
  revalidatePath(`/destinations/${slug}`)
  revalidatePath("/")
  redirect("/admin/regions")
}

export async function deleteRegion(id: string) {
  await requireAdmin()

  const counts = await prisma.region.findUnique({
    where: { id },
    select: { _count: { select: { tours: true, hotels: true, cars: true, sites: true } } },
  })

  const total =
    (counts?._count.tours ?? 0) +
    (counts?._count.hotels ?? 0) +
    (counts?._count.cars ?? 0) +
    (counts?._count.sites ?? 0)

  if (total > 0) {
    throw new Error(
      `This region still has ${total} listing(s). Move or delete them first.`
    )
  }

  await prisma.region.delete({ where: { id } })
  revalidatePath("/admin/regions")
  revalidatePath("/destinations")
}

// ------------------------------------------------------- historic sites

export async function saveHistoricSite(
  id: string | null,
  _prev: AdminState,
  formData: FormData
): Promise<AdminState> {
  await requireAdmin()

  const parsed = historicSiteSchema.safeParse({
    name: str(formData, "name"),
    slug: str(formData, "slug"),
    regionId: str(formData, "regionId"),
    location: str(formData, "location"),
    period: str(formData, "period"),
    summary: str(formData, "summary"),
    history: str(formData, "history"),
    facts: linesToArray(str(formData, "facts")),
    tips: linesToArray(str(formData, "tips")),
    imageUrl: str(formData, "imageUrl"),
    imageCredit: str(formData, "imageCredit"),
    galleryUrls: linesToArray(str(formData, "galleryUrls")),
    keywords: str(formData, "keywords")
      .split(/[\n,]/)
      .map((word) => word.trim().toLowerCase())
      .filter(Boolean),
    sortOrder: str(formData, "sortOrder") || "0",
    published: bool(formData, "published"),
  })

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid historic site" }
  }

  const { slug: requestedSlug, ...data } = parsed.data
  const slug = await uniqueSlug(
    "historicSite",
    slugify(requestedSlug || data.name),
    id ?? undefined
  )

  const previous = id
    ? await prisma.historicSite.findUnique({ where: { id }, select: { slug: true } })
    : null

  if (id) {
    await prisma.historicSite.update({ where: { id }, data: { ...data, slug } })
  } else {
    await prisma.historicSite.create({ data: { ...data, slug } })
  }

  revalidatePath("/admin/sites")
  revalidatePath("/sites")
  revalidatePath(`/sites/${slug}`)
  if (previous && previous.slug !== slug) revalidatePath(`/sites/${previous.slug}`)
  revalidatePath("/destinations/[slug]", "page")
  // The chat assistant links to sites by name, so it should know about them at once.
  updateTag("chat-catalogue")
  redirect("/admin/sites")
}

export async function deleteHistoricSite(id: string) {
  await requireAdmin()
  const site = await prisma.historicSite.delete({ where: { id }, select: { slug: true } })
  revalidatePath("/admin/sites")
  revalidatePath("/sites")
  revalidatePath(`/sites/${site.slug}`)
  revalidatePath("/destinations/[slug]", "page")
  // The chat assistant links to sites by name, so it should know about them at once.
  updateTag("chat-catalogue")
}

export async function toggleHistoricSitePublished(id: string, published: boolean) {
  await requireAdmin()
  const site = await prisma.historicSite.update({ where: { id }, data: { published }, select: { slug: true } })
  revalidatePath("/admin/sites")
  revalidatePath("/sites")
  revalidatePath(`/sites/${site.slug}`)
  revalidatePath("/destinations/[slug]", "page")
  // The chat assistant links to sites by name, so it should know about them at once.
  updateTag("chat-catalogue")
}

// ------------------------------------------------------------- bookings

export async function updateBookingStatus(
  id: string,
  data: { status?: BookingStatus; paymentStatus?: PaymentStatus }
) {
  await requireAdmin()

  await prisma.booking.update({
    where: { id },
    data: {
      ...(data.status ? { status: data.status } : {}),
      ...(data.paymentStatus ? { paymentStatus: data.paymentStatus } : {}),
    },
  })

  revalidatePath("/admin/bookings")
  revalidatePath(`/admin/bookings/${id}`)
  revalidatePath("/admin")
}

// ------------------------------------------------------------ inquiries

export async function setInquiryHandled(id: string, handled: boolean) {
  await requireAdmin()
  await prisma.inquiry.update({ where: { id }, data: { handled } })
  revalidatePath("/admin/inquiries")
  revalidatePath("/admin")
}

export async function deleteInquiry(id: string) {
  await requireAdmin()
  await prisma.inquiry.delete({ where: { id } })
  revalidatePath("/admin/inquiries")
}

// -------------------------------------------------------------- reviews

export async function setReviewApproved(id: string, approved: boolean) {
  await requireAdmin()

  const review = await prisma.review.update({
    where: { id },
    data: { approved },
    include: { tour: { select: { slug: true } } },
  })

  revalidatePath("/admin/reviews")
  revalidatePath(`/tours/${review.tour.slug}`)
  revalidatePath("/")
}

export async function deleteReview(id: string) {
  await requireAdmin()
  const review = await prisma.review.delete({
    where: { id },
    include: { tour: { select: { slug: true } } },
  })
  revalidatePath("/admin/reviews")
  revalidatePath(`/tours/${review.tour.slug}`)
}

// ------------------------------------------------------------- settings

export async function saveSettings(
  _prev: AdminState,
  formData: FormData
): Promise<AdminState> {
  await requireAdmin()

  const parsed = settingsSchema.safeParse({
    siteName: str(formData, "siteName"),
    tagline: str(formData, "tagline"),
    contactEmail: str(formData, "contactEmail"),
    contactPhone: str(formData, "contactPhone"),
    whatsappNumber: str(formData, "whatsappNumber"),
    address: str(formData, "address"),
    facebookUrl: str(formData, "facebookUrl"),
    instagramUrl: str(formData, "instagramUrl"),
    hotelMarkupPercent: str(formData, "hotelMarkupPercent") || "10",
  })

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Invalid settings",
    }
  }

  const { hotelMarkupPercent, ...siteSettings } = parsed.data
  await prisma.siteSetting.upsert({
    where: { id: "site" },
    update: siteSettings,
    create: { id: "site", ...siteSettings },
  })
  await prisma.pricingSetting.upsert({
    where: { id: "site" },
    update: { hotelMarkupPercent },
    create: { id: "site", hotelMarkupPercent },
  })

  // updateTag gives read-your-writes: the admin sees the new settings at once.
  updateTag("settings")
  updateTag("pricing")
  updateTag("chat-catalogue")
  revalidatePath("/", "layout")
  return { ok: true, message: "Settings saved." }
}
