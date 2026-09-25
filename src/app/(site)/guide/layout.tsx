import { redirect } from "next/navigation"

import { GuideNav } from "@/components/guides/guide-nav"
import { Badge } from "@/components/ui/badge"
import { expireStaleRequests, currentGuideProfile } from "@/lib/guides/data"
import { prisma } from "@/lib/prisma"

const STATUS = {
  PENDING: { label: "Waiting for approval", variant: "secondary" },
  APPROVED: { label: "Live", variant: "cartouche" },
  REJECTED: { label: "Changes needed", variant: "destructive" },
  SUSPENDED: { label: "Paused", variant: "destructive" },
} as const

export default async function GuideLayout({ children }: { children: React.ReactNode }) {
  const guide = await currentGuideProfile()
  if (!guide) redirect("/guides/login")

  await expireStaleRequests({ guideId: guide.id })
  const pendingCount = await prisma.guideRequest.count({
    where: { guideId: guide.id, status: "PENDING" },
  })
  const status = STATUS[guide.status]

  return (
    <div className="border-b border-border bg-limestone">
      <div className="container-page pt-28 pb-20 sm:pt-32">
        <header className="mb-10">
          <p className="eyebrow">Guide dashboard</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h1 className="font-heading text-3xl sm:text-4xl">{guide.displayName}</h1>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{guide.guideType}</p>
        </header>

        <div className="grid gap-10 lg:grid-cols-[240px_1fr] lg:gap-14">
          <GuideNav pendingCount={pendingCount} />
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </div>
  )
}
