import type { Metadata } from "next"

import { RegionForm } from "@/components/admin/region-form"
import { AdminHeader } from "@/components/admin/ui"

export const metadata: Metadata = { title: "New region" }

export default function NewRegionPage() {
  return (
    <>
      <AdminHeader
        title="New region"
        description="Regions group tours, hotels and vehicles, and get their own destination page."
      />
      <RegionForm />
    </>
  )
}
