"use client"

import { useRouter } from "next/navigation"
import { useMemo, useRef, useState, useTransition } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { toast } from "sonner"

import { setBlockedDays } from "@/actions/guides"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { addDays, eachDay, tripLength } from "@/lib/guides/availability"
import { cn } from "@/lib/utils"

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const MONTHS_AHEAD = 12

function monthStart(today: string, offset: number) {
  const [y, m] = today.split("-").map(Number)
  const date = new Date(Date.UTC(y, m - 1 + offset, 1))
  return date.toISOString().slice(0, 10)
}

function monthDays(first: string) {
  const [y, m] = first.split("-").map(Number)
  const count = new Date(Date.UTC(y, m, 0)).getUTCDate()
  const lead = (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7 // Monday first
  return { lead, days: Array.from({ length: count }, (_, i) => addDays(first, i)) }
}

const longDate = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`))

export function GuideCalendar({
  today,
  booked,
  blocked,
  pending,
}: {
  today: string
  booked: string[]
  blocked: string[]
  pending: string[]
}) {
  const router = useRouter()
  const [offset, setOffset] = useState(0)
  const [blockedSet, setBlockedSet] = useState(() => new Set(blocked))
  // Uncontrolled, so dates typed before hydration aren't wiped.
  const rangeForm = useRef<HTMLFormElement>(null)
  const [busy, startTransition] = useTransition()
  const bookedSet = useMemo(() => new Set(booked), [booked])
  const pendingSet = useMemo(() => new Set(pending), [pending])

  const first = monthStart(today, offset)
  const { lead, days } = monthDays(first)
  const title = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${first}T00:00:00Z`))

  const save = (dates: string[], block: boolean) =>
    startTransition(async () => {
      const before = new Set(blockedSet)
      const next = new Set(blockedSet)
      for (const d of dates) (block ? next.add(d) : next.delete(d))
      setBlockedSet(next)
      const result = await setBlockedDays({ dates, blocked: block })
      if (result.ok) {
        toast.success(result.message)
        router.refresh()
      } else {
        setBlockedSet(before)
        toast.error(result.message)
      }
    })

  const blockRange = (block: boolean) => {
    const form = rangeForm.current ? new FormData(rangeForm.current) : null
    const from = String(form?.get("from") ?? "")
    const to = String(form?.get("to") ?? "")
    if (!from || !to || to < from) {
      toast.error("Choose a first and last day, in order.")
      return
    }
    if (tripLength({ start: from, end: to }) > 62) {
      toast.error("Block up to two months at a time.")
      return
    }
    save(eachDay({ start: from, end: to }), block)
  }

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-border bg-papyrus p-5 sm:p-7">
        <div className="flex items-center justify-between gap-3">
          <Button type="button" variant="ghost" size="icon-lg" aria-label="Previous month" disabled={offset === 0} onClick={() => setOffset((o) => o - 1)}>
            <ChevronLeft />
          </Button>
          <h2 className="font-heading text-xl" aria-live="polite">{title}</h2>
          <Button type="button" variant="ghost" size="icon-lg" aria-label="Next month" disabled={offset >= MONTHS_AHEAD} onClick={() => setOffset((o) => o + 1)}>
            <ChevronRight />
          </Button>
        </div>

        <div className="mt-5 grid grid-cols-7 gap-1.5 text-center">
          {WEEKDAYS.map((d) => (
            <div key={d} aria-hidden className="pb-1 text-xs font-medium text-muted-foreground">{d}</div>
          ))}
          {Array.from({ length: lead }, (_, i) => <div key={`lead-${i}`} />)}
          {days.map((day) => {
            const past = day < today
            const isBooked = bookedSet.has(day)
            const isBlocked = blockedSet.has(day)
            const isPending = pendingSet.has(day)
            const state = isBooked ? "booked" : isBlocked ? "blocked" : "free"
            return (
              <button
                key={day}
                type="button"
                disabled={past || isBooked || busy}
                aria-pressed={isBlocked}
                aria-label={`${longDate(day)}: ${state}${isPending ? ", has a pending request" : ""}${!past && !isBooked ? (isBlocked ? ". Reopen this day" : ". Block this day") : ""}`}
                onClick={() => save([day], !isBlocked)}
                className={cn(
                  "relative flex h-11 items-center justify-center rounded-md border sm:h-14 text-sm tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-lapis",
                  past && "border-transparent text-muted-foreground/50",
                  !past && state === "free" && "border-border bg-background hover:border-lapis",
                  !past && isBooked && "border-lapis bg-lapis font-semibold text-white",
                  !past && state === "blocked" && "border-dashed border-input bg-muted text-muted-foreground line-through hover:border-lapis"
                )}
              >
                {Number(day.slice(8))}
                {isPending && !past && !isBooked && (
                  <span aria-hidden className="absolute bottom-1 size-1.5 rounded-full bg-ochre" />
                )}
              </button>
            )
          })}
        </div>

        <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
          <li className="flex items-center gap-2"><span className="size-4 rounded border border-border bg-background" /> Free: click to block</li>
          <li className="flex items-center gap-2"><span className="size-4 rounded border border-dashed border-input bg-muted" /> Blocked: click to reopen</li>
          <li className="flex items-center gap-2"><span className="size-4 rounded bg-lapis" /> Booked trip</li>
          <li className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-ochre" /> Pending request</li>
        </ul>
      </div>

      <form
        ref={rangeForm}
        className="rounded-2xl border border-border bg-papyrus p-5 sm:p-7"
        onSubmit={(event) => {
          event.preventDefault()
          blockRange(true)
        }}
      >
        <h2 className="font-heading text-xl">Block a holiday or other work</h2>
        <p className="mt-1 text-sm text-muted-foreground">Travellers can&apos;t request blocked days. Days with a booked trip stay booked.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end">
          <div>
            <Label htmlFor="block-from">First day</Label>
            <Input id="block-from" name="from" type="date" min={today} max={addDays(today, 400)} className="mt-2 h-11" />
          </div>
          <div>
            <Label htmlFor="block-to">Last day</Label>
            <Input id="block-to" name="to" type="date" min={today} max={addDays(today, 400)} className="mt-2 h-11" />
          </div>
          <Button type="submit" size="lg" className="h-11" disabled={busy}>Block these days</Button>
          <Button type="button" size="lg" variant="outline" className="h-11" disabled={busy} onClick={() => blockRange(false)}>Reopen them</Button>
        </div>
      </form>
    </div>
  )
}
