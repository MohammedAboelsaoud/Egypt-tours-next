"use server"

import { revalidatePath } from "next/cache"

import { auth, isAdmin } from "@/lib/auth"
import {
  eachDay,
  fromISODate,
  isRangeFree,
  toISODate,
  todayInEgypt,
  tripRangeError,
  formatDay,
} from "@/lib/guides/availability"
import { expireStaleRequests, getGuideBusyDays } from "@/lib/guides/data"
import { prisma } from "@/lib/prisma"
import {
  sendGuideApplicationToAdmin,
  sendGuideNewRequest,
  sendGuideRequestAccepted,
  sendGuideRequestDeclined,
  sendGuideStatusChange,
  sendGuideTripCancelled,
} from "@/lib/resend"
import { bookingReference } from "@/lib/utils"
import {
  blockDaysSchema,
  guideProfileSchema,
  guideReplySchema,
  guideRequestSchema,
  guideReviewSchema,
} from "@/lib/validations"

export type GuideActionResult = { ok: boolean; message: string; reference?: string }

/** Pending requests one traveller may have open at once, across all guides. */
const MAX_OPEN_REQUESTS = 5

function firstIssue(error: { issues: { message: string }[] }) {
  return error.issues[0]?.message ?? "Please check the form."
}

async function signedInGuide() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "GUIDE") return null
  return prisma.guideProfile.findUnique({
    where: { userId: session.user.id },
    include: { user: { select: { email: true, phone: true } } },
  })
}

function revalidateGuide(slug: string) {
  revalidatePath("/guides")
  revalidatePath(`/guides/${slug}`)
  revalidatePath("/guide", "layout")
}

// ---------------------------------------------------------------------------
// Guides
// ---------------------------------------------------------------------------

export async function updateGuideProfile(input: unknown): Promise<GuideActionResult> {
  const guide = await signedInGuide()
  if (!guide) return { ok: false, message: "Please sign in as a guide." }

  const parsed = guideProfileSchema.safeParse(input)
  if (!parsed.success) return { ok: false, message: firstIssue(parsed.error) }
  const { regionIds, dayRate, ...data } = parsed.data

  const regions = await prisma.region.findMany({ where: { id: { in: regionIds } }, select: { id: true } })
  if (regions.length === 0) return { ok: false, message: "Choose where you guide." }

  // A rejected guide who edits their profile goes back into the review queue.
  const resubmitted = guide.status === "REJECTED"

  await prisma.guideProfile.update({
    where: { id: guide.id },
    data: {
      ...data,
      photoUrl: data.photoUrl || null,
      licenceNumber: data.licenceNumber || null,
      dayRate: dayRate ?? null,
      regions: { set: regions },
      ...(resubmitted ? { status: "PENDING", adminNote: null } : {}),
    },
  })

  if (resubmitted) {
    await sendGuideApplicationToAdmin({
      displayName: data.displayName,
      email: guide.user.email ?? "",
      guideType: data.guideType,
    }).catch(() => undefined)
  }

  revalidateGuide(guide.slug)
  return {
    ok: true,
    message: resubmitted
      ? "Saved and sent back to our team for review."
      : "Your profile is saved.",
  }
}

export async function setBlockedDays(input: unknown): Promise<GuideActionResult> {
  const guide = await signedInGuide()
  if (!guide) return { ok: false, message: "Please sign in as a guide." }

  const parsed = blockDaysSchema.safeParse(input)
  if (!parsed.success) return { ok: false, message: firstIssue(parsed.error) }
  const today = todayInEgypt()
  const dates = [...new Set(parsed.data.dates)].filter((d) => d >= today)
  if (dates.length === 0) return { ok: false, message: "Choose days from today onwards." }

  if (!parsed.data.blocked) {
    await prisma.guideBlockedDay.deleteMany({
      where: { guideId: guide.id, date: { in: dates.map(fromISODate) } },
    })
    revalidateGuide(guide.slug)
    return { ok: true, message: dates.length === 1 ? "Day reopened." : `${dates.length} days reopened.` }
  }

  const { booked } = await getGuideBusyDays(guide.id)
  const clash = dates.filter((d) => booked.has(d))
  if (clash.length > 0) {
    return {
      ok: false,
      message: `You already have a trip on ${clash.map((d) => formatDay(d)).join(", ")}. Cancel it with the traveller first.`,
    }
  }

  await prisma.guideBlockedDay.createMany({
    data: dates.map((d) => ({ guideId: guide.id, date: fromISODate(d) })),
    skipDuplicates: true,
  })
  revalidateGuide(guide.slug)
  return { ok: true, message: dates.length === 1 ? "Day blocked." : `${dates.length} days blocked.` }
}

