import guides from "@/content/guides.json"

import type { AreaSlug } from "./types"

export type Guide = {
  id: string
  title: string
  areas: AreaSlug[]
  /** Where they guide, in plain words. */
  coverage: string
  description: string
  specialties: string[]
  languages: string[]
  image?: string
}

/** Edit in /admin/ or src/content/guides.json. */
export const GUIDES = guides as Guide[]
