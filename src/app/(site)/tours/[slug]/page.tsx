import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Clock, MapPin, Sparkles, Users } from "lucide-react"

import { BookingCta } from "@/components/booking/booking-cta"
import { BreadcrumbJsonLd } from "@/components/layout/breadcrumb"
import { PageHero } from "@/components/layout/page-hero"
import { RegionMap } from "@/components/maps/region-map"
import { IncludesList } from "@/components/tours/includes-list"
import { ItineraryTimeline } from "@/components/tours/itinerary-timeline"
import { ReviewSection } from "@/components/tours/review-section"
import { TourCard } from "@/components/tours/tour-card"
import { WishlistButton } from "@/components/tours/wishlist-button"
import { Gallery } from "@/components/ui/gallery"
import { Rating } from "@/components/ui/rating"
import { SectionHeading } from "@/components/ui/section-heading"
import { SITE } from "@/lib/constants"
import { prisma } from "@/lib/prisma"
import { getTourRatings } from "@/lib/queries"
import { getSettings } from "@/lib/settings"
import { toNumber } from "@/lib/utils"
import type { ItineraryDay } from "@/types"

export const revalidate = 3600

export async function generateStaticParams() {
  const tours = await prisma.tour.findMany({
    where: { published: true },
    select: { slug: true },
  })
  return tours.map((tour) => ({ slug: tour.slug }))
}

async function getTour(slug: string) {
  return prisma.tour.findFirst({
    where: { slug, published: true },
    include: {
      region: true,
      reviews: {
        where: { approved: true },
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true } } },
      },
    },
  })
}

export async function generateMetadata({
  params,
}: PageProps<"/tours/[slug]">): Promise<Metadata> {
  const { slug } = await params
  const tour = await prisma.tour.findFirst({
    where: { slug, published: true },
    select: { title: true, summary: true, imageUrl: true },
  })

  if (!tour) return { title: "Tour not found" }

  return {
    title: tour.title,
    description: tour.summary.slice(0, 160),
    alternates: { canonical: `/tours/${slug}` },
    openGraph: {
      title: tour.title,
      description: tour.summary.slice(0, 200),
      images: [{ url: tour.imageUrl }],
      type: "article",
    },
  }
}

