"use client"

import { useId, useRef, useState } from "react"
import { X } from "lucide-react"

import { WhatsAppIcon } from "@/components/icons"
import { cn, formatUSD } from "@/lib/utils"
import type { RequestField } from "@/lib/request-forms"
import { bookingMessage, whatsappLink } from "@/lib/whatsapp"

export function WhatsAppRequest({
  subject,
  fields,
  title,
  estimate,
  label = "Request on WhatsApp",
  className,
}: {
  /** What's being booked — the first line of the message. */
  subject: string
  fields: RequestField[]
  title?: string
  /** Shows a live price estimate: `price` × the number in field `per` (× Rooms when present). */
  estimate?: { price: number; per: string; unit: string }
  label?: string
  className?: string
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const formId = useId()
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f) => [f.label, f.defaultValue ?? ""]))
  )
  const [today, setToday] = useState<string>()

  function open() {
    // Computed on open, not at build time, so the date picker starts today.
    setToday(new Date().toISOString().slice(0, 10))
    dialogRef.current?.showModal()
  }

  function close() {
    dialogRef.current?.close()
  }

  const message = bookingMessage(subject, values)

  const units = estimate ? Number(values[estimate.per]) || 0 : 0
  const rooms = "Rooms" in values ? Math.max(1, Number(values.Rooms) || 1) : 1
  const total = estimate ? estimate.price * units * rooms : 0

  function send(event: React.FormEvent) {
    event.preventDefault()
    const url = whatsappLink(message)
    const win = window.open(url, "_blank")
    if (win) win.opener = null
    else window.location.href = url
    close()
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        className={cn(
          "inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-whatsapp px-5 text-sm font-semibold text-white transition-colors hover:bg-whatsapp-dark",
          className
        )}
      >
        <WhatsAppIcon className="size-4.5" />
        {label}
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={`${formId}-title`}
        onClick={(e) => e.target === dialogRef.current && close()}
        className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl bg-ivory p-0 text-ink shadow-2xl backdrop:bg-ink/60 backdrop:backdrop-blur-sm"
      >
        <form onSubmit={send} className="flex max-h-[85vh] flex-col">
          <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
            <div>
              <p className="eyebrow">Booking request</p>
              <h2 id={`${formId}-title`} className="mt-1 text-xl">
                {title ?? subject}
              </h2>
            </div>
            <button type="button" onClick={close} aria-label="Close" className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-ink">
              <X className="size-5" />
            </button>
          </div>

          <div className="grid gap-4 overflow-y-auto px-6 py-5 sm:grid-cols-2">
            {fields.map((field, i) => {
              const id = `${formId}-${i}`
              const common = {
                id,
                name: field.label,
                value: values[field.label] ?? "",
                placeholder: field.placeholder,
                required: field.required,
                onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                  setValues((v) => ({ ...v, [field.label]: e.target.value })),
                className: "field",
              }
              return (
                <label
                  key={field.label}
                  htmlFor={id}
                  className={cn("block", (field.type === "textarea" || field.type === "text") && "sm:col-span-2")}
                >
                  <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    {field.label}
                    {field.required && <span className="text-gold"> *</span>}
                  </span>
                  {field.type === "textarea" ? (
                    <textarea rows={3} {...common} />
                  ) : (
                    <input
                      type={field.type}
                      min={field.type === "date" ? today : field.min}
                      inputMode={field.type === "number" ? "numeric" : undefined}
                      {...common}
                    />
                  )}
                </label>
              )
            })}

            {estimate && total > 0 && (
              <p className="rounded-lg bg-gold/10 px-4 py-3 text-sm sm:col-span-2">
                Estimated total: <strong>{formatUSD(total)}</strong>{" "}
                <span className="text-muted-foreground">
                  ({formatUSD(estimate.price)} × {units} {estimate.unit}
                  {units === 1 ? "" : "s"}
                  {rooms > 1 ? ` × ${rooms} rooms` : ""}) — we confirm the final price on WhatsApp.
                </span>
              </p>
            )}

            <details className="text-xs text-muted-foreground sm:col-span-2">
              <summary className="cursor-pointer select-none">Preview message</summary>
              <pre className="mt-2 font-sans whitespace-pre-wrap rounded-lg bg-muted p-3 text-ink">{message}</pre>
            </details>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-border px-6 py-4 sm:flex-row sm:justify-end">
            <button type="button" onClick={close} className="h-11 rounded-lg px-5 text-sm font-medium text-muted-foreground hover:bg-muted">
              Cancel
            </button>
            <button type="submit" className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-whatsapp px-5 text-sm font-semibold text-white hover:bg-whatsapp-dark">
              <WhatsAppIcon className="size-4.5" />
              Send on WhatsApp
            </button>
          </div>
        </form>
      </dialog>
    </>
  )
}
