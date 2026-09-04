"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useTransition } from "react"
import { Search } from "lucide-react"

import { cn } from "@/lib/utils"

const FIELDS = [
  {
    name: "status",
    label: "Status",
    options: ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"],
  },
  { name: "payment", label: "Payment", options: ["PENDING", "PAID", "REFUNDED"] },
  { name: "type", label: "Type", options: ["TOUR", "HOTEL", "CAR"] },
]

function label(value: string) {
  return value.charAt(0) + value.slice(1).toLowerCase()
}

export function BookingFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [pending, startTransition] = useTransition()

  const setParam = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(name, value)
    else params.delete(name)
    startTransition(() =>
      router.push(`/admin/bookings?${params.toString()}`, { scroll: false })
    )
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-end gap-4 rounded-2xl border border-border bg-ivory p-5",
        pending && "opacity-60"
      )}
    >
      <div className="min-w-[14rem] flex-1">
        <label
          htmlFor="booking-search"
          className="mb-2 block text-xs font-medium tracking-[0.1em] text-muted-foreground uppercase"
        >
          Search
        </label>
        <div className="relative">
          <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            id="booking-search"
            type="search"
            defaultValue={searchParams.get("q") ?? ""}
            placeholder="Reference, name or email…"
            onChange={(event) => {
              const value = event.target.value
              window.clearTimeout(
                (window as unknown as { __bookingTimer?: number }).__bookingTimer
              )
              ;(window as unknown as { __bookingTimer?: number }).__bookingTimer =
                window.setTimeout(() => setParam("q", value), 350)
            }}
            className="h-11 w-full rounded-lg border border-input bg-background pr-3 pl-10 text-sm outline-none focus-visible:border-gold focus-visible:ring-3 focus-visible:ring-gold/20"
          />
        </div>
      </div>

      {FIELDS.map((field) => (
        <div key={field.name} className="w-40">
          <label
            htmlFor={`booking-${field.name}`}
            className="mb-2 block text-xs font-medium tracking-[0.1em] text-muted-foreground uppercase"
          >
            {field.label}
          </label>
          <select
            id={`booking-${field.name}`}
            value={searchParams.get(field.name) ?? ""}
            onChange={(event) => setParam(field.name, event.target.value)}
            className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-gold focus-visible:ring-3 focus-visible:ring-gold/20"
          >
            <option value="">All</option>
            {field.options.map((option) => (
              <option key={option} value={option}>
                {label(option)}
              </option>
            ))}
          </select>
        </div>
      ))}

      {Array.from(searchParams.keys()).length > 0 && (
        <button
          type="button"
          onClick={() =>
            startTransition(() =>
              router.push("/admin/bookings", { scroll: false })
            )
          }
          className="h-11 rounded-lg px-4 text-sm font-medium text-muted-foreground hover:text-gold"
        >
          Clear
        </button>
      )}
    </div>
  )
}
