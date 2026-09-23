import { NextResponse } from "next/server"

import { auth } from "@/lib/auth"
import { markBookingPaid } from "@/lib/payments"
import { prisma } from "@/lib/prisma"
import {
  isSessionPaid,
  retrieveCheckoutSession,
  sessionPaymentId,
  stripeConfigured,
  stripeMockAllowed,
} from "@/lib/stripe"

/**
 * POST /api/payments/stripe/confirm — called by the browser when embedded
 * checkout completes. The session is re-read from Stripe, so the client can't
 * mark a booking paid on its own. The webhook does the same job in case the
 * traveller closes the tab first.
 */
export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const { bookingId, sessionId } = (await request.json().catch(() => ({}))) as {
    bookingId?: string
    sessionId?: string
  }

  if (!bookingId || !sessionId) {
    return NextResponse.json(
      { error: "Missing bookingId or sessionId" },
      { status: 400 }
    )
  }

  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, userId: session.user.id },
    select: { id: true, reference: true, paymentStatus: true },
  })

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 })
  }

  // Already confirmed (by the webhook or a double-click) — report success.
  if (booking.paymentStatus === "PAID") {
    return NextResponse.json({ ok: true, reference: booking.reference })
  }

  if (sessionId.startsWith("MOCK-")) {
    if (!stripeMockAllowed()) {
      return NextResponse.json({ error: "Invalid payment" }, { status: 400 })
    }
    const reference = await markBookingPaid(booking.id, sessionId)
    return NextResponse.json({ ok: true, reference })
  }

  if (!stripeConfigured) {
    return NextResponse.json(
      { error: "Payments are not configured." },
      { status: 503 }
    )
  }

  try {
    const checkout = await retrieveCheckoutSession(sessionId)

    // The session must have been opened for this booking by our checkout route.
    if (checkout.metadata?.bookingId !== booking.id) {
      return NextResponse.json({ error: "Invalid payment" }, { status: 400 })
    }
    if (!isSessionPaid(checkout)) {
      return NextResponse.json(
        {
          error:
            "Your payment hasn't cleared yet. We'll email your confirmation as soon as it does.",
        },
        { status: 402 }
      )
    }

    const reference = await markBookingPaid(booking.id, sessionPaymentId(checkout))
    return NextResponse.json({ ok: true, reference })
  } catch (error) {
    console.error("[stripe:confirm]", error)
    return NextResponse.json(
      { error: "We couldn't confirm the payment. Please contact us." },
      { status: 502 }
    )
  }
}
