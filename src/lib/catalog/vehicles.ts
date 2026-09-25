/**
 * The vehicles the site offers, all with a driver: the cars most tourist
 * transport companies in Egypt run, plus coach charters from Superjet (the
 * Arab Union for Land Transport) and Go Bus. Loaded by `bun run db:seed`, and
 * into the live database once by lib/db/ensure-schema.ts. After that, edit
 * them in Admin → Cars.
 *
 * Prices are per day with driver, in USD. The four cars from the owner's plan
 * keep its prices (Elantra $30, X-Trail $45, Mercedes $90, Vito $60); the
 * others follow typical Egyptian rates for a vehicle with driver. The coach
 * prices are indicative: a charter is quoted per route, and the booking is
 * confirmed with the company before the trip. `year` is the oldest model year
 * offered.
 */

const U = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=80`

/** Stock photos until real photos of each vehicle are added. */
const STOCK = {
  sedan: U("photo-1541899481282-d53bffe3c35d"),
  interior: U("photo-1449965408869-eaa3f722e40d"),
  suv: U("photo-1533473359331-0135ef1b58bf"),
  compactSuv: U("photo-1519641471654-76ce0107ad1b"),
  luxury: U("photo-1583267746897-2cf415887172"),
  luxuryAlt: U("photo-1503376780353-7e6692767b70"),
  crossover: U("photo-1600661653561-629509216228"),
  coach: U("photo-1570125909232-eb263c188f7e"),
  coachNight: U("photo-1544620347-c4fd4a3d5957"),
}

export type CatalogVehicle = {
  slug: string
  name: string
  regionSlug: string
  brand: string
  model: string
  year: number
  type: "Sedan" | "SUV" | "Minivan" | "Luxury" | "Economy" | "Coach"
  seats: number
  transmission: "Automatic" | "Manual"
  fuelType: "Petrol" | "Diesel"
  pricePerDay: number
  features: string[]
  description: string
  imageUrl: string
  galleryUrls: string[]
}

const DRIVER = ["Air conditioning", "English-speaking driver", "Bottled water"]

export const CATALOG_VEHICLES: CatalogVehicle[] = [
  // ── Cairo & Giza ─────────────────────────────────────────────────────
  {
    slug: "hyundai-elantra-economy",
    name: "Hyundai Elantra — Economy Sedan",
    regionSlug: "cairo-giza",
    brand: "Hyundai",
    model: "Elantra",
    year: 2022,
    type: "Economy",
    seats: 4,
    transmission: "Automatic",
    fuelType: "Petrol",
    pricePerDay: 30,
    features: [...DRIVER, "Automatic"],
    description:
      "The most common car on Egypt's roads, and our best value: comfortable and air-conditioned for airport transfers, museum days and the drive out to Giza. Best for up to three travellers with luggage.",
    imageUrl: STOCK.sedan,
    galleryUrls: [STOCK.sedan, STOCK.interior],
  },
  {
    slug: "mercedes-e-class-premium",
    name: "Mercedes-Benz E-Class — Premium Sedan",
    regionSlug: "cairo-giza",
    brand: "Mercedes-Benz",
    model: "E-Class",
    year: 2020,
    type: "Luxury",
    seats: 3,
    transmission: "Automatic",
    fuelType: "Petrol",
    pricePerDay: 90,
    features: [...DRIVER, "Automatic", "Bluetooth"],
    description:
      "Business-class comfort with a professional chauffeur, for VIP guests, meetings, weddings and evenings out.",
    imageUrl: STOCK.luxury,
    galleryUrls: [STOCK.luxury, STOCK.luxuryAlt],
  },
  {
    slug: "mercedes-vito-vip-minivan",
    name: "Mercedes-Benz Vito — VIP Minivan",
    regionSlug: "cairo-giza",
    brand: "Mercedes-Benz",
    model: "Vito",
    year: 2020,
    type: "Minivan",
    seats: 7,
    transmission: "Automatic",
    fuelType: "Diesel",
    pricePerDay: 60,
    features: [...DRIVER, "Automatic", "Child seat available"],
    description:
      "Leather seats and room for a family or small group of up to seven, with space for suitcases — the favourite for airport pickups and full-day tours.",
    imageUrl: STOCK.crossover,
    galleryUrls: [STOCK.crossover, STOCK.interior],
  },
  {
    slug: "toyota-coaster-minibus",
    name: "Toyota Coaster — 25-Seat Minibus",
    regionSlug: "cairo-giza",
    brand: "Toyota",
    model: "Coaster",
    year: 2019,
    type: "Coach",
    seats: 25,
    transmission: "Manual",
    fuelType: "Diesel",
    pricePerDay: 120,
    features: DRIVER,
    description:
      "Egypt's classic tour minibus for groups of up to 25, with air conditioning and room for luggage at the back. Ideal for school trips, clubs and wedding guests.",
    imageUrl: STOCK.coach,
    galleryUrls: [STOCK.coach, STOCK.coachNight],
  },
  {
    slug: "superjet-coach-charter",
    name: "Superjet Coach Charter — Arab Union for Land Transport",
    regionSlug: "cairo-giza",
    brand: "Superjet",
    model: "49-seat coach",
    year: 2018,
    type: "Coach",
    seats: 49,
    transmission: "Manual",
    fuelType: "Diesel",
    pricePerDay: 250,
    features: DRIVER,
    description:
      "A full Superjet coach with its driver, from the Arab Union for Land Transport — Superjet's state-owned operator, founded in 1974, with its main Cairo station in Almaza, Heliopolis. Superjet rents whole buses for groups to anywhere in Egypt.\n\nThe price shown is indicative: send us your route, dates and group size and we confirm the final charter price with Superjet before you pay.",
    imageUrl: STOCK.coach,
    galleryUrls: [STOCK.coach, STOCK.coachNight],
  },
  {
    slug: "go-bus-coach-charter",
    name: "Go Bus Coach — Group Travel",
    regionSlug: "cairo-giza",
    brand: "Go Bus",
    model: "Coach",
    year: 2018,
    type: "Coach",
    seats: 45,
    transmission: "Manual",
    fuelType: "Diesel",
    pricePerDay: 250,
    features: DRIVER,
    description:
      "Group travel with Go Bus, one of Egypt's largest private coach companies, serving more than 80 destinations since 1998.\n\nWe arrange a coach or a block of seats for your group through Go Bus, depending on the route and date. The price shown is indicative: send us your plans and we confirm the final price before you pay.",
    imageUrl: STOCK.coachNight,
    galleryUrls: [STOCK.coachNight, STOCK.coach],
  },

  // ── Luxor & Aswan ────────────────────────────────────────────────────
  {
    slug: "hyundai-h1-van",
    name: "Hyundai H-1 — 8-Seat Van",
    regionSlug: "luxor-aswan",
    brand: "Hyundai",
    model: "H-1",
    year: 2020,
    type: "Minivan",
    seats: 8,
    transmission: "Automatic",
    fuelType: "Diesel",
    pricePerDay: 55,
    features: [...DRIVER, "Automatic"],
    description:
      "A roomy van for up to eight, ideal for the East and West Bank days in Luxor and the drive to Aswan via Edfu and Kom Ombo.",
    imageUrl: STOCK.crossover,
    galleryUrls: [STOCK.crossover, STOCK.interior],
  },
  {
    slug: "toyota-hiace-luxor",
    name: "Toyota HiAce — 13-Seat Minibus",
    regionSlug: "luxor-aswan",
    brand: "Toyota",
    model: "HiAce",
    year: 2019,
    type: "Minivan",
    seats: 13,
    transmission: "Manual",
    fuelType: "Diesel",
    pricePerDay: 75,
    features: DRIVER,
    description:
      "The high-roof HiAce is the workhorse of Egyptian tourism: 13 seats, strong air conditioning and space for bags. The usual choice for the early-morning drive to Abu Simbel.",
    imageUrl: STOCK.coachNight,
    galleryUrls: [STOCK.coachNight, STOCK.coach],
  },

  // ── North Coast ──────────────────────────────────────────────────────
  {
    slug: "nissan-x-trail-suv",
    name: "Nissan X-Trail — SUV",
    regionSlug: "north-coast",
    brand: "Nissan",
    model: "X-Trail",
    year: 2021,
    type: "SUV",
    seats: 4,
    transmission: "Automatic",
    fuelType: "Petrol",
    pricePerDay: 45,
    features: [...DRIVER, "Automatic"],
    description:
      "More space and luggage room for small families — the comfortable choice for the long drive from Cairo or Alexandria to the North Coast beaches.",
    imageUrl: STOCK.suv,
    galleryUrls: [STOCK.suv, STOCK.compactSuv],
  },

  // ── Sinai & the Red Sea ──────────────────────────────────────────────
  {
    slug: "toyota-land-cruiser-4x4",
    name: "Toyota Land Cruiser — Desert 4x4",
    regionSlug: "sinai-red-sea",
    brand: "Toyota",
    model: "Land Cruiser",
    year: 2018,
    type: "SUV",
    seats: 6,
    transmission: "Manual",
    fuelType: "Diesel",
    pricePerDay: 110,
    features: DRIVER,
    description:
      "The 4x4 used for Sinai's desert and mountain roads — the Coloured Canyon, Ras Abu Galum and the road up to St. Catherine — with a Bedouin driver who knows the tracks.",
    imageUrl: STOCK.suv,
    galleryUrls: [STOCK.suv, STOCK.compactSuv],
  },
  {
    slug: "toyota-hiace-minibus-sinai",
    name: "Toyota HiAce — 13-Seat Minibus",
    regionSlug: "sinai-red-sea",
    brand: "Toyota",
    model: "HiAce",
    year: 2019,
    type: "Minivan",
    seats: 13,
    transmission: "Manual",
    fuelType: "Diesel",
    pricePerDay: 75,
    features: DRIVER,
    description:
      "For groups moving between Sharm El Sheikh, Dahab and St. Catherine, including the night drive for the Mount Sinai sunrise climb.",
    imageUrl: STOCK.coachNight,
    galleryUrls: [STOCK.coachNight, STOCK.coach],
  },
]

/** The first seed's demo vehicles that the list above replaces. */
export const RETIRED_VEHICLE_SLUGS = [
  "vw-passat-sedan-cairo",
  "ford-expedition-family-suv",
  "mercedes-s-class-luxury",
  "toyota-crossover-luxor",
  "coach-45-seat-north-coast",
]
