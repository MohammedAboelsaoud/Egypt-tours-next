"use client"

import { useState } from "react"
import { Mail } from "lucide-react"

import { WhatsAppIcon } from "@/components/icons"
import { DESTINATIONS } from "@/data/destinations"
import { SITE } from "@/data/site"
import { whatsappLink } from "@/lib/whatsapp"

const NEEDS = ["Tour guide", "Hotel", "Transport", "Full trip planning"]

/**
 * There's no server, so the form doesn't "submit" anywhere — it writes the
 * enquiry into a WhatsApp message (or an email) that the visitor sends.
 */
export function ContactForm() {
  const [name, setName] = useState("")
  const [dates, setDates] = useState("")
  const [travellers, setTravellers] = useState("2")
  const [areas, setAreas] = useState<string[]>([])
  const [needs, setNeeds] = useState<string[]>([])
  const [message, setMessage] = useState("")

  const toggle = (list: string[], set: (v: string[]) => void, value: string) =>
    set(list.includes(value) ? list.filter((x) => x !== value) : [...list, value])

  const body = [
    `Hello ${SITE.name}! I'm planning a trip to Egypt.`,
    name && `• Name: ${name}`,
    dates && `• Dates: ${dates}`,
    travellers && `• Travellers: ${travellers}`,
    areas.length > 0 && `• Destinations: ${areas.join(", ")}`,
    needs.length > 0 && `• I need: ${needs.join(", ")}`,
    message && `\n${message}`,
  ]
    .filter(Boolean)
    .join("\n")

  function sendWhatsApp(e: React.FormEvent) {
    e.preventDefault()
    const url = whatsappLink(body)
    const win = window.open(url, "_blank")
    if (win) win.opener = null
    else window.location.href = url
  }

  const mailto = `mailto:${SITE.email}?subject=${encodeURIComponent("Trip enquiry" + (name ? ` — ${name}` : ""))}&body=${encodeURIComponent(body)}`

  return (
    <form onSubmit={sendWhatsApp} className="card space-y-5 p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Your name <span className="text-gold">*</span></span>
          <input required value={name} onChange={(e) => setName(e.target.value)} className="field" autoComplete="name" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Travellers</span>
          <input type="number" min={1} inputMode="numeric" value={travellers} onChange={(e) => setTravellers(e.target.value)} className="field" />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Travel dates</span>
          <input value={dates} onChange={(e) => setDates(e.target.value)} placeholder="e.g. 10–17 March, or “flexible in spring”" className="field" />
        </label>
      </div>

      <fieldset>
        <legend className="mb-2 text-xs font-medium text-muted-foreground">Where would you like to go?</legend>
        <div className="flex flex-wrap gap-2">
          {DESTINATIONS.map((d) => (
            <Chip key={d.slug} checked={areas.includes(d.name)} onChange={() => toggle(areas, setAreas, d.name)} label={d.name} />
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-xs font-medium text-muted-foreground">What do you need?</legend>
        <div className="flex flex-wrap gap-2">
          {NEEDS.map((n) => (
            <Chip key={n} checked={needs.includes(n)} onChange={() => toggle(needs, setNeeds, n)} label={n} />
          ))}
        </div>
      </fieldset>

      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Message</span>
        <textarea rows={4} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tell us about your trip, budget or questions…" className="field" />
      </label>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button type="submit" className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-whatsapp px-6 font-semibold text-white hover:bg-whatsapp-dark">
          <WhatsAppIcon className="size-5" />
          Send on WhatsApp
        </button>
        <a href={mailto} className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-border px-6 font-medium hover:bg-muted">
          <Mail className="size-4" />
          Send by email
        </a>
      </div>
    </form>
  )
}

function Chip({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <label className={`cursor-pointer rounded-full border px-3.5 py-2 text-sm transition-colors has-focus-visible:outline-2 has-focus-visible:outline-gold-light ${checked ? "border-ink bg-ink text-white" : "border-border bg-white hover:border-gold"}`}>
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
      {label}
    </label>
  )
}
