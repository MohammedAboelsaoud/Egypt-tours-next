import { NextResponse } from "next/server"

import { auth } from "@/lib/auth"
import {
  createPayPalOrder,
  paypalConfigured,
  paypalMockAllowed,
} from "@/lib/paypal"
import { prisma } from "@/lib/prisma"
import { toNumber } from "@/lib/utils"

/** POST /api/payments/paypal/create — opens a PayPal order for a booking. */
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
      { error: "This booking has already been paid." },
      { status: 409 }
    )
  }

  const itemName =
    booking.tour?.title ?? booking.hotel?.name ?? booking.car?.name ?? "Booking"

  if (!paypalConfigured) {
    if (!paypalMockAllowed()) {
      return NextResponse.json(
        { error: "Payments are not configured." },
        { status: 503 }
      )
    }
    // Development fallback so the flow is testable without PayPal keys.
    return NextResponse.json({
      orderId: `MOCK-${booking.reference}`,
      mock: true,
    })
  }

  try {
    const order = await createPayPalOrder({
      amount: toNumber(booking.totalPrice),
      currency: booking.currency,
      reference: booking.reference,
      description: `${itemName} — ${booking.reference}`,
    })

    await prisma.booking.update({
      where: { id: booking.id },
      data: { paymentId: order.id },
    })

    return NextResponse.json({ orderId: order.id, mock: false })
  } catch (error) {
    console.error("[paypal:create]", error)
    return NextResponse.json(
      { error: "We couldn't start the payment. Please try again." },
      { status: 502 }
    )
  }
}
