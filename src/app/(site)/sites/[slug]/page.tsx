import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ArrowRight, Lightbulb, MapPin } from "lucide-react"

import { BreadcrumbJsonLd } from "@/components/layout/breadcrumb"
import { PageHero } from "@/components/layout/page-hero"
import { SiteCard } from "@/components/sites/site-card"
import { Gallery } from "@/components/ui/gallery"
import { SectionHeading } from "@/components/ui/section-heading"
import { SITE } from "@/lib/constants"
import { prisma } from "@/lib/prisma"
import { getSettings } from "@/lib/settings"
import { parseFact, parseHistory } from "@/lib/sites/history"

export const revalidate = 600

export async function generateStaticParams() {
  try {
    const sites = await prisma.historicSite.findMany({ where: { published: true }, select: { slug: true } })
    return sites.map((site) => ({ slug: site.slug }))
  } catch {
    // Table not created yet (first deploy): pages render on first visit instead.
    return []
  }
}

async function getSite(slug: string) {
  return prisma.historicSite.findFirst({
    where: { slug, published: true },
    include: { region: { select: { slug: true, name: true, published: true } } },
  })
}

export async function generateMetadata({ params }: PageProps<"/sites/[slug]">): Promise<Metadata> {
  const { slug } = await params
  const site = await getSite(slug)
  if (!site) return { title: "Site not found" }
  return {
    title: site.name,
    description: site.summary.slice(0, 160),
    alternates: { canonical: `/sites/${slug}` },
    openGraph: { title: site.name, description: site.summary.slice(0, 200), images: [{ url: site.imageUrl }] },
  }
}

export default async function HistoricSitePage({ params }: PageProps<"/sites/[slug]">) {
  const { slug } = await params
  const [site, settings] = await Promise.all([getSite(slug), getSettings()])
  if (!site) notFound()

  const [guides, others] = await Promise.all([
    prisma.guideProfile.count({ where: { status: "APPROVED", regions: { some: { id: site.regionId } } } }).catch(() => 0),
    prisma.historicSite.findMany({
      where: { regionId: site.regionId, published: true, NOT: { id: site.id } },
      orderBy: { sortOrder: "asc" },
      take: 3,
      select: { slug: true, name: true, period: true, summary: true, imageUrl: true },
    }),
  ])

  const chapters = parseHistory(site.history)
  const facts = site.facts.map(parseFact)
  const whatsappHref = `https://wa.me/${settings.whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(
    `Hello! I'd like to visit ${site.name} with a guide.`
  )}`

  const crumbs = [{ label: "Historic sites", href: "/sites" }, { label: site.name }]
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name: site.name,
    description: site.summary,
    url: `${SITE.url}/sites/${site.slug}`,
    image: site.imageUrl,
    ...(site.location ? { address: site.location } : {}),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <BreadcrumbJsonLd items={crumbs} baseUrl={SITE.url} />

      <PageHero eyebrow={site.period} title={site.name} description={site.summary} image={site.imageUrl} crumbs={crumbs} size="tall">
        {site.location && (
          <p className="mt-6 flex items-center gap-2 text-sm text-white/85">
            <MapPin className="size-4 text-sun" />
            {site.location}
          </p>
        )}
      </PageHero>

      <div className="container-page section-y">
        <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
          <article className="min-w-0 space-y-12">
            {chapters.map((chapter, index) => (
              <section key={index}>
                {chapter.heading && (
                  <>
                    <h2 className="font-heading text-3xl">{chapter.heading}</h2>
                    <div className="mt-4 horizon-rule" />
                  </>
                )}
                <div className="mt-6 space-y-4 text-lg leading-relaxed text-muted-foreground">
                  {chapter.paragraphs.map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}

            {site.galleryUrls.length > 0 && (
              <section>
                <h2 className="font-heading text-2xl">Photos</h2>
                <div className="mt-6">
                  <Gallery images={[site.imageUrl, ...site.galleryUrls]} alt={site.name} />
                </div>
              </section>
            )}

            {site.imageCredit && <p className="text-xs text-muted-foreground">Main photo: {site.imageCredit}</p>}

            {site.tips.length > 0 && (
              <section className="rounded-2xl border border-border bg-papyrus p-6 sm:p-8">
                <h2 className="flex items-center gap-2 font-heading text-2xl">
                  <Lightbulb className="size-6 text-ochre" /> Visiting tips
                </h2>
                <ul className="mt-5 space-y-3">
                  {site.tips.map((tip) => (
                    <li key={tip} className="flex gap-3 leading-relaxed">
                      <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-sun" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </article>

          <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
            {facts.length > 0 && (
              <dl className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-papyrus">
                {facts.map((fact, i) => (
                  <div key={i} className="px-6 py-4">
                    {fact.label && (
                      <dt className="text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">{fact.label}</dt>
                    )}
                    <dd className="mt-1 text-sm">{fact.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            <div className="rounded-2xl border border-border bg-papyrus p-6">
              <h2 className="font-heading text-xl">See it with a guide</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {guides > 0
                  ? `${guides} licensed guide${guides === 1 ? "" : "s"} work in ${site.region.name}.`
                  : "A local guide brings the history to life."}
              </p>
              <div className="mt-5 flex flex-col gap-2">
                <Link
                  href="/guides"
                  className="inline-flex h-11 items-center justify-center rounded-lg bg-lapis text-sm font-medium text-white hover:bg-lapis-deep"
                >
                  Find a guide
                </Link>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 items-center justify-center rounded-lg border border-border text-sm font-medium hover:border-lapis hover:text-lapis"
                >
                  Ask us on WhatsApp
                </a>
              </div>
            </div>

            {site.region.published && (
              <Link
                href={`/destinations/${site.region.slug}`}
                className="flex items-center justify-between rounded-2xl border border-border bg-papyrus p-6 text-sm font-medium text-lapis hover:border-lapis"
              >
                Plan a trip to {site.region.name}
                <ArrowRight className="size-4" />
              </Link>
            )}
            <Link href="/sites" className="flex items-center gap-2 px-1 text-sm text-muted-foreground hover:text-basalt">
              <ArrowLeft className="size-4" /> All historic sites
            </Link>
          </aside>
        </div>
      </div>

      {others.length > 0 && (
        <section className="bg-papyrus">
          <div className="container-page section-y">
            <SectionHeading eyebrow="Nearby" title={`More in ${site.region.name}`} className="mb-12" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((other) => (
                <SiteCard key={other.slug} site={other} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
