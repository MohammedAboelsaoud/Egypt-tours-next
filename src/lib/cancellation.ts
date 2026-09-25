import { addDays, toISODate, todayInEgypt } from "@/lib/guides/availability"

/**
 * The booking terms travellers accept at checkout: free cancellation up to 14
 * days before the start date, 50% refundable up to 7 days before, and
 * non-refundable inside 7 days. Days are counted on Egypt's calendar.
 */
export const REFUND_TIERS = [
  { minDays: 14, percent: 100 },
  { minDays: 7, percent: 50 },
  { minDays: 0, percent: 0 },
] as const

export type CancellationTerms = {
  allowed: boolean
  /** Why cancelling isn't possible, in plain words. */
  reason?: string
  /** Whole days from today until the first day of the booking. */
  daysBefore: number
  /** Share of the amount paid that goes back, 0–100. */
  percent: number
  /** Amount refunded to the card (0 when nothing was paid). */
  refund: number
}

function daysUntil(start: string, today: string): number {
  let days = 0
  for (let day = today; day < start; day = addDays(day, 1)) days++
  return days
}

export function cancellationTerms(booking: {
  checkIn: Date | string
  total: number
  status: string
  paymentStatus: string
  today?: string
}): CancellationTerms {
  const today = booking.today ?? todayInEgypt()
  const start = typeof booking.checkIn === "string" ? booking.checkIn.slice(0, 10) : toISODate(booking.checkIn)
  const daysBefore = start > today ? daysUntil(start, today) : 0
  const base = { daysBefore, percent: 0, refund: 0 }

  if (booking.status === "CANCELLED") return { ...base, allowed: false, reason: "This booking is already cancelled." }
  if (booking.status === "COMPLETED") return { ...base, allowed: false, reason: "This trip has been completed." }
  if (start <= today) {
    return { ...base, allowed: false, reason: "This trip has started. Please contact us about changes." }
  }

  const percent = REFUND_TIERS.find((tier) => daysBefore >= tier.minDays)?.percent ?? 0
  const paid = booking.paymentStatus === "PAID"
  const refund = paid ? Math.round(booking.total * percent) / 100 : 0
  return { allowed: true, daysBefore, percent: paid ? percent : 0, refund }
}
