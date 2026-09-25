import type { Metadata } from "next"
import Link from "next/link"

import { GuideStatusActions } from "@/components/admin/guide-actions"
import { AdminHeader, TableEmpty } from "@/components/admin/ui"
import { GuidePortrait } from "@/components/guides/guide-card"
import { Badge } from "@/components/ui/badge"
import { getGuideRatings } from "@/lib/guides/data"
import { prisma } from "@/lib/prisma"
import { formatDateTime, formatPrice, toNumber } from "@/lib/utils"

export const metadata: Metadata = { title: "Guides" }

const TABS = ["PENDING", "APPROVED", "REJECTED", "SUSPENDED"] as const
const LABEL = { PENDING: "Applications", APPROVED: "Live", REJECTED: "Sent back", SUSPENDED: "Suspended" }
const BADGE = { PENDING: "secondary", APPROVED: "cartouche", REJECTED: "outline", SUSPENDED: "destructive" } as const

export default async function AdminGuidesPage({ searchParams }: PageProps<"/admin/guides">) {
  const params = await searchParams
  const status = TABS.find((t) => t === params.status) ?? "PENDING"

  const [guides, counts] = await Promise.all([
    prisma.guideProfile.findMany({
      where: { status },
      orderBy: { createdAt: status === "PENDING" ? "asc" : "desc" },
      include: {
        user: { select: { email: true, name: true } },
        regions: { select: { name: true } },
        _count: { select: { requests: { where: { status: "ACCEPTED" } } } },
      },
    }),
    prisma.guideProfile.groupBy({ by: ["status"], _count: { _all: true } }),
  ])
  const countOf = (s: string) => counts.find((c) => c.status === s)?._count._all ?? 0
  const ratings = await getGuideRatings(guides.map((g) => g.id))

  return (
    <>
      <AdminHeader
        title="Guides"
        description="New guides stay hidden until you approve them. Check the licence and the profile before approving."
        action={{ href: "/admin/guides/reviews", label: "Guide reviews" }}
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <Link
            key={tab}
            href={`/admin/guides?status=${tab}`}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              status === tab ? "bg-lapis/12 text-lapis" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {LABEL[tab]} ({countOf(tab)})
          </Link>
        ))}
      </div>

      {guides.length === 0 ? (
        <TableEmpty message="No guides here." />
      ) : (
        <ul className="space-y-4">
          {guides.map((guide) => {
            const rating = ratings.get(guide.id)
            return (
              <li key={guide.id} className="rounded-2xl border border-border bg-papyrus p-6">
                <div className="flex flex-col gap-5 sm:flex-row">
                  <GuidePortrait guide={guide} sizes="96px" className="size-24 shrink-0 rounded-xl" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-heading text-xl">{guide.displayName}</h2>
                      <Badge variant={BADGE[guide.status]}>{LABEL[guide.status]}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {guide.guideType} · {guide.regions.map((r) => r.name).join(", ")} · {guide.languages.join(", ")}
                    </p>
                    <dl className="mt-3 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
                      <div><dt className="inline text-muted-foreground">Account: </dt><dd className="inline">{guide.user.name} · {guide.user.email}</dd></div>
                      <div><dt className="inline text-muted-foreground">WhatsApp: </dt><dd className="inline">{guide.whatsapp}</dd></div>
                      <div><dt className="inline text-muted-foreground">Licence: </dt><dd className="inline">{guide.licenceNumber ?? "Not given"}</dd></div>
                      <div><dt className="inline text-muted-foreground">Experience: </dt><dd className="inline">{guide.yearsExperience} years</dd></div>
                      <div><dt className="inline text-muted-foreground">Day rate: </dt><dd className="inline">{guide.dayRate === null ? "Per trip" : formatPrice(toNumber(guide.dayRate), guide.currency, { compact: true })}</dd></div>
                      <div><dt className="inline text-muted-foreground">Trips / rating: </dt><dd className="inline">{guide._count.requests} · {rating ? `${rating.average.toFixed(1)} (${rating.count})` : "no reviews"}</dd></div>
                      <div><dt className="inline text-muted-foreground">Applied: </dt><dd className="inline">{formatDateTime(guide.createdAt)}</dd></div>
                    </dl>
                    <p className="mt-3 text-sm leading-relaxed whitespace-pre-line">{guide.bio}</p>
                    <p className="mt-2 text-sm text-muted-foreground">Specialties: {guide.specialties.join(" · ")}</p>
                    {guide.adminNote && <p className="mt-2 text-sm"><span className="font-medium">Last note:</span> {guide.adminNote}</p>}
                    {guide.status === "APPROVED" && (
                      <Link href={`/guides/${guide.slug}`} className="mt-2 inline-block text-sm font-medium text-lapis hover:underline">
                        View public profile →
                      </Link>
                    )}
                    <GuideStatusActions guideId={guide.id} status={guide.status} />
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}
