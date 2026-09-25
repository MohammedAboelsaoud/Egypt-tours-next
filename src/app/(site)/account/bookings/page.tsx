import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { redirect } from "next/navigation"
import { CalendarCheck, CalendarDays, Users } from "lucide-react"

import {
  BookingStatusBadge,
  PaymentStatusBadge,
} from "@/components/booking/booking-status-badge"
import { EmptyState } from "@/components/ui/empty-state"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { formatDate, formatPrice } from "@/lib/utils"

export const metadata: Metadata = {
  title: "My bookings",
  robots: { index: false, follow: false },
}

export default async function AccountBookingsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login?callbackUrl=/account/bookings")

  const bookings = await prisma.booking.findMany({
    where: { userId: session.user.id },
    orderBy: { checkIn: "desc" },
    include: {
      tour: { select: { title: true, slug: true, imageUrl: true } },
      hotel: { select: { name: true, slug: true, imageUrl: true } },
      car: { select: { name: true, slug: true, imageUrl: true } },
    },
  })

  const now = new Date()
  const upcoming = bookings.filter(
    (booking) => booking.checkOut >= now && booking.status !== "CANCELLED"
  )
  const past = bookings.filter(
    (booking) => booking.checkOut < now || booking.status === "CANCELLED"
  )

  return (
    <div className="space-y-10">
      <section>
        <h2 className="font-heading text-2xl">Upcoming</h2>
        <div className="mt-6">
          {upcoming.length > 0 ? (
            <ul className="space-y-4">
              {upcoming.map((booking) => (
                <BookingRow key={booking.id} booking={booking} />
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={<CalendarCheck className="size-5" />}
              title="No trips booked yet"
              description="When you book a tour, hotel or car it will appear here with its reference and status."
              action={
                <Link
                  href="/tours"
                  className="rounded-lg bg-lapis px-6 py-3 text-sm font-medium text-white hover:bg-lapis-deep"
                >
                  Browse tours
                </Link>
              }
            />
          )}
        </div>
      </section>

      {past.length > 0 && (
        <section>
          <h2 className="font-heading text-2xl">Past & cancelled</h2>
          <ul className="mt-6 space-y-4">
            {past.map((booking) => (
              <BookingRow key={booking.id} booking={booking} muted />
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

type BookingWithItems = Awaited<
  ReturnType<typeof prisma.booking.findMany<{
    include: {
      tour: { select: { title: true; slug: true; imageUrl: true } }
      hotel: { select: { name: true; slug: true; imageUrl: true } }
      car: { select: { name: true; slug: true; imageUrl: true } }
    }
  }>>
>[number]

function BookingRow({
  booking,
  muted = false,
}: {
  booking: BookingWithItems
  muted?: boolean
}) {
  const name =
    booking.tour?.title ?? booking.hotel?.name ?? booking.car?.name ?? "Booking"
  const image =
    booking.tour?.imageUrl ?? booking.hotel?.imageUrl ?? booking.car?.imageUrl
  const href = booking.tour
    ? `/tours/${booking.tour.slug}`
    : booking.hotel
      ? `/hotels/${booking.hotel.slug}`
      : booking.car
        ? `/car-rentals/${booking.car.slug}`
        : "#"

  const kindLabel =
    booking.bookingType === "TOUR"
      ? "Tour"
      : booking.bookingType === "HOTEL"
        ? "Hotel"
        : "Vehicle"

  return (
    <li
      className={`overflow-hidden rounded-2xl border border-border bg-papyrus ${
        muted ? "opacity-75" : ""
      }`}
    >
      <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center">
        {image && (
          <Link
            href={href}
            className="relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded-xl sm:aspect-square sm:w-28"
          >
            <Image
              src={image}
              alt={name}
              fill
              sizes="120px"
              className="object-cover"
            />
          </Link>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[0.65rem] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              {kindLabel}
            </span>
            <BookingStatusBadge status={booking.status} />
            <PaymentStatusBadge status={booking.paymentStatus} />
          </div>

          <h3 className="mt-2 font-heading text-lg leading-snug">
            <Link href={href} className="hover:text-lapis">
              {name}
            </Link>
          </h3>

          <div className="mt-2.5 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="size-3.5 text-lapis" />
              {formatDate(booking.checkIn)} → {formatDate(booking.checkOut)}
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="size-3.5 text-lapis" />
              {booking.guests}
            </span>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <p className="text-xs tracking-[0.12em] text-muted-foreground uppercase">
            {booking.reference}
          </p>
          <p className="mt-1 font-heading text-2xl text-lapis">
            {formatPrice(booking.totalPrice, booking.currency)}
          </p>
        </div>
      </div>

      {booking.specialRequests && (
        <p className="border-t border-border bg-limestone px-5 py-3 text-xs text-muted-foreground">
          <span className="font-medium">Your notes:</span>{" "}
          {booking.specialRequests}
        </p>
      )}
    </li>
  )
}
