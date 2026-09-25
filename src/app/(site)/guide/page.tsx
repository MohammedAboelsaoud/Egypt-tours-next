import type { Metadata } from "next"
import Link from "next/link"
import { AlertTriangle, CalendarDays, Clock, ImageUp, Inbox, Star } from "lucide-react"

import { ButtonLink } from "@/components/ui/button-link"
import { fromISODate, todayInEgypt, formatDay } from "@/lib/guides/availability"
import { currentGuideProfile, getGuideRatings } from "@/lib/guides/data"
import { prisma } from "@/lib/prisma"

export const metadata: Metadata = { title: "Guide dashboard", robots: { index: false, follow: false } }

export default async function GuideOverviewPage() {
  const guide = await currentGuideProfile()
  if (!guide) return null

  const today = fromISODate(todayInEgypt())
  const [pending, upcoming, ratings] = await Promise.all([
    prisma.guideRequest.count({ where: { guideId: guide.id, status: "PENDING" } }),
    prisma.guideRequest.findMany({
      where: { guideId: guide.id, status: "ACCEPTED", endDate: { gte: today } },
      orderBy: { startDate: "asc" },
      take: 5,
      include: { tourist: { select: { name: true, nationality: true } } },
    }),
    getGuideRatings([guide.id]),
  ])
  const rating = ratings.get(guide.id)

  return (
    <div className="space-y-8">
      {guide.status === "PENDING" && (
        <Notice icon={Clock} title="Your profile is being reviewed">
          Our team checks every new guide, usually within two business days. We&apos;ll email you when
          you&apos;re live. Meanwhile, add a photo and fill in your calendar.
        </Notice>
      )}
      {guide.status === "REJECTED" && (
        <Notice icon={AlertTriangle} title="Your profile needs changes" tone="danger">
          {guide.adminNote ?? "Please update your profile."}{" "}
          <Link href="/guide/profile" className="font-medium underline">Edit your profile</Link> and save it to send it back for review.
        </Notice>
      )}
      {guide.status === "SUSPENDED" && (
        <Notice icon={AlertTriangle} title="Your profile is paused" tone="danger">
          Travellers can&apos;t see or request you right now. {guide.adminNote}
          {" "}Contact us if you think this is a mistake.
        </Notice>
      )}
      {!guide.photoUrl && (
        <Notice icon={ImageUp} title="Add your photo">
          Guides with a clear, friendly photo get far more requests.{" "}
          <Link href="/guide/profile" className="font-medium underline">Upload one now</Link>.
        </Notice>
      )}

      <dl className="grid gap-4 sm:grid-cols-3">
        <Stat icon={Inbox} label="Waiting for your answer" value={String(pending)} href="/guide/requests" />
        <Stat icon={CalendarDays} label="Upcoming trips" value={String(upcoming.length)} href="/guide/calendar" />
        <Stat
          icon={Star}
          label={rating ? `From ${rating.count} ${rating.count === 1 ? "review" : "reviews"}` : "No reviews yet"}
          value={rating ? rating.average.toFixed(1) : "–"}
          href="/guide/reviews"
        />
      </dl>

      <section className="rounded-2xl border border-border bg-papyrus p-7">
        <h2 className="font-heading text-2xl">Next trips</h2>
        {upcoming.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            No confirmed trips yet. Accepted requests appear here.
          </p>
        ) : (
          <ul className="mt-5 divide-y divide-border">
            {upcoming.map((trip) => (
              <li key={trip.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                <span>
                  <span className="font-medium">{trip.tourist.name}</span>
                  {trip.tourist.nationality && <span className="text-muted-foreground"> · {trip.tourist.nationality}</span>}
                  <span className="text-muted-foreground"> · {trip.groupSize} {trip.groupSize === 1 ? "traveller" : "travellers"}</span>
                </span>
                <span className="tabular-nums">{formatDay(trip.startDate)} – {formatDay(trip.endDate)}</span>
              </li>
            ))}
          </ul>
        )}
        {pending > 0 && (
          <ButtonLink href="/guide/requests" className="mt-6">
            Answer {pending} {pending === 1 ? "request" : "requests"}
          </ButtonLink>
        )}
      </section>
    </div>
  )
}

function Notice({
  icon: Icon,
  title,
  tone = "info",
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  tone?: "info" | "danger"
  children: React.ReactNode
}) {
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={
        tone === "danger"
          ? "flex gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-5"
          : "flex gap-3 rounded-xl border border-lapis/25 bg-accent p-5"
      }
    >
      <Icon className={tone === "danger" ? "mt-0.5 size-5 shrink-0 text-destructive" : "mt-0.5 size-5 shrink-0 text-lapis"} />
      <div>
        <p className="font-medium">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{children}</p>
      </div>
    </div>
  )
}

function Stat({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  href: string
}) {
  return (
    <Link href={href} className="rounded-2xl border border-border bg-papyrus p-6 transition-colors hover:border-lapis/40">
      <dt className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="size-4 text-lapis" />
        {label}
      </dt>
      <dd className="mt-3 font-heading text-4xl tabular-nums">{value}</dd>
    </Link>
  )
}
