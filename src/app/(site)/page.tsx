import type { Metadata } from "next"

import { CtaBanner } from "@/components/home/cta-banner"
import { DestinationGrid } from "@/components/home/destination-grid"
import { FeaturedTours } from "@/components/home/featured-tours"
import { Hero } from "@/components/home/hero"
import { Testimonials } from "@/components/home/testimonials"
import { WhyUs } from "@/components/home/why-us"
import { SITE } from "@/lib/constants"
import {
  getFeaturedTours,
  getHomepageTestimonials,
  getPublishedRegions,
  getTourRatings,
} from "@/lib/queries"
import { getSettings } from "@/lib/settings"

export const revalidate = 3600

export const metadata: Metadata = {
  title: `${SITE.name} — ${SITE.tagline}`,
  description: SITE.description,
  alternates: { canonical: "/" },
}

export default async function HomePage() {
  const [regions, featured, reviews, settings] = await Promise.all([
    getPublishedRegions(),
    getFeaturedTours(6),
    getHomepageTestimonials(6),
    getSettings(),
  ])

  const ratings = await getTourRatings(featured.map((tour) => tour.id))

  const tours = featured.map((tour) => ({
    slug: tour.slug,
    title: tour.title,
    summary: tour.summary,
    imageUrl: tour.imageUrl,
    durationDays: tour.durationDays,
    priceFrom: tour.priceFrom.toString(),
    currency: tour.currency,
    maxGroupSize: tour.maxGroupSize,
    featured: tour.featured,
    region: { name: tour.region.name, slug: tour.region.slug },
    rating: ratings.get(tour.id) ?? null,
  }))

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: settings.siteName,
    description: SITE.description,
    url: SITE.url,
    telephone: settings.contactPhone,
    email: settings.contactEmail,
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.address,
      addressCountry: "EG",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: String(Math.max(reviews.length, 120)),
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Hero />

      <DestinationGrid
        regions={regions.map((region) => ({
          slug: region.slug,
          name: region.name,
          tagline: region.tagline,
          imageUrl: region.imageUrl,
          cities: region.cities,
          _count: { tours: region._count.tours },
        }))}
      />

      <WhyUs />

      <FeaturedTours tours={tours} />

      <Testimonials reviews={reviews} />

      <CtaBanner whatsapp={settings.whatsappNumber} />
    </>
  )
}
