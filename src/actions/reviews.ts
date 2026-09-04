"use server"

import { revalidatePath } from "next/cache"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { reviewSchema } from "@/lib/validations"

export type ReviewActionResult = { ok: boolean; message: string }

/**
 * Submits a review. Reviews are held for admin approval before they appear,
 * and a traveller may only review a tour once.
 */
export async function submitReview(
  _prev: ReviewActionResult | null,
  formData: FormData
): Promise<ReviewActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, message: "Please sign in to leave a review." }
  }

  const parsed = reviewSchema.safeParse({
    tourId: formData.get("tourId"),
    rating: formData.get("rating"),
    comment: formData.get("comment"),
  })

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Please check your review.",
    }
  }

  const tour = await prisma.tour.findUnique({
    where: { id: parsed.data.tourId },
    select: { slug: true },
  })
  if (!tour) return { ok: false, message: "That tour no longer exists." }

  const existing = await prisma.review.findFirst({
    where: { tourId: parsed.data.tourId, userId: session.user.id },
  })
  if (existing) {
    return { ok: false, message: "You have already reviewed this tour." }
  }

  await prisma.review.create({
    data: {
      tourId: parsed.data.tourId,
      userId: session.user.id,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
    },
  })

  revalidatePath(`/tours/${tour.slug}`)
  return {
    ok: true,
    message: "Thank you — your review will appear once it has been approved.",
  }
}
