export const SITE = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || "Egypt Journeys",
  tagline: "Egypt, Planned Around You",
  description:
    "Tailor-made tours, hand-picked hotels and private car rentals across Egypt — planned around you by local Egyptologists.",
  // Vercel sets NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL (host only) for Next.js
  // projects, so links stay right even if NEXT_PUBLIC_SITE_URL isn't set.
  url:
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000"),
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "201001234567",
  email: "hello@egyptjourneys.com",
  phone: "+20 100 123 4567",
  address: "12 Brazil St, Zamalek, Cairo, Egypt",
} as const

export const NAV_LINKS = [
  { href: "/destinations", label: "Destinations" },
  { href: "/tours", label: "Tours" },
  { href: "/hotels", label: "Hotels" },
  { href: "/car-rentals", label: "Car Rentals" },
  { href: "/guides", label: "Guides" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const

export const ADMIN_NAV = [
  { href: "/admin", label: "Overview", icon: "LayoutDashboard" },
  { href: "/admin/bookings", label: "Bookings", icon: "CalendarCheck" },
  { href: "/admin/tours", label: "Tours", icon: "Map" },
  { href: "/admin/hotels", label: "Hotels", icon: "BedDouble" },
  { href: "/admin/cars", label: "Cars", icon: "Car" },
  { href: "/admin/regions", label: "Regions", icon: "Globe" },
  { href: "/admin/guides", label: "Guides", icon: "UsersRound" },
  { href: "/admin/inquiries", label: "Inquiries", icon: "Inbox" },
  { href: "/admin/reviews", label: "Reviews", icon: "Star" },
  { href: "/admin/settings", label: "Settings", icon: "Settings" },
] as const

export const CAR_TYPES = [
  "Sedan",
  "SUV",
  "Minivan",
  "Luxury",
  "Economy",
  "Coach",
] as const

export const HOTEL_AMENITIES = [
  "Free Wi-Fi",
  "Swimming pool",
  "Spa",
  "Airport transfer",
  "Restaurant",
  "Bar",
  "Gym",
  "Air conditioning",
  "Room service",
  "Private beach",
  "Nile view",
  "Family rooms",
  "Parking",
  "Dive centre",
] as const

export const CAR_FEATURES = [
  "Air conditioning",
  "Automatic",
  "GPS navigation",
  "Bluetooth",
  "Child seat available",
  "English-speaking driver",
  "Unlimited mileage",
  "Bottled water",
] as const

export const NATIONALITIES = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Italy",
  "Spain",
  "Netherlands",
  "Japan",
  "China",
  "India",
  "Brazil",
  "Egypt",
  "Other",
] as const

/** Fallback map centre — Egypt. */
export const EGYPT_CENTER = { lat: 26.8206, lng: 30.8025 }

export const GUIDE_TYPES = [
  "Egyptologist",
  "Nubian guide",
  "Bedouin guide",
  "Local guide",
] as const

/** Languages travellers and guides pick from. */
export const LANGUAGES = [
  "English",
  "Arabic",
  "French",
  "German",
  "Spanish",
  "Italian",
  "Russian",
  "Portuguese",
  "Dutch",
  "Chinese",
  "Japanese",
  "Korean",
  "Nubian",
] as const
