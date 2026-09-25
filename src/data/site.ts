/**
 * ─── SITE SETTINGS ────────────────────────────────────────────────────────
 * Your business details. Change the text between the quotes, save, rebuild.
 */
export const SITE = {
  name: "Egypt Journeys",
  tagline: "Guides, hotels & transport across Egypt",
  description:
    "One message on WhatsApp and we arrange your tour guide, hotel and driver anywhere in Egypt — Cairo, Luxor, Aswan, the North Coast and Sinai.",

  /**
   * WhatsApp number that receives every booking request.
   * Country code + number, digits only: no "+", no spaces, no leading 0.
   * Example for an Egyptian mobile 0100 123 4567 → "201001234567"
   *
   * ⚠️ PLACEHOLDER — replace with your real number before publishing.
   */
  whatsapp: "201000000000",

  /** The address the site will live at — used for link previews on social media. */
  url: "https://yourservice.netlify.app",

  email: "hello@example.com",
  /** Shown as text on the Contact page. Leave "" to hide. */
  location: "Cairo, Egypt",
  /** Replying hours shown on the Contact page. */
  hours: "Every day, 9:00 – 22:00 (Cairo time)",

  /** Social links — leave "" to hide an icon. */
  facebook: "",
  instagram: "",
} as const

export const NAV_LINKS = [
  { href: "/destinations/", label: "Destinations" },
  { href: "/hotels/", label: "Hotels" },
  { href: "/transport/", label: "Transport" },
  { href: "/guides/", label: "Tour Guides" },
  { href: "/contact/", label: "Contact" },
] as const
