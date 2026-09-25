import { describe, expect, it } from "vitest"

import { COLLECTIONS, slugify, validate } from "@/components/admin/schema"

const hotels = COLLECTIONS.find((c) => c.id === "hotels")!

describe("admin validation", () => {
  it("turns names into web-safe ids", () => {
    expect(slugify("St. Catherine's Monastery")).toBe("st-catherines-monastery")
    expect(slugify("  Café  Riche — Cairo ")).toBe("cafe-riche-cairo")
  })

  it("catches missing required fields, bad ids and duplicates", () => {
    const base = { id: "a", name: "A", area: "sinai", city: "Dahab", stars: 3, rating: 8, pricePerNight: 20, image: "/img/x.jpg" }
    const errors = validate(hotels, [base, { ...base, name: "B" }, { ...base, id: "Bad Id", name: "", city: "" }])
    expect(errors.join("\n")).toMatch(/already uses "a"/)
    expect(errors.join("\n")).toMatch(/may only use lowercase/)
    expect(errors.join("\n")).toMatch(/Name is required/)
    expect(errors.join("\n")).toMatch(/City is required/)
  })

  it("checks number ranges", () => {
    const errors = validate(hotels, [{ id: "a", name: "A", area: "sinai", city: "x", stars: 3, rating: 11, pricePerNight: 20, image: "/i.jpg" }])
    expect(errors.join("\n")).toMatch(/at most 10/)
  })
})
