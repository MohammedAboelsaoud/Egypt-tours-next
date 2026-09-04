import type { Metadata } from "next"
import Image from "next/image"
import { Award, Compass, HeartHandshake, Users } from "lucide-react"

import { CtaBanner } from "@/components/home/cta-banner"
import { PageHero } from "@/components/layout/page-hero"
import { SectionHeading } from "@/components/ui/section-heading"
import { getSettings } from "@/lib/settings"

export const metadata: Metadata = {
  title: "About us",
  description:
    "Egypt Journeys is a Cairo-based travel company building private, tailor-made trips across Egypt with licensed Egyptologist guides.",
  alternates: { canonical: "/about" },
}

const VALUES = [
  {
    icon: Compass,
    title: "We only sell Egypt",
    body: "One country, known properly. We are not a global agency with an Egypt page — this is all we do, and it is where we live.",
  },
  {
    icon: Users,
    title: "Small groups, private guides",
    body: "No coach parties. Most of our trips run with one family or one couple, at whatever pace suits them that day.",
  },
  {
    icon: Award,
    title: "Licensed and insured",
    body: "Ministry of Tourism licence #4412. Every guide is degree-qualified in Egyptology and licensed to work at the sites.",
  },
  {
    icon: HeartHandshake,
    title: "Fair to the people who host you",
    body: "We pay guides and drivers above the market rate, book directly with family-run hotels, and never take kickbacks from shops.",
  },
]

const TEAM = [
  {
    name: "Nadia Farouk",
    role: "Founder & lead planner",
    bio: "Twenty years designing trips through Egypt, and still answers the phone at 11pm when a flight moves.",
    image: "/img/cairo-giza.jpg",
  },
  {
    name: "Hossam El-Deeb",
    role: "Head of guiding",
    bio: "Egyptologist, ex-Supreme Council of Antiquities. Knows which tombs are open this month before the ticket office does.",
    image: "/img/luxor-aswan.jpg",
  },
  {
    name: "Mariam Sabry",
    role: "Red Sea & Sinai",
    bio: "PADI instructor turned trip designer. Builds the diving weeks and the Sinai crossings.",
    image: "/img/sinai-red-sea.jpg",
  },
]

export default async function AboutPage() {
  const settings = await getSettings()

  return (
    <>
      <PageHero
        eyebrow="About us"
        title="A small Cairo company that plans Egypt properly"
        description="We started in 2007 with one guide, one car and a conviction that Egypt deserves better than a fixed-departure coach tour. That has not changed."
        image="/img/nile-felucca.jpg"
        crumbs={[{ label: "About" }]}
        size="tall"
      />

      <section className="container-page section-y">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="eyebrow">Our story</p>
            <h2 className="mt-3 font-heading text-3xl sm:text-4xl">
              Built by people who grew up here
            </h2>
            <div className="mt-5 gold-rule" />

            <div className="mt-7 space-y-4 text-lg leading-relaxed text-muted-foreground">
              <p>
                Egypt Journeys began when Nadia Farouk, then a guide at Giza, got
                tired of watching visitors spend eleven days in Egypt and see it
                through a coach window. She started planning trips herself — one
                family at a time, with the guides she trusted.
              </p>
              <p>
                Eighteen years later we are a team of twenty-two: planners in
                Zamalek, guides in Cairo, Luxor and Sharm, and drivers who have
                been with us since the beginning. We have hosted more than four
                thousand travellers and we still write every itinerary by hand.
              </p>
              <p>
                What we sell is judgement — knowing that the Valley of the Kings
                is better at 6am in July, that the Grand Egyptian Museum needs a
                full day, and that a felucca at sunset will be the thing you
                remember.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="relative aspect-[3/4] overflow-hidden rounded-2xl sm:mt-10">
              <Image
                src="/img/cairo-giza.jpg"
                alt="The Sphinx and the Giza plateau"
                fill
                sizes="(min-width: 640px) 25vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="relative aspect-[3/4] overflow-hidden rounded-2xl">
              <Image
                src="/img/luxor-aswan.jpg"
                alt="Columns at Karnak Temple, Luxor"
                fill
                sizes="(min-width: 640px) 25vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-ivory">
        <div className="container-page section-y">
          <SectionHeading
            eyebrow="What we stand for"
            title="Four things we won't compromise on"
            align="center"
            className="mb-14"
          />

          <div className="grid gap-6 sm:grid-cols-2">
            {VALUES.map((value) => (
              <div
                key={value.title}
                className="rounded-2xl border border-border bg-sand p-8"
              >
                <div className="flex size-12 items-center justify-center rounded-xl bg-gold/10 text-gold">
                  <value.icon className="size-5" />
                </div>
                <h3 className="mt-6 font-heading text-xl">{value.title}</h3>
                <p className="mt-3 leading-relaxed text-muted-foreground">
                  {value.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page section-y">
        <SectionHeading
          eyebrow="The team"
          title="Who you'll actually be talking to"
          description="Your planner stays with you from the first email to the last transfer — no handovers, no call centre."
          className="mb-14"
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TEAM.map((person) => (
            <article
              key={person.name}
              className="overflow-hidden rounded-2xl border border-border bg-ivory"
            >
              <div className="relative aspect-[4/3]">
                <Image
                  src={person.image}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 33vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
              </div>
              <div className="p-6">
                <h3 className="font-heading text-xl">{person.name}</h3>
                <p className="mt-1 text-sm text-gold">{person.role}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {person.bio}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <CtaBanner whatsapp={settings.whatsappNumber} />
    </>
  )
}
