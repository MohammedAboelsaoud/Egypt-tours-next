import type { Metadata } from "next"
import Link from "next/link"
import { Users } from "lucide-react"

import { GuideCard } from "@/components/guides/guide-card"
import { PageHero } from "@/components/layout/page-hero"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { Input } from "@/components/ui/input"
import { GUIDE_TYPES, LANGUAGES } from "@/lib/constants"
import { addDays, isISODate, todayInEgypt } from "@/lib/guides/availability"
import { getApprovedGuides } from "@/lib/guides/data"
import { prisma } from "@/lib/prisma"

export const metadata: Metadata = {
  title: "Tour guides",
  description:
    "Choose your own guide in Egypt: licensed Egyptologists, Nubian and Bedouin guides. See who's free on your dates, read reviews and send a request.",
  alternates: { canonical: "/guides" },
}

const selectClass =
  "mt-2 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-lapis focus-visible:ring-3 focus-visible:ring-lapis/20"
const labelClass = "block text-xs font-medium tracking-[0.1em] text-muted-foreground uppercase"

export default async function GuidesPage({ searchParams }: PageProps<"/guides">) {
  const params = await searchParams
  const pick = (key: string) => (typeof params[key] === "string" ? (params[key] as string) : undefined)

  const today = todayInEgypt()
  let from = pick("from")
  let to = pick("to")
  if (from && !isISODate(from)) from = undefined
  if (to && !isISODate(to)) to = undefined
  if (from && !to) to = from
  const datesInvalid = Boolean(from && to && to < from)

  const filters = {
    region: pick("region"),
    language: pick("language"),
    type: pick("type"),
    from: datesInvalid ? undefined : from,
    to: datesInvalid ? undefined : to,
  }

  const [guides, regions] = await Promise.all([
    getApprovedGuides(filters),
    prisma.region.findMany({ where: { published: true }, orderBy: { sortOrder: "asc" }, select: { slug: true, name: true } }),
  ])

  // Carry the chosen dates into each profile, so the request form is pre-filled.
  const dateQuery = filters.from && filters.to ? `?from=${filters.from}&to=${filters.to}` : ""
  const filtered = Object.values(filters).some(Boolean)

  return (
    <>
      <PageHero
        eyebrow="Tour guides"
        title="Choose the guide who shows you Egypt"
        description="Licensed Egyptologists, Nubian and Bedouin guides. Pick your dates to see who's free, read what travellers say, then send a request. Your guide confirms within 48 hours."
        crumbs={[{ label: "Guides" }]}
      />

      <div className="container-page section-y space-y-10">
        <form method="get" action="/guides" className="rounded-2xl border border-border bg-papyrus p-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_1fr_auto] lg:items-end">
            <div>
              <label htmlFor="from" className={labelClass}>First day</label>
              <Input id="from" name="from" type="date" min={addDays(today, 1)} defaultValue={from} className="mt-2 h-11" />
            </div>
            <div>
              <label htmlFor="to" className={labelClass}>Last day</label>
              <Input id="to" name="to" type="date" min={addDays(today, 1)} defaultValue={to} className="mt-2 h-11" />
            </div>
            <div>
              <label htmlFor="region" className={labelClass}>Region</label>
              <select id="region" name="region" defaultValue={filters.region ?? ""} className={selectClass}>
                <option value="">Anywhere</option>
                {regions.map((r) => <option key={r.slug} value={r.slug}>{r.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="language" className={labelClass}>Language</label>
              <select id="language" name="language" defaultValue={filters.language ?? ""} className={selectClass}>
                <option value="">Any</option>
                {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="type" className={labelClass}>Kind of guide</label>
              <select id="type" name="type" defaultValue={filters.type ?? ""} className={selectClass}>
                <option value="">All</option>
                {GUIDE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <Button type="submit" size="lg" className="h-11 px-6">Show guides</Button>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-sm text-muted-foreground">
            <p aria-live="polite">
              {datesInvalid
                ? "The last day must be on or after the first day."
                : filters.from
                  ? `${guides.length} ${guides.length === 1 ? "guide is" : "guides are"} free on your dates.`
                  : `${guides.length} ${guides.length === 1 ? "guide" : "guides"}. Add your dates to see who's free.`}
            </p>
            {filtered && <Link href="/guides" className="font-medium text-lapis hover:underline">Clear filters</Link>}
          </div>
        </form>

        {guides.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {guides.map((guide) => (
              <GuideCard key={guide.id} guide={guide} query={dateQuery} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Users className="size-5" />}
            title="No guides match yet"
            description="Try other dates or fewer filters. Or tell us what you need and a planner will find you a guide."
            action={<Link href="/contact" className="font-medium text-lapis hover:underline">Ask a planner</Link>}
          />
        )}

        <p className="text-center text-sm text-muted-foreground">
          Are you a licensed guide?{" "}
          <Link href="/guides/join" className="font-medium text-lapis hover:underline">Guide with us</Link>
        </p>
      </div>
    </>
  )
}
