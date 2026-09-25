import { describe, expect, it } from "vitest"

import { CATALOG_HOTELS, RETIRED_HOTEL_SLUGS } from "@/lib/catalog/hotels"
import { CATALOG_VEHICLES, RETIRED_VEHICLE_SLUGS } from "@/lib/catalog/vehicles"
import { CAR_FEATURES, CAR_TYPES, HOTEL_AMENITIES } from "@/lib/constants"
import { applyMarkup, removeMarkup } from "@/lib/markup"

const REGIONS = ["cairo-giza", "luxor-aswan", "north-coast", "sinai-red-sea"]

describe("hotel markup", () => {
  it("adds the markup and rounds to whole dollars", () => {
    expect(applyMarkup(272, 10)).toBe(299)
    expect(applyMarkup(82, 10)).toBe(90)
    expect(applyMarkup(100, 0)).toBe(100)
    expect(applyMarkup(200, 12.5)).toBe(225)
  })

  it("turns a traveller's price back into the official rate", () => {
    expect(removeMarkup(220, 10)).toBeCloseTo(200)
  })
})

describe("hotel catalog", () => {
  it("has three hotels in every region", () => {
    for (const region of REGIONS) {
      expect(CATALOG_HOTELS.filter((h) => h.regionSlug === region), region).toHaveLength(3)
    }
  })

  it("uses unique slugs that don't clash with the retired demo hotels", () => {
    const slugs = CATALOG_HOTELS.map((h) => h.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
    for (const slug of slugs) expect(RETIRED_HOTEL_SLUGS).not.toContain(slug)
  })

  it("has sensible stars, rates and amenities", () => {
    for (const h of CATALOG_HOTELS) {
      expect(h.starRating, h.slug).toBeGreaterThanOrEqual(3)
      expect(h.starRating, h.slug).toBeLessThanOrEqual(5)
      expect(h.officialRate, h.slug).toBeGreaterThan(0)
      for (const a of h.amenities) expect(HOTEL_AMENITIES, `${h.slug}: ${a}`).toContain(a)
    }
  })
})

describe("vehicle catalog", () => {
  it("covers every region and includes both coach companies", () => {
    for (const region of REGIONS) {
      expect(CATALOG_VEHICLES.some((v) => v.regionSlug === region), region).toBe(true)
    }
    expect(CATALOG_VEHICLES.map((v) => v.brand)).toEqual(expect.arrayContaining(["Superjet", "Go Bus"]))
  })

  it("uses known types and features, and unique slugs", () => {
    const slugs = CATALOG_VEHICLES.map((v) => v.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
    for (const slug of slugs) expect(RETIRED_VEHICLE_SLUGS).not.toContain(slug)
    for (const v of CATALOG_VEHICLES) {
      expect(CAR_TYPES as readonly string[], v.slug).toContain(v.type)
      for (const f of v.features) expect(CAR_FEATURES as readonly string[], `${v.slug}: ${f}`).toContain(f)
      expect(v.seats, v.slug).toBeGreaterThan(0)
      expect(v.pricePerDay, v.slug).toBeGreaterThan(0)
    }
  })
})
