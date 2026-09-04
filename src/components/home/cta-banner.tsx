import Image from "next/image"
import Link from "next/link"
import { ArrowRight, MessageCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ButtonLink } from "@/components/ui/button-link"

export function CtaBanner({ whatsapp }: { whatsapp: string }) {
  const waHref = `https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
    "Hello! I'd like to plan a trip to Egypt."
  )}`

  return (
    <section className="relative isolate overflow-hidden">
      <Image
        src="/img/nile-felucca.jpg"
        alt=""
        fill
        sizes="100vw"
        className="-z-10 object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/92 via-ink/75 to-ink/55" />

      <div className="container-page py-20 sm:py-28">
        <div className="max-w-2xl">
          <p className="eyebrow text-gold-light">Ready when you are</p>
          <h2 className="mt-4 font-heading text-3xl leading-tight text-white text-balance sm:text-4xl lg:text-5xl">
            Tell us your dates. We&apos;ll send an itinerary within a day.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-white/80">
            No deposit to see a plan, no obligation to book it. Just a real
            itinerary with real prices, written for your trip.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/contact" className="h-13 bg-gold px-8 text-base text-white hover:bg-gold-light">
              Plan my trip
              <ArrowRight className="size-4" />
            </ButtonLink>
            <ButtonLink href={waHref} external variant="outline"
              className="h-13 border-white/40 bg-white/10 px-8 text-base text-white backdrop-blur-sm hover:bg-white/20 hover:text-white">
              <MessageCircle className="size-4" />
              Chat on WhatsApp
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  )
}
