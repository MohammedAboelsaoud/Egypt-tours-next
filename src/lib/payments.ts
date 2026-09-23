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
    data: { status: "CONFIRMED", paymentStatus: "PAID", paymentId },
  })

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      user: { select: { name: true, email: true } },
      tour: { select: { title: true } },
      hotel: { select: { name: true } },
      car: { select: { name: true } },
    },
  })
  if (!booking) return null

  // Another caller already confirmed it.
  if (count === 0) return booking.reference

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
  }

  // Email failures must not undo a successful payment.
  await Promise.allSettled([
    sendBookingConfirmation(emailData),
    sendAdminBookingAlert(emailData),
  ])

  return booking.reference
}
