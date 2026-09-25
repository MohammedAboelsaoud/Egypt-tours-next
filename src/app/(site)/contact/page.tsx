import type { Metadata } from "next"
import { Suspense } from "react"
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react"

import { ContactForm } from "@/components/contact/contact-form"
import { PageHero } from "@/components/layout/page-hero"
import { prisma } from "@/lib/prisma"
import { getSettings } from "@/lib/settings"

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Tell us your dates and we'll send a tailor-made Egypt itinerary within one business day. No deposit, no obligation.",
  alternates: { canonical: "/contact" },
}

export default async function ContactPage() {
  const [regions, settings] = await Promise.all([
    prisma.region.findMany({
      where: { published: true },
      orderBy: { sortOrder: "asc" },
      select: { slug: true, name: true },
    }),
    getSettings(),
  ])

  const waHref = `https://wa.me/${settings.whatsappNumber.replace(/\D/g, "")}`

  return (
    <>
      <PageHero
        eyebrow="Start planning"
        title="Tell us your dates. We'll do the rest."
        description="Send us a few lines about the trip you have in mind and a specialist will reply within one business day with a draft itinerary and real prices."
        crumbs={[{ label: "Contact" }]}
      />

      <div className="container-page section-y">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:gap-14">
          <Suspense
            fallback={
              <div className="h-[40rem] animate-pulse rounded-2xl bg-muted" />
            }
          >
            <ContactForm regions={regions} />
          </Suspense>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-border bg-papyrus p-7">
              <h2 className="font-heading text-xl">Reach us directly</h2>

              <ul className="mt-6 space-y-5 text-sm">
                <li className="flex gap-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-lapis/10 text-lapis">
                    <Phone className="size-4" />
                  </span>
                  <span>
                    <span className="block text-xs tracking-[0.12em] text-muted-foreground uppercase">
                      Phone
                    </span>
                    <a
                      href={`tel:${settings.contactPhone.replace(/\s/g, "")}`}
                      className="mt-1 block font-medium hover:text-lapis"
                    >
                      {settings.contactPhone}
                    </a>
                  </span>
                </li>

                <li className="flex gap-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-lapis/10 text-lapis">
                    <Mail className="size-4" />
                  </span>
                  <span>
                    <span className="block text-xs tracking-[0.12em] text-muted-foreground uppercase">
                      Email
                    </span>
                    <a
                      href={`mailto:${settings.contactEmail}`}
                      className="mt-1 block font-medium hover:text-lapis"
                    >
                      {settings.contactEmail}
                    </a>
                  </span>
                </li>

                <li className="flex gap-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-lapis/10 text-lapis">
                    <MapPin className="size-4" />
                  </span>
                  <span>
                    <span className="block text-xs tracking-[0.12em] text-muted-foreground uppercase">
                      Office
                    </span>
                    <span className="mt-1 block font-medium">
                      {settings.address}
                    </span>
                  </span>
                </li>

                <li className="flex gap-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-lapis/10 text-lapis">
                    <Clock className="size-4" />
                  </span>
                  <span>
                    <span className="block text-xs tracking-[0.12em] text-muted-foreground uppercase">
                      Hours
                    </span>
                    <span className="mt-1 block font-medium">
                      Sun–Thu, 9am – 6pm (EET)
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      WhatsApp answered 7 days a week
                    </span>
                  </span>
                </li>
              </ul>

              <a
                href={waHref}
                target="_blank"
                rel="noreferrer"
                className="mt-7 flex items-center justify-center gap-2 rounded-lg bg-[#25D366] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#20bd5a]"
              >
                <MessageCircle className="size-4" />
                Chat on WhatsApp
              </a>
            </div>

            <div className="rounded-2xl border border-lapis/25 bg-gradient-to-br from-lapis/10 to-transparent p-7">
              <h2 className="font-heading text-xl">What happens next</h2>
              <ol className="mt-5 space-y-4 text-sm text-muted-foreground">
                {[
                  "A specialist reads your notes and picks the right region and season.",
                  "You get a draft itinerary with day-by-day detail and a real price.",
                  "We revise it until it's right — usually two or three rounds.",
                  "You book online by card through Stripe, and we take it from there.",
                ].map((step, index) => (
                  <li key={step} className="flex gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-lapis text-xs font-semibold text-white">
                      {index + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </div>
      </div>
    </>
  )
}
