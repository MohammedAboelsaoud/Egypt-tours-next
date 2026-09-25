import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Mail, MessageCircle, Phone } from "lucide-react"

import { CancelRequestButton, GuideReviewForm } from "@/components/guides/traveller-request-actions"
import { Badge } from "@/components/ui/badge"
import { ButtonLink } from "@/components/ui/button-link"
import { Rating } from "@/components/ui/rating"
import { auth } from "@/lib/auth"
import { toISODate, todayInEgypt, formatDay } from "@/lib/guides/availability"
import { expireStaleRequests } from "@/lib/guides/data"
import { prisma } from "@/lib/prisma"

export const metadata: Metadata = { title: "My guide requests", robots: { index: false, follow: false } }

const STATUS = {
  PENDING: { label: "Waiting for the guide", variant: "secondary", note: "Guides answer within 48 hours. We'll email you either way." },
  ACCEPTED: { label: "Confirmed", variant: "cartouche", note: null },
  DECLINED: { label: "Declined", variant: "outline", note: "This guide can't take the trip. Other guides may be free." },
  CANCELLED: { label: "Cancelled", variant: "outline", note: null },
  EXPIRED: { label: "No answer in time", variant: "outline", note: "The guide didn't answer within 48 hours. Other guides may be free." },
} as const

export default async function MyGuideRequestsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login?callbackUrl=/account/guides")

  await expireStaleRequests({ touristId: session.user.id })
  const requests = await prisma.guideRequest.findMany({
    where: { touristId: session.user.id },
    orderBy: { startDate: "desc" },
    include: {
      review: true,
      guide: {
        select: {
          slug: true,
          displayName: true,
          guideType: true,
          whatsapp: true,
          user: { select: { email: true } },
        },
      },
    },
  })
  const today = todayInEgypt()

  if (requests.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-papyrus p-9 text-center">
        <h2 className="font-heading text-2xl">No guide requests yet</h2>
        <p className="mt-2 text-sm text-muted-foreground">Choose a guide, pick your dates, and send a request. It&apos;s free.</p>
        <ButtonLink href="/guides" className="mt-6">Find a guide</ButtonLink>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {requests.map((r) => {
        const status = STATUS[r.status]
        const start = toISODate(r.startDate)
        const end = toISODate(r.endDate)
        const accepted = r.status === "ACCEPTED"
        const canCancel = (r.status === "PENDING" || accepted) && start > today
        const canReview = accepted && end <= today && !r.review
        const findOthers = `/guides?from=${start}&to=${end}`
        return (
          <article key={r.id} className="rounded-2xl border border-border bg-papyrus p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-heading text-xl">
                  <Link href={`/guides/${r.guide.slug}`} className="hover:text-lapis">{r.guide.displayName}</Link>
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {r.guide.guideType} · {formatDay(r.startDate)}{end !== start && <> – {formatDay(r.endDate)}</>} · {r.groupSize} {r.groupSize === 1 ? "traveller" : "travellers"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground tabular-nums">{r.reference}</span>
                <Badge variant={status.variant}>{status.label}</Badge>
              </div>
            </div>

            {status.note && <p className="mt-3 text-sm text-muted-foreground">{status.note}</p>}
            {r.guideReply && (
              <p className="mt-3 text-sm"><span className="font-medium">{r.guide.displayName.split(" ")[0]}:</span> {r.guideReply}</p>
            )}

            {accepted && (
              <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 rounded-lg bg-accent p-4 text-sm text-accent-foreground">
                <li className="flex items-center gap-2"><Phone className="size-4" /> <a className="hover:underline" href={`tel:${r.guide.whatsapp.replace(/\s/g, "")}`}>{r.guide.whatsapp}</a></li>
                <li className="flex items-center gap-2"><MessageCircle className="size-4" /> <a className="hover:underline" target="_blank" rel="noreferrer" href={`https://wa.me/${r.guide.whatsapp.replace(/\D/g, "")}`}>WhatsApp {r.guide.displayName.split(" ")[0]}</a></li>
                {r.guide.user.email && (
                  <li className="flex items-center gap-2"><Mail className="size-4" /> <a className="hover:underline" href={`mailto:${r.guide.user.email}`}>{r.guide.user.email}</a></li>
                )}
              </ul>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-3">
              {(r.status === "DECLINED" || r.status === "EXPIRED") && start > today && (
                <ButtonLink href={findOthers} size="lg">See guides free on these dates</ButtonLink>
              )}
              {canCancel && <CancelRequestButton requestId={r.id} accepted={accepted} />}
            </div>

            {r.review && (
              <div className="mt-5 border-t border-border pt-5 text-sm">
                <Rating value={r.review.rating} />
                <p className="mt-2 text-muted-foreground">Your review: {r.review.comment}</p>
              </div>
            )}
            {canReview && <GuideReviewForm requestId={r.id} guideName={r.guide.displayName.split(" ")[0]} />}
          </article>
        )
      })}
    </div>
  )
}
