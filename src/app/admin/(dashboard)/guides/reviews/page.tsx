import type { Metadata } from "next"
import Link from "next/link"

import { GuideReviewToggle } from "@/components/admin/guide-actions"
import { AdminHeader, TableEmpty } from "@/components/admin/ui"
import { Badge } from "@/components/ui/badge"
import { Rating } from "@/components/ui/rating"
import { prisma } from "@/lib/prisma"
import { formatDateTime } from "@/lib/utils"

export const metadata: Metadata = { title: "Guide reviews" }

export default async function AdminGuideReviewsPage() {
  const reviews = await prisma.guideReview.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      tourist: { select: { name: true, email: true } },
      guide: { select: { displayName: true, slug: true } },
      request: { select: { reference: true } },
    },
  })

  return (
    <>
      <AdminHeader
        title="Guide reviews"
        description="Only travellers with a completed trip can review, and reviews go live straight away. Hide any that break the rules."
        action={{ href: "/admin/guides", label: "Back to guides" }}
      />
      {reviews.length === 0 ? (
        <TableEmpty message="No guide reviews yet." />
      ) : (
        <ul className="space-y-4">
          {reviews.map((review) => (
            <li key={review.id} className="rounded-2xl border border-border bg-papyrus p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm">
                    <span className="font-medium">{review.tourist.name}</span>{" "}
                    <span className="text-muted-foreground">({review.tourist.email}) about </span>
                    <Link href={`/guides/${review.guide.slug}`} className="font-medium text-lapis hover:underline">{review.guide.displayName}</Link>
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{review.request.reference} · {formatDateTime(review.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  {review.hidden && <Badge variant="destructive">Hidden</Badge>}
                  <GuideReviewToggle reviewId={review.id} hidden={review.hidden} />
                </div>
              </div>
              <Rating value={review.rating} className="mt-3" />
              <p className="mt-2 leading-relaxed">{review.comment}</p>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
