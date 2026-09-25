import { describe, expect, it } from "vitest"

import {
  parseCriteria,
  respond,
  type ChatKnowledge,
  type ChatListing,
} from "@/lib/chat/engine"
import { FAQ_GROUPS } from "@/lib/faq"
import { chatRequestSchema } from "@/lib/validations"

function listing(partial: Partial<ChatListing> & Pick<ChatListing, "kind" | "slug" | "title" | "regionSlug" | "price">): ChatListing {
  return {
    href: `/${partial.kind}s/${partial.slug}`,
    imageUrl: "/img/hero.jpg",
    regionName: partial.regionSlug,
    currency: "USD",
    unit: "per person",
    detail: "",
    capacity: 12,
    searchText: partial.title.toLowerCase(),
    ...partial,
  }
}

const KB: ChatKnowledge = {
  faq: FAQ_GROUPS,
  contact: { phone: "+20 100 123 4567", email: "hello@egyptjourneys.com", whatsapp: "201001234567" },
  regions: [
    { slug: "cairo-giza", name: "Cairo & Giza", tagline: "Pyramids and the old city", cities: ["Cairo", "Giza"] },
    { slug: "luxor-aswan", name: "Luxor & Aswan", tagline: "Temples along the Nile", cities: ["Luxor", "Aswan"] },
    { slug: "north-coast", name: "North Coast", tagline: "Mediterranean summers", cities: ["El Alamein", "Sidi Abdel Rahman"] },
    { slug: "sinai-red-sea", name: "Sinai & the Red Sea", tagline: "Reefs and mountains", cities: ["Sharm El Sheikh", "Dahab"] },
  ],
  listings: [
    listing({ kind: "tour", slug: "pyramids-3", title: "Pyramids and Old Cairo", regionSlug: "cairo-giza", price: 260, durationDays: 3, featured: true }),
    listing({ kind: "tour", slug: "museums-2", title: "Cairo Museums and Islamic Cairo", regionSlug: "cairo-giza", price: 170, durationDays: 2 }),
    listing({ kind: "tour", slug: "nile-cruise-4", title: "Nile Cruise Luxor to Aswan", regionSlug: "luxor-aswan", price: 520, durationDays: 4, featured: true }),
    listing({ kind: "tour", slug: "luxor-2", title: "Luxor Highlights", regionSlug: "luxor-aswan", price: 190, durationDays: 2 }),
    listing({ kind: "tour", slug: "diving-6", title: "Sharm El Sheikh Diving Week", regionSlug: "sinai-red-sea", price: 640, durationDays: 6 }),
    listing({ kind: "hotel", slug: "giza-resort", title: "Giza Pyramids View Resort", regionSlug: "cairo-giza", price: 240, starRating: 5, unit: "per night" }),
    listing({ kind: "hotel", slug: "nile-boutique", title: "Nile View Boutique Cairo", regionSlug: "cairo-giza", price: 180, starRating: 5, unit: "per night" }),
    listing({ kind: "hotel", slug: "dahab-lodge", title: "Dahab Lagoon Lodge", regionSlug: "sinai-red-sea", price: 85, starRating: 3, unit: "per night" }),
    listing({ kind: "car", slug: "passat", title: "VW Passat Sedan", regionSlug: "cairo-giza", price: 65, carType: "Sedan", capacity: 4, unit: "per day" }),
    listing({ kind: "car", slug: "expedition", title: "Ford Expedition Family SUV", regionSlug: "cairo-giza", price: 110, carType: "SUV", capacity: 7, unit: "per day" }),
  ],
}

describe("respond — FAQ answers", () => {
  it("answers visa questions from the FAQ", () => {
    const reply = respond("Do I need a visa for Egypt?", KB)
    expect(reply.text).toMatch(/visa on arrival/i)
    expect(reply.listings).toBeUndefined()
  })

  it("prefers a clear FAQ topic over a place name", () => {
    const reply = respond("Are meals included on the Nile cruise?", KB)
    expect(reply.text).toMatch(/breakfast is included/i)
  })

  it("matches paraphrased questions", () => {
    expect(respond("how much baksheesh should I give", KB).text).toMatch(/USD 10–15 per day/)
    expect(respond("what's the weather like in december?", KB).text).toMatch(/October to April/)
    expect(respond("can I get a refund if I cancel", KB).text).toMatch(/Free cancellation/)
  })
})

