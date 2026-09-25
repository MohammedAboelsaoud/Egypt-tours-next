import { describe, expect, it } from "vitest"
import { existsSync } from "node:fs"
import path from "node:path"

import { DESTINATIONS } from "@/data/destinations"
import { GUIDES } from "@/data/guides"
import { HOTELS } from "@/data/hotels"
import { VEHICLES } from "@/data/transport"

const publicFile = (src: string) => existsSync(path.join(__dirname, "..", "public", src))

describe("data files", () => {
  it("every destination has two hotels or more", () => {
    for (const d of DESTINATIONS) {
      expect(HOTELS.filter((h) => h.area === d.slug).length).toBeGreaterThanOrEqual(2)
    }
  })

  it("ids are unique", () => {
    for (const list of [HOTELS, VEHICLES, GUIDES]) {
      const ids = list.map((x) => x.id)
      expect(new Set(ids).size).toBe(ids.length)
    }
  })

  it("every image exists in /public", () => {
    const images = [
      ...DESTINATIONS.map((d) => d.image),
      ...DESTINATIONS.flatMap((d) => d.spots?.map((s) => s.image) ?? []),
      ...HOTELS.map((h) => h.image),
      ...GUIDES.flatMap((g) => (g.image ? [g.image] : [])),
    ]
    for (const src of images) expect(publicFile(src), src).toBe(true)
  })

  it("hotel stars and ratings are in range", () => {
    for (const h of HOTELS) {
      expect(h.stars).toBeGreaterThanOrEqual(1)
      expect(h.stars).toBeLessThanOrEqual(5)
      expect(h.rating).toBeGreaterThan(0)
      expect(h.rating).toBeLessThanOrEqual(10)
      expect(h.pricePerNight).toBeGreaterThan(0)
    }
  })
})
