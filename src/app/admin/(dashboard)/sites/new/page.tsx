import type { Metadata } from "next"

import { HistoricSiteForm } from "@/components/admin/historic-site-form"
import { AdminHeader } from "@/components/admin/ui"
import { prisma } from "@/lib/prisma"

export const metadata: Metadata = { title: "New historic site" }

export default async function NewHistoricSitePage() {
  const regions = await prisma.region.findMany({
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true },
  })

  return (
    <>
      <AdminHeader title="New historic site" description="Add a monument to the catalog, with its history and photos." />
      <HistoricSiteForm regions={regions} />
    </>
  )
}