describe("respond — catalogue search", () => {
  it("lists tours in a region", () => {
    const reply = respond("Show me tours in Luxor", KB)
    expect(reply.listings?.map((l) => l.slug)).toEqual(["nile-cruise-4", "luxor-2"])
  })

  it("applies a budget", () => {
    const reply = respond("tours under $200", KB)
    expect(reply.listings?.every((l) => l.price <= 200)).toBe(true)
    expect(reply.listings?.length).toBeGreaterThan(0)
  })

  it("falls back to the closest options when nothing fits the budget", () => {
    const reply = respond("diving trip in Sharm under $100", KB)
    expect(reply.text).toMatch(/closest/i)
    expect(reply.listings?.[0].slug).toBe("diving-6")
  })

  it("finds hotels, cheapest first when asked", () => {
    const reply = respond("cheapest hotel in cairo", KB)
    expect(reply.listings?.map((l) => l.slug)).toEqual(["nile-boutique", "giza-resort"])
  })

  it("filters cars by type and seats", () => {
    expect(respond("I need an SUV", KB).listings?.map((l) => l.slug)).toEqual(["expedition"])
    expect(respond("car with driver for 6 people", KB).listings?.map((l) => l.slug)).toEqual(["expedition"])
  })

  it("respects trip length", () => {
    const reply = respond("a 2 day trip in Cairo", KB)
    expect(reply.listings?.map((l) => l.slug)).toEqual(["museums-2"])
  })
})

describe("respond — actions", () => {
  it("hands off to a human with contact details", () => {
    const reply = respond("Can I talk to a real person?", KB)
    expect(reply.action).toBe("handoff")
    expect(reply.text).toContain("+20 100 123 4567")
  })

  it("starts an enquiry for custom planning", () => {
    expect(respond("Help me plan a 10 day honeymoon", KB).action).toBe("enquiry")
  })

  it("greets and falls back politely", () => {
    expect(respond("hello!", KB).text).toMatch(/Nefer/)
    const unknown = respond("zzzz qqqq", KB)
    expect(unknown.text).toMatch(/didn't quite catch/)
    expect(unknown.suggestions?.length).toBeGreaterThan(0)
  })
})

describe("parseCriteria", () => {
  it("reads budget, duration, people and region", () => {
    const c = parseCriteria("5 day tour in Aswan for 4 people under 1,200 USD", KB)
    expect(c).toMatchObject({ kinds: ["tour"], regionSlugs: ["luxor-aswan"], days: 5, people: 4, maxPrice: 1200 })
  })

  it("maps a week to seven days", () => {
    expect(parseCriteria("a week in the red sea", KB)).toMatchObject({ days: 7, regionSlugs: ["sinai-red-sea"] })
  })
})

describe("chatRequestSchema", () => {
  it("trims and bounds the message", () => {
    expect(chatRequestSchema.safeParse({ message: "   " }).success).toBe(false)
    expect(chatRequestSchema.safeParse({ message: "x".repeat(501) }).success).toBe(false)
    expect(chatRequestSchema.parse({ message: "  visa?  " }).message).toBe("visa?")
  })
})

describe("respond — guides", () => {
  const withGuides: ChatKnowledge = {
    ...KB,
    listings: [
      ...KB.listings,
      // A guide covering two regions is listed once per region.
      listing({ kind: "guide", slug: "amira", title: "Amira Hassan", regionSlug: "cairo-giza", price: 75, languages: ["English", "French"], unit: "per day" }),
      listing({ kind: "guide", slug: "amira", title: "Amira Hassan", regionSlug: "luxor-aswan", price: 75, languages: ["English", "French"], unit: "per day" }),
      listing({ kind: "guide", slug: "hamdy", title: "Hamdy Nour", regionSlug: "luxor-aswan", price: 55, languages: ["English", "Arabic", "Nubian"], unit: "per day" }),
    ],
  }

  it("treats 'tour guide' as a guide search, not tours", () => {
    const reply = respond("I need a tour guide in Luxor", withGuides)
    expect(reply.listings?.every((l) => l.kind === "guide")).toBe(true)
    expect(reply.listings?.map((l) => l.slug).sort()).toEqual(["amira", "hamdy"])
  })

  it("filters guides by language and lists each guide once", () => {
    const reply = respond("French-speaking guide", withGuides)
    expect(reply.listings?.map((l) => l.slug)).toEqual(["amira"])
    expect(reply.text).toMatch(/French-speaking guide/)
  })

  it("suggests guides after a tour search", () => {
    expect(respond("tours in Luxor", withGuides).suggestions).toContain("Guides in Luxor & Aswan")
  })
})
