import site from "@/content/site.json"

/** Business details — edit in /admin/ (Settings) or src/content/site.json. */
export const SITE: {
  name: string
  tagline: string
  description: string
  /** Country code + number, digits only, e.g. "201029350015". */
  whatsapp: string
  url: string
  email: string
  location: string
  hours: string
  facebook: string
  instagram: string
} = site

export const NAV_LINKS = [
  { href: "/destinations/", label: "Destinations" },
  { href: "/sites/", label: "Historic Sites" },
  { href: "/hotels/", label: "Hotels" },
  { href: "/transport/", label: "Transport" },
  { href: "/guides/", label: "Tour Guides" },
  { href: "/contact/", label: "Contact" },
] as const
