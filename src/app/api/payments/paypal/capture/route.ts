import { NextResponse } from "next/server"

import { auth } from "@/lib/auth"
import {
  capturePayPalOrder,
  paypalConfigured,
  paypalMockAllowed,
} from "@/lib/paypal"
import { prisma } from "@/lib/prisma"
import { sendAdminBookingAlert, sendBookingConfirmation } from "@/lib/resend"
import { toNumber } from "@/lib/utils"

/**
 * POST /api/payments/paypal/capture — captures an approved order, confirms the
 * booking and sends the confirmation emails.
 */
export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const { bookingId, orderId } = (await request.json().catch(() => ({}))) as {
    bookingId?: string
    orderId?: string
  }

  if (!bookingId || !orderId) {
    return NextResponse.json(
      { error: "Missing bookingId or orderId" },
      { status: 400 }
    )
  }

  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, userId: session.user.id },
    include: {
      tour: { select: { title: true } },
      hotel: { select: { name: true } },
      car: { select: { name: true } },
    },
  })

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 })
  }

  // Already captured — return success so a double-click can't double-charge.
  if (booking.paymentStatus === "PAID") {
    return NextResponse.json({ ok: true, reference: booking.reference })
  }

  const isMock = orderId.startsWith("MOCK-")

  if (isMock) {
    if (!paypalMockAllowed()) {
      return NextResponse.json({ error: "Invalid order" }, { status: 400 })
    }
  } else if (!paypalConfigured) {
    return NextResponse.json(
      { error: "Payments are not configured." },
      { status: 503 }
    )
  } else {
    try {
      const capture = await capturePayPalOrder(orderId)
      if (capture.status !== "COMPLETED") {
        return NextResponse.json(
          { error: `Payment not completed (${capture.status}).` },
          { status: 402 }
        )
      }
    } catch (error) {
      console.error("[paypal:capture]", error)
      return NextResponse.json(
        { error: "We couldn't confirm the payment. Please contact us." },
        { status: 502 }
      )
    }
  }

  const confirmed = await prisma.booking.update({
    where: { id: booking.id },
    data: {
      status: "CONFIRMED",
      paymentStatus: "PAID",
      paymentId: orderId,
    },
  })

  const itemName =
    booking.tour?.title ?? booking.hotel?.name ?? booking.car?.name ?? "Booking"
  const itemType =
    booking.bookingType === "TOUR"
      ? "Tour"
      : booking.bookingType === "HOTEL"
        ? "Hotel"
        : "Vehicle"

  const emailData = {
    reference: confirmed.reference,
    itemName,
    itemType,
    checkIn: confirmed.checkIn,
    checkOut: confirmed.checkOut,
    guests: confirmed.guests,
    totalPrice: toNumber(confirmed.totalPrice),
    currency: confirmed.currency,
    customerName: confirmed.contactName ?? session.user.name ?? "Traveller",
    customerEmail: confirmed.contactEmail ?? session.user.email ?? "",
    specialRequests: confirmed.specialRequests,
  }

  // Email failures must not undo a successful payment.
  await Promise.allSettled([
    sendBookingConfirmation(emailData),
    sendAdminBookingAlert(emailData),
  ])

  return NextResponse.json({ ok: true, reference: confirmed.reference })
}
