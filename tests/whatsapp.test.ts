import { describe, expect, it } from "vitest"

import { SITE } from "@/data/site"
import { bookingMessage, whatsappLink } from "@/lib/whatsapp"

describe("whatsapp", () => {
  it("builds a wa.me link with only digits and an encoded message", () => {
    const url = whatsappLink("Hi & welcome", "+20 100-123 4567")
    expect(url).toBe("https://wa.me/201001234567?text=Hi%20%26%20welcome")
  })

  it("uses the site number by default", () => {
    expect(whatsappLink("x")).toContain(`wa.me/${SITE.whatsapp}?`)
  })

  it("lists filled-in details and skips empty ones", () => {
    const msg = bookingMessage("Rixos Alamein", { "Check-in": "2026-07-01", Nights: 3, Name: " ", Notes: undefined })
    expect(msg).toBe(`Hello ${SITE.name}! I'd like to book: Rixos Alamein\n• Check-in: 2026-07-01\n• Nights: 3`)
  })
})
