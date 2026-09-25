/**
 * Guide availability, in whole days. Dates are ISO strings ("2027-03-12") so
 * they compare as text and never shift with the server's time zone. A trip's
 * start and end days are both included.
 *
 * The rules: a guide takes one group per day. A day is busy when an ACCEPTED
 * request covers it or the guide blocked it. Pending requests never block —
 * the guide chooses between them — and they expire if left unanswered.
 */

export type DayRange = { start: string; end: string }

/** Hours a guide has to answer before a request lapses. */
export const PENDING_TTL_HOURS = 48
export const MAX_TRIP_DAYS = 14
/** How far ahead a trip can be requested. */
export const MAX_DAYS_AHEAD = 365

const DAY_MS = 24 * 60 * 60 * 1000

/** Today's date in Egypt, where the trips happen. */
export function todayInEgypt(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Cairo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now)
}

/** A Postgres DATE (read back as UTC midnight) → "YYYY-MM-DD". */
export function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

/** "YYYY-MM-DD" → a Date at UTC midnight, the form Prisma writes to a DATE column. */
export function fromISODate(iso: string): Date {
  return new Date(`${iso}T00:00:00.000Z`)
}

export function addDays(iso: string, days: number): string {
  return toISODate(new Date(fromISODate(iso).getTime() + days * DAY_MS))
}

export function isISODate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && toISODate(fromISODate(value)) === value
}

/** Number of days in a range, counting both ends. */
export function tripLength(range: DayRange): number {
  return Math.round((fromISODate(range.end).getTime() - fromISODate(range.start).getTime()) / DAY_MS) + 1
}

/** Every day in a range, both ends included. */
export function eachDay(range: DayRange): string[] {
  const days: string[] = []
  for (let day = range.start; day <= range.end; day = addDays(day, 1)) days.push(day)
  return days
}

export function rangesOverlap(a: DayRange, b: DayRange): boolean {
  return a.start <= b.end && b.start <= a.end
}

/** Days the guide cannot take a new group. */
export function busyDays(accepted: DayRange[], blocked: string[]): Set<string> {
  const busy = new Set(blocked)
  for (const range of accepted) for (const day of eachDay(range)) busy.add(day)
  return busy
}

export function isRangeFree(range: DayRange, busy: Set<string>): boolean {
  return eachDay(range).every((day) => !busy.has(day))
}

/** Ids of pending requests that overlap another pending request. */
export function conflictingPending(requests: (DayRange & { id: string })[]): Set<string> {
  const clashing = new Set<string>()
  for (let i = 0; i < requests.length; i++) {
    for (let j = i + 1; j < requests.length; j++) {
      if (rangesOverlap(requests[i], requests[j])) {
        clashing.add(requests[i].id)
        clashing.add(requests[j].id)
      }
    }
  }
  return clashing
}

/** A pending request lapses after the reply window, or once its first day arrives. */
export function isExpired(
  request: { status: string; createdAt: Date; start: string },
  now: Date = new Date()
): boolean {
  if (request.status !== "PENDING") return false
  if (now.getTime() - request.createdAt.getTime() > PENDING_TTL_HOURS * 60 * 60 * 1000) return true
  return request.start <= todayInEgypt(now)
}

/** Why a requested range is not allowed, or null when it is. */
export function tripRangeError(range: DayRange, today: string = todayInEgypt()): string | null {
  if (!isISODate(range.start) || !isISODate(range.end)) return "Choose valid dates."
  if (range.end < range.start) return "The last day must be on or after the first day."
  if (range.start <= today) return "Trips can start from tomorrow."
  if (range.start > addDays(today, MAX_DAYS_AHEAD)) return "Trips can be requested up to a year ahead."
  if (tripLength(range) > MAX_TRIP_DAYS) return `A request can cover up to ${MAX_TRIP_DAYS} days.`
  return null
}

/**
 * A trip day for display ("12 Mar 2027"). Pinned to UTC, the zone the day is
 * stored in, so a browser in the Americas doesn't show the day before.
 */
export function formatDay(day: Date | string, style: "short" | "long" = "short"): string {
  const date = typeof day === "string" ? fromISODate(day.slice(0, 10)) : day
  if (Number.isNaN(date.getTime())) return "—"
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: style === "long" ? "long" : "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date)
}

/**
 * A traveller's dates as one line for enquiries and emails:
 * "12 Mar 2027 – 20 Mar 2027 (9 days)", "From 12 Mar 2027", or "".
 */
export function describeDateRange(start?: string, end?: string): string {
  const from = start && isISODate(start) ? start : ""
  const to = end && isISODate(end) ? end : ""
  if (from && to) {
    const days = tripLength({ start: from, end: to })
    return `${formatDay(from)} – ${formatDay(to)} (${days} ${days === 1 ? "day" : "days"})`
  }
  if (from) return `From ${formatDay(from)}`
  if (to) return `Until ${formatDay(to)}`
  return ""
}
