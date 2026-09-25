import type { Metadata } from "next"

import { HotelBrowser } from "@/components/hotel-browser"
import { PageHero } from "@/components/page-hero"
import { DESTINATIONS } from "@/data/destinations"
import { HOTELS } from "@/data/hotels"

export const metadata: Metadata = {
  title: "Hotels",
  description: "Hand-picked hotels in Cairo, Luxor, Aswan, the North Coast, Sharm El Sheikh, Dahab and St. Catherine — with prices in USD.",
}

export default function HotelsPage() {
  return (
    <>
      <PageHero
        eyebrow="Hotels"
        title="Hand-picked places to stay"
        description="Two of the best hotels in every region — one for comfort, one for value. Prices are approximate per room per night; we confirm the exact rate for your dates on WhatsApp."
        image="/img/nile-felucca.jpg"
      />
      <section className="container-page py-12 sm:py-16">
        <HotelBrowser hotels={HOTELS} areas={DESTINATIONS.map(({ slug, name }) => ({ slug, name }))} />
      </section>
    </>
  )
}
