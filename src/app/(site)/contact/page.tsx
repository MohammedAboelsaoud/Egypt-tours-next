import type { Metadata } from "next"
import { Clock, Mail, MapPin } from "lucide-react"

import { ContactForm } from "@/components/contact-form"
import { WhatsAppIcon } from "@/components/icons"
import { PageHero } from "@/components/page-hero"
import { SITE } from "@/data/site"
import { whatsappLink } from "@/lib/whatsapp"

export const metadata: Metadata = {
  title: "Contact",
  description: `Plan your Egypt trip with ${SITE.name} on WhatsApp or by email.`,
}

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Let's plan your trip"
        description="The quickest way to reach us is WhatsApp. Fill in the form and it will write the message for you — or just say hello."
        image="/img/cairo-giza.jpg"
      />

      <section className="container-page section-y grid gap-10 lg:grid-cols-[360px_1fr]">
        <aside className="space-y-4">
          <a
            href={whatsappLink("Hello! I'd like to plan a trip to Egypt.")}
            target="_blank"
            rel="noreferrer"
            className="card flex items-center gap-4 border-whatsapp/40 p-6 hover:bg-whatsapp/5"
          >
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-whatsapp text-white">
              <WhatsAppIcon className="size-6" />
            </span>
            <span>
              <span className="block font-semibold">Chat on WhatsApp</span>
              <span className="text-sm text-muted-foreground">Fastest reply</span>
            </span>
          </a>
          <a href={`mailto:${SITE.email}`} className="card flex items-center gap-4 p-6 hover:bg-muted">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold">
              <Mail className="size-5" />
            </span>
            <span>
              <span className="block font-semibold">Email</span>
              <span className="text-sm break-all text-muted-foreground">{SITE.email}</span>
            </span>
          </a>
          <div className="card space-y-3 p-6 text-sm">
            <p className="flex gap-3"><Clock className="size-4 shrink-0 text-gold" />{SITE.hours}</p>
            {SITE.location && <p className="flex gap-3"><MapPin className="size-4 shrink-0 text-gold" />{SITE.location}</p>}
          </div>
        </aside>

        <div>
          <h2 className="text-3xl">Tell us about your trip</h2>
          <p className="mt-2 mb-6 text-muted-foreground">Nothing is booked or paid until we confirm with you.</p>
          <ContactForm />
        </div>
      </section>
    </>
  )
}
