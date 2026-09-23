import { NextResponse } from "next/server"

import { markBookingPaid } from "@/lib/payments"
import {
  isSessionPaid,
  sessionPaymentId,
  verifyWebhookEvent,
  webhookConfigured,
  type Stripe,
} from "@/lib/stripe"

/**
 * POST /api/payments/stripe/webhook — Stripe's server-to-server notice that a
 * checkout was paid. Confirms the booking even if the traveller closed the tab
 * before the browser could.
 */
export async function POST(request: Request) {
  if (!webhookConfigured) {
    return NextResponse.json(
      { error: "Stripe webhooks are not configured." },
      { status: 503 }
    )
  }

  const signature = request.headers.get("stripe-signature")
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 })
  }

  // Signature checks need the body exactly as sent, so read it as raw text.
  const payload = await request.text()

  let event: Stripe.Event
  try {
    event = await verifyWebhookEvent(payload, signature)
  } catch (error) {
    console.error("[stripe:webhook] signature check failed", error)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const checkout = event.data.object
      const bookingId = checkout.metadata?.bookingId
      if (bookingId && isSessionPaid(checkout)) {
        // A thrown error returns 500, which makes Stripe retry later.
        await markBookingPaid(bookingId, sessionPaymentId(checkout))
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
