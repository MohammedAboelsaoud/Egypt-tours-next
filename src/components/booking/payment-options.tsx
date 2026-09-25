"use client"

import dynamic from "next/dynamic"
import { useState } from "react"
import { AlertCircle, Banknote, CreditCard } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn, formatPrice } from "@/lib/utils"

/** Stripe.js is only needed once someone chooses to pay, so it loads on demand. */
const StripeCheckout = dynamic(
  () => import("@/components/booking/stripe-checkout").then((mod) => mod.StripeCheckout),
  { ssr: false, loading: () => <div className="h-32 animate-pulse rounded-xl bg-muted" /> }
)

const OPTIONS = [
  {
    value: "CARD",
    icon: CreditCard,
    title: "Pay now by card",
    body: "Secure card payment through Stripe. Your booking is confirmed straight away.",
  },
  {
    value: "CASH",
    icon: Banknote,
    title: "Pay in cash on the day",
    body: "Your booking is confirmed now and you pay the full amount in cash when your trip starts.",
  },
] as const

/**
 * The card-or-cash choice for an unpaid booking. Used at the end of checkout
 * and on the booking page, to finish a booking left unpaid.
 */
export function PaymentOptions({
  bookingId,
  amount,
  currency,
  onConfirmed,
}: {
  bookingId: string
  amount: number
  currency: string
  onConfirmed: (reference: string, method: "CARD" | "CASH") => void
}) {
  const [method, setMethod] = useState<"CARD" | "CASH">("CARD")
  const [reserving, setReserving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reserveWithCash = async () => {
    setError(null)
    setReserving(true)
    try {
      const response = await fetch(`/api/bookings/${bookingId}/pay-later`, { method: "POST" })
      const data = (await response.json().catch(() => null)) as { reference?: string; error?: string } | null
      if (!response.ok || !data?.reference) {
        setError(data?.error ?? "We couldn't confirm your booking. Please try again.")
        return
      }
      onConfirmed(data.reference, "CASH")
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setReserving(false)
    }
  }

  return (
    <div>
      <fieldset>
        <legend className="text-sm font-medium">How would you like to pay?</legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {OPTIONS.map((option) => (
            <label
              key={option.value}
              className={cn(
                "flex cursor-pointer gap-3 rounded-xl border bg-papyrus p-4 transition-colors has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-lapis/30",
                method === option.value ? "border-lapis bg-accent" : "border-border hover:border-lapis/40"
              )}
            >
              <input
                type="radio"
                name={`payment-method-${bookingId}`}
                value={option.value}
                checked={method === option.value}
                onChange={() => {
                  setError(null)
                  setMethod(option.value)
                }}
                className="mt-1 size-4 accent-lapis"
              />
              <span>
                <span className="flex items-center gap-2 font-medium">
                  <option.icon className="size-4 text-lapis" />
                  {option.title}
                </span>
                <span className="mt-1 block text-sm text-muted-foreground">{option.body}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-6">
        {method === "CARD" ? (
          <StripeCheckout
            bookingId={bookingId}
            amount={amount}
            currency={currency}
            onPaid={(reference) => onConfirmed(reference, "CARD")}
          />
        ) : (
          <div className="rounded-xl border border-border bg-papyrus p-5">
            <p className="text-sm">
              You&apos;ll pay{" "}
              <span className="font-heading text-xl text-lapis">{formatPrice(amount, currency)}</span> in cash on the
              first day. Your coordinator confirms who to pay and when.
            </p>
            {error && (
              <p role="alert" className="mt-3 flex items-start gap-2 text-sm text-destructive">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                {error}
              </p>
            )}
            <Button type="button" size="lg" className="mt-4 h-12 px-7" disabled={reserving} onClick={reserveWithCash}>
              <Banknote />
              {reserving ? "Confirming…" : "Confirm booking, pay in cash"}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
