import { describe, expect, it } from "vitest"

import {
  addDaysISO,
  arrayToLines,
  bookingReference,
  formatDate,
  formatPrice,
  initials,
  linesToArray,
  nightsBetween,
  slugify,
  toNumber,
  truncate,
} from "@/lib/utils"

describe("toNumber", () => {
  it("handles numbers, strings, Decimal-likes and nullish values", () => {
    expect(toNumber(42)).toBe(42)
    expect(toNumber("19.99")).toBe(19.99)
    expect(toNumber({ toString: () => "260.00" })).toBe(260)
    expect(toNumber(null)).toBe(0)
    expect(toNumber(undefined)).toBe(0)
    expect(toNumber("not a number")).toBe(0)
  })
})

describe("formatPrice", () => {
  it("formats USD with the currency symbol", () => {
    expect(formatPrice(520, "USD")).toBe("$520")
    expect(formatPrice("260.50", "USD")).toBe("$260.5")
  })

  it("drops the decimals in compact mode", () => {
    expect(formatPrice(199.99, "USD", { compact: true })).toBe("$200")
  })
})

describe("slugify", () => {
  it("makes URL-safe slugs", () => {
    expect(slugify("Pyramids & Old Cairo — 3 Days")).toBe(
      "pyramids-old-cairo-3-days"
    )
    expect(slugify("  Luxor's Highlights  ")).toBe("luxors-highlights")
    expect(slugify("Sinai & the Red Sea")).toBe("sinai-the-red-sea")
  })
})

describe("nightsBetween", () => {
  it("counts whole nights and floors at one", () => {
    expect(nightsBetween("2026-03-01", "2026-03-04")).toBe(3)
    expect(nightsBetween("2026-03-01", "2026-03-01")).toBe(1)
  })
})

describe("list helpers", () => {
  it("round-trips lines to arrays, dropping blanks", () => {
    expect(linesToArray("one\n\n  two  \nthree")).toEqual([
      "one",
      "two",
      "three",
    ])
    expect(arrayToLines(["a", "b"])).toBe("a\nb")
    expect(linesToArray(null)).toEqual([])
  })
})

describe("bookingReference", () => {
  it("uses the EJ- prefix and unambiguous characters", () => {
    for (let i = 0; i < 40; i++) {
      const reference = bookingReference()
      expect(reference).toMatch(/^EJ-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/)
    }
  })
})

describe("formatDate", () => {
  it("formats dates and copes with bad input", () => {
    expect(formatDate("2026-03-01")).toBe("1 Mar 2026")
    expect(formatDate("2026-03-01", "long")).toBe("1 March 2026")
    expect(formatDate(null)).toBe("—")
    expect(formatDate("nonsense")).toBe("—")
  })
})

describe("misc helpers", () => {
  it("truncates long text on a word boundary", () => {
    expect(truncate("a".repeat(200)).length).toBe(161)
    expect(truncate("short")).toBe("short")
  })

  it("builds initials", () => {
    expect(initials("Sarah Whitfield")).toBe("SW")
    expect(initials("Nadia")).toBe("N")
    expect(initials(null)).toBe("EJ")
  })

  it("adds days to an ISO date", () => {
    expect(addDaysISO("2026-03-01", 3)).toBe("2026-03-04")
  })
})
