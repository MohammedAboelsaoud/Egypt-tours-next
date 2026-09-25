import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ArrowRight, Lightbulb, MapPin } from "lucide-react"

import { Gallery } from "@/components/gallery"
import { WhatsAppIcon } from "@/components/icons"
import { PageHero } from "@/components/page-hero"
import { SiteCard } from "@/components/site-card"
import { getDestination } from "@/data/destinations"
import { GUIDES } from "@/data/guides"
import { getSite, SITES } from "@/data/sites"
import { whatsappLink } from "@/lib/whatsapp"

export const dynamicParams = false

export function generateStaticParams() {
  return SITES.map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: PageProps<"/sites/[slug]">): Promise<Metadata> {
  const site = getSite((await params).slug)
  return site ? { title: site.name, description: site.summary } : {}
}

export default async function SitePage({ params }: PageProps<"/sites/[slug]">) {
  const site = getSite((await params).slug)
  if (!site) notFound()

  const area = getDestination(site.area)
  const guides = GUIDES.filter((g) => g.areas.includes(site.area))
  const others = SITES.filter((s) => s.area === site.area && s.slug !== site.slug).slice(0, 3)
  const photos = [{ src: site.image, caption: site.name, credit: site.imageCredit }, ...(site.gallery ?? []).filter((p) => p.src !== site.image)]

  return (
    <>
      <PageHero eyebrow={site.period} title={site.name} description={site.summary} image={site.image}>
        <p className="mt-6 flex items-center gap-2 text-sm text-white/80">
          <MapPin className="size-4 text-gold-light" /> {site.location}
        </p>
      </PageHero>

      <article className="container-page section-y grid gap-12 lg:grid-cols-[1fr_320px]">
        <div className="max-w-3xl">
          {site.chapters.map((chapter) => (
            <section key={chapter.heading} className="mb-10">
              <h2 className="text-3xl">{chapter.heading}</h2>
              {chapter.body.split(/\n\s*\n/).map((para, i) => (
                <p key={i} className="mt-4 text-[1.05rem] leading-relaxed text-ink/85">{para}</p>
              ))}
            </section>
          ))}

          {photos.length > 1 && (
            <section className="mb-10">
              <h2 className="text-3xl">Photos</h2>
              <Gallery photos={photos} className="mt-5" />
            </section>
          )}

          {site.tips.length > 0 && (
            <section className="rounded-2xl bg-gold/10 p-6 sm:p-8">
              <h2 className="flex items-center gap-2 text-2xl"><Lightbulb className="size-6 text-gold" /> Visiting tips</h2>
              <ul className="mt-4 space-y-2.5">
                {site.tips.map((tip) => (
                  <li key={tip} className="flex gap-3 leading-relaxed">
                    <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-gold" />
                    {tip}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="space-y-4">
          {site.facts.length > 0 && (
            <dl className="card divide-y divide-border">
              {site.facts.map((f) => (
                <div key={f.label} className="px-6 py-4">
                  <dt className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{f.label}</dt>
                  <dd className="mt-1 text-sm">{f.value}</dd>
                </div>
              ))}
            </dl>
          )}
          <div className="card p-6">
            <h2 className="font-sans text-sm font-semibold">See it with a guide</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {guides.length > 0 ? `Our ${guides.map((g) => g.title).join(" or ")} will bring ${site.name} to life.` : "We can arrange a local guide."}
            </p>
            <a
              href={whatsappLink(`Hello! I'd like to visit ${site.name} with a guide.`)}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-whatsapp text-sm font-semibold text-white hover:bg-whatsapp-dark"
            >
              <WhatsAppIcon className="size-4" /> Ask on WhatsApp
            </a>
          </div>
          {area && (
            <Link href={`/destinations/${area.slug}/`} className="card flex items-center justify-between p-6 text-sm font-semibold text-gold hover:bg-muted">
              Plan a trip to {area.name} <ArrowRight className="size-4" />
            </Link>
          )}
          <Link href="/sites/" className="flex items-center gap-2 px-2 text-sm text-muted-foreground hover:text-ink">
            <ArrowLeft className="size-4" /> All historic sites
          </Link>
        </aside>
      </article>

      {others.length > 0 && (
        <section className="bg-ivory">
          <div className="container-page section-y">
            <h2 className="text-3xl">More in {area?.name}</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((s) => <SiteCard key={s.slug} site={s} />)}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
