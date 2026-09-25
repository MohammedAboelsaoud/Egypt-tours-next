import Image from "next/image"
import Link from "next/link"
import { Languages, MapPin } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Rating } from "@/components/ui/rating"
import { cn, formatPrice, initials, toNumber } from "@/lib/utils"

export type GuideCardData = {
  slug: string
  displayName: string
  guideType: string
  bio: string
  photoUrl: string | null
  languages: string[]
  yearsExperience: number
  dayRate: unknown
  currency: string
  regions: { slug: string; name: string }[]
  rating: { average: number; count: number } | null
}

/** A guide's photo, or their initials on lapis when there isn't one yet. */
export function GuidePortrait({
  guide,
  sizes,
  className,
}: {
  guide: Pick<GuideCardData, "displayName" | "photoUrl">
  sizes: string
  className?: string
}) {
  return (
    <span className={cn("relative block overflow-hidden bg-lapis", className)}>
      {guide.photoUrl ? (
        <Image src={guide.photoUrl} alt={guide.displayName} fill sizes={sizes} className="object-cover" />
      ) : (
        <span aria-hidden className="absolute inset-0 flex items-center justify-center font-heading text-4xl text-sun">
          {initials(guide.displayName)}
        </span>
      )}
    </span>
  )
}

export function GuideCard({ guide, query = "" }: { guide: GuideCardData; query?: string }) {
  const href = `/guides/${guide.slug}${query}`
  const rate = guide.dayRate === null || guide.dayRate === undefined ? null : toNumber(guide.dayRate)

  return (
    <article className="group card-hover relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-papyrus">
      <GuidePortrait guide={guide} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="aspect-[4/3]" />

      <div className="flex flex-1 flex-col p-6">
        <Badge variant="cartouche">{guide.guideType}</Badge>
        <h3 className="mt-3 font-heading text-xl leading-snug">
          <Link href={href} className="transition-colors after:absolute after:inset-0 hover:text-lapis">
            {guide.displayName}
          </Link>
        </h3>

        <p className="mt-2 flex items-start gap-1.5 text-sm text-muted-foreground">
          <MapPin className="mt-0.5 size-3.5 shrink-0 text-lapis" />
          {guide.regions.map((r) => r.name).join(" · ")}
        </p>
        <p className="mt-1 flex items-start gap-1.5 text-sm text-muted-foreground">
          <Languages className="mt-0.5 size-3.5 shrink-0 text-lapis" />
          {guide.languages.join(" · ")}
        </p>

        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{guide.bio}</p>

        <div className="mt-4">
          {guide.rating && guide.rating.count > 0 ? (
            <Rating value={guide.rating.average} count={guide.rating.count} showValue />
          ) : (
            <p className="text-xs text-muted-foreground">New guide · no reviews yet</p>
          )}
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 pt-6">
          <div>
            {rate !== null ? (
              <>
                <p className="text-[0.65rem] tracking-[0.14em] text-muted-foreground uppercase">From</p>
                <p className="font-heading text-2xl text-lapis tabular-nums">{formatPrice(rate, guide.currency, { compact: true })}</p>
                <p className="text-xs text-muted-foreground">per day</p>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">Fee agreed per trip</p>
            )}
          </div>
          <span className="relative z-10 text-sm font-medium text-basalt transition-colors group-hover:text-lapis">
            View profile →
          </span>
        </div>
      </div>
    </article>
  )
}
