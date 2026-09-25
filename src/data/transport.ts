import vehicles from "@/content/transport.json"

export type Vehicle = {
  id: string
  name: string
  model: string
  /** Picks the fallback icon when there's no photo. */
  kind: "car" | "suv" | "van" | "bus"
  seats: number
  /** USD per day; null shows "Price on request". */
  pricePerDay: number | null
  image?: string
  imageCredit?: string
  description: string
  features: string[]
}

/** Edit in /admin/ or src/content/transport.json. */
export const VEHICLES = vehicles as Vehicle[]