export async function respondToRequest(input: unknown): Promise<GuideActionResult> {
  const guide = await signedInGuide()
  if (!guide) return { ok: false, message: "Please sign in as a guide." }

  const parsed = guideReplySchema.safeParse(input)
  if (!parsed.success) return { ok: false, message: firstIssue(parsed.error) }
  const { requestId, decision } = parsed.data
  const reply = parsed.data.reply || null

  await expireStaleRequests({ guideId: guide.id })

  if (decision === "ACCEPT" && guide.status !== "APPROVED") {
    return { ok: false, message: "You can accept trips once your profile is approved." }
  }

  const include = { tourist: { select: { name: true, email: true } } } as const

  const outcome = await prisma.$transaction(async (tx) => {
    // One writer per guide at a time, so two accepts can't book the same day.
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${guide.id}))`

    const request = await tx.guideRequest.findFirst({
      where: { id: requestId, guideId: guide.id },
      include,
    })
    if (!request) return { error: "That request no longer exists." } as const
    if (request.status !== "PENDING") {
      return { error: `This request is already ${request.status.toLowerCase()}.` } as const
    }

    if (decision === "DECLINE") {
      const declined = await tx.guideRequest.update({
        where: { id: request.id },
        data: { status: "DECLINED", guideReply: reply, respondedAt: new Date() },
        include,
      })
      return { declined, accepted: null, bumped: [] } as const
    }

    const range = { start: toISODate(request.startDate), end: toISODate(request.endDate) }
    const { busy } = await getGuideBusyDays(guide.id, tx)
    if (!isRangeFree(range, busy)) {
      return { error: "You're already booked or have blocked some of these days." } as const
    }

    const accepted = await tx.guideRequest.update({
      where: { id: request.id },
      data: { status: "ACCEPTED", guideReply: reply, respondedAt: new Date() },
      include,
    })

    // Other pending requests for these days can no longer be taken.
    const overlapping = await tx.guideRequest.findMany({
      where: {
        guideId: guide.id,
        status: "PENDING",
        id: { not: request.id },
        startDate: { lte: request.endDate },
        endDate: { gte: request.startDate },
      },
      include,
    })
    if (overlapping.length > 0) {
      await tx.guideRequest.updateMany({
        where: { id: { in: overlapping.map((r) => r.id) } },
        data: {
          status: "DECLINED",
          guideReply: "The guide has been booked on these dates.",
          respondedAt: new Date(),
        },
      })
    }
    return { accepted, declined: null, bumped: overlapping } as const
  })

  if ("error" in outcome) return { ok: false, message: outcome.error ?? "Something went wrong." }

  const base = { guideName: guide.displayName, guideEmail: guide.user.email ?? "" }
  const email = (r: NonNullable<typeof outcome.accepted>) => ({
    ...base,
    reference: r.reference,
    touristName: r.tourist.name ?? "there",
    touristEmail: r.tourist.email ?? "",
    startDate: r.startDate,
    endDate: r.endDate,
    groupSize: r.groupSize,
    reply: r.guideReply,
  })

  await Promise.allSettled([
    ...(outcome.accepted ? [sendGuideRequestAccepted(email(outcome.accepted))] : []),
    ...(outcome.declined ? [sendGuideRequestDeclined({ ...email(outcome.declined), reason: "declined" })] : []),
    ...outcome.bumped.map((r) => sendGuideRequestDeclined({ ...email(r), reply: null, reason: "booked" })),
  ])

  revalidateGuide(guide.slug)
  revalidatePath("/account/guides")

  if (outcome.accepted) {
    const n = outcome.bumped.length
    return {
      ok: true,
      message:
        n > 0
          ? `Accepted. ${n} other ${n === 1 ? "request" : "requests"} for those days ${n === 1 ? "was" : "were"} declined for you.`
          : "Accepted. The traveller now has your contact details.",
    }
  }
  return { ok: true, message: "Declined. The traveller has been told." }
}

// ---------------------------------------------------------------------------
// Travellers
// ---------------------------------------------------------------------------

async function signedInTraveller() {
  const session = await auth()
  if (!session?.user?.id) return { error: "Please sign in to request a guide." } as const
  if (session.user.role !== "CUSTOMER") {
    return { error: "Guide requests are made from a traveller account." } as const
  }
  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user) return { error: "Please sign in again." } as const
  return { user } as const
}

export async function createGuideRequest(input: unknown): Promise<GuideActionResult> {
  const me = await signedInTraveller()
  if ("error" in me) return { ok: false, message: me.error ?? "Please sign in." }
  const { user } = me

  if (!user.phone) {
    return {
      ok: false,
      message: "Add your phone or WhatsApp number in your profile first, so your guide can reach you.",
    }
  }

  const parsed = guideRequestSchema.safeParse(input)
  if (!parsed.success) return { ok: false, message: firstIssue(parsed.error) }
  const { guideId, startDate, endDate, groupSize, message } = parsed.data
  const range = { start: startDate, end: endDate }

  const rangeError = tripRangeError(range)
  if (rangeError) return { ok: false, message: rangeError }

  const guide = await prisma.guideProfile.findFirst({
    where: { id: guideId, status: "APPROVED" },
    include: { user: { select: { email: true } } },
  })
  if (!guide) return { ok: false, message: "This guide isn't taking requests right now." }

  await expireStaleRequests({ touristId: user.id })

  const { busy } = await getGuideBusyDays(guide.id)
  const taken = eachDay(range).filter((d) => busy.has(d))
  if (taken.length > 0) {
    return {
      ok: false,
      message: `${guide.displayName} isn't available on ${taken.map((d) => formatDay(d)).join(", ")}. Please pick other dates.`,
    }
  }

  const [duplicate, openCount] = await Promise.all([
    prisma.guideRequest.findFirst({
      where: {
        guideId,
        touristId: user.id,
        status: { in: ["PENDING", "ACCEPTED"] },
        startDate: { lte: fromISODate(endDate) },
        endDate: { gte: fromISODate(startDate) },
      },
    }),
    prisma.guideRequest.count({ where: { touristId: user.id, status: "PENDING" } }),
  ])
  if (duplicate) {
    return { ok: false, message: `You already have a request with ${guide.displayName} for these dates.` }
  }
  if (openCount >= MAX_OPEN_REQUESTS) {
    return {
      ok: false,
      message: `You have ${openCount} requests waiting for an answer. Please wait for a reply or cancel one first.`,
    }
  }

  const request = await prisma.guideRequest.create({
    data: {
      reference: bookingReference().replace("EJ-", "GR-"),
      guideId,
      touristId: user.id,
      startDate: fromISODate(startDate),
      endDate: fromISODate(endDate),
      groupSize,
      message,
    },
  })

  await sendGuideNewRequest({
    reference: request.reference,
    guideName: guide.displayName,
    guideEmail: guide.user.email ?? "",
    touristName: user.name ?? "A traveller",
    touristEmail: user.email ?? "",
    startDate: request.startDate,
    endDate: request.endDate,
    groupSize,
    message,
  }).catch(() => undefined)

  revalidatePath("/account/guides")
  revalidatePath("/guide", "layout")
  return {
    ok: true,
    reference: request.reference,
    message: `Request sent to ${guide.displayName}. Guides answer within 48 hours; we'll email you either way.`,
  }
}

