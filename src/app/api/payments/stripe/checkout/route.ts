import { NextResponse } from "next/server"

import { auth } from "@/lib/auth"
import { markBookingPaid } from "@/lib/payments"
import { prisma } from "@/lib/prisma"
import {
  createCheckoutSession,
  expireCheckoutSession,
  isSessionPaid,
  retrieveCheckoutSession,
  sessionPaymentId,
  stripeConfigured,
  stripeMockAllowed,
} from "@/lib/stripe"
import { toNumber } from "@/lib/utils"

/** POST /api/payments/stripe/checkout — opens a Stripe Checkout Session for a booking. */
export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const { bookingId } = (await request.json().catch(() => ({}))) as {
    bookingId?: string
  }

  if (!bookingId) {
    return NextResponse.json({ error: "Missing bookingId" }, { status: 400 })
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
  if (booking.paymentStatus === "PAID") {
    return NextResponse.json(
      { error: "This booking has already been paid.", reference: booking.reference },
      { status: 409 }
    )
  }
  if (booking.paymentStatus !== "PENDING" || booking.status === "CANCELLED") {
    return NextResponse.json(
      { error: "This booking can no longer be paid." },
      { status: 409 }
    )
  }

  if (!stripeConfigured) {
    if (!stripeMockAllowed()) {
      return NextResponse.json(
        { error: "Payments are not configured." },
        { status: 503 }
      )
    }
    // Development fallback so the flow is testable without Stripe keys.
    return NextResponse.json({ sessionId: `MOCK-${booking.reference}`, mock: true })
  }

  const itemName =
    booking.tour?.title ?? booking.hotel?.name ?? booking.car?.name ?? "Booking"

  try {
    // Returning to the payment step opens a fresh session. The old one is
    // closed first so the same booking can't be paid twice from two tabs.
    if (booking.paymentId?.startsWith("cs_")) {
      const previous = await retrieveCheckoutSession(booking.paymentId)
      if (isSessionPaid(previous)) {
        const reference = await markBookingPaid(
          booking.id,
          sessionPaymentId(previous)
        )
        return NextResponse.json(
          { error: "This booking has already been paid.", reference },
          { status: 409 }
        )
      }
      if (previous.status === "open") {
        await expireCheckoutSession(previous.id).catch(() => undefined)
      }
    }

    const checkout = await createCheckoutSession({
      bookingId: booking.id,
      reference: booking.reference,
      amount: toNumber(booking.totalPrice),
      currency: booking.currency,
      itemName,
      customerEmail: booking.contactEmail ?? session.user.email ?? null,
    })

    await prisma.booking.update({
      where: { id: booking.id },
      data: { paymentId: checkout.id },
    })

    return NextResponse.json({
      sessionId: checkout.id,
      clientSecret: checkout.client_secret,
      mock: false,
    })
  } catch (error) {
    console.error("[stripe:checkout]", error)
    return NextResponse.json(
      { error: "We couldn't start the payment. Please try again." },
      { status: 502 }
    )
  }
}
