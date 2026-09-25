import { CalendarHeart, MessageSquareHeart, ScrollText } from "lucide-react"

import { SectionHeading } from "@/components/ui/section-heading"

const PILLARS = [
  {
    icon: CalendarHeart,
    title: "Tailor-made, not off the shelf",
    body: "Every itinerary is built from scratch around your dates, your pace and what you actually want to see. Nothing here is a fixed departure you have to squeeze into.",
  },
  {
    icon: ScrollText,
    title: "Egyptologist guides",
    body: "Your guide holds a degree in Egyptology and a Ministry of Tourism licence. They read the walls, know which tomb reopened last month, and know when to leave you alone with the view.",
  },
  {
    icon: MessageSquareHeart,
    title: "A single point of contact",
    body: "One planner from your first email to your last transfer — reachable on WhatsApp while you travel. No call centres, no handovers, no repeating yourself.",
  },
]

export function WhyUs() {
  return (
    <section className="bg-papyrus">
      <div className="container-page section-y">
        <SectionHeading
          eyebrow="Why travel with us"
          title="The difference is in who plans it"
          align="center"
          className="mb-14"
        />

        <div className="grid gap-6 md:grid-cols-3">
          {PILLARS.map((pillar) => (
            <div
              key={pillar.title}
              className="group rounded-2xl border border-border bg-limestone p-8 transition-colors duration-300 hover:border-lapis/40"
            >
              <div className="flex size-12 items-center justify-center rounded-xl bg-lapis/10 text-lapis transition-colors duration-300 group-hover:bg-lapis group-hover:text-white">
                <pillar.icon className="size-5" />
              </div>
              <h3 className="mt-6 font-heading text-xl">{pillar.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {pillar.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
