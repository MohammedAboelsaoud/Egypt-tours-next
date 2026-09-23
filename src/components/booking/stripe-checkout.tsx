"use client"

import { useEffect, useRef, useState } from "react"
import { loadStripe } from "@stripe/stripe-js"
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js"
import { AlertCircle, LoaderCircle, RotateCcw, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/utils"

type Props = {
  bookingId: string
  amount: number
  currency: string
  onPaid: (reference: string) => void
}

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ""

// Created once per page load, as Stripe recommends.
const stripePromise = publishableKey ? loadStripe(publishableKey) : null

type CheckoutStart =
  | { kind: "session"; sessionId: string; clientSecret: string }
  | { kind: "mock"; sessionId: string }
  | { kind: "paid"; reference: string }

async function startCheckout(bookingId: string): Promise<CheckoutStart> {
  const response = await fetch("/api/payments/stripe/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bookingId }),
  })
  const data = (await response.json()) as {
    sessionId?: string
    clientSecret?: string | null
    mock?: boolean
    reference?: string
    error?: string
  }

  // Paid in another tab (or the webhook got there first).
  if (response.status === 409 && data.reference) {
    return { kind: "paid", reference: data.reference }
  }
  if (!response.ok || !data.sessionId) {
    throw new Error(data.error ?? "Could not start the payment.")
  }
  if (data.mock) return { kind: "mock", sessionId: data.sessionId }
  if (!data.clientSecret) throw new Error("Could not start the payment.")
  return { kind: "session", sessionId: data.sessionId, clientSecret: data.clientSecret }
}

async function confirmPayment(bookingId: string, sessionId: string) {
  const response = await fetch("/api/payments/stripe/confirm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bookingId, sessionId }),
  })
  const data = (await response.json()) as { reference?: string; error?: string }
  if (!response.ok || !data.reference) {
    throw new Error(data.error ?? "Could not confirm the payment.")
  }
  return data.reference
}

function errorMessage(cause: unknown) {
  return cause instanceof Error ? cause.message : "Payment failed."
}

function ErrorNote({ message }: { message: string }) {
  return (
    <p className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
      <AlertCircle className="mt-0.5 size-4 shrink-0" />
      {message}
    </p>
  )
}

export function StripeCheckout(props: Props) {
  if (!stripePromise) return <SimulatedCheckout {...props} />
  return <EmbeddedStripeCheckout {...props} />
}

function EmbeddedStripeCheckout(props: Props) {
  const { bookingId, onPaid } = props
  const [attempt, setAttempt] = useState(0)
  const [start, setStart] = useState<CheckoutStart | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)

  // Keeps the latest callback without restarting checkout when it changes.
  const onPaidRef = useRef(onPaid)
  useEffect(() => {
    onPaidRef.current = onPaid
  })

  useEffect(() => {
    let cancelled = false
    startCheckout(bookingId)
      .then((result) => {
        if (cancelled) return
        if (result.kind === "paid") onPaidRef.current(result.reference)
        else setStart(result)
      })
      .catch((cause) => {
        if (!cancelled) setError(errorMessage(cause))
      })
    return () => {
      cancelled = true
    }
  }, [bookingId, attempt])

  if (error) {
    return (
      <div className="space-y-4">
        <ErrorNote message={error} />
        {!confirming && (
          <Button
            type="button"
            variant="outline"
            className="h-11 gap-2"
            onClick={() => {
              setError(null)
              setStart(null)
              setAttempt((value) => value + 1)
            }}
          >
            <RotateCcw className="size-4" />
            Try again
          </Button>
        )}
      </div>
    )
  }

  // Secret key missing in development while the publishable key is set.
  if (start?.kind === "mock") return <SimulatedCheckout {...props} />

  if (confirming) {
    return (
      <p className="flex items-center gap-2.5 rounded-xl border border-border bg-ivory p-5 text-sm">
        <LoaderCircle className="size-4 animate-spin text-gold" />
        Payment received — confirming your booking…
      </p>
    )
  }

  if (start?.kind !== "session") {
    return <div className="h-96 animate-pulse rounded-xl bg-muted" />
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-border bg-white">
        <EmbeddedCheckoutProvider
          key={start.clientSecret}
          stripe={stripePromise}
          options={{
            clientSecret: start.clientSecret,
            onComplete: async () => {
              setConfirming(true)
              try {
                onPaidRef.current(await confirmPayment(bookingId, start.sessionId))
              } catch (cause) {
                setError(errorMessage(cause))
              }
            },
          }}
        >
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      </div>

      <p className="flex items-start gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-teal" />
        Payments are processed securely by Stripe. We never see or store your
        card details.
      </p>
    </div>
  )
}

/** No Stripe keys (local development): simulate the payment so the rest of the flow can be tested end to end. */
function SimulatedCheckout({ bookingId, amount, currency, onPaid }: Props) {
  const [error, setError] = useState<string | null>(null)
  const [working, setWorking] = useState(false)

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-dashed border-gold/50 bg-gold/5 p-5">
        <p className="flex items-start gap-2.5 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-gold" />
          <span>
            <strong className="font-medium">Stripe is not configured yet.</strong>{" "}
            Add <code className="rounded bg-muted px-1">STRIPE_SECRET_KEY</code>{" "}
            and{" "}
            <code className="rounded bg-muted px-1">
              NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
            </code>{" "}
            to take real payments. Until then you can simulate the payment to
            test the flow.
          </span>
        </p>
      </div>

      {error && <ErrorNote message={error} />}

      <Button
        type="button"
        disabled={working}
        className="h-12 w-full bg-gold text-base text-white hover:bg-gold-light"
        onClick={async () => {
          setWorking(true)
          setError(null)
          try {
            const result = await startCheckout(bookingId)
            if (result.kind === "paid") {
              onPaid(result.reference)
              return
            }
            if (result.kind !== "mock") {
              throw new Error(
                "Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to show the card form."
              )
            }
            onPaid(await confirmPayment(bookingId, result.sessionId))
          } catch (cause) {
            setError(errorMessage(cause))
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
