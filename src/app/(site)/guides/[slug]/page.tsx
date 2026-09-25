import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Award, Check, Languages, MapPin } from "lucide-react"

import { GuidePortrait } from "@/components/guides/guide-card"
import { GuideRequestPanel, type Viewer } from "@/components/guides/guide-request-panel"
import { Breadcrumb } from "@/components/layout/breadcrumb"
import { Badge } from "@/components/ui/badge"
import { Rating } from "@/components/ui/rating"
import { auth } from "@/lib/auth"
import { isISODate, todayInEgypt } from "@/lib/guides/availability"
import { getGuideBusyDays, getGuideBySlug } from "@/lib/guides/data"
import { prisma } from "@/lib/prisma"
import { formatDate, formatPrice, toNumber } from "@/lib/utils"

export async function generateMetadata({ params }: PageProps<"/guides/[slug]">): Promise<Metadata> {
  const { slug } = await params
  const guide = await getGuideBySlug(slug)
  if (!guide) return { title: "Guide not found" }
  return {
    title: `${guide.displayName}, ${guide.guideType}`,
    description: guide.bio.slice(0, 160),
    alternates: { canonical: `/guides/${guide.slug}` },
  }
}

export default async function GuideProfilePage({ params, searchParams }: PageProps<"/guides/[slug]">) {
  const { slug } = await params
  const query = await searchParams
  const guide = await getGuideBySlug(slug)
  if (!guide) notFound()

  const [session, { busy }] = await Promise.all([auth(), getGuideBusyDays(guide.id)])
  let viewer: Viewer = "guest"
  if (session?.user?.id) {
    if (session.user.role !== "CUSTOMER") {
      viewer = "other"
    } else {
      const me = await prisma.user.findUnique({ where: { id: session.user.id }, select: { phone: true } })
      viewer = me?.phone ? "traveller" : "traveller-no-phone"
    }
  }

  const from = typeof query.from === "string" && isISODate(query.from) ? query.from : ""
  const to = typeof query.to === "string" && isISODate(query.to) ? query.to : ""
  const rate = guide.dayRate === null ? null : toNumber(guide.dayRate)

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: guide.displayName,
    jobTitle: guide.guideType,
    knowsLanguage: guide.languages,
    ...(guide.rating && guide.rating.count > 0
      ? { aggregateRating: { "@type": "AggregateRating", ratingValue: guide.rating.average.toFixed(1), reviewCount: guide.rating.count } }
      : {}),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <section className="border-b border-border bg-papyrus">
        <div className="container-page pt-28 pb-12 sm:pt-36">
          <Breadcrumb items={[{ label: "Guides", href: "/guides" }, { label: guide.displayName }]} className="mb-8" />
          <div className="flex flex-col gap-8 sm:flex-row sm:items-center">
            <GuidePortrait guide={guide} sizes="160px" className="size-36 shrink-0 rounded-2xl sm:size-40" />
            <div>
              <Badge variant="cartouche">{guide.guideType}</Badge>
              <h1 className="mt-3 font-heading text-4xl leading-tight sm:text-5xl">{guide.displayName}</h1>
              <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-1.5"><MapPin className="size-4 text-lapis" /> {guide.regions.map((r) => r.name).join(" · ")}</li>
                <li className="flex items-center gap-1.5"><Languages className="size-4 text-lapis" /> {guide.languages.join(" · ")}</li>
                {guide.yearsExperience > 0 && (
                  <li className="flex items-center gap-1.5"><Award className="size-4 text-lapis" /> {guide.yearsExperience} {guide.yearsExperience === 1 ? "year" : "years"} guiding</li>
                )}
              </ul>
              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
                {guide.rating && guide.rating.count > 0 ? (
                  <Rating value={guide.rating.average} count={guide.rating.count} showValue size="md" />
                ) : (
                  <span className="text-sm text-muted-foreground">New guide · no reviews yet</span>
                )}
                <a href="#request" className="text-sm font-medium text-lapis hover:underline lg:hidden">
                  Check dates &amp; request ↓
                </a>
                <span className="text-sm">
                  {rate !== null ? (
                    <>From <span className="font-heading text-xl text-lapis tabular-nums">{formatPrice(rate, guide.currency, { compact: true })}</span> a day</>
                  ) : (
                    <span className="text-muted-foreground">Fee agreed per trip</span>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container-page section-y grid gap-12 lg:grid-cols-[1fr_400px]">
        <div className="min-w-0 space-y-12">
          <section>
            <p className="eyebrow">About</p>
            <h2 className="mt-3 font-heading text-3xl">Meet {guide.displayName.split(" ")[0]}</h2>
            <div className="mt-5 horizon-rule" aria-hidden />
            <p className="mt-6 max-w-2xl leading-relaxed whitespace-pre-line text-muted-foreground">{guide.bio}</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl">Specialties</h2>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {guide.specialties.map((s) => (
                <li key={s} className="flex items-start gap-2.5 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-faience" /> {s}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-2xl">What travellers say</h2>
            {guide.reviews.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">
                No reviews yet. Only travellers who completed a trip with {guide.displayName.split(" ")[0]} can review.
              </p>
            ) : (
              <div className="mt-5 space-y-4">
                {guide.reviews.map((review) => (
                  <article key={review.id} className="rounded-2xl border border-border bg-papyrus p-6">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Rating value={review.rating} />
                      <span className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</span>
                    </div>
                    <p className="mt-3 leading-relaxed">{review.comment}</p>
                    <p className="mt-3 text-sm text-muted-foreground">
                      {review.tourist.name ?? "Traveller"}
                      {review.tourist.nationality && ` · ${review.tourist.nationality}`} · verified trip
                    </p>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside id="request" className="scroll-mt-24 lg:sticky lg:top-24 lg:self-start">
          <GuideRequestPanel
            guideId={guide.id}
            guideName={guide.displayName}
            busy={[...busy]}
            today={todayInEgypt()}
            viewer={viewer}
            loginHref={`/login?callbackUrl=${encodeURIComponent(`/guides/${guide.slug}`)}`}
            initialFrom={from}
            initialTo={to}
          />
        </aside>
      </div>
    </>
  )
}
