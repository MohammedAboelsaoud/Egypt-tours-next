import { unstable_cache } from "next/cache"

import { prisma } from "@/lib/prisma"
import { SITE } from "@/lib/constants"

export type SiteSettings = {
  siteName: string
  tagline: string
  contactEmail: string
  contactPhone: string
  whatsappNumber: string
  address: string
  facebookUrl: string
  instagramUrl: string
}

const FALLBACK: SiteSettings = {
  siteName: SITE.name,
  tagline: SITE.tagline,
  contactEmail: SITE.email,
  contactPhone: SITE.phone,
  whatsappNumber: SITE.whatsapp,
  address: SITE.address,
  facebookUrl: "",
  instagramUrl: "",
}

/**
 * Site-wide settings edited from /admin/settings. Cached and tagged so the
 * settings form can revalidate it after a save.
 */
export const getSettings = unstable_cache(
  async (): Promise<SiteSettings> => {
    try {
      const row = await prisma.siteSetting.findUnique({ where: { id: "site" } })
      if (!row) return FALLBACK
      return {
        siteName: row.siteName,
        tagline: row.tagline,
        contactEmail: row.contactEmail,
        contactPhone: row.contactPhone,
        whatsappNumber: row.whatsappNumber,
        address: row.address,
        facebookUrl: row.facebookUrl,
        instagramUrl: row.instagramUrl,
      }
    } catch {
      // Database not reachable yet (e.g. first boot before `prisma db push`).
      return FALLBACK
    }
  },
  ["site-settings"],
  { tags: ["settings"], revalidate: 300 }
)
