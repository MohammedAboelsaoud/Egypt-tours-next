"use client"

import { useState } from "react"
import {
  PayPalButtons,
  PayPalScriptProvider,
} from "@paypal/react-paypal-js"
import { AlertCircle, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/utils"

type Props = {
  bookingId: string
  amount: number
  currency: string
  onPaid: (reference: string) => void
}

async function createOrder(bookingId: string) {
  const response = await fetch("/api/payments/paypal/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bookingId }),
  })
  const data = (await response.json()) as {
    orderId?: string
    mock?: boolean
    error?: string
  }
  if (!response.ok || !data.orderId) {
    throw new Error(data.error ?? "Could not start the payment.")
  }
  return data
}

async function captureOrder(bookingId: string, orderId: string) {
  const response = await fetch("/api/payments/paypal/capture", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bookingId, orderId }),
  })
  const data = (await response.json()) as { reference?: string; error?: string }
  if (!response.ok || !data.reference) {
    throw new Error(data.error ?? "Could not confirm the payment.")
  }
  return data.reference
}

export function PayPalCheckout({ bookingId, amount, currency, onPaid }: Props) {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? ""
  const [error, setError] = useState<string | null>(null)
  const [working, setWorking] = useState(false)

  // No PayPal credentials (local development) — offer a simulated capture so
  // the rest of the flow can still be tested end to end.
  if (!clientId) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-dashed border-gold/50 bg-gold/5 p-5">
          <p className="flex items-start gap-2.5 text-sm">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-gold" />
            <span>
              <strong className="font-medium">PayPal is not configured yet.</strong>{" "}
              Add <code className="rounded bg-muted px-1">PAYPAL_CLIENT_ID</code>{" "}
              and{" "}
              <code className="rounded bg-muted px-1">
                NEXT_PUBLIC_PAYPAL_CLIENT_ID
              </code>{" "}
              to take real payments. Until then you can simulate the capture to
              test the flow.
            </span>
          </p>
        </div>

        {error && (
          <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </p>
        )}

        <Button
          type="button"
          disabled={working}
          className="h-12 w-full bg-gold text-base text-white hover:bg-gold-light"
          onClick={async () => {
            setWorking(true)
            setError(null)
            try {
              const { orderId } = await createOrder(bookingId)
              const reference = await captureOrder(bookingId, orderId!)
              onPaid(reference)
            } catch (cause) {
              setError(
                cause instanceof Error ? cause.message : "Payment failed."
              )
            } finally {
              setWorking(false)
            }
          }}
        >
          {working
            ? "Processing…"
            : `Simulate payment of ${formatPrice(amount, currency)}`}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <p className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      )}

      <PayPalScriptProvider
        options={{
          clientId,
          currency,
          intent: "capture",
          components: "buttons",
        }}
      >
        <PayPalButtons
          style={{ layout: "vertical", color: "gold", shape: "rect", height: 48 }}
          disabled={working}
          createOrder={async () => {
            setError(null)
            const { orderId } = await createOrder(bookingId)
            return orderId!
          }}
          onApprove={async (data) => {
            setWorking(true)
            try {
              const reference = await captureOrder(bookingId, data.orderID)
              onPaid(reference)
            } catch (cause) {
              setError(
                cause instanceof Error ? cause.message : "Payment failed."
              )
            } finally {
              setWorking(false)
            }
          }}
          onError={(cause) => {
            console.error("[paypal]", cause)
            setError("PayPal reported a problem. Please try again.")
          }}
        />
      </PayPalScriptProvider>

      <p className="flex items-start gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-teal" />
        Payments are processed by PayPal. We never see or store your card
        details.
      </p>
    </div>
  )
}
