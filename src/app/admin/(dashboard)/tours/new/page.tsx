import type { Metadata } from "next"

import { TourForm } from "@/components/admin/tour-form"
import { AdminHeader } from "@/components/admin/ui"
import { prisma } from "@/lib/prisma"

export const metadata: Metadata = { title: "New tour" }

export default async function NewTourPage() {
  const regions = await prisma.region.findMany({
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true },
  })

  return (
    <>
      <AdminHeader
        title="New tour"
        description="Everything here is editable later — publish when you're ready."
      />
      <TourForm regions={regions} />
    </>
  )
}
