import type { Metadata } from "next"
import { AlertTriangle, Mail, MessageCircle, Phone } from "lucide-react"

import { RequestResponder } from "@/components/guides/request-responder"
import { Badge } from "@/components/ui/badge"
import {
  conflictingPending,
  fromISODate,
  isRangeFree,
  toISODate,
  todayInEgypt,
  tripLength,
  formatDay,
} from "@/lib/guides/availability"
import { currentGuideProfile, getGuideBusyDays } from "@/lib/guides/data"
import { prisma } from "@/lib/prisma"
import { formatDate } from "@/lib/utils"

export const metadata: Metadata = { title: "Trip requests", robots: { index: false, follow: false } }

const STATUS_BADGE = {
  PENDING: ["Waiting", "secondary"],
  ACCEPTED: ["Accepted", "cartouche"],
  DECLINED: ["Declined", "outline"],
  CANCELLED: ["Cancelled by traveller", "outline"],
  EXPIRED: ["Expired", "outline"],
} as const

export default async function GuideRequestsPage() {
  const guide = await currentGuideProfile()
  if (!guide) return null

  const today = fromISODate(todayInEgypt())
  const requests = await prisma.guideRequest.findMany({
    where: { guideId: guide.id },
    orderBy: [{ startDate: "asc" }],
    include: {
      tourist: { select: { name: true, email: true, phone: true, nationality: true, languages: true } },
    },
  })

  const pending = requests.filter((r) => r.status === "PENDING")
  const upcoming = requests.filter((r) => r.status === "ACCEPTED" && r.endDate >= today)
  const past = requests
    .filter((r) => !pending.includes(r) && !upcoming.includes(r))
    .sort((a, b) => b.startDate.getTime() - a.startDate.getTime())
    .slice(0, 30)

  const range = (r: (typeof requests)[number]) => ({ start: toISODate(r.startDate), end: toISODate(r.endDate) })
  const clashes = conflictingPending(pending.map((r) => ({ id: r.id, ...range(r) })))
  const { busy } = await getGuideBusyDays(guide.id)

  return (
    <div className="space-y-12">
      <Section title="Waiting for your answer" empty="No new requests. They'll appear here, and we'll email you too.">
        {pending.map((r) => {
          const free = isRangeFree(range(r), busy)
          return (
            <RequestCard key={r.id} request={r}>
              {!free && (
                <Warning>You&apos;re already booked or have blocked some of these days, so you can only decline.</Warning>
              )}
              {free && clashes.has(r.id) && (
                <Warning>
                  Another request overlaps these dates. Accepting this one declines the other for you.
                </Warning>
              )}
              <p className="mt-2 text-xs text-muted-foreground">
                Answer within 48 hours of {formatDate(r.createdAt)} or the request lapses.
              </p>
              <RequestResponder requestId={r.id} canAccept={free && guide.status === "APPROVED"} />
              {guide.status !== "APPROVED" && (
                <p className="mt-2 text-xs text-muted-foreground">You can accept trips once your profile is approved.</p>
              )}
            </RequestCard>
          )
        })}
      </Section>

      <Section title="Upcoming trips" empty="No confirmed trips coming up.">
        {upcoming.map((r) => (
          <RequestCard key={r.id} request={r}>
            <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {r.tourist.phone && (
                <>
                  <li className="flex items-center gap-2"><Phone className="size-4 text-lapis" /> <a className="hover:underline" href={`tel:${r.tourist.phone.replace(/\s/g, "")}`}>{r.tourist.phone}</a></li>
                  <li className="flex items-center gap-2"><MessageCircle className="size-4 text-lapis" /> <a className="hover:underline" target="_blank" rel="noreferrer" href={`https://wa.me/${r.tourist.phone.replace(/\D/g, "")}`}>WhatsApp</a></li>
                </>
              )}
              {r.tourist.email && (
                <li className="flex items-center gap-2"><Mail className="size-4 text-lapis" /> <a className="hover:underline" href={`mailto:${r.tourist.email}`}>{r.tourist.email}</a></li>
              )}
            </ul>
          </RequestCard>
        ))}
      </Section>

      <Section title="Past and closed" empty="Nothing here yet.">
        {past.map((r) => (
          <RequestCard key={r.id} request={r} compact />
        ))}
      </Section>
    </div>
  )
}

type RequestWithTourist = {
  id: string
  reference: string
  status: keyof typeof STATUS_BADGE
  startDate: Date
  endDate: Date
  groupSize: number
  message: string
  guideReply: string | null
  tourist: { name: string | null; nationality: string | null; languages: string[] | null }
}

function RequestCard({
  request: r,
  compact = false,
  children,
}: {
  request: RequestWithTourist
  compact?: boolean
  children?: React.ReactNode
}) {
  const [label, variant] = STATUS_BADGE[r.status]
  const days = tripLength({ start: toISODate(r.startDate), end: toISODate(r.endDate) })
  return (
    <article className="rounded-2xl border border-border bg-papyrus p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-heading text-xl">
            {formatDay(r.startDate)}
            {days > 1 && <> – {formatDay(r.endDate)}</>}
            <span className="ml-2 align-middle text-sm font-normal text-muted-foreground font-sans">
              {days} {days === 1 ? "day" : "days"}
            </span>
          </h3>
          <p className="mt-1 text-sm">
            <span className="font-medium">{r.tourist.name ?? "Traveller"}</span>
            {r.tourist.nationality && <span className="text-muted-foreground"> · {r.tourist.nationality}</span>}
            <span className="text-muted-foreground"> · {r.groupSize} {r.groupSize === 1 ? "traveller" : "travellers"}</span>
          </p>
          {(r.tourist.languages ?? []).length > 0 && (
            <p className="mt-0.5 text-xs text-muted-foreground">Speaks {(r.tourist.languages ?? []).join(", ")}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground tabular-nums">{r.reference}</span>
          <Badge variant={variant}>{label}</Badge>
        </div>
      </div>
      {!compact && <p className="mt-4 text-sm leading-relaxed whitespace-pre-line">{r.message}</p>}
      {r.guideReply && !compact && (
        <p className="mt-3 text-sm text-muted-foreground"><span className="font-medium text-basalt">Your reply:</span> {r.guideReply}</p>
      )}
      {children}
    </article>
  )
}

function Section({ title, empty, children }: { title: string; empty: string; children: React.ReactNode[] }) {
  return (
    <section>
      <h2 className="font-heading text-2xl">{title}</h2>
      <div className="mt-5 space-y-4">
        {children.length > 0 ? children : <p className="text-sm text-muted-foreground">{empty}</p>}
      </div>
    </section>
  )
}

function Warning({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-4 flex items-start gap-2 rounded-lg bg-carnelian/10 p-3 text-sm text-carnelian">
      <AlertTriangle className="mt-0.5 size-4 shrink-0" />
      {children}
    </p>
  )
}
