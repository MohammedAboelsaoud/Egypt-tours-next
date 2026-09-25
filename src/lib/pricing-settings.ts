import { unstable_cache } from "next/cache"

import { DEFAULT_HOTEL_MARKUP_PERCENT } from "@/lib/markup"
import { prisma } from "@/lib/prisma"
import { toNumber } from "@/lib/utils"

/**
 * The hotel markup from Admin → Settings. Cached and tagged "pricing" so a
 * save applies at once; falls back to the default before the table exists.
 */
export const getHotelMarkupPercent = unstable_cache(
  async (): Promise<number> => {
    try {
      const row = await prisma.pricingSetting.findUnique({ where: { id: "site" } })
      return row ? toNumber(row.hotelMarkupPercent) : DEFAULT_HOTEL_MARKUP_PERCENT
    } catch {
      return DEFAULT_HOTEL_MARKUP_PERCENT
    }
  },
  ["hotel-markup"],
  { tags: ["pricing"], revalidate: 300 }
)
