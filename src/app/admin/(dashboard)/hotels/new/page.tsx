import type { Metadata } from "next"

import { HotelForm } from "@/components/admin/hotel-form"
import { AdminHeader } from "@/components/admin/ui"
import { prisma } from "@/lib/prisma"

export const metadata: Metadata = { title: "New hotel" }

export default async function NewHotelPage() {
  const regions = await prisma.region.findMany({
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true },
  })

  return (
    <>
      <AdminHeader title="New hotel" description="Add a property to the catalogue." />
      <HotelForm regions={regions} />
    </>
  )
}
