import Link from "next/link"
import { Quote } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Rating } from "@/components/ui/rating"
import { SectionHeading } from "@/components/ui/section-heading"
import { initials } from "@/lib/utils"

export type TestimonialData = {
  id: string
  rating: number
  comment: string
  author: string
  tourTitle: string
  tourSlug: string
}

export function Testimonials({ reviews }: { reviews: TestimonialData[] }) {
  if (reviews.length === 0) return null

  return (
    <section className="relative overflow-hidden bg-basalt">
      <div
        className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-lapis/10 blur-3xl"
        aria-hidden
      />
      <div className="container-page section-y relative">
        <div className="mb-14 text-center">
          <p className="eyebrow text-sun">In their words</p>
          <h2 className="mt-3 font-heading text-3xl text-white text-balance sm:text-4xl">
            4.9 out of 5, from travellers who came back
          </h2>
          <div className="mx-auto mt-5 h-px w-16 bg-gradient-to-r from-sun to-transparent" />
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {reviews.slice(0, 6).map((review) => (
            <figure
              key={review.id}
              className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur-sm transition-colors hover:border-sun/30"
            >
              <Quote className="size-7 text-sun/50" />
              <Rating value={review.rating} className="mt-5" />
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-white/80">
                “{review.comment}”
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-white/10 pt-5">
                <Avatar className="size-10">
                  <AvatarFallback className="bg-lapis/20 text-xs font-semibold text-sun">
                    {initials(review.author)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">
                    {review.author}
                  </p>
                  <Link
                    href={`/tours/${review.tourSlug}`}
                    className="truncate text-xs text-white/55 transition-colors hover:text-sun"
                  >
                    {review.tourTitle}
                  </Link>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
