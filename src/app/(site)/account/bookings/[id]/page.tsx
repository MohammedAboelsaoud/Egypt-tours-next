import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { BookingStateBadge } from "@/components/booking/booking-status-badge"
import { CancelBooking } from "@/components/booking/cancel-booking"
import { FinishPayment } from "@/components/booking/finish-payment"
import { auth } from "@/lib/auth"
import { cancellationTerms } from "@/lib/cancellation"
import { formatDay } from "@/lib/guides/availability"
import { prisma } from "@/lib/prisma"
import { formatDateTime, formatPrice, toNumber } from "@/lib/utils"

export const metadata: Metadata = { title: "Booking", robots: { index: false, follow: false } }

export default async function BookingDetailPage({ params }: PageProps<"/account/bookings/[id]">) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) redirect(`/login?callbackUrl=/account/bookings/${id}`)

  const booking = await prisma.booking.findFirst({
    where: { id, userId: session.user.id },
    include: {
      tour: { select: { title: true, slug: true, imageUrl: true, region: { select: { name: true } } } },
      hotel: { select: { name: true, slug: true, imageUrl: true, region: { select: { name: true } } } },
      car: { select: { name: true, slug: true, imageUrl: true, region: { select: { name: true } } } },
    },
  })
  if (!booking) notFound()

  const item = booking.tour
    ? { name: booking.tour.title, href: `/tours/${booking.tour.slug}`, image: booking.tour.imageUrl, region: booking.tour.region.name, kind: "tour" }
    : booking.hotel
      ? { name: booking.hotel.name, href: `/hotels/${booking.hotel.slug}`, image: booking.hotel.imageUrl, region: booking.hotel.region.name, kind: "hotel" }
      : booking.car
        ? { name: booking.car.name, href: `/car-rentals/${booking.car.slug}`, image: booking.car.imageUrl, region: booking.car.region.name, kind: "car" }
        : { name: "Booking", href: "/", image: null, region: "", kind: "booking" }

  const total = toNumber(booking.totalPrice)
  const refunded = booking.refundAmount === null ? null : toNumber(booking.refundAmount)
  const unfinished = booking.status === "PENDING" && booking.paymentStatus === "PENDING"
  const terms = cancellationTerms({
    checkIn: booking.checkIn,
    total,
    status: booking.status,
    paymentStatus: booking.paymentStatus,
  })
  const cancelSummary =
    booking.paymentStatus !== "PAID"
      ? "Nothing has been charged, so there's nothing to refund."
      : terms.refund > 0
        ? `You'll get ${formatPrice(terms.refund, booking.currency)} back to your card (${terms.percent}%).`
        : "It's within 7 days of the start, so under the booking terms there's no refund."

  const paymentLine =
    booking.status === "CANCELLED"
      ? refunded && refunded > 0
        ? `Refunded ${formatPrice(refunded, booking.currency)} of ${formatPrice(total, booking.currency)}`
        : booking.paymentStatus === "PAID"
          ? "Paid, not refundable"
          : "Not charged"
      : booking.paymentStatus === "PAID"
        ? "Paid by card"
        : booking.paymentMethod === "CASH"
          ? "Pay in cash on the day"
          : "Not paid yet"

  const rows: [string, React.ReactNode][] = [
    ["Reference", <span key="r" className="font-mono">{booking.reference}</span>],
    [booking.bookingType === "HOTEL" ? "Check-in" : "Start", formatDay(booking.checkIn, "long")],
    [booking.bookingType === "HOTEL" ? "Check-out" : "End", formatDay(booking.checkOut, "long")],
    [booking.bookingType === "CAR" ? "Passengers" : "Guests", booking.guests],
    ["Lead traveller", booking.contactName ?? "—"],
    ["Email", booking.contactEmail ?? "—"],
    ["Phone", booking.contactPhone ?? "—"],
    ["Nationality", booking.nationality ?? "—"],
    ["Booked on", formatDateTime(booking.createdAt)],
  ]
  if (booking.cancelledAt) rows.push(["Cancelled on", formatDateTime(booking.cancelledAt)])

  return (
    <div className="space-y-6">
      <Link href="/account/bookings" className="inline-flex items-center gap-1.5 text-sm font-medium text-lapis hover:underline">
        <ArrowLeft className="size-4" /> All bookings
      </Link>

      <article className="overflow-hidden rounded-2xl border border-border bg-papyrus">
        <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
          {item.image && (
            <span className="relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded-xl sm:aspect-square sm:w-32">
              <Image src={item.image} alt="" fill sizes="128px" className="object-cover" />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <BookingStateBadge booking={{ ...booking, refundAmount: booking.refundAmount?.toString() ?? null }} />
            <h2 className="mt-2 font-heading text-2xl leading-snug">{item.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {item.region} ·{" "}
              <Link href={item.href} className="font-medium text-lapis hover:underline">
                View {item.kind} page
              </Link>
            </p>
          </div>
          <div className="sm:text-right">
            <p className="text-xs tracking-[0.12em] text-muted-foreground uppercase">Total</p>
            <p className="font-heading text-3xl text-lapis tabular-nums">{formatPrice(total, booking.currency)}</p>
            <p className="text-sm text-muted-foreground">{paymentLine}</p>
          </div>
        </div>

        <dl className="divide-y divide-border border-t border-border">
          {rows.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4 px-6 py-3 text-sm">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="text-right font-medium">{value}</dd>
            </div>
          ))}
        </dl>

        {booking.specialRequests && (
          <p className="border-t border-border bg-limestone px-6 py-4 text-sm">
            <span className="font-medium">Your notes:</span> {booking.specialRequests}
          </p>
        )}
      </article>

      {unfinished && terms.allowed && (
        <section className="rounded-2xl border border-lapis/30 bg-papyrus p-6">
          <h2 className="font-heading text-xl">Finish your booking</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            This booking isn&apos;t confirmed yet. Pay by card now, or confirm it and pay in cash on the day.
          </p>
          <div className="mt-5">
            <FinishPayment bookingId={booking.id} amount={total} currency={booking.currency} />
          </div>
        </section>
      )}

      {terms.allowed ? (
        <section className="rounded-2xl border border-border bg-papyrus p-6">
          <h2 className="font-heading text-xl">Cancel this booking</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Free cancellation up to 14 days before the start date, 50% refundable up to 7 days before, and
            non-refundable inside 7 days. Your trip starts in {terms.daysBefore} {terms.daysBefore === 1 ? "day" : "days"}.
          </p>
          <p className="mt-3 text-sm font-medium">{cancelSummary}</p>
          <div className="mt-4">
            <CancelBooking bookingId={booking.id} summary={cancelSummary} />
          </div>
        </section>
      ) : (
        booking.status !== "CANCELLED" && (
          <p className="text-sm text-muted-foreground">
            {terms.reason}{" "}
            <Link href="/contact" className="font-medium text-lapis hover:underline">Contact us</Link>
          </p>
        )
      )}
    </div>
  )
}
