"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { Check, RotateCcw, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { deleteInquiry, setInquiryHandled } from "@/actions/admin"
import { Button } from "@/components/ui/button"

export function InquiryActions({
  id,
  handled,
  name,
}: {
  id: string
  handled: boolean
  name: string
}) {
  const router = useRouter()
  const [isHandled, setIsHandled] = useState(handled)
  const [pending, startTransition] = useTransition()

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={isHandled ? "ghost" : "outline"}
        className="h-9 gap-1.5"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const next = !isHandled
            setIsHandled(next)
            try {
              await setInquiryHandled(id, next)
              toast.success(next ? "Marked as handled" : "Reopened")
              router.refresh()
            } catch {
              setIsHandled(!next)
              toast.error("Could not update")
            }
          })
        }
      >
        {isHandled ? (
          <>
            <RotateCcw className="size-3.5" />
            Reopen
          </>
        ) : (
          <>
            <Check className="size-3.5" />
            Mark handled
          </>
        )}
      </Button>

      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={`Delete enquiry from ${name}`}
        disabled={pending}
        className="text-muted-foreground hover:text-destructive"
        onClick={() =>
          startTransition(async () => {
            try {
              await deleteInquiry(id)
              toast.success("Enquiry deleted")
              router.refresh()
            } catch {
              toast.error("Could not delete")
            }
          })
        }
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  )
}
