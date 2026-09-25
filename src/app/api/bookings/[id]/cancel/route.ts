import { NextResponse } from "next/server"

import { auth } from "@/lib/auth"
import { cancellationTerms } from "@/lib/cancellation"
import { prisma } from "@/lib/prisma"
import { sendBookingCancelled } from "@/lib/resend"
import { refundPayment, stripeConfigured, stripeMockAllowed } from "@/lib/stripe"
import { toNumber } from "@/lib/utils"

/**
 * POST /api/bookings/[id]/cancel — the owner cancels their booking. Card
 * payments are refunded automatically under the booking terms before the
 * booking is marked cancelled; if the refund fails, nothing changes.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Please sign in again." }, { status: 401 })
  }

  const { id } = await params
  const booking = await prisma.booking.findFirst({
    where: { id, userId: session.user.id },
    include: {
      user: { select: { name: true, email: true } },
      tour: { select: { title: true } },
      hotel: { select: { name: true } },
      car: { select: { name: true } },
    },
  })
  if (!booking) return NextResponse.json({ error: "Booking not found." }, { status: 404 })

  const total = toNumber(booking.totalPrice)
  const terms = cancellationTerms({
    checkIn: booking.checkIn,
    total,
    status: booking.status,
    paymentStatus: booking.paymentStatus,
  })
  if (!terms.allowed) return NextResponse.json({ error: terms.reason }, { status: 409 })

  let refundId: string | null = null
  if (terms.refund > 0) {
    const paymentId = booking.paymentId ?? ""
    if (paymentId.startsWith("pi_") && stripeConfigured) {
      try {
        const refund = await refundPayment({
          paymentIntentId: paymentId,
          amount: terms.refund,
          currency: booking.currency,
          bookingId: booking.id,
        })
        refundId = refund.id
      } catch (error) {
        console.error("[cancel] refund failed", booking.reference, error)
        return NextResponse.json(
          { error: "We couldn't process your refund, so the booking is still active. Please contact us and we'll sort it out." },
          { status: 502 }
        )
      }
    } else if (stripeMockAllowed()) {
      // Development without Stripe keys: simulated payments get a simulated refund.
      refundId = `MOCK-REFUND-${booking.reference}`
    } else {
      return NextResponse.json(
        { error: "This payment can't be refunded online. Please contact us to cancel." },
        { status: 409 }
      )
    }
  }

  const { count } = await prisma.booking.updateMany({
    where: { id: booking.id, status: { in: ["PENDING", "CONFIRMED"] } },
    data: {
      status: "CANCELLED",
      cancelledAt: new Date(),
      refundAmount: terms.refund,
      refundId,
      ...(terms.refund > 0 ? { paymentStatus: "REFUNDED" } : {}),
    },
  })
  if (count === 0) {
    return NextResponse.json({ error: "This booking was already cancelled." }, { status: 409 })
  }

  await sendBookingCancelled({
    reference: booking.reference,
    itemName: booking.tour?.title ?? booking.hotel?.name ?? booking.car?.name ?? "Booking",
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    customerName: booking.contactName ?? booking.user.name ?? "Traveller",
    customerEmail: booking.contactEmail ?? booking.user.email ?? "",
    total,
    refund: terms.refund,
    currency: booking.currency,
    paid: booking.paymentStatus === "PAID",
  }).catch(() => undefined)

  return NextResponse.json({ ok: true, refund: terms.refund })
}
