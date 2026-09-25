import type { BookingStatus, PaymentStatus } from "@prisma/client"

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
  className,
}: {
  status: PaymentStatus
  className?: string
}) {
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
