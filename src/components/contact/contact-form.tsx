"use client"

import { useSearchParams } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertCircle, PartyPopper, Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { inquirySchema, type InquiryInput } from "@/lib/validations"

export function ContactForm({
  regions,
}: {
  regions: { slug: string; name: string }[]
}) {
  const searchParams = useSearchParams()
  const [sent, setSent] = useState(false)
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
      phone: "",
      destination: searchParams.get("destination") ?? "",
      travelDates: "",
      partySize: "",
      message: "",
      planTitle: searchParams.get("plan") ?? "",
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
      const data = (await response.json().catch(() => null)) as {
        error?: string
      } | null
      setError(data?.error ?? "We couldn't send that. Please try again.")
      return
    }

    setSent(true)
  })

  if (sent) {
    return (
      <div className="rounded-2xl border border-border bg-ivory p-10 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-teal/10 text-teal">
          <PartyPopper className="size-6" />
        </div>
        <h2 className="mt-6 font-heading text-2xl">Thank you — it&apos;s sent</h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          One of our Egypt specialists will read your notes and reply within one
          business day with a first draft itinerary and pricing. Check your inbox
          for a confirmation in the meantime.
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-border bg-ivory p-7 sm:p-9"
      noValidate
    >
      <h2 className="font-heading text-2xl">Tell us about your trip</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        The more you tell us, the more useful the first draft will be.
      </p>

      {error && (
        <p className="mt-6 flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      )}

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Your name *</Label>
          <Input id="name" className="mt-2 h-11" {...register("name")} />
          <Error message={errors.name?.message} />
        </div>

        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            className="mt-2 h-11"
            {...register("email")}
          />
          <Error message={errors.email?.message} />
        </div>

        <div>
          <Label htmlFor="phone">Phone / WhatsApp</Label>
          <Input
            id="phone"
            placeholder="+1 555 0100"
            className="mt-2 h-11"
            {...register("phone")}
          />
        </div>

        <div>
          <Label htmlFor="destination">Where do you want to go?</Label>
          <select
            id="destination"
            className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-gold focus-visible:ring-3 focus-visible:ring-gold/20"
            {...register("destination")}
          >
            <option value="">Not sure yet</option>
            {regions.map((region) => (
              <option key={region.slug} value={region.name}>
                {region.name}
              </option>
            ))}
            <option value="Multiple regions">Multiple regions</option>
          </select>
        </div>

        <div>
          <Label htmlFor="travelDates">Travel dates</Label>
          <Input
            id="travelDates"
            placeholder="Mid-October, 10 nights"
            className="mt-2 h-11"
            {...register("travelDates")}
          />
        </div>

        <div>
          <Label htmlFor="partySize">Party size</Label>
          <Input
            id="partySize"
            placeholder="2 adults, 1 child (8)"
            className="mt-2 h-11"
            {...register("partySize")}
          />
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="message">What would make this trip? *</Label>
          <Textarea
            id="message"
            rows={6}
            placeholder="Sites you don't want to miss, pace, budget range, anything we should plan around…"
            className="mt-2"
            {...register("message")}
          />
          <Error message={errors.message?.message} />
        </div>
      </div>

      <input type="hidden" {...register("planTitle")} />

      <Button
        type="submit"
        disabled={isSubmitting}
        className="mt-8 h-12 w-full gap-2 bg-gold text-base text-white hover:bg-gold-light sm:w-auto sm:px-8"
      >
        <Send className="size-4" />
        {isSubmitting ? "Sending…" : "Send enquiry"}
      </Button>

      <p className="mt-4 text-xs text-muted-foreground">
        We reply within one business day. No deposit, no obligation.
      </p>
    </form>
  )
}

function Error({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1.5 text-xs text-destructive">{message}</p>
}
