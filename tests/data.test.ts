import { describe, expect, it } from "vitest"
import { existsSync, readFileSync } from "node:fs"
import path from "node:path"

import { COLLECTIONS, validate } from "@/components/admin/schema"
import { DESTINATIONS } from "@/data/destinations"
import { GUIDES } from "@/data/guides"
import { HOTELS } from "@/data/hotels"
import { SITES } from "@/data/sites"
import { VEHICLES } from "@/data/transport"

const root = path.join(__dirname, "..")
const isLocal = (src: string) => src.startsWith("/")
const publicFile = (src: string) => existsSync(path.join(root, "public", src))
const areas = new Set(DESTINATIONS.map((d) => d.slug))

describe("content files", () => {
  it("pass the same checks the admin page runs before saving", () => {
    for (const c of COLLECTIONS) {
      const data = JSON.parse(readFileSync(path.join(root, c.file), "utf8"))
      expect(validate(c, data), c.file).toEqual([])
    }
  })

  it("every destination has two hotels or more", () => {
    for (const d of DESTINATIONS) {
      expect(HOTELS.filter((h) => h.area === d.slug).length).toBeGreaterThanOrEqual(2)
    }
  })

  it("every hotel, site and guide points at a real region", () => {
    for (const x of [...HOTELS, ...SITES]) expect(areas.has(x.area), x.name).toBe(true)
    for (const g of GUIDES) for (const a of g.areas) expect(areas.has(a), g.title).toBe(true)
  })

  it("every local image exists in /public", () => {
    const images = [
      ...DESTINATIONS.flatMap((d) => [d.image, ...(d.spots ?? []).map((s) => s.image), ...(d.gallery ?? []).map((p) => p.src)]),
      ...SITES.flatMap((s) => [s.image, ...(s.gallery ?? []).map((p) => p.src)]),
      ...HOTELS.map((h) => h.image),
      ...VEHICLES.flatMap((v) => (v.image ? [v.image] : [])),
      ...GUIDES.flatMap((g) => (g.image ? [g.image] : [])),
    ]
    for (const src of images.filter(isLocal)) expect(publicFile(src), src).toBe(true)
  })

  it("every historic site has history to read", () => {
    for (const s of SITES) {
      expect(s.chapters.length, s.name).toBeGreaterThan(0)
      for (const c of s.chapters) expect(c.body.length, `${s.name} → ${c.heading}`).toBeGreaterThan(100)
    }
  })
})
