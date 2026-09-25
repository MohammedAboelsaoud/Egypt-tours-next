import type { Metadata } from "next"

import { GuideCalendar } from "@/components/guides/guide-calendar"
import { eachDay, fromISODate, toISODate, todayInEgypt } from "@/lib/guides/availability"
import { currentGuideProfile, getGuideBusyDays } from "@/lib/guides/data"
import { prisma } from "@/lib/prisma"

export const metadata: Metadata = { title: "My calendar", robots: { index: false, follow: false } }

export default async function GuideCalendarPage() {
  const guide = await currentGuideProfile()
  if (!guide) return null

  const today = todayInEgypt()
  const [{ booked, blocked }, pending] = await Promise.all([
    getGuideBusyDays(guide.id),
    prisma.guideRequest.findMany({
      where: { guideId: guide.id, status: "PENDING", endDate: { gte: fromISODate(today) } },
      select: { startDate: true, endDate: true },
    }),
  ])
  const pendingDays = new Set(
    pending.flatMap((r) => eachDay({ start: toISODate(r.startDate), end: toISODate(r.endDate) }))
  )

  return (
    <div>
      <p className="mb-6 max-w-2xl text-sm text-muted-foreground">
        You take one group per day. Booked trips and blocked days are hidden from travellers&apos; date
        pickers, so you only get requests you can take.
      </p>
      <GuideCalendar today={today} booked={[...booked]} blocked={[...blocked]} pending={[...pendingDays]} />
    </div>
  )
}