export async function cancelGuideRequest(requestId: string): Promise<GuideActionResult> {
  const me = await signedInTraveller()
  if ("error" in me) return { ok: false, message: me.error ?? "Please sign in." }

  const request = await prisma.guideRequest.findFirst({
    where: { id: requestId, touristId: me.user.id },
    include: { guide: { include: { user: { select: { email: true } } } } },
  })
  if (!request) return { ok: false, message: "That request no longer exists." }
  if (request.status !== "PENDING" && request.status !== "ACCEPTED") {
    return { ok: false, message: "Only open or confirmed requests can be cancelled." }
  }
  if (toISODate(request.startDate) <= todayInEgypt()) {
    return { ok: false, message: "This trip has started. Please contact your guide directly." }
  }

  await prisma.guideRequest.update({
    where: { id: request.id },
    data: { status: "CANCELLED", respondedAt: new Date() },
  })

  if (request.status === "ACCEPTED") {
    await sendGuideTripCancelled({
      reference: request.reference,
      guideName: request.guide.displayName,
      guideEmail: request.guide.user.email ?? "",
      touristName: me.user.name ?? "The traveller",
      touristEmail: me.user.email ?? "",
      startDate: request.startDate,
      endDate: request.endDate,
      groupSize: request.groupSize,
    }).catch(() => undefined)
  }

  revalidateGuide(request.guide.slug)
  revalidatePath("/account/guides")
  return { ok: true, message: "Request cancelled." }
}

