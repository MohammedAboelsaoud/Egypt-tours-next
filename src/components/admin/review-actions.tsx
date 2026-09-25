"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { Check, Trash2, X } from "lucide-react"
import { toast } from "sonner"

import { deleteReview, setReviewApproved } from "@/actions/admin"
import { Button } from "@/components/ui/button"

export function ReviewActions({
  id,
  approved,
  author,
}: {
  id: string
  approved: boolean
  author: string
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const run = (fn: () => Promise<void>, success: string) =>
    startTransition(async () => {
      try {
        await fn()
        toast.success(success)
        router.refresh()
      } catch {
        toast.error("Could not update the review")
      }
    })

  return (
    <div className="flex items-center gap-2">
      {approved ? (
        <Button
          variant="outline"
          className="h-9 gap-1.5"
          disabled={pending}
          onClick={() => run(() => setReviewApproved(id, false), "Review hidden")}
        >
          <X className="size-3.5" />
          Unapprove
        </Button>
      ) : (
        <Button
          className="h-9 gap-1.5 bg-faience text-white hover:bg-faience/90"
          disabled={pending}
          onClick={() =>
            run(() => setReviewApproved(id, true), "Review published")
          }
        >
          <Check className="size-3.5" />
          Approve
        </Button>
      )}

      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={`Delete review by ${author}`}
        disabled={pending}
        className="text-muted-foreground hover:text-destructive"
        onClick={() => run(() => deleteReview(id), "Review deleted")}
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  )
}
