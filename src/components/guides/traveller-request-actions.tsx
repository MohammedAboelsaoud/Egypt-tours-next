"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { Star } from "lucide-react"
import { toast } from "sonner"

import { cancelGuideRequest, submitGuideReview } from "@/actions/guides"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

export function CancelRequestButton({ requestId, accepted }: { requestId: string; accepted: boolean }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [pending, startTransition] = useTransition()

  if (!confirming) {
    return (
      <Button type="button" variant="ghost" onClick={() => setConfirming(true)}>
        Cancel {accepted ? "trip" : "request"}
      </Button>
    )
  }
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span>{accepted ? "Cancel this trip? Your guide will be told." : "Cancel this request?"}</span>
      <Button
        type="button"
        variant="destructive"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await cancelGuideRequest(requestId)
            if (result.ok) {
              toast.success(result.message)
              router.refresh()
            } else {
              toast.error(result.message)
            }
          })
        }
      >
        Yes, cancel
      </Button>
      <Button type="button" variant="ghost" onClick={() => setConfirming(false)}>Keep it</Button>
    </div>
  )
}

export function GuideReviewForm({ requestId, guideName }: { requestId: string; guideName: string }) {
  const router = useRouter()
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const shown = hover || rating

  return (
    <form
      noValidate
      className="mt-5 space-y-3 border-t border-border pt-5"
      onSubmit={(event) => {
        event.preventDefault()
        setError(null)
        startTransition(async () => {
          const result = await submitGuideReview({ requestId, rating, comment })
          if (result.ok) {
            toast.success(result.message)
            router.refresh()
          } else {
            setError(result.message)
          }
        })
      }}
    >
      <fieldset>
        <legend className="text-sm font-medium">How was your trip with {guideName}?</legend>
        <div className="mt-2 flex gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              aria-label={`${value} ${value === 1 ? "star" : "stars"}`}
              aria-pressed={rating === value}
              onMouseEnter={() => setHover(value)}
              onClick={() => setRating(value)}
              className="rounded p-1 focus-visible:outline-2 focus-visible:outline-lapis"
            >
              <Star className={cn("size-7", value <= shown ? "fill-sun text-ochre" : "fill-transparent text-muted-foreground/40")} />
            </button>
          ))}
        </div>
      </fieldset>
      <div>
        <Label htmlFor={`review-${requestId}`} className="text-xs">Your review</Label>
        <Textarea
          id={`review-${requestId}`}
          rows={3}
          maxLength={1500}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="What made the day? Anything future travellers should know?"
          className="mt-1.5"
        />
      </div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={pending || rating === 0}>
        {pending ? "Posting…" : "Post review"}
      </Button>
    </form>
  )
}
