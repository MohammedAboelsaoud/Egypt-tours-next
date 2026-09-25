import { SITE } from "@/data/site"

/** A wa.me link that opens WhatsApp with `message` already typed. */
export function whatsappLink(message: string, number: string = SITE.whatsapp): string {
  const digits = number.replace(/\D/g, "")
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}

export type RequestDetails = Record<string, string | number | undefined>

/**
 * Builds the booking message the owner receives, e.g.
 *
 *   Hello Egypt Journeys! I'd like to book: Marriott Mena House (Giza)
 *   • Check-in: 2026-10-12
 *   • Nights: 3
 *
 * Empty details are left out so the message stays short.
 */
export function bookingMessage(subject: string, details: RequestDetails = {}): string {
  const lines = Object.entries(details)
    .filter(([, value]) => value !== undefined && String(value).trim() !== "")
    .map(([label, value]) => `• ${label}: ${String(value).trim()}`)

  return [`Hello ${SITE.name}! I'd like to book: ${subject}`, ...lines].join("\n")
}
