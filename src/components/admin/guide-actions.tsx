"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"

import { setGuideReviewHidden, setGuideStatus } from "@/actions/guides"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type Status = "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED"

export function GuideStatusActions({ guideId, status }: { guideId: string; status: Status }) {
  const router = useRouter()
  const [note, setNote] = useState("")
  const [pending, startTransition] = useTransition()

  const run = (next: Exclude<Status, "PENDING">) =>
    startTransition(async () => {
      const result = await setGuideStatus(guideId, next, note)
      if (result.ok) {
        toast.success(result.message)
        setNote("")
        router.refresh()
      } else {
        toast.error(result.message)
      }
    })

  return (
    <div className="mt-5 space-y-3 border-t border-border pt-5">
      <div>
        <Label htmlFor={`note-${guideId}`} className="text-xs">
          Note to the guide <span className="font-normal text-muted-foreground">(required to send back)</span>
        </Label>
        <Textarea
          id={`note-${guideId}`}
          rows={2}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="e.g. Please add your Ministry of Tourism licence number."
          className="mt-1.5"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {status !== "APPROVED" && (
          <Button type="button" disabled={pending} onClick={() => run("APPROVED")} className="bg-faience text-white hover:bg-faience/90">
            Approve
          </Button>
        )}
        {status !== "REJECTED" && status !== "APPROVED" && (
          <Button type="button" variant="outline" disabled={pending} onClick={() => run("REJECTED")}>
            Send back for changes
          </Button>
        )}
        {status === "APPROVED" && (
          <Button type="button" variant="destructive" disabled={pending} onClick={() => run("SUSPENDED")}>
            Suspend
          </Button>
        )}
      </div>
    </div>
  )
}

export function GuideReviewToggle({ reviewId, hidden }: { reviewId: string; hidden: boolean }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  return (
    <Button
      type="button"
      variant={hidden ? "outline" : "destructive"}
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await setGuideReviewHidden(reviewId, !hidden)
          if (result.ok) {
            toast.success(result.message)
            router.refresh()
          } else {
            toast.error(result.message)
          }
        })
      }
    >
      {hidden ? "Show again" : "Hide review"}
    </Button>
  )
}
