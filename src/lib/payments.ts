import "server-only"

import { prisma } from "@/lib/prisma"
import { sendAdminBookingAlert, sendBookingConfirmation } from "@/lib/resend"
import { toNumber } from "@/lib/utils"

/**
 * Confirms a booking once its payment has cleared and sends the emails.
 *
 * Both the browser (right after checkout) and the Stripe webhook call this, in
 * either order. The conditional update makes the PENDING → PAID transition
 * happen exactly once, so the emails are never sent twice.
 */
export async function markBookingPaid(bookingId: string, paymentId: string) {
  const { count } = await prisma.booking.updateMany({
    where: { id: bookingId, paymentStatus: "PENDING" },
    data: { status: "CONFIRMED", paymentStatus: "PAID", paymentMethod: "CARD", paymentId },
  })

  const booking = await loadBooking(bookingId)
  if (!booking) return null

  // Another caller already confirmed it.
  if (count === 0) return booking.reference

  await sendBookingEmails(booking)
  return booking.reference
}

/**
 * Confirms a booking the traveller will pay for in cash on the day. Payment
 * stays PENDING until an admin marks it PAID. Only the owner's own unpaid,
 * unconfirmed booking can be switched, and only once.
 */
export async function reserveBookingForCash(bookingId: string, userId: string) {
  const { count } = await prisma.booking.updateMany({
    where: { id: bookingId, userId, status: "PENDING", paymentStatus: "PENDING" },
    data: { status: "CONFIRMED", paymentMethod: "CASH" },
  })
  if (count === 0) return null

  const booking = await loadBooking(bookingId)
  if (!booking) return null

  await sendBookingEmails(booking)
  return booking.reference
}

type BookingWithItem = NonNullable<Awaited<ReturnType<typeof loadBooking>>>

function loadBooking(bookingId: string) {
  return prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      user: { select: { name: true, email: true } },
      tour: { select: { title: true } },
      hotel: { select: { name: true } },
      car: { select: { name: true } },
    },
  })
}

async function sendBookingEmails(booking: BookingWithItem) {
  const emailData = {
    reference: booking.reference,
    itemName:
      booking.tour?.title ?? booking.hotel?.name ?? booking.car?.name ?? "Booking",
    itemType:
      booking.bookingType === "TOUR"
        ? "Tour"
        : booking.bookingType === "HOTEL"
          ? "Hotel"
          : "Vehicle",
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    guests: booking.guests,
    totalPrice: toNumber(booking.totalPrice),
    currency: booking.currency,
    customerName: booking.contactName ?? booking.user.name ?? "Traveller",
    customerEmail: booking.contactEmail ?? booking.user.email ?? "",
    specialRequests: booking.specialRequests,
    paymentMethod: booking.paymentMethod,
  }

  // Email failures must not undo a successful payment.
  await Promise.allSettled([
    sendBookingConfirmation(emailData),
    sendAdminBookingAlert(emailData),
  ])
}
