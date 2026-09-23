import { nightsBetween } from "@/lib/utils"

export type BookingKind = "TOUR" | "HOTEL" | "CAR"

export type PriceBreakdown = {
  /** Number of billable units — guests for tours, nights for hotels, days for cars. */
  units: number
  unitLabel: string
  unitPrice: number
  subtotal: number
  total: number
  currency: string
}

/**
 * Single source of truth for booking prices — used by the booking UI and again
 * on the server before a Stripe payment is created, so the client can never set
 * its own price.
 */
export function calculatePrice({
  kind,
  unitPrice,
  currency,
  checkIn,
  checkOut,
  guests,
}: {
  kind: BookingKind
  unitPrice: number
  currency: string
  checkIn: string | Date
  checkOut: string | Date
  guests: number
}): PriceBreakdown {
  const span = nightsBetween(checkIn, checkOut)
  const people = Math.max(1, Math.floor(guests))

  if (kind === "TOUR") {
    // Tours are a fixed per-person price; the dates set the departure only.
    const subtotal = unitPrice * people
    return {
      units: people,
      unitLabel: people === 1 ? "traveller" : "travellers",
      unitPrice,
      subtotal,
      total: subtotal,
      currency,
    }
  }

  if (kind === "HOTEL") {
    const subtotal = unitPrice * span
    return {
      units: span,
      unitLabel: span === 1 ? "night" : "nights",
      unitPrice,
      subtotal,
      total: subtotal,
      currency,
    }
  }

  const subtotal = unitPrice * span
  return {
    units: span,
    unitLabel: span === 1 ? "day" : "days",
    unitPrice,
    subtotal,
    total: subtotal,
    currency,
  }
}

// Currencies Stripe charges in whole units rather than cents.
const ZERO_DECIMAL_CURRENCIES = new Set([
  "BIF", "CLP", "DJF", "GNF", "JPY", "KMF", "KRW", "MGA",
  "PYG", "RWF", "UGX", "VND", "VUV", "XAF", "XOF", "XPF",
])

/** Converts a price to the smallest currency unit Stripe expects (cents for USD). */
export function toMinorUnits(amount: number, currency: string) {
  return ZERO_DECIMAL_CURRENCIES.has(currency.toUpperCase())
    ? Math.round(amount)
    : Math.round(amount * 100)
}
