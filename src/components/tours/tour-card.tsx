import Image from "next/image"
import Link from "next/link"
import { Clock, MapPin, Users } from "lucide-react"

import { Rating } from "@/components/ui/rating"
import { cn, formatPrice, toNumber } from "@/lib/utils"

export type TourCardData = {
  slug: string
  title: string
  summary: string
  imageUrl: string
  durationDays: number
  priceFrom: unknown
  currency: string
  maxGroupSize: number
  featured?: boolean
  region: { name: string; slug: string }
  rating?: { average: number; count: number } | null
}

export function TourCard({
  tour,
  className,
  priority = false,
}: {
  tour: TourCardData
  className?: string
  priority?: boolean
}) {
  return (
    <article
      className={cn(
        "group card-hover relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-ivory",
        className
      )}
    >
      <Link href={`/tours/${tour.slug}`} className="relative block aspect-[4/3] overflow-hidden">
        <Image
          src={tour.imageUrl}
          alt={tour.title}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />

        {tour.featured && (
          <span className="absolute top-4 left-4 rounded-full bg-gold px-3 py-1 text-[0.65rem] font-semibold tracking-[0.12em] text-white uppercase">
            Popular
          </span>
        )}

        <span className="absolute bottom-4 left-4 flex items-center gap-1.5 text-xs font-medium text-white">
          <MapPin className="size-3.5" />
          {tour.region.name}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Clock className="size-3.5 text-gold" />
            {tour.durationDays} {tour.durationDays === 1 ? "day" : "days"}
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="size-3.5 text-gold" />
            Max {tour.maxGroupSize}
          </span>
        </div>

        <h3 className="mt-3 font-heading text-xl leading-snug">
          <Link
            href={`/tours/${tour.slug}`}
            className="transition-colors after:absolute after:inset-0 hover:text-gold"
          >
            {tour.title}
          </Link>
        </h3>

        <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {tour.summary}
        </p>

        {tour.rating && tour.rating.count > 0 && (
          <Rating
            value={tour.rating.average}
            count={tour.rating.count}
            className="mt-4"
          />
        )}

        <div className="mt-auto flex items-end justify-between gap-3 pt-6">
          <div>
            <p className="text-[0.65rem] tracking-[0.14em] text-muted-foreground uppercase">
              From
            </p>
            <p className="font-heading text-2xl text-gold">
              {formatPrice(toNumber(tour.priceFrom), tour.currency, { compact: true })}
            </p>
            <p className="text-xs text-muted-foreground">per person</p>
          </div>
          <span className="relative z-10 text-sm font-medium text-ink transition-colors group-hover:text-gold">
            View tour →
          </span>
        </div>
      </div>
    </article>
  )
}
