import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Heart } from "lucide-react"

import { TourCard } from "@/components/tours/tour-card"
import { EmptyState } from "@/components/ui/empty-state"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getTourRatings } from "@/lib/queries"

export const metadata: Metadata = {
  title: "My wishlist",
  robots: { index: false, follow: false },
}

export default async function WishlistPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login?callbackUrl=/account/wishlist")

  const saved = await prisma.wishlist.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { tour: { include: { region: true } } },
  })

  const tours = saved.map((entry) => entry.tour).filter((tour) => tour.published)
  const ratings = await getTourRatings(tours.map((tour) => tour.id))

  return (
    <div>
      <h2 className="font-heading text-2xl">Saved tours</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Keep a shortlist while you decide — nothing here is booked or held.
      </p>

      <div className="mt-8">
        {tours.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2">
            {tours.map((tour) => (
              <TourCard
                key={tour.id}
                tour={{
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
                }}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Heart className="size-5" />}
            title="Your wishlist is empty"
            description="Tap the heart on any tour to keep it here while you plan."
            action={
              <Link
                href="/tours"
                className="rounded-lg bg-gold px-6 py-3 text-sm font-medium text-white hover:bg-gold-light"
              >
                Browse tours
              </Link>
            }
          />
        )}
      </div>
    </div>
  )
}
