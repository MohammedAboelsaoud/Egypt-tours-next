import { describe, expect, it } from "vitest"

import {
  createBookingSchema,
  inquirySchema,
  registerSchema,
  reviewSchema,
  tourSchema,
} from "@/lib/validations"

describe("registerSchema", () => {
  const valid = {
    name: "Sarah Whitfield",
    email: "sarah@example.com",
    password: "supersecret",
    confirmPassword: "supersecret",
    phone: "+44 7700 900123",
    nationality: "United Kingdom",
    languages: ["English"],
  }

  it("accepts a well-formed registration", () => {
    expect(registerSchema.safeParse(valid).success).toBe(true)
  })

  it("requires phone, nationality and at least one language, but not a passport", () => {
    expect(registerSchema.safeParse({ ...valid, phone: "" }).success).toBe(false)
    expect(registerSchema.safeParse({ ...valid, phone: "call me maybe" }).success).toBe(false)
    expect(registerSchema.safeParse({ ...valid, nationality: "" }).success).toBe(false)
    expect(registerSchema.safeParse({ ...valid, languages: [] }).success).toBe(false)
    expect(registerSchema.safeParse({ ...valid, passportNo: "" }).success).toBe(true)
    expect(registerSchema.safeParse({ ...valid, passportNo: "123456789" }).success).toBe(true)
  })

  it("rejects mismatched passwords", () => {
    const result = registerSchema.safeParse({
      ...valid,
      confirmPassword: "different",
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/do not match/i)
    }
  })

  it("rejects short passwords and bad emails", () => {
    expect(
      registerSchema.safeParse({ ...valid, password: "short", confirmPassword: "short" })
        .success
    ).toBe(false)
    expect(registerSchema.safeParse({ ...valid, email: "nope" }).success).toBe(
      false
    )
  })
})

describe("inquirySchema", () => {
  it("requires a name, valid email and a real message", () => {
    expect(
      inquirySchema.safeParse({
        name: "David Chen",
        email: "david@example.com",
        message: "We'd like ten days in March, Cairo and Luxor.",
      }).success
    ).toBe(true)

    expect(
      inquirySchema.safeParse({
        name: "D",
        email: "david@example.com",
        message: "Hi",
      }).success
    ).toBe(false)
  })

  it("treats optional fields as optional", () => {
    const result = inquirySchema.safeParse({
      name: "David Chen",
      email: "david@example.com",
      message: "A longer message about the trip.",
      phone: "",
      destination: "",
    })
    expect(result.success).toBe(true)
  })
})

describe("createBookingSchema", () => {
  const valid = {
    bookingType: "TOUR",
    itemId: "abc123",
    checkIn: "2026-03-01",
    checkOut: "2026-03-04",
    guests: 2,
    contactName: "Emma Lindqvist",
    contactEmail: "emma@example.com",
    contactPhone: "+46 70 000 0000",
  }

  it("accepts a complete booking payload", () => {
    expect(createBookingSchema.safeParse(valid).success).toBe(true)
  })

  it("coerces a numeric string guest count", () => {
    const result = createBookingSchema.safeParse({ ...valid, guests: "3" })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.guests).toBe(3)
  })

  it("rejects unknown booking types and out-of-range guests", () => {
    expect(
      createBookingSchema.safeParse({ ...valid, bookingType: "CRUISE" }).success
    ).toBe(false)
    expect(createBookingSchema.safeParse({ ...valid, guests: 0 }).success).toBe(
      false
    )
    expect(createBookingSchema.safeParse({ ...valid, guests: 99 }).success).toBe(
      false
    )
  })
})

describe("reviewSchema", () => {
  it("bounds the rating to 1–5", () => {
    const base = { tourId: "t1", comment: "A really excellent few days." }
    expect(reviewSchema.safeParse({ ...base, rating: 5 }).success).toBe(true)
    expect(reviewSchema.safeParse({ ...base, rating: 0 }).success).toBe(false)
    expect(reviewSchema.safeParse({ ...base, rating: 6 }).success).toBe(false)
  })
})

describe("tourSchema", () => {
  it("coerces numeric fields sent as strings by the admin form", () => {
    const result = tourSchema.safeParse({
      title: "Test Tour",
      regionId: "r1",
      summary: "A short summary of the tour.",
      description: "A much longer description of what happens on the tour.",
      durationDays: "3",
      priceFrom: "260.50",
      maxGroupSize: "12",
      imageUrl: "/img/test.jpg",
      currency: "USD",
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.durationDays).toBe(3)
      expect(result.data.priceFrom).toBe(260.5)
      expect(result.data.highlights).toEqual([])
    }
  })

  it("requires an image and a region", () => {
    expect(
      tourSchema.safeParse({
        title: "Test Tour",
        summary: "A short summary of the tour.",
        description: "A much longer description of what happens on the tour.",
        durationDays: 3,
        priceFrom: 100,
        maxGroupSize: 10,
        imageUrl: "",
        regionId: "",
      }).success
    ).toBe(false)
  })
})
