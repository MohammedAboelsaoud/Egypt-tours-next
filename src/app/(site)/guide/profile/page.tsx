import type { Metadata } from "next"
import Link from "next/link"

import { GuideProfileEditor } from "@/components/guides/guide-profile-editor"
import { currentGuideProfile } from "@/lib/guides/data"
import { prisma } from "@/lib/prisma"
import { toNumber } from "@/lib/utils"

export const metadata: Metadata = { title: "My guide profile", robots: { index: false, follow: false } }

export default async function GuideProfilePage() {
  const guide = await currentGuideProfile()
  if (!guide) return null

  const regions = await prisma.region.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true },
  })

  return (
    <div className="rounded-2xl border border-border bg-papyrus p-7 sm:p-9">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="font-heading text-2xl">Your public profile</h2>
        {guide.status === "APPROVED" && (
          <Link href={`/guides/${guide.slug}`} className="text-sm font-medium text-lapis hover:underline">
            See it as travellers do →
          </Link>
        )}
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Travellers choose guides from this page. Your WhatsApp number and licence stay private until you accept a trip.
      </p>
      <div className="mt-8">
        <GuideProfileEditor
          regions={regions}
          defaults={{
            displayName: guide.displayName,
            guideType: guide.guideType,
            bio: guide.bio,
            photoUrl: guide.photoUrl,
            licenceNumber: guide.licenceNumber,
            yearsExperience: guide.yearsExperience,
            languages: guide.languages,
            specialties: guide.specialties,
            regionIds: guide.regions.map((r) => r.id),
            dayRate: guide.dayRate === null ? null : toNumber(guide.dayRate),
            whatsapp: guide.whatsapp,
          }}
        />
      </div>
    </div>
  )
}
