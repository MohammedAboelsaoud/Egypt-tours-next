import type { Metadata } from "next"
import Link from "next/link"

import { PageHero } from "@/components/page-hero"
import { SectionHeading } from "@/components/section-heading"
import { SiteCard } from "@/components/site-card"
import { DESTINATIONS } from "@/data/destinations"
import { SITES } from "@/data/sites"

export const metadata: Metadata = {
  title: "Historic Sites",
  description: "A catalog of Egypt's great historic sites — the pyramids, Karnak, the Valley of the Kings, Abu Simbel, St. Catherine's and more — with their history and visiting tips.",
}

export default function SitesPage() {
  const groups = DESTINATIONS.map((d) => ({ area: d, sites: SITES.filter((s) => s.area === d.slug) })).filter((g) => g.sites.length > 0)

  return (
    <>
      <PageHero
        eyebrow="Catalog"
        title="Egypt's historic sites"
        description="Five thousand years of history, site by site. Read the stories behind the monuments before you go — then let one of our guides show you in person."
        image="/img/luxor-aswan.jpg"
      >
        <nav aria-label="Jump to region" className="mt-8 flex flex-wrap gap-2">
          {groups.map(({ area }) => (
            <Link key={area.slug} href={`#${area.slug}`} className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm text-white backdrop-blur-sm hover:bg-white/20">
              {area.name}
            </Link>
          ))}
        </nav>
      </PageHero>

      {groups.map(({ area, sites }, i) => (
        <section key={area.slug} id={area.slug} className={i % 2 ? "scroll-mt-20 bg-ivory" : "scroll-mt-20"}>
          <div className="container-page section-y">
            <SectionHeading eyebrow={`${sites.length} site${sites.length === 1 ? "" : "s"}`} title={area.name} description={area.tagline} />
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {sites.map((site) => (
                <SiteCard key={site.slug} site={site} />
              ))}
            </div>
          </div>
        </section>
      ))}
    </>
  )
}
