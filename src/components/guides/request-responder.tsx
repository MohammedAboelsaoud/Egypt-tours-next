"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { Check, X } from "lucide-react"
import { toast } from "sonner"

import { respondToRequest } from "@/actions/guides"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function RequestResponder({ requestId, canAccept }: { requestId: string; canAccept: boolean }) {
  const router = useRouter()
  const [reply, setReply] = useState("")
  const [pending, startTransition] = useTransition()

  const answer = (decision: "ACCEPT" | "DECLINE") =>
    startTransition(async () => {
      const result = await respondToRequest({ requestId, decision, reply })
      if (result.ok) {
        toast.success(result.message)
        router.refresh()
      } else {
        toast.error(result.message)
      }
    })

  return (
    <div className="mt-5 space-y-3 border-t border-border pt-5">
      <div>
        <Label htmlFor={`reply-${requestId}`} className="text-xs">
          Message to the traveller <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Textarea
          id={`reply-${requestId}`}
          rows={2}
          maxLength={1000}
          value={reply}
          onChange={(event) => setReply(event.target.value)}
          placeholder="e.g. I'd suggest Saqqara in the morning before the heat."
          className="mt-1.5"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="lg" disabled={pending || !canAccept} onClick={() => answer("ACCEPT")}>
          <Check />
          Accept trip
        </Button>
        <Button type="button" size="lg" variant="outline" disabled={pending} onClick={() => answer("DECLINE")}>
          <X />
          Decline
        </Button>
      </div>
    </div>
  )
}
