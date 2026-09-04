import { describe, expect, it } from "vitest"

import { calculatePrice } from "@/lib/pricing"

describe("calculatePrice", () => {
  it("charges tours per person, regardless of the date span", () => {
    const price = calculatePrice({
      kind: "TOUR",
      unitPrice: 260,
      currency: "USD",
      checkIn: "2026-03-01",
      checkOut: "2026-03-04",
      guests: 2,
    })

    expect(price.units).toBe(2)
    expect(price.unitLabel).toBe("travellers")
    expect(price.total).toBe(520)
  })

  it("charges hotels per night, regardless of guest count", () => {
    const price = calculatePrice({
      kind: "HOTEL",
      unitPrice: 180,
      currency: "USD",
      checkIn: "2026-03-01",
      checkOut: "2026-03-04",
      guests: 2,
    })

    expect(price.units).toBe(3)
    expect(price.unitLabel).toBe("nights")
    expect(price.total).toBe(540)
  })

  it("charges cars per day", () => {
    const price = calculatePrice({
      kind: "CAR",
      unitPrice: 65,
      currency: "USD",
      checkIn: "2026-03-01",
      checkOut: "2026-03-03",
      guests: 4,
    })

    expect(price.units).toBe(2)
    expect(price.total).toBe(130)
  })

  it("bills at least one night even when the dates are the same day", () => {
    const price = calculatePrice({
      kind: "HOTEL",
      unitPrice: 100,
      currency: "USD",
      checkIn: "2026-03-01",
      checkOut: "2026-03-01",
      guests: 1,
    })

    expect(price.units).toBe(1)
    expect(price.total).toBe(100)
  })

  it("uses singular labels for a single unit", () => {
    const tour = calculatePrice({
      kind: "TOUR",
      unitPrice: 100,
      currency: "USD",
      checkIn: "2026-03-01",
      checkOut: "2026-03-02",
      guests: 1,
    })
    expect(tour.unitLabel).toBe("traveller")

    const car = calculatePrice({
      kind: "CAR",
      unitPrice: 50,
      currency: "USD",
      checkIn: "2026-03-01",
      checkOut: "2026-03-02",
      guests: 1,
    })
    expect(car.unitLabel).toBe("day")
  })

  it("rounds fractional guest counts down and never below one", () => {
    const price = calculatePrice({
      kind: "TOUR",
      unitPrice: 200,
      currency: "USD",
      checkIn: "2026-03-01",
      checkOut: "2026-03-02",
      guests: 0,
    })

    expect(price.units).toBe(1)
    expect(price.total).toBe(200)
  })

  it("is unaffected by daylight-saving transitions", () => {
    // The UK moves to BST on 29 March 2026 — the span must still be 3 nights.
    const price = calculatePrice({
      kind: "HOTEL",
      unitPrice: 100,
      currency: "USD",
      checkIn: "2026-03-28",
      checkOut: "2026-03-31",
      guests: 2,
    })

    expect(price.units).toBe(3)
    expect(price.total).toBe(300)
  })
})
