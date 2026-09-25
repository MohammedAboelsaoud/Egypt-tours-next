import { notFound, redirect } from "next/navigation"

import { BookingFlow, type BookingItem } from "@/components/booking/booking-flow"
import { Breadcrumb } from "@/components/layout/breadcrumb"
import { auth } from "@/lib/auth"
import { applyMarkup } from "@/lib/markup"
import { getHotelMarkupPercent } from "@/lib/pricing-settings"
import { prisma } from "@/lib/prisma"
import { getBookableItem, type BookableKind } from "@/lib/queries"
import { toNumber } from "@/lib/utils"

/**
 * Shared server shell behind /book/tour/[id], /book/hotel/[id] and
 * /book/car/[id]: enforces sign-in, loads the item, hands the rest to the
 * client flow.
 */
export async function BookingPageShell({
  kind,
  id,
}: {
  kind: BookableKind
  id: string
}) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=${encodeURIComponent(`/book/${kind}/${id}`)}`)
  }

  const [item, user] = await Promise.all([
    getBookableItem(kind, id),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        email: true,
        phone: true,
        nationality: true,
        passportNo: true,
      },
    }),
  ])

  if (!item) notFound()

  let bookingItem: BookingItem

  if (kind === "tour" && "title" in item) {
    bookingItem = {
      id: item.id,
      kind: "TOUR",
      name: item.title,
      imageUrl: item.imageUrl,
      regionName: item.region.name,
      unitPrice: toNumber(item.priceFrom),
      currency: item.currency,
      maxGuests: item.maxGroupSize,
      fixedDays: item.durationDays,
      href: `/tours/${item.slug}`,
    }
  } else if (kind === "hotel" && "pricePerNight" in item) {
    bookingItem = {
      id: item.id,
      kind: "HOTEL",
      name: item.name,
      imageUrl: item.imageUrl,
      regionName: item.region.name,
      // The traveller's price: official rate plus markup, as /api/bookings charges it.
      unitPrice: applyMarkup(toNumber(item.pricePerNight), await getHotelMarkupPercent()),
      currency: item.currency,
      maxGuests: item.maxGuests,
      fixedDays: null,
      href: `/hotels/${item.slug}`,
    }
  } else if (kind === "car" && "pricePerDay" in item) {
    bookingItem = {
      id: item.id,
      kind: "CAR",
      name: item.name,
      imageUrl: item.imageUrl,
      regionName: item.region.name,
      unitPrice: toNumber(item.pricePerDay),
      currency: item.currency,
      maxGuests: item.seats,
      fixedDays: null,
      href: `/car-rentals/${item.slug}`,
    }
  } else {
    notFound()
  }

  const label =
    kind === "tour" ? "Tours" : kind === "hotel" ? "Hotels" : "Car Rentals"
  const listHref =
    kind === "tour" ? "/tours" : kind === "hotel" ? "/hotels" : "/car-rentals"

  return (
    <div className="border-b border-border bg-limestone">
      <div className="container-page pt-28 pb-20 sm:pt-32">
        <Breadcrumb
          items={[
            { label, href: listHref },
            { label: bookingItem.name, href: bookingItem.href },
            { label: "Book" },
          ]}
          className="mb-7"
        />

        <div className="mb-12 max-w-3xl">
          <p className="eyebrow">Booking</p>
          <h1 className="mt-3 font-heading text-3xl leading-tight sm:text-4xl">
            {bookingItem.name}
          </h1>
        </div>

        <BookingFlow
          item={bookingItem}
          user={
            user ?? {
              name: session.user.name ?? null,
              email: session.user.email ?? null,
              phone: null,
              nationality: null,
              passportNo: null,
            }
          }
        />
      </div>
    </div>
  )
}
