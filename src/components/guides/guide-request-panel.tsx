"use client"

import Link from "next/link"
import { useMemo, useState, useTransition } from "react"
import { CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react"

import { createGuideRequest } from "@/actions/guides"
import { Button } from "@/components/ui/button"
import { ButtonLink } from "@/components/ui/button-link"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { addDays, eachDay, MAX_TRIP_DAYS, tripLength, tripRangeError, formatDay } from "@/lib/guides/availability"
import { cn } from "@/lib/utils"

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"]

function monthStart(today: string, offset: number) {
  const [y, m] = today.split("-").map(Number)
  return new Date(Date.UTC(y, m - 1 + offset, 1)).toISOString().slice(0, 10)
}

export type Viewer = "guest" | "traveller" | "traveller-no-phone" | "other"

export function GuideRequestPanel({
  guideId,
  guideName,
  busy,
  today,
  viewer,
  loginHref,
  initialFrom = "",
  initialTo = "",
}: {
  guideId: string
  guideName: string
  busy: string[]
  today: string
  viewer: Viewer
  loginHref: string
  initialFrom?: string
  initialTo?: string
}) {
  const busySet = useMemo(() => new Set(busy), [busy])
  const firstBookable = addDays(today, 1)
  const [offset, setOffset] = useState(() => {
    if (!initialFrom) return 0
    const [ty, tm] = today.split("-").map(Number)
    const [fy, fm] = initialFrom.split("-").map(Number)
    return Math.max(0, Math.min(12, (fy - ty) * 12 + (fm - tm)))
  })
  const [from, setFrom] = useState(initialFrom)
  const [to, setTo] = useState(initialTo || initialFrom)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const range = from && to ? { start: from, end: to } : null
  const clash = range && to >= from ? eachDay(range).filter((d) => busySet.has(d)) : []
  const rangeProblem = range ? tripRangeError(range, today) : null

  const first = monthStart(today, offset)
  const [y, m] = first.split("-").map(Number)
  const lead = (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7
  const count = new Date(Date.UTC(y, m, 0)).getUTCDate()
  const days = Array.from({ length: count }, (_, i) => addDays(first, i))
  const monthTitle = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${first}T00:00:00Z`))

  const pickDay = (day: string) => {
    setError(null)
    if (!from || (from && to && from !== to) || day < from) {
      setFrom(day)
      setTo(day)
      return
    }
    setTo(day)
  }

  if (sent) {
    return (
      <div role="status" className="rounded-2xl border border-faience/40 bg-papyrus p-7 text-center">
        <CheckCircle2 className="mx-auto size-8 text-faience" />
        <h2 className="mt-4 font-heading text-2xl">Request sent</h2>
        <p className="mt-2 text-sm text-muted-foreground">{sent}</p>
        <ButtonLink href="/account/guides" className="mt-6">See my requests</ButtonLink>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-border bg-papyrus p-6">
      <h2 className="font-heading text-2xl">Check dates and request</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Tap your first and last day. Greyed-out days are taken.
      </p>

      <div className="mt-5">
        <div className="flex items-center justify-between">
          <Button type="button" variant="ghost" size="icon" aria-label="Previous month" disabled={offset === 0} onClick={() => setOffset((o) => o - 1)}>
            <ChevronLeft />
          </Button>
          <p className="text-sm font-medium" aria-live="polite">{monthTitle}</p>
          <Button type="button" variant="ghost" size="icon" aria-label="Next month" disabled={offset >= 12} onClick={() => setOffset((o) => o + 1)}>
            <ChevronRight />
          </Button>
        </div>
        <div className="mt-2 grid grid-cols-7 gap-1 text-center text-xs">
          {WEEKDAYS.map((d, i) => <span key={i} aria-hidden className="py-1 text-muted-foreground">{d}</span>)}
          {Array.from({ length: lead }, (_, i) => <span key={`l${i}`} />)}
          {days.map((day) => {
            const taken = busySet.has(day)
            const unavailable = day < firstBookable || taken
            const selected = range && day >= range.start && day <= range.end
            const edge = day === from || day === to
            return (
              <button
                key={day}
                type="button"
                disabled={unavailable}
                onClick={() => pickDay(day)}
                aria-pressed={Boolean(selected)}
                aria-label={`${formatDay(day, "long")}${taken ? ", not available" : ""}`}
                className={cn(
                  "flex h-9 items-center justify-center rounded-md tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-lapis",
                  unavailable && "cursor-not-allowed text-muted-foreground/45",
                  taken && day >= firstBookable && "bg-muted line-through",
                  !unavailable && !selected && "hover:bg-accent",
                  selected && !edge && "bg-accent text-lapis-deep",
                  edge && "bg-lapis font-semibold text-white"
                )}
              >
                {Number(day.slice(8))}
              </button>
            )
          })}
        </div>
      </div>

      {viewer === "guest" && (
        <div className="mt-6 space-y-3 border-t border-border pt-6">
          <p className="text-sm text-muted-foreground">Sign in to send {guideName} a request. It takes a minute to create an account.</p>
          <ButtonLink href={loginHref} size="lg" className="w-full">Sign in to request</ButtonLink>
        </div>
      )}
      {viewer === "other" && (
        <p className="mt-6 border-t border-border pt-6 text-sm text-muted-foreground">
          Requests are sent from a traveller account.
        </p>
      )}
      {viewer === "traveller-no-phone" && (
        <p className="mt-6 border-t border-border pt-6 text-sm text-muted-foreground">
          Add your phone or WhatsApp number in <Link href="/account" className="font-medium text-lapis hover:underline">your profile</Link> first, so {guideName} can reach you once they accept.
        </p>
      )}

      {viewer === "traveller" && (
        <form
          className="mt-6 space-y-4 border-t border-border pt-6"
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            setError(null)
            if (!range) return setError("Choose your first and last day on the calendar.")
            if (rangeProblem) return setError(rangeProblem)
            if (clash.length > 0) return setError(`${guideName} isn't free on ${clash.map((d) => formatDay(d)).join(", ")}.`)
            // Read at submit time: text typed before hydration is kept.
            const form = new FormData(event.currentTarget)
            const groupSize = String(form.get("groupSize") ?? "")
            const message = String(form.get("message") ?? "")
            startTransition(async () => {
              const result = await createGuideRequest({ guideId, startDate: from, endDate: to, groupSize, message })
              if (result.ok) setSent(result.message)
              else setError(result.message)
            })
          }}
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="req-from" className="text-xs">First day</Label>
              <Input id="req-from" type="date" min={firstBookable} value={from} onChange={(e) => { setFrom(e.target.value); if (!to || to < e.target.value) setTo(e.target.value) }} className="mt-1.5 h-10" />
            </div>
            <div>
              <Label htmlFor="req-to" className="text-xs">Last day</Label>
              <Input id="req-to" type="date" min={from || firstBookable} max={from ? addDays(from, MAX_TRIP_DAYS - 1) : undefined} value={to} onChange={(e) => setTo(e.target.value)} className="mt-1.5 h-10" />
            </div>
          </div>
          {range && !rangeProblem && clash.length === 0 && (
            <p className="text-sm text-faience">
              {guideName} is free for all {tripLength(range)} {tripLength(range) === 1 ? "day" : "days"}.
            </p>
          )}
          {range && (rangeProblem || clash.length > 0) && (
            <p className="text-sm text-destructive">
              {rangeProblem ?? `Not available on ${clash.map((d) => formatDay(d)).join(", ")}. Try other dates.`}
            </p>
          )}
          <div>
            <Label htmlFor="req-group" className="text-xs">Travellers</Label>
            <Input id="req-group" name="groupSize" type="number" min={1} max={60} defaultValue={2} className="mt-1.5 h-10 w-28" />
          </div>
          <div>
            <Label htmlFor="req-message" className="text-xs">What would you like to see?</Label>
            <Textarea id="req-message" name="message" rows={4} maxLength={1500} placeholder="Sites, pace, interests, anything the guide should know." className="mt-1.5" />
          </div>
          {error && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
          <Button type="submit" size="lg" className="h-11 w-full" disabled={pending}>
            {pending ? "Sending…" : `Send request to ${guideName.split(" ")[0]}`}
          </Button>
          <p className="text-xs text-muted-foreground">
            Free to request. {guideName.split(" ")[0]} answers within 48 hours, then you agree the programme and fee directly.
          </p>
        </form>
      )}
    </div>
  )
}
