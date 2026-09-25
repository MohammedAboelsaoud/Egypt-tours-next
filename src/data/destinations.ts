import destinations from "@/content/destinations.json"

import type { AreaSlug, Photo } from "./types"

export type { AreaSlug } from "./types"

export type Highlight = { title: string; text: string }

export type Spot = {
  name: string
  tagline: string
  text: string
  image: string
  highlights: string[]
}

export type Destination = {
  slug: AreaSlug
  name: string
  tagline: string
  image: string
  summary: string
  bestTime: string
  idealFor: string[]
  highlights: Highlight[]
  /** Extra photos shown in the destination's gallery. */
  gallery?: Photo[]
  /** Optional sub-destinations (used for Sinai). */
  spots?: Spot[]
}

/** The four areas — edit in /admin/ or src/content/destinations.json. */
export const DESTINATIONS = destinations as Destination[]

export function getDestination(slug: string): Destination | undefined {
  return DESTINATIONS.find((d) => d.slug === slug)
}
