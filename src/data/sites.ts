import sites from "@/content/sites.json"

import type { AreaSlug, Photo } from "./types"

export type HistoricSite = {
  slug: string
  name: string
  area: AreaSlug
  /** e.g. "Giza, Cairo" */
  location: string
  /** e.g. "c. 2560 BC" */
  period: string
  image: string
  imageCredit?: string
  /** One or two sentences for the catalog card. */
  summary: string
  facts: { label: string; value: string }[]
  /** The history, as titled chapters. Blank lines split paragraphs. */
  chapters: { heading: string; body: string }[]
  tips: string[]
  gallery?: Photo[]
  /** Words that make the chat assistant link to this page. */
  keywords: string[]
}

/** The historic sites catalog — edit in /admin/ or src/content/sites.json. */
export const SITES = sites as HistoricSite[]

export function getSite(slug: string): HistoricSite | undefined {
  return SITES.find((s) => s.slug === slug)
}
