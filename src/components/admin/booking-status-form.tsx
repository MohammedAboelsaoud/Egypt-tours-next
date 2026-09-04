"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import type { BookingStatus, PaymentStatus } from "@prisma/client"
import { toast } from "sonner"

import { updateBookingStatus } from "@/actions/admin"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

const BOOKING_STATUSES: BookingStatus[] = [
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
]
const PAYMENT_STATUSES: PaymentStatus[] = ["PENDING", "PAID", "REFUNDED"]

function label(value: string) {
  return value.charAt(0) + value.slice(1).toLowerCase()
}

export function BookingStatusForm({
  id,
  status,
  paymentStatus,
}: {
  id: string
  status: BookingStatus
  paymentStatus: PaymentStatus
}) {
  const router = useRouter()
  const [nextStatus, setNextStatus] = useState<BookingStatus>(status)
  const [nextPayment, setNextPayment] = useState<PaymentStatus>(paymentStatus)
  const [pending, startTransition] = useTransition()

  const dirty = nextStatus !== status || nextPayment !== paymentStatus

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="status">Booking status</Label>
        <select
          id="status"
          value={nextStatus}
          onChange={(event) =>
            setNextStatus(event.target.value as BookingStatus)
          }
          className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-gold focus-visible:ring-3 focus-visible:ring-gold/20"
        >
          {BOOKING_STATUSES.map((value) => (
            <option key={value} value={value}>
              {label(value)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="paymentStatus">Payment status</Label>
        <select
          id="paymentStatus"
          value={nextPayment}
          onChange={(event) =>
            setNextPayment(event.target.value as PaymentStatus)
          }
          className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-gold focus-visible:ring-3 focus-visible:ring-gold/20"
        >
          {PAYMENT_STATUSES.map((value) => (
            <option key={value} value={value}>
              {label(value)}
            </option>
          ))}
        </select>
        <p className="mt-1.5 text-xs text-muted-foreground">
          Marking a payment refunded here records it — process the refund in
          PayPal separately.
        </p>
      </div>

      <Button
        disabled={!dirty || pending}
        className="h-11 w-full bg-gold text-white hover:bg-gold-light"
        onClick={() =>
          startTransition(async () => {
            try {
              await updateBookingStatus(id, {
                status: nextStatus,
                paymentStatus: nextPayment,
              })
              toast.success("Booking updated")
              router.refresh()
            } catch {
              toast.error("Could not update the booking")
            }
          })
        }
      >
        {pending ? "Saving…" : "Update booking"}
      </Button>
    </div>
  )
}
