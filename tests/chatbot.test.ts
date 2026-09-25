import { describe, expect, it } from "vitest"

import { HOTELS } from "@/data/hotels"
import { getBotReply, STARTER_SUGGESTIONS, WELCOME } from "@/lib/chatbot"

const reply = (q: string) => getBotReply(q).text

describe("chatbot", () => {
  it("greets and offers help", () => {
    expect(getBotReply("hello")).toBe(WELCOME)
    expect(getBotReply("")).toBe(WELCOME)
  })

  it("answers history questions", () => {
    expect(reply("Tell me about the pyramids")).toMatch(/Khufu/)
    expect(reply("who built the pyramids?")).toMatch(/paid workers/)
    expect(reply("Who was King Tut?")).toMatch(/Howard Carter/)
    expect(reply("the step pyramid")).toMatch(/Djoser/)
    expect(reply("Who was Ramses II?")).toMatch(/Kadesh/)
    expect(reply("How were mummies made?")).toMatch(/70 days/)
    expect(reply("Egyptian gods")).toMatch(/Osiris/)
    expect(reply("battle of el alamein")).toMatch(/Montgomery/)
    expect(reply("St. Catherine's Monastery")).toMatch(/Justinian/)
    expect(reply("hot air balloon")).toMatch(/balloon/)
  })

  it("answers practical questions", () => {
    expect(reply("Best time to visit?")).toMatch(/October to April/)
    expect(reply("What should I wear?")).toMatch(/shoulders/)
    expect(reply("Do I need a visa?")).toMatch(/visa2egypt/)
    expect(reply("How do I book?")).toMatch(/WhatsApp/)
  })

  it("filters hotels by budget using the data file", () => {
    const text = reply("Hotels under $50")
    for (const hotel of HOTELS) {
      if (hotel.pricePerNight <= 50) expect(text).toContain(hotel.name)
      else expect(text).not.toContain(hotel.name)
    }
  })

  it("filters hotels by budget and place", () => {
    const text = reply("a hotel in dahab for 40 dollars")
    expect(text).toContain("Laguna Vista")
    expect(text).not.toContain("Swiss Inn")
    expect(text).not.toContain("Daniela")
  })

  it("explains when nothing fits the budget", () => {
    expect(reply("hotel in luxor under $20")).toMatch(/Nothing in our list/)
  })

  it("lists hotels for a place", () => {
    const text = reply("Hotels in Cairo")
    expect(text).toContain("Mena House")
    expect(text).toContain("Steigenberger")
    expect(text).not.toContain("Rixos")
  })

  it("picks a vehicle for the group size", () => {
    expect(reply("Which car for 2 people?")).toMatch(/Economy sedan/)
    expect(reply("Which car for 4 people?")).toMatch(/SUV/)
    expect(reply("Which car for 6 people?")).toMatch(/Vito/)
    expect(reply("we are a group of 30 people")).toMatch(/Superjet/)
  })

  it("builds itineraries from a number of days", () => {
    expect(reply("Plan a 3-day trip")).toMatch(/Cairo & Giza/)
    expect(reply("Plan a 7-day trip")).toMatch(/Abu Simbel/)
    expect(reply("2 weeks in Egypt, plan my trip")).toMatch(/Mount Sinai/)
  })

  it("describes a destination when only a place is named", () => {
    expect(reply("tell me about luxor")).toMatch(/Thebes/)
    expect(getBotReply("tell me about luxor").links?.[0].href).toBe("/destinations/luxor-aswan/")
  })

  it("falls back politely", () => {
    const r = getBotReply("qwerty zxcv")
    expect(r.text).toMatch(/didn't quite catch/)
    expect(r.suggestions).toEqual(STARTER_SUGGESTIONS)
  })

  it("every starter suggestion gets a real answer", () => {
    for (const s of STARTER_SUGGESTIONS) {
      expect(reply(s)).not.toMatch(/didn't quite catch/)
    }
  })
})

describe("chatbot and the historic sites catalog", () => {
  it("links history answers to the catalog page", () => {
    const r = getBotReply("Tell me about Karnak")
    expect(r.links?.some((l) => l.href === "/sites/karnak/")).toBe(true)
  })

  it("answers from the catalog when there's no hand-written answer", () => {
    const r = getBotReply("Coptic Cairo")
    expect(r.links?.[0].href).toBe("/sites/coptic-cairo/")
  })
})
