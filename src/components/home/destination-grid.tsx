import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

import { SectionHeading } from "@/components/ui/section-heading"
import { cn } from "@/lib/utils"

export type DestinationCardData = {
  slug: string
  name: string
  tagline: string
  imageUrl: string
  cities: string[]
  _count?: { tours: number }
}

export function DestinationGrid({
  regions,
  heading = true,
  className,
}: {
  regions: DestinationCardData[]
  heading?: boolean
  className?: string
}) {
  return (
    <section className={cn("container-page section-y", className)}>
      {heading && (
        <SectionHeading
          eyebrow="Where to go"
          title="Four Egypts, one country"
          description="Each region has its own season, its own pace and its own reason to go. Most trips combine two."
          action={
            <Link
              href="/destinations"
              className="group hidden items-center gap-2 text-sm font-medium text-gold sm:flex"
            >
              All destinations
              <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          }
          className="mb-12"
        />
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {regions.map((region, index) => (
          <Link
            key={region.slug}
            href={`/destinations/${region.slug}`}
            className="group relative aspect-[3/4] overflow-hidden rounded-2xl"
          >
            <Image
              src={region.imageUrl}
              alt={region.name}
              fill
              priority={index < 2}
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/25 to-transparent transition-opacity duration-300 group-hover:from-ink/95" />

            <div className="absolute inset-x-0 bottom-0 p-6">
              <p className="text-[0.65rem] font-semibold tracking-[0.16em] text-gold-light uppercase">
                {region._count ? `${region._count.tours} tours` : "Explore"}
              </p>
              <h3 className="mt-2 font-heading text-2xl text-white">
                {region.name}
              </h3>
              <p className="mt-2 line-clamp-2 text-sm text-white/75">
                {region.tagline}
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-white opacity-0 transition-all duration-300 group-hover:opacity-100">
                Discover
                <ArrowUpRight className="size-4" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
