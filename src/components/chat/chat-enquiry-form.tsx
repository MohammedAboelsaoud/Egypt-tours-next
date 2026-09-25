"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { inquirySchema, type InquiryInput } from "@/lib/validations"

/**
 * A short enquiry form shown inside the chat. It posts to the same endpoint as
 * the contact page, so the enquiry lands in /admin/inquiries and triggers the
 * usual confirmation emails.
 */
export function ChatEnquiryForm({
  draft,
  onSent,
}: {
  /** What the traveller typed before asking for help, used as the opening note. */
  draft: string
  onSent: (name: string) => void
}) {
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<InquiryInput>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      name: "",
      email: "",
      travelDates: "",
      partySize: "",
      message: draft.length >= 10 ? draft : "",
      planTitle: "Chat assistant enquiry",
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    setError(null)
    const response = await fetch("/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    })
    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null
      setError(data?.error ?? "We couldn't send that. Please try again.")
      return
    }
    onSent(values.name)
  })

  const field = "space-y-1"
  const hint = "text-xs text-destructive"

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      aria-label="Trip enquiry"
      className="space-y-3 rounded-lg border border-border bg-papyrus p-3.5"
    >
      <div className="grid grid-cols-2 gap-2.5">
        <div className={field}>
          <Label htmlFor="chat-name" className="text-xs">Name</Label>
          <Input id="chat-name" autoComplete="name" aria-invalid={Boolean(errors.name)} {...register("name")} />
          {errors.name && <p className={hint}>{errors.name.message}</p>}
        </div>
        <div className={field}>
          <Label htmlFor="chat-email" className="text-xs">Email</Label>
          <Input id="chat-email" type="email" autoComplete="email" aria-invalid={Boolean(errors.email)} {...register("email")} />
          {errors.email && <p className={hint}>{errors.email.message}</p>}
        </div>
        <div className={field}>
          <Label htmlFor="chat-dates" className="text-xs">Travel dates</Label>
          <Input id="chat-dates" placeholder="e.g. March 2027" {...register("travelDates")} />
        </div>
        <div className={field}>
          <Label htmlFor="chat-party" className="text-xs">Travellers</Label>
          <Input id="chat-party" placeholder="e.g. 2 adults" {...register("partySize")} />
        </div>
      </div>
      <div className={field}>
        <Label htmlFor="chat-message" className="text-xs">What would you like to do?</Label>
        <Textarea
          id="chat-message"
          rows={3}
          placeholder="Places, pace, budget, anything we should know"
          aria-invalid={Boolean(errors.message)}
          {...register("message")}
        />
        {errors.message && <p className={hint}>{errors.message.message}</p>}
      </div>
      {error && <p className={hint} role="alert">{error}</p>}
      <Button type="submit" disabled={isSubmitting} className="w-full">
        <Send />
        {isSubmitting ? "Sending…" : "Send to a planner"}
      </Button>
    </form>
  )
}
