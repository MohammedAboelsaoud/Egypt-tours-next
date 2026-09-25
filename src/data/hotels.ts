import hotels from "@/content/hotels.json"

import type { AreaSlug } from "./types"

export type Hotel = {
  id: string
  name: string
  area: AreaSlug
  city: string
  /** Official star category (1–5). */
  stars: number
  /** Guest review score out of 10. */
  rating: number
  /** Approximate price per room per night, USD. */
  pricePerNight: number
  image: string
  imageCredit?: string
  description: string
  features: string[]
}

/** Edit in /admin/ or src/content/hotels.json. */
export const HOTELS = hotels as Hotel[]
