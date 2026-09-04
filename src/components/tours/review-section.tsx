"use client"

import Link from "next/link"
import { useActionState, useState } from "react"
import { useSession } from "next-auth/react"
import { Star } from "lucide-react"

import { submitReview, type ReviewActionResult } from "@/actions/reviews"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ButtonLink } from "@/components/ui/button-link"
import { Rating } from "@/components/ui/rating"
import { Textarea } from "@/components/ui/textarea"
import { cn, formatDate, initials } from "@/lib/utils"

export type ReviewItem = {
  id: string
  rating: number
  comment: string
  author: string
  createdAt: string
}

export function ReviewSection({
  tourId,
  reviews,
  average,
}: {
  tourId: string
  reviews: ReviewItem[]
  average: number
}) {
  const { status } = useSession()
  const [rating, setRating] = useState(5)
  const [state, formAction, pending] = useActionState<
    ReviewActionResult | null,
    FormData
  >(submitReview, null)

  return (
    <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr]">
      <div>
        {reviews.length > 0 ? (
          <>
            <div className="flex items-baseline gap-4">
              <span className="font-heading text-5xl text-gold">
                {average.toFixed(1)}
              </span>
              <div>
                <Rating value={average} size="md" />
                <p className="mt-1 text-sm text-muted-foreground">
                  Based on {reviews.length}{" "}
                  {reviews.length === 1 ? "review" : "reviews"}
                </p>
              </div>
            </div>

            <ul className="mt-8 space-y-6">
              {reviews.map((review) => (
                <li
                  key={review.id}
                  className="rounded-2xl border border-border bg-ivory p-6"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="size-10">
                      <AvatarFallback className="bg-gold/15 text-xs font-semibold text-gold">
                        {initials(review.author)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{review.author}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(review.createdAt)}
                      </p>
                    </div>
                    <Rating value={review.rating} className="ml-auto" />
                  </div>
                  <p className="mt-4 leading-relaxed text-muted-foreground">
                    {review.comment}
                  </p>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="text-muted-foreground">
            No reviews yet — be the first to write one.
          </p>
        )}
      </div>

      <div className="h-fit rounded-2xl border border-border bg-ivory p-6 lg:sticky lg:top-28">
        <h3 className="font-heading text-xl">Write a review</h3>

        {status === "authenticated" ? (
          <form action={formAction} className="mt-5 space-y-4">
            <input type="hidden" name="tourId" value={tourId} />
            <input type="hidden" name="rating" value={rating} />

            <div>
              <span className="mb-2 block text-sm font-medium">Your rating</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    aria-label={`${value} star${value > 1 ? "s" : ""}`}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      className={cn(
                        "size-6",
                        value <= rating
                          ? "fill-gold text-gold"
                          : "fill-transparent text-muted-foreground/40"
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="comment" className="mb-2 block text-sm font-medium">
                Your review
              </label>
              <Textarea
                id="comment"
                name="comment"
                rows={5}
                required
                minLength={10}
                placeholder="What did you enjoy? How was your guide?"
              />
            </div>

            {state && (
              <p
                className={cn(
                  "text-sm",
                  state.ok ? "text-teal" : "text-destructive"
                )}
              >
                {state.message}
              </p>
            )}

            <Button
              type="submit"
              disabled={pending}
              className="h-11 w-full bg-gold text-white hover:bg-gold-light"
            >
              {pending ? "Submitting…" : "Submit review"}
            </Button>

            <p className="text-xs text-muted-foreground">
              Reviews are published once our team has checked them.
            </p>
          </form>
        ) : (
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">
              Sign in to share your experience of this tour.
            </p>
            <ButtonLink href="/login" className="mt-4 h-11 w-full bg-gold text-white hover:bg-gold-light">
              Sign in to review
            </ButtonLink>
          </div>
        )}
      </div>
    </div>
  )
}
