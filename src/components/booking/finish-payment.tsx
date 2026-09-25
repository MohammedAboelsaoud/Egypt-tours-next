"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { PaymentOptions } from "@/components/booking/payment-options"

/** Lets a traveller finish paying for a booking they left unpaid at checkout. */
export function FinishPayment({ bookingId, amount, currency }: { bookingId: string; amount: number; currency: string }) {
  const router = useRouter()
  return (
    <PaymentOptions
      bookingId={bookingId}
      amount={amount}
      currency={currency}
      onConfirmed={(_reference, method) => {
        toast.success(method === "CASH" ? "Booking confirmed. You'll pay in cash on the day." : "Payment received. Your booking is confirmed.")
        router.refresh()
      }}
    />
  )
}