export async function submitGuideReview(input: unknown): Promise<GuideActionResult> {
  const me = await signedInTraveller()
  if ("error" in me) return { ok: false, message: me.error ?? "Please sign in." }

  const parsed = guideReviewSchema.safeParse(input)
  if (!parsed.success) return { ok: false, message: firstIssue(parsed.error) }

  const request = await prisma.guideRequest.findFirst({
    where: { id: parsed.data.requestId, touristId: me.user.id },
    include: { review: true, guide: { select: { slug: true } } },
  })
  if (!request || request.status !== "ACCEPTED") {
    return { ok: false, message: "You can review a guide after a trip they accepted." }
  }
  if (toISODate(request.endDate) > todayInEgypt()) {
    return { ok: false, message: "You can leave a review from the last day of your trip." }
  }
  if (request.review) return { ok: false, message: "You've already reviewed this trip." }

  await prisma.guideReview.create({
    data: {
      guideId: request.guideId,
      touristId: me.user.id,
      requestId: request.id,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
    },
  })

  revalidateGuide(request.guide.slug)
  revalidatePath("/account/guides")
  return { ok: true, message: "Thank you! Your review is live on the guide's profile." }
}

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

export async function setGuideStatus(
  guideId: string,
  status: "APPROVED" | "REJECTED" | "SUSPENDED",
  note?: string
): Promise<GuideActionResult> {
  if (!(await isAdmin())) return { ok: false, message: "Admins only." }
  if (status === "REJECTED" && !note?.trim()) {
    return { ok: false, message: "Tell the guide what to change so they can reapply." }
  }

  const guide = await prisma.guideProfile.update({
    where: { id: guideId },
    data: { status, adminNote: note?.trim() || null },
    include: { user: { select: { email: true } } },
  })

  await sendGuideStatusChange({
    displayName: guide.displayName,
    email: guide.user.email ?? "",
    status,
    note: guide.adminNote,
  }).catch(() => undefined)

  revalidateGuide(guide.slug)
  revalidatePath("/admin/guides")
  const done = { APPROVED: "approved", REJECTED: "sent back", SUSPENDED: "suspended" }[status]
  return { ok: true, message: `${guide.displayName} ${done}.` }
}

export async function setGuideReviewHidden(reviewId: string, hidden: boolean): Promise<GuideActionResult> {
  if (!(await isAdmin())) return { ok: false, message: "Admins only." }
  const review = await prisma.guideReview.update({
    where: { id: reviewId },
    data: { hidden },
    include: { guide: { select: { slug: true } } },
  })
  revalidateGuide(review.guide.slug)
  revalidatePath("/admin/guides/reviews")
  return { ok: true, message: hidden ? "Review hidden." : "Review visible again." }
}
