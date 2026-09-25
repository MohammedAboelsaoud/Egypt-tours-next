import Image from "next/image"
import Link from "next/link"
import { MapPin, Star, Users } from "lucide-react"

import { cn, formatPrice, toNumber } from "@/lib/utils"

export type HotelCardData = {
  slug: string
  name: string
  description: string
  imageUrl: string
  starRating: number
  pricePerNight: unknown
  currency: string
  maxGuests: number
  amenities: string[]
  region: { name: string; slug: string }
}

export function HotelCard({
  hotel,
  className,
  priority = false,
}: {
  hotel: HotelCardData
  className?: string
  priority?: boolean
}) {
  return (
    <article
      className={cn(
        "group card-hover relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-papyrus",
        className
      )}
    >
      <Link
        href={`/hotels/${hotel.slug}`}
        className="relative block aspect-[4/3] overflow-hidden"
      >
        <Image
          src={hotel.imageUrl}
          alt={hotel.name}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-basalt/70 via-transparent to-transparent" />

        <span className="absolute top-4 left-4 flex items-center gap-0.5 rounded-full bg-papyrus/95 px-2.5 py-1">
          {Array.from({ length: hotel.starRating }).map((_, i) => (
            <Star key={i} className="size-3 fill-sun text-ochre" />
          ))}
        </span>

        <span className="absolute bottom-4 left-4 flex items-center gap-1.5 text-xs font-medium text-white">
          <MapPin className="size-3.5" />
          {hotel.region.name}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-heading text-xl leading-snug">
          <Link
            href={`/hotels/${hotel.slug}`}
            className="transition-colors after:absolute after:inset-0 hover:text-lapis"
          >
            {hotel.name}
          </Link>
        </h3>

        <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {hotel.description}
        </p>

        <ul className="mt-4 flex flex-wrap gap-1.5">
          {hotel.amenities.slice(0, 3).map((amenity) => (
            <li
              key={amenity}
              className="rounded-full bg-muted px-2.5 py-1 text-[0.7rem] text-muted-foreground"
            >
              {amenity}
            </li>
          ))}
          {hotel.amenities.length > 3 && (
            <li className="rounded-full bg-muted px-2.5 py-1 text-[0.7rem] text-muted-foreground">
              +{hotel.amenities.length - 3} more
            </li>
          )}
        </ul>

        <div className="mt-auto flex items-end justify-between gap-3 pt-6">
          <div>
            <p className="font-heading text-2xl text-lapis">
              {formatPrice(toNumber(hotel.pricePerNight), hotel.currency, {
                compact: true,
              })}
            </p>
            <p className="text-xs text-muted-foreground">per night</p>
          </div>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="size-3.5" />
            Sleeps {hotel.maxGuests}
          </span>
        </div>
      </div>
    </article>
  )
}
