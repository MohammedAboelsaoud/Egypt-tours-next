import Image from "next/image"
import Link from "next/link"
import { ArrowRight, ArrowUpRight, BedDouble, CarFront, CircleCheck, Compass, MousePointerClick, UserRound } from "lucide-react"

import { AskAssistantButton } from "@/components/ask-assistant-button"
import { WhatsAppIcon } from "@/components/icons"
import { SectionHeading } from "@/components/section-heading"
import { DESTINATIONS } from "@/data/destinations"
import { GUIDES } from "@/data/guides"
import { HOTELS } from "@/data/hotels"
import { SITE } from "@/data/site"
import { VEHICLES } from "@/data/transport"
import { formatUSD } from "@/lib/utils"
import { whatsappLink } from "@/lib/whatsapp"

const cheapestHotel = Math.min(...HOTELS.map((h) => h.pricePerNight))
const cheapestCar = Math.min(...VEHICLES.flatMap((v) => (v.pricePerDay == null ? [] : [v.pricePerDay])))

const SERVICES = [
  {
    icon: UserRound,
    title: "Tour guides",
    text: `${GUIDES.map((g) => g.title).join(", ")} — local experts for every region.`,
    price: "Price per programme",
    href: "/guides/",
  },
  {
    icon: BedDouble,
    title: "Hotels",
    text: `${HOTELS.length} hand-picked hotels, from mountain lodges to palace hotels on the Nile.`,
    price: `From ${formatUSD(cheapestHotel)}/night`,
    href: "/hotels/",
  },
  {
    icon: CarFront,
    title: "Transport",
    text: "Sedans, SUVs and minivans with driver, plus a 49-seat bus for groups.",
    price: `From ${formatUSD(cheapestCar)}/day`,
    href: "/transport/",
  },
]

const STEPS = [
  { icon: MousePointerClick, title: "Choose", text: "Pick a destination, hotel, car or guide on the site — or ask our assistant." },
  { icon: WhatsAppIcon, title: "Message", text: "Tap “Request on WhatsApp”. Your message is written for you — just send it." },
  { icon: CircleCheck, title: "We confirm", text: "We check availability and confirm everything with you personally. No online payment." },
]

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative isolate flex min-h-[88vh] items-center overflow-hidden bg-ink">
        <Image src="/img/hero.jpg" alt="The pyramids of Giza at sunrise" fill priority sizes="100vw" className="-z-10 object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/70 via-ink/45 to-ink/85" />

        <div className="container-page w-full pt-28 pb-20">
          <div className="max-w-3xl">
            <p className="flex items-center gap-2.5 text-[0.7rem] font-semibold tracking-[0.22em] text-gold-light uppercase">
              <Compass className="size-4" />
              Cairo · Luxor · Aswan · North Coast · Sinai
            </p>
            <h1 className="mt-6 text-[2.6rem] leading-[1.05] text-balance text-white sm:text-6xl lg:text-7xl">
              Your Egypt trip,
              <span className="block text-gold-light">one message away</span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-white/85">
              We connect you with trusted local tour guides, hotels and drivers across Egypt. Choose what you need,
              send us a WhatsApp — we arrange the rest.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <a
                href={whatsappLink("Hello! I'd like to plan a trip to Egypt.")}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-13 items-center justify-center gap-2 rounded-lg bg-whatsapp px-7 text-base font-semibold text-white hover:bg-whatsapp-dark"
              >
                <WhatsAppIcon className="size-5" />
                Plan my trip on WhatsApp
              </a>
              <Link
                href="/destinations/"
                className="inline-flex h-13 items-center justify-center gap-2 rounded-lg border border-white/40 bg-white/10 px-7 text-base font-medium text-white backdrop-blur-sm hover:bg-white/20"
              >
                Explore destinations
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* What we arrange */}
      <section className="container-page section-y">
        <SectionHeading
          eyebrow="What we do"
          title="Everything you need on the ground, from one contact"
          description={`${SITE.name} works with local guides, hotels and drivers we trust. You tell us what you need — we book it and stay in touch throughout your trip.`}
        />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {SERVICES.map((s) => (
            <Link key={s.title} href={s.href} className="card card-hover group p-7">
              <span className="flex size-12 items-center justify-center rounded-xl bg-gold/10 text-gold">
                <s.icon className="size-6" />
              </span>
              <h3 className="mt-5 text-2xl">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
              <p className="mt-5 flex items-center justify-between text-sm font-semibold text-gold">
                {s.price}
                <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Destinations */}
      <section className="bg-ivory">
        <div className="container-page section-y">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading eyebrow="Where to go" title="Four regions, four different Egypts" />
            <Link href="/destinations/" className="flex items-center gap-2 text-sm font-semibold text-gold hover:underline">
              All destinations <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {DESTINATIONS.map((d) => (
              <Link key={d.slug} href={`/destinations/${d.slug}/`} className="group relative aspect-[3/4] overflow-hidden rounded-2xl">
                <Image src={d.image} alt="" fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/25 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <h3 className="text-2xl text-white">{d.name}</h3>
                  <p className="mt-2 text-sm text-white/80">{d.tagline}</p>
                  {d.spots && (
                    <p className="mt-3 text-xs font-semibold tracking-wide text-gold-light">{d.spots.map((s) => s.name).join(" · ")}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="container-page section-y">
        <SectionHeading center eyebrow="How it works" title="Book in three simple steps" description="No accounts, no online payments, no forms to lose. Just a conversation." />
        <ol className="mt-12 grid gap-5 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <li key={step.title} className="card p-7">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-full bg-ink font-heading text-white">{i + 1}</span>
                <step.icon className="size-6 text-gold" />
              </div>
              <h3 className="mt-5 text-xl">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* CTA */}
      <section className="container-page pb-20">
        <div className="relative isolate overflow-hidden rounded-3xl bg-ink px-6 py-14 text-center sm:px-12">
          <Image src="/img/nile-felucca.jpg" alt="" fill sizes="100vw" className="-z-10 object-cover opacity-35" />
          <h2 className="mx-auto max-w-2xl text-3xl text-balance text-white sm:text-4xl">Not sure where to start?</h2>
          <p className="mx-auto mt-4 max-w-xl text-white/80">
            Ask our assistant about Egyptian history and trip ideas, or message us directly and a real person will help you plan.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href={whatsappLink("Hello! I'd like help planning a trip to Egypt.")}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-whatsapp px-6 font-semibold text-white hover:bg-whatsapp-dark"
            >
              <WhatsAppIcon className="size-5" />
              Message us on WhatsApp
            </a>
            <AskAssistantButton className="h-12 justify-center rounded-lg border border-white/40 bg-white/10 px-6 font-medium text-white backdrop-blur-sm hover:bg-white/20" />
          </div>
        </div>
      </section>
    </>
  )
}
