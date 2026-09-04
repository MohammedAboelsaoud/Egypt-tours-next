import type { Metadata } from "next"
import Link from "next/link"
import {
  BedDouble,
  CalendarCheck,
  Car,
  DollarSign,
  Inbox,
  Map,
  Star,
} from "lucide-react"

import {
  BookingStatusBadge,
  PaymentStatusBadge,
} from "@/components/booking/booking-status-badge"
import { AdminCard, AdminHeader, StatsCard, TableEmpty } from "@/components/admin/ui"
import { prisma } from "@/lib/prisma"
import { formatDate, formatPrice, toNumber } from "@/lib/utils"

export const metadata: Metadata = { title: "Overview" }

export default async function AdminOverviewPage() {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const [
    totalBookings,
    paidAggregate,
    monthAggregate,
    pendingInquiries,
    pendingReviews,
    tours,
    hotels,
    cars,
    recentBookings,
    recentInquiries,
  ] = await Promise.all([
    prisma.booking.count(),
    prisma.booking.aggregate({
      where: { paymentStatus: "PAID" },
      _sum: { totalPrice: true },
    }),
    prisma.booking.aggregate({
      where: { paymentStatus: "PAID", createdAt: { gte: monthStart } },
      _sum: { totalPrice: true },
      _count: { _all: true },
    }),
    prisma.inquiry.count({ where: { handled: false } }),
    prisma.review.count({ where: { approved: false } }),
    prisma.tour.count({ where: { published: true } }),
    prisma.hotel.count({ where: { published: true } }),
    prisma.car.count({ where: { published: true } }),
    prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: {
        user: { select: { name: true, email: true } },
        tour: { select: { title: true } },
        hotel: { select: { name: true } },
        car: { select: { name: true } },
      },
    }),
    prisma.inquiry.findMany({
      where: { handled: false },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ])

  const revenue = toNumber(paidAggregate._sum.totalPrice)
  const monthRevenue = toNumber(monthAggregate._sum.totalPrice)

  return (
    <>
      <AdminHeader
        title="Overview"
        description={`${formatDate(now, "long")} — everything at a glance.`}
      />

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          label="Total bookings"
          value={totalBookings}
          hint={`${monthAggregate._count._all} this month`}
          icon={<CalendarCheck className="size-4" />}
          tone="gold"
        />
        <StatsCard
          label="Revenue (paid)"
          value={formatPrice(revenue, "USD", { compact: true })}
          hint={`${formatPrice(monthRevenue, "USD", { compact: true })} this month`}
          icon={<DollarSign className="size-4" />}
          tone="teal"
        />
        <StatsCard
          label="Open inquiries"
          value={pendingInquiries}
          hint={pendingInquiries > 0 ? "Awaiting a reply" : "All handled"}
          icon={<Inbox className="size-4" />}
          tone={pendingInquiries > 0 ? "amber" : "default"}
        />
        <StatsCard
          label="Reviews to approve"
          value={pendingReviews}
          hint={pendingReviews > 0 ? "Pending moderation" : "Nothing waiting"}
          icon={<Star className="size-4" />}
          tone={pendingReviews > 0 ? "amber" : "default"}
        />
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-3">
        <StatsCard
          label="Published tours"
          value={tours}
          icon={<Map className="size-4" />}
        />
        <StatsCard
          label="Published hotels"
          value={hotels}
          icon={<BedDouble className="size-4" />}
        />
        <StatsCard
          label="Published vehicles"
          value={cars}
          icon={<Car className="size-4" />}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <AdminCard
          title="Recent bookings"
          description="The six most recent, newest first."
        >
          {recentBookings.length > 0 ? (
            <ul className="divide-y divide-border">
              {recentBookings.map((booking) => {
                const item =
                  booking.tour?.title ??
                  booking.hotel?.name ??
                  booking.car?.name ??
                  "—"
                return (
                  <li key={booking.id}>
                    <Link
                      href={`/admin/bookings/${booking.id}`}
                      className="flex flex-wrap items-center gap-3 px-6 py-4 transition-colors hover:bg-muted/50"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-2 text-sm font-medium">
                          <span className="font-mono text-xs text-muted-foreground">
                            {booking.reference}
                          </span>
                          <span className="truncate">{item}</span>
                        </p>
                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          {booking.user.name ?? booking.user.email} ·{" "}
                          {formatDate(booking.checkIn)}
                        </p>
                      </div>

                      <BookingStatusBadge status={booking.status} />
                      <span className="w-20 text-right text-sm font-medium">
                        {formatPrice(booking.totalPrice, booking.currency, {
                          compact: true,
                        })}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          ) : (
            <TableEmpty message="No bookings yet." />
          )}

          <div className="border-t border-border px-6 py-3">
            <Link
              href="/admin/bookings"
              className="text-sm font-medium text-gold hover:underline"
            >
              All bookings →
            </Link>
          </div>
        </AdminCard>

        <AdminCard
          title="Open inquiries"
          description="Website enquiries not yet marked handled."
        >
          {recentInquiries.length > 0 ? (
            <ul className="divide-y divide-border">
              {recentInquiries.map((inquiry) => (
                <li key={inquiry.id} className="px-6 py-4">
                  <p className="text-sm font-medium">{inquiry.name}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {inquiry.email}
                    {inquiry.destination ? ` · ${inquiry.destination}` : ""}
                  </p>
                  <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                    {inquiry.message}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <TableEmpty message="Nothing waiting." />
          )}

          <div className="border-t border-border px-6 py-3">
            <Link
              href="/admin/inquiries"
              className="text-sm font-medium text-gold hover:underline"
            >
              All inquiries →
            </Link>
          </div>
        </AdminCard>
      </div>
    </>
  )
}
