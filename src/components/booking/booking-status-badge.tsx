import type { BookingStatus, PaymentMethod, PaymentStatus } from "@prisma/client"

import { cn } from "@/lib/utils"

const BOOKING_STYLES: Record<BookingStatus, string> = {
  PENDING: "bg-amber-500/12 text-amber-700",
  CONFIRMED: "bg-faience/12 text-faience",
  COMPLETED: "bg-lapis/15 text-lapis",
  CANCELLED: "bg-destructive/10 text-destructive",
}

const PAYMENT_STYLES: Record<PaymentStatus, string> = {
  PENDING: "bg-amber-500/12 text-amber-700",
  PAID: "bg-faience/12 text-faience",
  REFUNDED: "bg-muted text-muted-foreground",
}

function label(value: string) {
  return value.charAt(0) + value.slice(1).toLowerCase()
}

export function BookingStatusBadge({
  status,
  className,
}: {
  status: BookingStatus
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        BOOKING_STYLES[status],
        className
      )}
    >
      {label(status)}
    </span>
  )
}

export function PaymentStatusBadge({
  status,
  method,
  className,
}: {
  status: PaymentStatus
  /** A CASH booking still to be paid reads "Cash on the day". */
  method?: PaymentMethod
  className?: string
}) {
  if (method === "CASH" && status === "PENDING") {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground",
          className
        )}
      >
        Cash on the day
      </span>
    )
  }
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        PAYMENT_STYLES[status],
        className
      )}
    >
      {label(status)}
    </span>
  )
}

/**
 * One status for travellers, instead of separate booking and payment badges:
 * "Payment not finished", "Confirmed · Paid", "Cancelled · Refunded $X"…
 */
export function bookingStateLabel(booking: {
  status: BookingStatus
  paymentStatus: PaymentStatus
  paymentMethod: PaymentMethod
  refundAmount?: string | null
}): { label: string; tone: "good" | "info" | "warn" | "muted" } {
  const refund = booking.refundAmount ? Number.parseFloat(booking.refundAmount) : 0
  switch (booking.status) {
    case "CANCELLED":
      return { label: refund > 0 ? `Cancelled · Refunded` : "Cancelled", tone: "muted" }
    case "COMPLETED":
      return { label: "Completed", tone: "info" }
    case "CONFIRMED":
      if (booking.paymentStatus === "PAID") return { label: "Confirmed · Paid", tone: "good" }
      if (booking.paymentMethod === "CASH") return { label: "Confirmed · Cash on the day", tone: "good" }
      return { label: "Confirmed", tone: "good" }
    default:
      return { label: "Payment not finished", tone: "warn" }
  }
}

const STATE_TONES = {
  good: "bg-faience/12 text-faience",
  info: "bg-lapis/12 text-lapis",
  warn: "bg-sun/25 text-ochre",
  muted: "bg-muted text-muted-foreground",
} as const

export function BookingStateBadge({
  booking,
  className,
}: {
  booking: Parameters<typeof bookingStateLabel>[0]
  className?: string
}) {
  const { label, tone } = bookingStateLabel(booking)
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", STATE_TONES[tone], className)}>
      {label}
    </span>
  )
}
