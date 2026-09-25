import type { Metadata } from "next"
import Link from "next/link"

import { PageHero } from "@/components/layout/page-hero"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { FAQ_GROUPS } from "@/lib/faq"

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Visas, safety, best time to visit, tipping, dress code, payment and cancellation — the questions travellers ask us most about Egypt.",
  alternates: { canonical: "/faq" },
}

export default function FaqPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_GROUPS.flatMap((group) =>
      group.items.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      }))
    ),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageHero
        eyebrow="Good to know"
        title="Questions travellers ask us most"
        description="Visas, safety, seasons, tipping and the practical detail of travelling in Egypt. If yours isn't here, just ask."
        crumbs={[{ label: "FAQ" }]}
      />

      <div className="container-page section-y">
        <div className="mx-auto max-w-3xl space-y-14">
          {FAQ_GROUPS.map((group) => (
            <section key={group.title}>
              <h2 className="font-heading text-2xl">{group.title}</h2>
              <div className="mt-6 horizon-rule" />

              <Accordion className="mt-6">
                {group.items.map((item) => (
                  <AccordionItem key={item.q} value={item.q}>
                    <AccordionTrigger className="text-left font-heading text-lg">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="leading-relaxed text-muted-foreground">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          ))}

          <div className="rounded-2xl border border-lapis/25 bg-gradient-to-br from-lapis/10 to-transparent p-8 text-center">
            <h2 className="font-heading text-2xl">Still have a question?</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
              Ask us anything — we answer every enquiry personally, usually the
              same day.
            </p>
            <Link
              href="/contact"
              className="mt-6 inline-block rounded-lg bg-lapis px-7 py-3 text-sm font-medium text-white transition-colors hover:bg-lapis-deep"
            >
              Get in touch
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
