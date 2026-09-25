import type { Metadata } from "next"
import { CalendarCheck, ShieldCheck, Star, UserRoundCheck } from "lucide-react"

import { PageHero } from "@/components/layout/page-hero"
import { ButtonLink } from "@/components/ui/button-link"
import { SectionHeading } from "@/components/ui/section-heading"

export const metadata: Metadata = {
  title: "Guide with us",
  description: "Licensed Egyptologists, Nubian and Bedouin guides: get trip requests from travellers who already know what they want.",
  alternates: { canonical: "/guides/join" },
}

const STEPS = [
  {
    icon: UserRoundCheck,
    title: "Create your profile",
    body: "Tell travellers who you are, where you guide, your languages and specialties. Add a friendly photo.",
  },
  {
    icon: ShieldCheck,
    title: "We review it",
    body: "Our team checks every guide before they go live, usually within two business days.",
  },
  {
    icon: CalendarCheck,
    title: "Accept the trips you want",
    body: "Travellers request your dates. You accept or decline within 48 hours. Block days off whenever you like.",
  },
  {
    icon: Star,
    title: "Build your reputation",
    body: "After each trip, travellers rate you. Good reviews bring more requests.",
  },
]

export default function GuideJoinPage() {
  return (
    <>
      <PageHero
        eyebrow="For guides"
        title="Guide travellers who chose you"
        description="Egypt Journeys connects licensed guides with travellers planning private trips. You set your calendar and your rate; you only take the trips you want."
        image="/img/luxor-aswan.jpg"
        crumbs={[{ label: "Guides", href: "/guides" }, { label: "Guide with us" }]}
      >
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/guides/register" className="h-12 px-7 text-base">
            Apply to guide
          </ButtonLink>
          <ButtonLink
            href="/guides/login"
            variant="outline"
            className="h-12 border-white/40 bg-white/10 px-7 text-base text-white backdrop-blur-sm hover:bg-white/20 hover:text-white"
          >
            Guide sign in
          </ButtonLink>
        </div>
      </PageHero>

      <section className="container-page section-y">
        <SectionHeading eyebrow="How it works" title="Four steps to your first trip" align="center" className="mb-14" />
        <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <li key={step.title} className="rounded-2xl border border-border bg-papyrus p-7">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-lg bg-accent text-lapis">
                  <step.icon className="size-5" />
                </span>
                <span className="text-xs font-semibold tracking-[0.14em] text-ochre uppercase">Step {index + 1}</span>
              </div>
              <h3 className="mt-5 font-heading text-xl">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>
    </>
  )
}
