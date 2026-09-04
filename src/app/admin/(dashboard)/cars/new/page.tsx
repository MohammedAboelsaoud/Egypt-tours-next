import type { Metadata } from "next"

import { CarForm } from "@/components/admin/car-form"
import { AdminHeader } from "@/components/admin/ui"
import { prisma } from "@/lib/prisma"

export const metadata: Metadata = { title: "New vehicle" }

export default async function NewCarPage() {
  const regions = await prisma.region.findMany({
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true },
  })

  return (
    <>
      <AdminHeader title="New vehicle" description="Add a car to the fleet." />
      <CarForm regions={regions} />
    </>
  )
}
