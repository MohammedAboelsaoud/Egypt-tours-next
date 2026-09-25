import type { Metadata } from "next"

import { Rating } from "@/components/ui/rating"
import { currentGuideProfile, getGuideRatings } from "@/lib/guides/data"
import { prisma } from "@/lib/prisma"
import { formatDate } from "@/lib/utils"

export const metadata: Metadata = { title: "My reviews", robots: { index: false, follow: false } }

export default async function GuideReviewsPage() {
  const guide = await currentGuideProfile()
  if (!guide) return null

  const [reviews, ratings] = await Promise.all([
    prisma.guideReview.findMany({
      where: { guideId: guide.id, hidden: false },
      orderBy: { createdAt: "desc" },
      include: { tourist: { select: { name: true, nationality: true } } },
    }),
    getGuideRatings([guide.id]),
  ])
  const rating = ratings.get(guide.id)

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-papyrus p-7">
        {rating ? (
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-heading text-5xl tabular-nums">{rating.average.toFixed(1)}</span>
            <Rating value={rating.average} count={rating.count} size="md" />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No reviews yet. Travellers can rate you from the last day of a trip you accepted.
          </p>
        )}
      </div>

      {reviews.map((review) => (
        <article key={review.id} className="rounded-2xl border border-border bg-papyrus p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Rating value={review.rating} />
            <span className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</span>
          </div>
          <p className="mt-3 leading-relaxed">{review.comment}</p>
          <p className="mt-3 text-sm text-muted-foreground">
            {review.tourist.name ?? "Traveller"}
            {review.tourist.nationality && ` · ${review.tourist.nationality}`}
          </p>
        </article>
      ))}
    </div>
  )
}
