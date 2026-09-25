"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { AlertCircle } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"

export function CancelBooking({
  bookingId,
  summary,
}: {
  bookingId: string
  /** What cancelling means for this booking, e.g. "You'll get $520 back (100%)." */
  summary: string
}) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const cancel = () =>
    startTransition(async () => {
      setError(null)
      const response = await fetch(`/api/bookings/${bookingId}/cancel`, { method: "POST" })
      const data = (await response.json().catch(() => null)) as { error?: string } | null
      if (!response.ok) {
        setError(data?.error ?? "We couldn't cancel this booking. Please try again or contact us.")
        return
      }
      toast.success("Your booking is cancelled. We've emailed you a confirmation.")
      setConfirming(false)
      router.refresh()
    })

  return (
    <div className="space-y-3">
      {error && (
        <p role="alert" className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      )}
      {confirming ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm font-medium">Cancel this booking?</p>
          <p className="mt-1 text-sm text-muted-foreground">{summary} This can&apos;t be undone.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="button" variant="destructive" size="lg" disabled={pending} onClick={cancel}>
              {pending ? "Cancelling…" : "Yes, cancel booking"}
            </Button>
            <Button type="button" variant="ghost" size="lg" disabled={pending} onClick={() => setConfirming(false)}>
              Keep my booking
            </Button>
          </div>
        </div>
      ) : (
        <Button type="button" variant="outline" size="lg" onClick={() => setConfirming(true)}>
          Cancel booking
        </Button>
      )}
    </div>
  )
}
