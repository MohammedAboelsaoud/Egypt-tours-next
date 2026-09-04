import Image from "next/image"
import Link from "next/link"
import { Fuel, MapPin, Settings2, Users } from "lucide-react"

import { cn, formatPrice, toNumber } from "@/lib/utils"

export type CarCardData = {
  slug: string
  name: string
  description: string
  imageUrl: string
  type: string
  seats: number
  transmission: string
  fuelType: string
  pricePerDay: unknown
  currency: string
  available: boolean
  region: { name: string; slug: string }
}

export function CarCard({
  car,
  className,
  priority = false,
}: {
  car: CarCardData
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
      <Link
        href={`/car-rentals/${car.slug}`}
        className="relative block aspect-[16/10] overflow-hidden bg-muted"
      >
        <Image
          src={car.imageUrl}
          alt={car.name}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <span className="absolute top-4 left-4 rounded-full bg-ivory/95 px-3 py-1 text-[0.65rem] font-semibold tracking-[0.12em] text-ink uppercase">
          {car.type}
        </span>
        {!car.available && (
          <span className="absolute top-4 right-4 rounded-full bg-ink/85 px-3 py-1 text-[0.65rem] font-semibold tracking-[0.12em] text-white uppercase">
            Unavailable
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-6">
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="size-3.5 text-gold" />
          {car.region.name}
        </span>

        <h3 className="mt-2 font-heading text-xl leading-snug">
          <Link
            href={`/car-rentals/${car.slug}`}
            className="transition-colors after:absolute after:inset-0 hover:text-gold"
          >
            {car.name}
          </Link>
        </h3>

        <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {car.description}
        </p>

        <dl className="mt-5 grid grid-cols-3 gap-2 border-y border-border py-3 text-center text-xs">
          <div>
            <dt className="sr-only">Seats</dt>
            <dd className="flex flex-col items-center gap-1 text-muted-foreground">
              <Users className="size-4 text-gold" />
              {car.seats} seats
            </dd>
          </div>
          <div>
            <dt className="sr-only">Transmission</dt>
            <dd className="flex flex-col items-center gap-1 text-muted-foreground">
              <Settings2 className="size-4 text-gold" />
              {car.transmission}
            </dd>
          </div>
          <div>
            <dt className="sr-only">Fuel</dt>
            <dd className="flex flex-col items-center gap-1 text-muted-foreground">
              <Fuel className="size-4 text-gold" />
              {car.fuelType}
            </dd>
          </div>
        </dl>

        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div>
            <p className="font-heading text-2xl text-gold">
              {formatPrice(toNumber(car.pricePerDay), car.currency, {
                compact: true,
              })}
            </p>
            <p className="text-xs text-muted-foreground">per day, with driver</p>
          </div>
          <span className="relative z-10 text-sm font-medium text-ink transition-colors group-hover:text-gold">
            Details →
          </span>
        </div>
      </div>
    </article>
  )
}
