import "server-only"

import type { Prisma } from "@prisma/client"

import { auth } from "@/lib/auth"
import {
  PENDING_TTL_HOURS,
  busyDays,
  fromISODate,
  isRangeFree,
  toISODate,
  todayInEgypt,
  type DayRange,
} from "@/lib/guides/availability"
import { prisma } from "@/lib/prisma"
import { sendGuideRequestDeclined } from "@/lib/resend"

/**
 * Marks unanswered requests as EXPIRED: older than the reply window, or whose
 * first day has arrived. Run before reading requests, so no scheduler is needed.
 */
export async function expireStaleRequests(where: Prisma.GuideRequestWhereInput = {}) {
  const cutoff = new Date(Date.now() - PENDING_TTL_HOURS * 60 * 60 * 1000)
  const stale = await prisma.guideRequest.findMany({
    where: {
      ...where,
      status: "PENDING",
      OR: [{ createdAt: { lt: cutoff } }, { startDate: { lte: fromISODate(todayInEgypt()) } }],
    },
    include: {
      guide: { include: { user: { select: { email: true } } } },
      tourist: { select: { name: true, email: true } },
    },
  })
  if (stale.length === 0) return

  // Only rows still pending are flipped, so two readers never both email.
  const { count } = await prisma.guideRequest.updateMany({
    where: { id: { in: stale.map((r) => r.id) }, status: "PENDING" },
    data: { status: "EXPIRED", respondedAt: new Date() },
  })
  if (count === 0) return

  await Promise.allSettled(
    stale.map((r) =>
      sendGuideRequestDeclined({
        reason: "expired",
        reference: r.reference,
        guideName: r.guide.displayName,
        guideEmail: r.guide.user.email ?? "",
        touristName: r.tourist.name ?? "there",
        touristEmail: r.tourist.email ?? "",
        startDate: r.startDate,
        endDate: r.endDate,
        groupSize: r.groupSize,
      })
    )
  )
}

/** The guide's busy days from today on: accepted trips plus blocked days. */
export async function getGuideBusyDays(guideId: string, db: Prisma.TransactionClient = prisma) {
  const today = fromISODate(todayInEgypt())
  const [accepted, blocked] = await Promise.all([
    db.guideRequest.findMany({
      where: { guideId, status: "ACCEPTED", endDate: { gte: today } },
      select: { startDate: true, endDate: true },
    }),
    db.guideBlockedDay.findMany({
      where: { guideId, date: { gte: today } },
      select: { date: true },
    }),
  ])
  const acceptedRanges: DayRange[] = accepted.map((r) => ({
    start: toISODate(r.startDate),
    end: toISODate(r.endDate),
  }))
  return {
    busy: busyDays(acceptedRanges, blocked.map((b) => toISODate(b.date))),
    booked: busyDays(acceptedRanges, []),
    blocked: new Set(blocked.map((b) => toISODate(b.date))),
  }
}

/** Average rating and count of visible reviews, per guide. */
export async function getGuideRatings(guideIds: string[]) {
  if (guideIds.length === 0) return new Map<string, { average: number; count: number }>()
  const rows = await prisma.guideReview.groupBy({
    by: ["guideId"],
    where: { guideId: { in: guideIds }, hidden: false },
    _avg: { rating: true },
    _count: { _all: true },
  })
  return new Map(
    rows.map((r) => [r.guideId, { average: r._avg.rating ?? 0, count: r._count._all }])
  )
}

export type GuideFilters = {
  region?: string
  language?: string
  type?: string
  from?: string
  to?: string
}

/** Private fields never loaded for public pages. */
const privateGuideFields = { whatsapp: true, licenceNumber: true, adminNote: true } as const

const publicGuideInclude = {
  regions: { select: { slug: true, name: true } },
} satisfies Prisma.GuideProfileInclude

export async function getApprovedGuides(filters: GuideFilters = {}) {
  const guides = await prisma.guideProfile.findMany({
    where: {
      status: "APPROVED",
      ...(filters.region ? { regions: { some: { slug: filters.region } } } : {}),
      ...(filters.language ? { languages: { has: filters.language } } : {}),
      ...(filters.type ? { guideType: filters.type } : {}),
    },
    include: publicGuideInclude,
    omit: privateGuideFields,
    orderBy: { createdAt: "asc" },
  })

  let visible = guides
  if (filters.from && filters.to && filters.from <= filters.to) {
    const range = { start: filters.from, end: filters.to }
    const free = await Promise.all(
      guides.map(async (g) => isRangeFree(range, (await getGuideBusyDays(g.id)).busy))
    )
    visible = guides.filter((_, i) => free[i])
  }

  const ratings = await getGuideRatings(visible.map((g) => g.id))
  return visible.map((g) => ({ ...g, rating: ratings.get(g.id) ?? null }))
}

export async function getGuideBySlug(slug: string) {
  const guide = await prisma.guideProfile.findFirst({
    where: { slug, status: "APPROVED" },
    omit: privateGuideFields,
    include: {
      ...publicGuideInclude,
      reviews: {
        where: { hidden: false },
        orderBy: { createdAt: "desc" },
        take: 30,
        include: { tourist: { select: { name: true, nationality: true } } },
      },
    },
  })
  if (!guide) return null
  const ratings = await getGuideRatings([guide.id])
  return { ...guide, rating: ratings.get(guide.id) ?? null }
}

/** The signed-in guide's own profile (any status), or null. */
export async function currentGuideProfile() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "GUIDE") return null
  return prisma.guideProfile.findUnique({
    where: { userId: session.user.id },
    include: { regions: { select: { id: true, slug: true, name: true } } },
  })
}
