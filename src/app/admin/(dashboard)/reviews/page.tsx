import type { Metadata } from "next"
import Link from "next/link"

import { ReviewActions } from "@/components/admin/review-actions"
import { AdminHeader, TableEmpty } from "@/components/admin/ui"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Rating } from "@/components/ui/rating"
import { prisma } from "@/lib/prisma"
import { formatDateTime, initials } from "@/lib/utils"

export const metadata: Metadata = { title: "Reviews" }

export default async function AdminReviewsPage({
  searchParams,
}: PageProps<"/admin/reviews">) {
  const params = await searchParams
  const filter = typeof params.filter === "string" ? params.filter : "pending"

  const where =
    filter === "approved"
      ? { approved: true }
      : filter === "all"
        ? {}
        : { approved: false }

  const [reviews, pendingCount, totalCount] = await Promise.all([
    prisma.review.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        tour: { select: { title: true, slug: true } },
      },
      take: 200,
    }),
    prisma.review.count({ where: { approved: false } }),
    prisma.review.count(),
  ])

  const tabs = [
    { key: "pending", label: `Pending (${pendingCount})` },
    { key: "approved", label: "Published" },
    { key: "all", label: `All (${totalCount})` },
  ]

  return (
    <>
      <AdminHeader
        title="Reviews"
        description="Reviews stay hidden until you approve them."
      />

      <div className="mb-6 flex gap-2">
        {tabs.map((tab) => (
          <a
            key={tab.key}
            href={`/admin/reviews?filter=${tab.key}`}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filter === tab.key
                ? "bg-lapis/12 text-lapis"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {tab.label}
          </a>
        ))}
      </div>

      {reviews.length > 0 ? (
        <ul className="space-y-4">
          {reviews.map((review) => (
            <li
              key={review.id}
              className="rounded-2xl border border-border bg-papyrus p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar className="size-10">
                    <AvatarFallback className="bg-lapis/15 text-xs font-semibold text-lapis">
                      {initials(review.user.name)}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <p className="text-sm font-medium">
                      {review.user.name ?? "Traveller"}
                      {review.approved && (
                        <span className="ml-3 rounded-full bg-faience/12 px-2.5 py-1 text-xs font-medium text-faience">
                          Published
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {review.user.email} · {formatDateTime(review.createdAt)}
                    </p>
                  </div>
                </div>

                <ReviewActions
                  id={review.id}
                  approved={review.approved}
                  author={review.user.name ?? "Traveller"}
                />
              </div>

              <div className="mt-5 border-t border-border pt-5">
                <div className="flex flex-wrap items-center gap-3">
                  <Rating value={review.rating} />
                  <Link
                    href={`/tours/${review.tour.slug}`}
                    target="_blank"
                    className="text-xs text-muted-foreground hover:text-lapis"
                  >
                    {review.tour.title} ↗
                  </Link>
                </div>

                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {review.comment}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-2xl border border-border bg-papyrus">
          <TableEmpty
            message={
              filter === "pending"
                ? "Nothing waiting for moderation."
                : "No reviews here."
            }
          />
        </div>
      )}
    </>
  )
}
