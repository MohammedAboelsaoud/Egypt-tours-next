import Image from "next/image"
import { MapPin } from "lucide-react"

import { Stars } from "@/components/stars"
import { WhatsAppRequest } from "@/components/whatsapp-request"
import type { Hotel } from "@/data/hotels"
import { REQUEST_FORMS } from "@/lib/request-forms"
import { formatUSD } from "@/lib/utils"

export function HotelCard({ hotel }: { hotel: Hotel }) {
  return (
    <article className="card card-hover flex flex-col">
      <div className="relative aspect-[16/10]">
        <Image src={hotel.image} alt={hotel.name} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
        <span className="absolute top-3 right-3 rounded-md bg-ink/85 px-2 py-1 text-xs font-semibold text-white backdrop-blur-sm">
          {hotel.rating.toFixed(1)}
          <span className="font-normal text-white/60">/10</span>
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
            <MapPin className="size-3.5" />
            {hotel.city}
          </p>
          <Stars count={hotel.stars} />
        </div>
        <h3 className="mt-2 text-xl leading-snug">{hotel.name}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{hotel.description}</p>
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {hotel.features.map((f) => (
            <li key={f} className="rounded-full bg-muted px-2.5 py-1 text-xs text-ink/75">{f}</li>
          ))}
        </ul>

        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <p>
            <span className="text-xs text-muted-foreground">from about</span>
            <span className="block font-heading text-2xl">
              {formatUSD(hotel.pricePerNight)}
              <span className="font-sans text-sm text-muted-foreground"> /night</span>
            </span>
          </p>
          <WhatsAppRequest
            subject={`${hotel.name} (${hotel.city})`}
            fields={REQUEST_FORMS.hotel}
            estimate={{ price: hotel.pricePerNight, per: "Nights", unit: "night" }}
            label="Request"
          />
        </div>
      </div>
    </article>
  )
}
