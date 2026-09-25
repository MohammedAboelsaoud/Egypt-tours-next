import "server-only"

import Stripe from "stripe"

import { toMinorUnits } from "@/lib/pricing"

const SECRET_KEY = process.env.STRIPE_SECRET_KEY ?? ""
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? ""

/**
 * Without a secret key the routes fall back to a mock payment so the whole
 * booking flow stays testable in development. Never true in production.
 */
export const stripeConfigured = Boolean(SECRET_KEY)

export function stripeMockAllowed() {
  return !stripeConfigured && process.env.NODE_ENV !== "production"
}

let client: Stripe | null = null

function stripe(): Stripe {
  if (!stripeConfigured) throw new Error("STRIPE_SECRET_KEY is not set")
  client ??= new Stripe(SECRET_KEY)
  return client
}

/** Opens an embedded Checkout Session for a booking. */
export async function createCheckoutSession(input: {
  bookingId: string
  reference: string
  amount: number
  currency: string
  itemName: string
  customerEmail: string | null
}) {
  const metadata = { bookingId: input.bookingId, reference: input.reference }

  return stripe().checkout.sessions.create({
    mode: "payment",
    ui_mode: "embedded_page",
    // The booking flow shows its own confirmation, so Stripe never redirects
    // away. Payment methods that need a redirect are left off as a result.
    redirect_on_completion: "never",
    client_reference_id: input.bookingId,
    customer_email: input.customerEmail ?? undefined,
    metadata,
    payment_intent_data: {
      description: `${input.itemName} — ${input.reference}`,
      metadata,
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: input.currency.toLowerCase(),
          unit_amount: toMinorUnits(input.amount, input.currency),
          product_data: {
            name: input.itemName,
            description: `Booking ${input.reference}`,
          },
        },
      },
    ],
  })
}

export async function retrieveCheckoutSession(sessionId: string) {
  return stripe().checkout.sessions.retrieve(sessionId)
}

/** Closes an unpaid session so it can no longer be paid. */
export async function expireCheckoutSession(sessionId: string) {
  return stripe().checkout.sessions.expire(sessionId)
}

/** A session counts as paid only once Stripe has the money, not merely when the form is submitted. */
export function isSessionPaid(session: Stripe.Checkout.Session) {
  return session.status === "complete" && session.payment_status === "paid"
}

/** The PaymentIntent id is what the Stripe dashboard searches and refunds by. */
export function sessionPaymentId(session: Stripe.Checkout.Session) {
  const intent = session.payment_intent
  if (!intent) return session.id
  return typeof intent === "string" ? intent : intent.id
}

/**
 * Refunds part or all of a card payment. The idempotency key ties the refund
 * to the booking, so a retried request can never refund twice.
 */
export async function refundPayment(input: {
  paymentIntentId: string
  amount: number
  currency: string
  bookingId: string
}) {
  return stripe().refunds.create(
    {
      payment_intent: input.paymentIntentId,
      amount: toMinorUnits(input.amount, input.currency),
      reason: "requested_by_customer",
      metadata: { bookingId: input.bookingId },
    },
    { idempotencyKey: `refund-${input.bookingId}` }
  )
}

export const webhookConfigured = Boolean(SECRET_KEY && WEBHOOK_SECRET)

/** Verifies a webhook signature against the raw request body. */
export async function verifyWebhookEvent(payload: string, signature: string) {
  // The async variant works with both Node crypto and Web Crypto (Bun/edge).
  return stripe().webhooks.constructEventAsync(
    payload,
    signature,
    WEBHOOK_SECRET
  )
}

export type { Stripe }
