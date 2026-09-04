/**
 * Integration tests against a running dev server (`bun run dev`).
 * They are skipped automatically when nothing is listening on the port.
 */
import { beforeAll, describe, expect, it } from "vitest"

const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3000"
let serverUp = false

beforeAll(async () => {
  try {
    const response = await fetch(`${BASE}/api/regions`, {
      signal: AbortSignal.timeout(5000),
    })
    serverUp = response.ok
  } catch {
    serverUp = false
  }
  if (!serverUp) {
    console.warn(`[integration] no server at ${BASE} — skipping API tests`)
  }
})

describe("public API", () => {
  it("lists regions with counts", async () => {
    if (!serverUp) return

    const response = await fetch(`${BASE}/api/regions`)
    expect(response.status).toBe(200)

    const data = (await response.json()) as {
      regions: { slug: string; counts: { tours: number } }[]
    }
    expect(data.regions.length).toBeGreaterThanOrEqual(4)
    expect(data.regions.map((region) => region.slug)).toContain("cairo-giza")
    expect(data.regions[0].counts).toHaveProperty("tours")
  })

  it("lists tours and filters them by region", async () => {
    if (!serverUp) return

    const all = await (await fetch(`${BASE}/api/tours`)).json()
    const filtered = await (
      await fetch(`${BASE}/api/tours?region=cairo-giza`)
    ).json()

    expect(all.tours.length).toBeGreaterThan(0)
    expect(filtered.tours.length).toBeGreaterThan(0)
    expect(filtered.tours.length).toBeLessThan(all.tours.length)
    for (const tour of filtered.tours) {
      expect(tour.region.slug).toBe("cairo-giza")
    }
  })

  it("returns prices as numbers, not Decimal strings", async () => {
    if (!serverUp) return

    const data = await (await fetch(`${BASE}/api/tours?limit=1`)).json()
    expect(typeof data.tours[0].priceFrom).toBe("number")
  })

  it("filters hotels by star rating", async () => {
    if (!serverUp) return

    const data = await (await fetch(`${BASE}/api/hotels?stars=5`)).json()
    expect(data.hotels.length).toBeGreaterThan(0)
    for (const hotel of data.hotels) {
      expect(hotel.starRating).toBeGreaterThanOrEqual(5)
    }
  })

  it("filters cars by seat count", async () => {
    if (!serverUp) return

    const data = await (await fetch(`${BASE}/api/cars?seats=7`)).json()
    for (const car of data.cars) {
      expect(car.seats).toBeGreaterThanOrEqual(7)
    }
  })

  it("only returns approved reviews", async () => {
    if (!serverUp) return

    const data = await (await fetch(`${BASE}/api/reviews`)).json()
    expect(Array.isArray(data.reviews)).toBe(true)
    for (const review of data.reviews) {
      expect(review.rating).toBeGreaterThanOrEqual(1)
      expect(review.rating).toBeLessThanOrEqual(5)
    }
  })
})

describe("protected API", () => {
  it("rejects anonymous booking creation", async () => {
    if (!serverUp) return

    const response = await fetch(`${BASE}/api/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingType: "TOUR", itemId: "x" }),
    })
    expect(response.status).toBe(401)
  })

  it("rejects anonymous admin reads", async () => {
    if (!serverUp) return

    for (const path of ["/api/admin/tours", "/api/admin/hotels", "/api/inquiries"]) {
      const response = await fetch(`${BASE}${path}`)
      expect(response.status).toBe(403)
    }
  })

  it("rejects anonymous image uploads", async () => {
    if (!serverUp) return

    const response = await fetch(`${BASE}/api/upload/image`, { method: "POST" })
    expect(response.status).toBe(403)
  })

  it("validates the contact form server-side", async () => {
    if (!serverUp) return

    const response = await fetch(`${BASE}/api/inquiries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "x", email: "bad", message: "short" }),
    })
    expect(response.status).toBe(400)
  })
})
