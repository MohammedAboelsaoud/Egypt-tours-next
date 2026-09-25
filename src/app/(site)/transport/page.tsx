import type { Metadata } from "next"
import Image from "next/image"
import { Bus, Car, CarFront, Check, Users, Van } from "lucide-react"

import { PageHero } from "@/components/page-hero"
import { WhatsAppRequest } from "@/components/whatsapp-request"
import { VEHICLES, type Vehicle } from "@/data/transport"
import { REQUEST_FORMS } from "@/lib/request-forms"
import { formatUSD } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Transport",
  description: "Private cars, SUVs and minivans with driver, and a 49-seat Superjet bus for groups — daily prices in USD.",
}

const ICONS: Record<Vehicle["kind"], typeof Car> = { car: Car, suv: CarFront, van: Van, bus: Bus }

export default function TransportPage() {
  const cars = VEHICLES.filter((v) => v.kind !== "bus")
  const buses = VEHICLES.filter((v) => v.kind === "bus")

  return (
    <>
      <PageHero
        eyebrow="Transport"
        title="Cars, minivans and buses with driver"
        description="Airport pickups, day trips and long drives between cities. Prices are approximate per day; the final price depends on your route and we confirm it on WhatsApp before you book."
        image="/img/el-alamein.jpg"
      />

      <section className="container-page section-y">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {cars.map((v) => (
            <VehicleCard key={v.id} vehicle={v} />
          ))}
        </div>

        {buses.map((bus) => {
          const Icon = ICONS[bus.kind]
          return (
            <article key={bus.id} className="card mt-10 grid gap-8 bg-ink p-8 text-white sm:p-10 lg:grid-cols-[auto_1fr_auto] lg:items-center">
              {bus.image ? (
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl lg:w-64">
                  <Image src={bus.image} alt={`${bus.name} — ${bus.model}`} fill sizes="(min-width: 1024px) 256px, 100vw" className="object-cover" />
                </div>
              ) : (
                <span className="flex size-20 items-center justify-center rounded-2xl bg-white/10 text-gold-light">
                  <Icon className="size-10" />
                </span>
              )}
              <div>
                <p className="eyebrow text-gold-light">For groups</p>
                <h2 className="mt-2 text-3xl">{bus.name}</h2>
                <p className="mt-1 text-white/60">{bus.model}</p>
                <p className="mt-4 max-w-2xl leading-relaxed text-white/80">{bus.description}</p>
                <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/80">
                  {bus.features.map((f) => (
                    <li key={f} className="flex items-center gap-1.5"><Check className="size-4 text-gold-light" />{f}</li>
                  ))}
                </ul>
              </div>
              <div className="lg:text-right">
                <p className="font-heading text-2xl">{bus.pricePerDay == null ? "Price on request" : `${formatUSD(bus.pricePerDay)}/day`}</p>
                <WhatsAppRequest subject={`${bus.name} (${bus.model})`} fields={REQUEST_FORMS.bus} label="Get a quote" className="mt-4 w-full lg:w-auto" />
              </div>
            </article>
          )
        })}
      </section>
    </>
  )
}

function VehicleCard({ vehicle: v }: { vehicle: Vehicle }) {
  const Icon = ICONS[v.kind]
  return (
    <article className="card card-hover flex flex-col">
      <div className="relative flex aspect-[16/10] items-center justify-center bg-gold/10 text-gold">
        {v.image ? (
          <Image src={v.image} alt={`${v.name} — ${v.model}`} fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
        ) : (
          <Icon className="size-14" aria-hidden="true" />
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
      <h2 className="text-2xl">{v.name}</h2>
      <p className="text-sm text-muted-foreground">{v.model}</p>
      <p className="mt-3 flex items-center gap-1.5 text-sm">
        <Users className="size-4 text-gold" /> Up to {v.seats} passengers
      </p>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{v.description}</p>
      <ul className="mt-4 space-y-1.5 text-sm">
        {v.features.map((f) => (
          <li key={f} className="flex items-center gap-2"><Check className="size-4 text-teal" />{f}</li>
        ))}
      </ul>
      <div className="mt-auto pt-6">
        <p className="font-heading text-3xl">
          {v.pricePerDay == null ? "On request" : formatUSD(v.pricePerDay)}
          {v.pricePerDay != null && <span className="font-sans text-sm text-muted-foreground"> /day</span>}
        </p>
        <WhatsAppRequest
          subject={`${v.name} — ${v.model}`}
          fields={REQUEST_FORMS.vehicle}
          estimate={v.pricePerDay == null ? undefined : { price: v.pricePerDay, per: "Days", unit: "day" }}
          className="mt-4 w-full"
        />
        {v.imageCredit && <p className="mt-3 text-[0.7rem] text-muted-foreground">Photo: {v.imageCredit}</p>}
      </div>
      </div>
    </article>
  )
}
