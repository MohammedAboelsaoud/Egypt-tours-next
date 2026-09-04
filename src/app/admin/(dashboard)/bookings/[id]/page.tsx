import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Mail, Phone } from "lucide-react"

import { BookingStatusForm } from "@/components/admin/booking-status-form"
import { AdminCard } from "@/components/admin/ui"
import {
  BookingStatusBadge,
  PaymentStatusBadge,
} from "@/components/booking/booking-status-badge"
import { prisma } from "@/lib/prisma"
import { formatDate, formatDateTime, formatPrice, nightsBetween } from "@/lib/utils"

export const metadata: Metadata = { title: "Booking detail" }

export default async function AdminBookingDetailPage({
  params,
}: PageProps<"/admin/bookings/[id]">) {
  const { id } = await params

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          nationality: true,
          passportNo: true,
          createdAt: true,
        },
      },
      tour: { select: { title: true, slug: true, imageUrl: true } },
      hotel: { select: { name: true, slug: true, imageUrl: true } },
      car: { select: { name: true, slug: true, imageUrl: true } },
    },
  })

  if (!booking) notFound()

  const itemName =
    booking.tour?.title ?? booking.hotel?.name ?? booking.car?.name ?? "—"
  const itemImage =
    booking.tour?.imageUrl ?? booking.hotel?.imageUrl ?? booking.car?.imageUrl
  const itemHref = booking.tour
    ? `/tours/${booking.tour.slug}`
    : booking.hotel
      ? `/hotels/${booking.hotel.slug}`
      : booking.car
        ? `/car-rentals/${booking.car.slug}`
        : null

  const span = nightsBetween(booking.checkIn, booking.checkOut)

  return (
    <>
      <Link
        href="/admin/bookings"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-gold"
      >
        <ArrowLeft className="size-4" />
        All bookings
      </Link>

      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl">{booking.reference}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Created {formatDateTime(booking.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <BookingStatusBadge status={booking.status} />
          <PaymentStatusBadge status={booking.paymentStatus} />
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <AdminCard title="What was booked">
            <div className="flex flex-col gap-5 p-6 sm:flex-row">
              {itemImage && (
                <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-xl sm:w-40">
                  <Image
                    src={itemImage}
                    alt=""
                    fill
                    sizes="160px"
                    className="object-cover"
                  />
                </div>
              )}

              <div className="min-w-0 flex-1">
                <p className="text-[0.7rem] tracking-[0.14em] text-muted-foreground uppercase">
                  {booking.bookingType}
                </p>
                <h2 className="mt-1.5 font-heading text-xl">
                  {itemHref ? (
                    <Link
                      href={itemHref}
                      target="_blank"
                      className="hover:text-gold"
                    >
                      {itemName} ↗
                    </Link>
                  ) : (
                    itemName
                  )}
                </h2>

                <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-muted-foreground">
                      {booking.bookingType === "HOTEL" ? "Check-in" : "Start"}
                    </dt>
                    <dd className="mt-0.5 font-medium">
                      {formatDate(booking.checkIn, "long")}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">
                      {booking.bookingType === "HOTEL" ? "Check-out" : "End"}
                    </dt>
                    <dd className="mt-0.5 font-medium">
                      {formatDate(booking.checkOut, "long")}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Guests</dt>
                    <dd className="mt-0.5 font-medium">{booking.guests}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">
                      {booking.bookingType === "TOUR" ? "Days" : "Nights / days"}
                    </dt>
                    <dd className="mt-0.5 font-medium">{span}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border bg-muted/30 px-6 py-4">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="font-heading text-2xl text-gold">
                {formatPrice(booking.totalPrice, booking.currency)}
              </span>
            </div>
          </AdminCard>

          <AdminCard title="Customer">
            <dl className="divide-y divide-border">
              <Row label="Name" value={booking.contactName ?? booking.user.name ?? "—"} />
              <Row
                label="Email"
                value={booking.contactEmail ?? booking.user.email ?? "—"}
                href={`mailto:${booking.contactEmail ?? booking.user.email}`}
                icon={<Mail className="size-3.5" />}
              />
              <Row
                label="Phone"
                value={booking.contactPhone ?? booking.user.phone ?? "—"}
                href={
                  booking.contactPhone || booking.user.phone
                    ? `tel:${(booking.contactPhone ?? booking.user.phone)!.replace(/\s/g, "")}`
                    : undefined
                }
                icon={<Phone className="size-3.5" />}
              />
              <Row
                label="Nationality"
                value={booking.nationality ?? booking.user.nationality ?? "—"}
              />
              <Row
                label="Passport"
                value={booking.passportNo ?? booking.user.passportNo ?? "—"}
              />
              <Row
                label="Account created"
                value={formatDate(booking.user.createdAt)}
              />
            </dl>
          </AdminCard>

          {booking.specialRequests && (
            <AdminCard title="Special requests">
              <p className="px-6 py-5 text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
                {booking.specialRequests}
              </p>
            </AdminCard>
          )}
        </div>

        <div className="space-y-6">
          <AdminCard title="Update status">
            <div className="p-6">
              <BookingStatusForm
                id={booking.id}
                status={booking.status}
                paymentStatus={booking.paymentStatus}
              />
            </div>
          </AdminCard>

          <AdminCard title="Payment">
            <dl className="divide-y divide-border">
              <Row label="Amount" value={formatPrice(booking.totalPrice, booking.currency)} />
              <Row label="Currency" value={booking.currency} />
              <Row label="PayPal order" value={booking.paymentId ?? "—"} />
              <Row label="Last updated" value={formatDateTime(booking.updatedAt)} />
            </dl>
          </AdminCard>
        </div>
      </div>
    </>
  )
}

function Row({
  label,
  value,
  href,
  icon,
}: {
  label: string
  value: string
  href?: string
  icon?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-6 py-3.5 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="max-w-[60%] truncate text-right font-medium">
        {href ? (
          <a
            href={href}
            className="inline-flex items-center gap-1.5 hover:text-gold"
          >
            {icon}
            {value}
          </a>
        ) : (
          value
        )}
      </dd>
    </div>
  )
}
