import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { HistoricSiteForm } from "@/components/admin/historic-site-form"
import { AdminHeader } from "@/components/admin/ui"
import { prisma } from "@/lib/prisma"

export const metadata: Metadata = { title: "Edit historic site" }

export default async function EditHistoricSitePage({ params }: PageProps<"/admin/sites/[id]/edit">) {
  const { id } = await params
  const [site, regions] = await Promise.all([
    prisma.historicSite.findUnique({ where: { id } }),
    prisma.region.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
  ])

  if (!site) notFound()

  return (
    <>
      <AdminHeader
        title="Edit historic site"
        description={site.name}
        action={
          <Link
            href={`/sites/${site.slug}`}
            target="_blank"
            className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:border-lapis hover:text-lapis"
          >
            View on site ↗
          </Link>
        }
      />
      <HistoricSiteForm
        regions={regions}
        site={{
          id: site.id,
          slug: site.slug,
          name: site.name,
          regionId: site.regionId,
          location: site.location,
          period: site.period,
          summary: site.summary,
          history: site.history,
          facts: site.facts,
          tips: site.tips,
          imageUrl: site.imageUrl,
          imageCredit: site.imageCredit,
          galleryUrls: site.galleryUrls,
          keywords: site.keywords,
          sortOrder: site.sortOrder,
          published: site.published,
        }}
      />
    </>
  )
}
