import type { Metadata } from "next"
import Link from "next/link"

import { CtaBanner } from "@/components/home/cta-banner"
import { PageHero } from "@/components/layout/page-hero"
import { SiteCard } from "@/components/sites/site-card"
import { EmptyState } from "@/components/ui/empty-state"
import { SectionHeading } from "@/components/ui/section-heading"
import { prisma } from "@/lib/prisma"
import { getSettings } from "@/lib/settings"

export const revalidate = 60

export const metadata: Metadata = {
  title: "Historic Sites",
  description:
    "A catalog of Egypt's great historic sites — the pyramids, Karnak, the Valley of the Kings, Abu Simbel, St. Catherine's and more — with their history and tips for visiting.",
  alternates: { canonical: "/sites" },
}

async function getCatalog() {
  try {
    return await prisma.region.findMany({
      where: { published: true, sites: { some: { published: true } } },
      orderBy: { sortOrder: "asc" },
      select: {
        slug: true,
        name: true,
        tagline: true,
        sites: {
          where: { published: true },
          orderBy: { sortOrder: "asc" },
          select: { slug: true, name: true, period: true, summary: true, imageUrl: true },
        },
      },
    })
  } catch {
    // The catalog table is created on the server's first start after deploying.
    return []
  }
}

export default async function SitesPage() {
  const [regions, settings] = await Promise.all([getCatalog(), getSettings()])
  const count = regions.reduce((total, region) => total + region.sites.length, 0)

  return (
    <>
      <PageHero
        eyebrow="Historic sites"
        title="Egypt's great monuments, and the stories behind them"
        description={`Five thousand years of history, site by site${count ? ` — ${count} places` : ""}. Read before you go, then let one of our guides show you in person.`}
        image="/img/luxor-aswan.jpg"
        crumbs={[{ label: "Historic sites" }]}
      >
        {regions.length > 1 && (
          <nav aria-label="Jump to region" className="mt-8 flex flex-wrap gap-2">
            {regions.map((region) => (
              <Link
                key={region.slug}
                href={`#${region.slug}`}
                className="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                {region.name}
              </Link>
            ))}
          </nav>
        )}
      </PageHero>

      {regions.length > 0 ? (
        regions.map((region, index) => (
          <section key={region.slug} id={region.slug} className={index % 2 ? "scroll-mt-20 bg-papyrus" : "scroll-mt-20"}>
            <div className="container-page section-y">
              <SectionHeading
                eyebrow={`${region.sites.length} site${region.sites.length === 1 ? "" : "s"}`}
                title={region.name}
                description={region.tagline}
                className="mb-12"
                action={
                  <Link href={`/destinations/${region.slug}`} className="text-sm font-medium text-lapis hover:underline">
                    Plan a trip here →
                  </Link>
                }
              />
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {region.sites.map((site) => (
                  <SiteCard key={site.slug} site={site} />
                ))}
              </div>
            </div>
          </section>
        ))
      ) : (
        <div className="container-page section-y">
          <EmptyState title="The catalog is being prepared" description="Check back soon — or ask us about any site on WhatsApp." />
        </div>
      )}

      <CtaBanner whatsapp={settings.whatsappNumber} />
    </>
  )
}
