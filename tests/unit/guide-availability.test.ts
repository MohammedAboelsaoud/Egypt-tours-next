import { describe, expect, it } from "vitest"

import {
  addDays,
  busyDays,
  conflictingPending,
  eachDay,
  isExpired,
  isRangeFree,
  rangesOverlap,
  todayInEgypt,
  tripLength,
  tripRangeError,
} from "@/lib/guides/availability"
import {
  guideProfileSchema,
  guideRequestSchema,
  guideReviewSchema,
  guideSignupSchema,
} from "@/lib/validations"

describe("day ranges", () => {
  it("lists every day, both ends included, across a month end", () => {
    expect(eachDay({ start: "2027-03-30", end: "2027-04-02" })).toEqual([
      "2027-03-30",
      "2027-03-31",
      "2027-04-01",
      "2027-04-02",
    ])
    expect(tripLength({ start: "2027-03-12", end: "2027-03-12" })).toBe(1)
  })

  it("treats touching days as overlapping, since a guide works whole days", () => {
    expect(rangesOverlap({ start: "2027-03-10", end: "2027-03-12" }, { start: "2027-03-12", end: "2027-03-14" })).toBe(true)
    expect(rangesOverlap({ start: "2027-03-10", end: "2027-03-11" }, { start: "2027-03-12", end: "2027-03-14" })).toBe(false)
  })
})

describe("busy days", () => {
  const busy = busyDays([{ start: "2027-03-10", end: "2027-03-12" }], ["2027-03-20"])

  it("combines accepted trips and blocked days", () => {
    expect([...busy].sort()).toEqual(["2027-03-10", "2027-03-11", "2027-03-12", "2027-03-20"])
  })

  it("rejects a range touching any busy day", () => {
    expect(isRangeFree({ start: "2027-03-12", end: "2027-03-13" }, busy)).toBe(false)
    expect(isRangeFree({ start: "2027-03-19", end: "2027-03-21" }, busy)).toBe(false)
    expect(isRangeFree({ start: "2027-03-13", end: "2027-03-19" }, busy)).toBe(true)
  })
})

describe("conflictingPending", () => {
  it("flags only the pending requests that clash with each other", () => {
    const clashes = conflictingPending([
      { id: "a", start: "2027-03-10", end: "2027-03-12" },
      { id: "b", start: "2027-03-12", end: "2027-03-13" },
      { id: "c", start: "2027-04-01", end: "2027-04-02" },
    ])
    expect([...clashes].sort()).toEqual(["a", "b"])
  })
})

describe("isExpired", () => {
  const now = new Date("2027-03-01T12:00:00Z")

  it("expires pending requests unanswered for more than 48 hours", () => {
    expect(isExpired({ status: "PENDING", createdAt: new Date("2027-02-27T11:00:00Z"), start: "2027-03-20" }, now)).toBe(true)
    expect(isExpired({ status: "PENDING", createdAt: new Date("2027-02-28T13:00:00Z"), start: "2027-03-20" }, now)).toBe(false)
  })

  it("expires a pending request once its first day arrives", () => {
    expect(isExpired({ status: "PENDING", createdAt: new Date("2027-03-01T08:00:00Z"), start: "2027-03-01" }, now)).toBe(true)
  })

  it("never expires answered requests", () => {
    expect(isExpired({ status: "ACCEPTED", createdAt: new Date("2026-01-01T00:00:00Z"), start: "2027-02-01" }, now)).toBe(false)
  })
})

describe("tripRangeError", () => {
  const today = "2027-03-01"

  it("accepts a trip from tomorrow up to 14 days", () => {
    expect(tripRangeError({ start: "2027-03-02", end: "2027-03-15" }, today)).toBeNull()
  })

  it("explains what's wrong", () => {
    expect(tripRangeError({ start: "2027-03-01", end: "2027-03-02" }, today)).toMatch(/tomorrow/)
    expect(tripRangeError({ start: "2027-03-05", end: "2027-03-04" }, today)).toMatch(/on or after/)
    expect(tripRangeError({ start: "2027-03-02", end: "2027-03-16" }, today)).toMatch(/14 days/)
    expect(tripRangeError({ start: addDays(today, 400), end: addDays(today, 401) }, today)).toMatch(/year/)
    expect(tripRangeError({ start: "2027-02-30", end: "2027-03-02" }, today)).toMatch(/valid/)
  })

  it("uses Egypt's date for today", () => {
    // 23:30 UTC on 1 March is already 2 March in Cairo.
    expect(todayInEgypt(new Date("2027-03-01T23:30:00Z"))).toBe("2027-03-02")
  })
})

describe("guide schemas", () => {
  const profile = {
    displayName: "Amira Hassan",
    guideType: "Egyptologist",
    bio: "Licensed Egyptologist with a degree from Cairo University. I guide at Giza, Saqqara and the Egyptian Museum.",
    yearsExperience: 9,
    languages: ["English", "French"],
    specialties: ["Pyramids of Giza"],
    regionIds: ["region-1"],
    whatsapp: "+20 100 555 1234",
  }

  it("accepts a complete guide sign-up", () => {
    expect(
      guideSignupSchema.safeParse({
        name: "Amira Hassan",
        email: "amira@example.com",
        password: "longenough",
        confirmPassword: "longenough",
        profile,
      }).success
    ).toBe(true)
  })

  it("needs a real bio, a region and a WhatsApp number", () => {
    expect(guideProfileSchema.safeParse({ ...profile, bio: "Hi" }).success).toBe(false)
    expect(guideProfileSchema.safeParse({ ...profile, regionIds: [] }).success).toBe(false)
    expect(guideProfileSchema.safeParse({ ...profile, whatsapp: "" }).success).toBe(false)
  })

  it("validates requests and reviews", () => {
    expect(
      guideRequestSchema.safeParse({ guideId: "g", startDate: "2027-03-02", endDate: "2027-03-03", groupSize: 2, message: "Pyramids and the museum please" }).success
    ).toBe(true)
    expect(guideRequestSchema.safeParse({ guideId: "g", startDate: "next week", endDate: "2027-03-03", groupSize: 2, message: "Pyramids please" }).success).toBe(false)
    expect(guideReviewSchema.safeParse({ requestId: "r", rating: 6, comment: "Wonderful day out" }).success).toBe(false)
    expect(guideReviewSchema.safeParse({ requestId: "r", rating: 5, comment: "Wonderful day out" }).success).toBe(true)
  })
})
