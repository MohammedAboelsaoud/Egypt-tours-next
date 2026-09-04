import { NextResponse } from "next/server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { reviewSchema } from "@/lib/validations"

/** GET /api/reviews?tour=slug — approved reviews for a tour. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const tourSlug = searchParams.get("tour")

  const reviews = await prisma.review.findMany({
    where: {
      approved: true,
      ...(tourSlug ? { tour: { slug: tourSlug } } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: { select: { name: true } },
      tour: { select: { title: true, slug: true } },
    },
  })

  return NextResponse.json({
    reviews: reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      author: review.user.name ?? "Traveller",
      tour: review.tour,
      createdAt: review.createdAt,
    })),
  })
}

/** POST /api/reviews — submit a review (held for moderation). */
export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const parsed = reviewSchema.safeParse(await request.json().catch(() => ({})))
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid review" },
      { status: 400 }
    )
  }

  const existing = await prisma.review.findFirst({
    where: { tourId: parsed.data.tourId, userId: session.user.id },
  })
  if (existing) {
    return NextResponse.json(
      { error: "You have already reviewed this tour." },
      { status: 409 }
    )
  }

  const review = await prisma.review.create({
    data: {
      tourId: parsed.data.tourId,
      userId: session.user.id,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
    },
  })

  return NextResponse.json({ ok: true, id: review.id }, { status: 201 })
}
