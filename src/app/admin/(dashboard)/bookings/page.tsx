import type { Metadata } from "next"
import Link from "next/link"
import type { Prisma } from "@prisma/client"

import {
  BookingStatusBadge,
  PaymentStatusBadge,
} from "@/components/booking/booking-status-badge"
import { BookingFilters } from "@/components/admin/booking-filters"
import { AdminCard, AdminHeader, TableEmpty } from "@/components/admin/ui"
import { prisma } from "@/lib/prisma"
import { formatDate, formatPrice, toNumber } from "@/lib/utils"

export const metadata: Metadata = { title: "Bookings" }

const STATUSES = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"] as const
const PAYMENTS = ["PENDING", "PAID", "REFUNDED"] as const

export default async function AdminBookingsPage({
  searchParams,
}: PageProps<"/admin/bookings">) {
  const params = await searchParams
  const status = typeof params.status === "string" ? params.status : ""
  const payment = typeof params.payment === "string" ? params.payment : ""
  const type = typeof params.type === "string" ? params.type : ""
  const query = typeof params.q === "string" ? params.q.trim() : ""

  const where: Prisma.BookingWhereInput = {
    ...(STATUSES.includes(status as (typeof STATUSES)[number])
      ? { status: status as (typeof STATUSES)[number] }
      : {}),
    ...(PAYMENTS.includes(payment as (typeof PAYMENTS)[number])
      ? { paymentStatus: payment as (typeof PAYMENTS)[number] }
      : {}),
    ...(["TOUR", "HOTEL", "CAR"].includes(type)
      ? { bookingType: type as "TOUR" | "HOTEL" | "CAR" }
      : {}),
    ...(query
      ? {
          OR: [
            { reference: { contains: query, mode: "insensitive" } },
            { contactName: { contains: query, mode: "insensitive" } },
            { contactEmail: { contains: query, mode: "insensitive" } },
            { user: { email: { contains: query, mode: "insensitive" } } },
          ],
        }
      : {}),
  }

  const [bookings, revenue] = await Promise.all([
    prisma.booking.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        tour: { select: { title: true } },
        hotel: { select: { name: true } },
        car: { select: { name: true } },
      },
      take: 200,
    }),
    prisma.booking.aggregate({
      where: { ...where, paymentStatus: "PAID" },
      _sum: { totalPrice: true },
    }),
  ])

  return (
    <>
      <AdminHeader
        title="Bookings"
        description={`${bookings.length} booking${
          bookings.length === 1 ? "" : "s"
        } · ${formatPrice(toNumber(revenue._sum.totalPrice), "USD", {
          compact: true,
        })} paid`}
      />

      <BookingFilters />

      <AdminCard className="mt-6">
        {bookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[56rem] text-sm">
              <thead className="border-b border-border bg-muted/40 text-left">
                <tr>
                  <th className="px-6 py-3 font-medium">Reference</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Item</th>
                  <th className="px-4 py-3 font-medium">Dates</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Payment</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {bookings.map((booking) => {
                  const item =
                    booking.tour?.title ??
                    booking.hotel?.name ??
                    booking.car?.name ??
                    "—"

                  return (
                    <tr key={booking.id} className="hover:bg-muted/30">
                      <td className="px-6 py-3">
                        <Link
                          href={`/admin/bookings/${booking.id}`}
                          className="font-mono text-xs font-medium hover:text-lapis"
                        >
                          {booking.reference}
                        </Link>
                        <span className="mt-0.5 block text-[0.7rem] text-muted-foreground">
                          {formatDate(booking.createdAt)}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <span className="block max-w-[12rem] truncate">
                          {booking.contactName ?? booking.user.name ?? "—"}
                        </span>
                        <span className="block max-w-[12rem] truncate text-xs text-muted-foreground">
                          {booking.contactEmail ?? booking.user.email}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <span className="block max-w-[14rem] truncate">{item}</span>
                        <span className="text-[0.7rem] tracking-[0.1em] text-muted-foreground uppercase">
                          {booking.bookingType}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDate(booking.checkIn)}
                        <span className="block text-xs">
                          → {formatDate(booking.checkOut)}
                        </span>
                      </td>

                      <td className="px-4 py-3 font-medium">
                        {formatPrice(booking.totalPrice, booking.currency, {
                          compact: true,
                        })}
                      </td>

                      <td className="px-4 py-3">
                        <BookingStatusBadge status={booking.status} />
                      </td>

                      <td className="px-4 py-3">
                        <PaymentStatusBadge status={booking.paymentStatus} method={booking.paymentMethod} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <TableEmpty message="No bookings match those filters." />
        )}
      </AdminCard>
    </>
  )
}