export default async function TourPage({ params }: PageProps<"/tours/[slug]">) {
  const { slug } = await params
  const [tour, settings] = await Promise.all([getTour(slug), getSettings()])

  if (!tour) notFound()

  const related = await prisma.tour.findMany({
    where: {
      published: true,
      regionId: tour.regionId,
      NOT: { id: tour.id },
    },
    include: { region: true },
    take: 3,
  })
  const relatedRatings = await getTourRatings(related.map((item) => item.id))

  const itinerary = (tour.itinerary as unknown as ItineraryDay[]) ?? []
  const price = toNumber(tour.priceFrom)
  const average =
    tour.reviews.length > 0
      ? tour.reviews.reduce((sum, review) => sum + review.rating, 0) /
        tour.reviews.length
      : 0

  const crumbs = [
    { label: "Tours", href: "/tours" },
    { label: tour.title },
  ]

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: tour.title,
    description: tour.summary,
    image: [tour.imageUrl, ...tour.galleryUrls],
    brand: { "@type": "Brand", name: SITE.name },
    offers: {
      "@type": "Offer",
      price: price.toFixed(2),
      priceCurrency: tour.currency,
      availability: "https://schema.org/InStock",
      url: `${SITE.url}/tours/${tour.slug}`,
    },
    ...(tour.reviews.length > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: average.toFixed(1),
            reviewCount: String(tour.reviews.length),
          },
        }
      : {}),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BreadcrumbJsonLd items={crumbs} baseUrl={SITE.url} />

      <PageHero
        eyebrow={tour.region.name}
        title={tour.title}
        description={tour.summary}
        image={tour.imageUrl}
        crumbs={crumbs}
        size="tall"
      >
        <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm text-white/85">
          <span className="flex items-center gap-2">
            <Clock className="size-4 text-gold-light" />
            {tour.durationDays} {tour.durationDays === 1 ? "day" : "days"}
          </span>
          <span className="flex items-center gap-2">
            <Users className="size-4 text-gold-light" />
            Max {tour.maxGroupSize} travellers
          </span>
          <span className="flex items-center gap-2">
            <MapPin className="size-4 text-gold-light" />
            {tour.region.cities.slice(0, 3).join(" · ")}
          </span>
          {tour.reviews.length > 0 && (
            <Rating value={average} count={tour.reviews.length} showValue />
          )}
        </div>
      </PageHero>

      <div className="container-page section-y">
        <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
          <div className="min-w-0 space-y-14">
            <Gallery
              images={[tour.imageUrl, ...tour.galleryUrls]}
              alt={tour.title}
            />

            <section>
              <p className="eyebrow">The journey</p>
              <h2 className="mt-3 font-heading text-3xl">About this tour</h2>
              <div className="mt-5 gold-rule" />
              <div className="mt-6 space-y-4 text-lg leading-relaxed text-muted-foreground">
                {tour.description.split("\n\n").map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </section>

            {tour.highlights.length > 0 && (
              <section>
                <h2 className="font-heading text-2xl">Highlights</h2>
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {tour.highlights.map((highlight) => (
                    <li
                      key={highlight}
                      className="flex gap-3 rounded-xl border border-border bg-ivory p-4 text-sm leading-relaxed"
                    >
                      <Sparkles className="mt-0.5 size-4 shrink-0 text-gold" />
                      {highlight}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {itinerary.length > 0 && (
              <section>
                <p className="eyebrow">Day by day</p>
                <h2 className="mt-3 font-heading text-3xl">Your itinerary</h2>
                <div className="mt-5 mb-10 gold-rule" />
                <ItineraryTimeline days={itinerary} />
              </section>
            )}

            <section>
              <IncludesList includes={tour.includes} excludes={tour.excludes} />
            </section>

            {tour.lat && tour.lng && (
              <section>
                <h2 className="font-heading text-2xl">Where it starts</h2>
                <div className="mt-6">
                  <RegionMap
                    title={tour.title}
                    center={{ lat: tour.lat, lng: tour.lng }}
                    zoom={10}
                    markers={[
                      {
                        id: tour.id,
                        lat: tour.lat,
                        lng: tour.lng,
                        title: tour.title,
                      },
                    ]}
                  />
                </div>
              </section>
            )}
          </div>

          <BookingCta
            price={price}
            currency={tour.currency}
            unit="per person"
            bookHref={`/book/tour/${tour.id}`}
            itemName={tour.title}
            whatsapp={settings.whatsappNumber}
            facts={[
              { label: "Duration", value: `${tour.durationDays} days` },
              { label: "Group size", value: `Up to ${tour.maxGroupSize}` },
              { label: "Region", value: tour.region.name },
              { label: "Guide", value: "Private Egyptologist" },
            ]}
          >
            <WishlistButton tourId={tour.id} className="w-full" />
          </BookingCta>
        </div>
      </div>

      <section className="bg-ivory">
        <div className="container-page section-y">
          <SectionHeading
            eyebrow="Reviews"
            title="What travellers said"
            className="mb-12"
          />
          <ReviewSection
            tourId={tour.id}
            average={average}
            reviews={tour.reviews.map((review) => ({
              id: review.id,
              rating: review.rating,
              comment: review.comment,
              author: review.user.name ?? "Traveller",
              createdAt: review.createdAt.toISOString(),
            }))}
          />
        </div>
      </section>

      {related.length > 0 && (
        <section className="container-page section-y">
          <SectionHeading
            eyebrow="You may also like"
            title={`More in ${tour.region.name}`}
            action={
              <Link
                href={`/destinations/${tour.region.slug}`}
                className="hidden text-sm font-medium text-gold sm:block"
              >
                See the region →
              </Link>
            }
            className="mb-12"
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <TourCard
                key={item.id}
                tour={{
                  slug: item.slug,
                  title: item.title,
                  summary: item.summary,
                  imageUrl: item.imageUrl,
                  durationDays: item.durationDays,
                  priceFrom: item.priceFrom.toString(),
                  currency: item.currency,
                  maxGroupSize: item.maxGroupSize,
                  featured: item.featured,
                  region: { name: item.region.name, slug: item.region.slug },
                  rating: relatedRatings.get(item.id) ?? null,
                }}
              />
            ))}
          </div>
        </section>
      )}
    </>
  )
}
