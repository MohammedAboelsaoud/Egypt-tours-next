import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { RegionForm } from "@/components/admin/region-form"
import { AdminHeader } from "@/components/admin/ui"
import { prisma } from "@/lib/prisma"

export const metadata: Metadata = { title: "Edit region" }

export default async function EditRegionPage({
  params,
}: PageProps<"/admin/regions/[id]/edit">) {
  const { id } = await params
  const region = await prisma.region.findUnique({ where: { id } })

  if (!region) notFound()

  return (
    <>
      <AdminHeader
        title="Edit region"
        description={region.name}
        action={
          <Link
            href={`/destinations/${region.slug}`}
            target="_blank"
            className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:border-lapis hover:text-lapis"
          >
            View on site ↗
          </Link>
        }
      />

      <RegionForm
        region={{
          id: region.id,
          slug: region.slug,
          name: region.name,
          tagline: region.tagline,
          summary: region.summary,
          cities: region.cities,
          imageUrl: region.imageUrl,
          lat: region.lat,
          lng: region.lng,
          zoom: region.zoom,
          sortOrder: region.sortOrder,
          published: region.published,
        }}
      />
    </>
  )
}
