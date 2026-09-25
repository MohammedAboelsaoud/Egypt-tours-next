import { existsSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

import { parseFact, parseHistory } from "@/lib/sites/history"
import { HISTORIC_SITES } from "@/lib/sites/details"
import { STARTER_SITES } from "@/lib/sites/starter"
import { historicSiteSchema } from "@/lib/validations"

describe("parseHistory", () => {
  it("splits chapters on '## ' headings and paragraphs on blank lines", () => {
    const chapters = parseHistory("## First\n\nOne\ncontinued.\n\nTwo.\n\n## Second\nThree.")
    expect(chapters).toEqual([
      { heading: "First", paragraphs: ["One continued.", "Two."] },
      { heading: "Second", paragraphs: ["Three."] },
    ])
  })

  it("keeps text written before the first heading, and ignores empty chapters", () => {
    expect(parseHistory("Intro.\r\n\r\n## \n## Later\n\nMore.")).toEqual([
      { heading: "", paragraphs: ["Intro."] },
      { heading: "Later", paragraphs: ["More."] },
    ])
  })
})

describe("parseFact", () => {
  it("splits at the first colon only", () => {
    expect(parseFact("Built: c. 2560 BC: 4th Dynasty")).toEqual({ label: "Built", value: "c. 2560 BC: 4th Dynasty" })
  })

  it("treats a line without a label as a plain value", () => {
    expect(parseFact("UNESCO World Heritage Site")).toEqual({ label: "", value: "UNESCO World Heritage Site" })
  })
})

describe("starter catalog", () => {
  const regions = new Set(["cairo-giza", "luxor-aswan", "north-coast", "sinai-red-sea"])

  it("has unique slugs in known regions", () => {
    expect(new Set(HISTORIC_SITES.map((s) => s.slug)).size).toBe(HISTORIC_SITES.length)
    for (const site of HISTORIC_SITES) expect(regions.has(site.regionSlug), site.slug).toBe(true)
  })

  it("passes the admin form's validation", () => {
    for (const { regionSlug: _regionSlug, ...site } of HISTORIC_SITES) {
      const result = historicSiteSchema.safeParse({ ...site, regionId: "region" })
      expect(result.success, `${site.slug}: ${result.error?.issues[0]?.message}`).toBe(true)
    }
  })

  it("has readable chapters and labelled facts", () => {
    for (const site of HISTORIC_SITES) {
      const chapters = parseHistory(site.history)
      expect(chapters.length, site.slug).toBeGreaterThan(0)
      expect(chapters.every((c) => c.heading && c.paragraphs.length > 0), site.slug).toBe(true)
      expect(site.facts.every((f) => parseFact(f).label), site.slug).toBe(true)
    }
  })

  it("points at images that exist", () => {
    for (const site of HISTORIC_SITES) {
      for (const src of [site.imageUrl, ...site.galleryUrls]) {
        expect(existsSync(path.join(process.cwd(), "public", src)), `${site.slug}: ${src}`).toBe(true)
      }
    }
  })

  it("adds chapters, facts and tips to every starter site", () => {
    expect(HISTORIC_SITES).toHaveLength(STARTER_SITES.length)
    HISTORIC_SITES.forEach((site, i) => {
      const starter = STARTER_SITES[i]
      expect(site.history.startsWith(starter.history), site.slug).toBe(true)
      expect(parseHistory(site.history).length, site.slug).toBeGreaterThan(parseHistory(starter.history).length)
      expect(site.facts.length, site.slug).toBeGreaterThan(starter.facts.length)
      expect(site.tips.length, site.slug).toBeGreaterThan(starter.tips.length)
    })
  })
})
