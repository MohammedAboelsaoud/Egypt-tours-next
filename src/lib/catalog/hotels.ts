/**
 * The hotels the site offers: three real hotels per region. Loaded by
 * `bun run db:seed`, and into the live database once by
 * lib/db/ensure-schema.ts. After that, edit them in Admin → Hotels.
 *
 * `officialRate` is the hotel's starting price per room per night in USD,
 * as found on 25 September 2026 (lowest recent "from" rate on Kayak, Momondo
 * or HotelsCombined — the official sites only quote for chosen dates).
 * Travellers see it plus the markup in Admin → Settings (10%). Rates change
 * with the season: check the hotel's website and update them in the admin.
 */

const U = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=80`

/** Stock photos until real photos of each hotel are added. */
const STOCK = {
  cairoRoom: U("photo-1618773928121-c32242e63f39"),
  poolDusk: U("photo-1571896349842-33c89424de2d"),
  poolside: U("photo-1566073771259-6a8506099945"),
  terrace: U("photo-1596394516093-501ba68a0ba6"),
  palms: U("photo-1551882547-ff40c63fe5fa"),
  loungers: U("photo-1582719508461-905c673771fd"),
}

export type CatalogHotel = {
  slug: string
  name: string
  regionSlug: string
  starRating: number
  officialRate: number
  maxGuests: number
  address: string
  lat: number
  lng: number
  amenities: string[]
  description: string
  imageUrl: string
  galleryUrls: string[]
}

export const CATALOG_HOTELS: CatalogHotel[] = [
  // ── Cairo & Giza ─────────────────────────────────────────────────────
  {
    slug: "marriott-mena-house-cairo",
    name: "Marriott Mena House, Cairo",
    regionSlug: "cairo-giza",
    starRating: 5,
    officialRate: 272,
    maxGuests: 3,
    address: "6 Pyramids Road, Giza",
    lat: 29.9867,
    lng: 31.133,
    amenities: ["Free Wi-Fi", "Swimming pool", "Spa", "Restaurant", "Bar", "Gym", "Air conditioning", "Room service", "Family rooms", "Parking"],
    description:
      "The most famous hotel in Egypt, at the foot of the Great Pyramid. It began in 1869 as a royal lodge used by Khedive Ismail and opened as a hotel in 1886; the Cairo Conference of 1943, attended by Roosevelt, Churchill and Chiang Kai-shek, was held here.\n\nThe hotel is set in some 40 acres of gardens. Many rooms, the pool and the terraces look straight onto the pyramids, and the Grand Egyptian Museum is a short drive away.",
    imageUrl: STOCK.poolDusk,
    galleryUrls: [STOCK.poolDusk, STOCK.cairoRoom],
  },
  {
    slug: "cairo-marriott-omar-khayyam",
    name: "Cairo Marriott Hotel & Omar Khayyam Casino",
    regionSlug: "cairo-giza",
    starRating: 5,
    officialRate: 159,
    maxGuests: 3,
    address: "16 Saraya El Gezira Street, Zamalek, Cairo",
    lat: 30.0571,
    lng: 31.2249,
    amenities: ["Free Wi-Fi", "Swimming pool", "Spa", "Restaurant", "Bar", "Gym", "Air conditioning", "Room service", "Nile view", "Parking"],
    description:
      "A palace hotel on Zamalek island in the Nile. At its heart is the Gezira Palace, built by Khedive Ismail in 1869 to host Empress Eugénie and other royal guests at the opening of the Suez Canal; the guest rooms are in two towers beside it.\n\nThe palace garden, with its pool and cafés, is one of the calmest spots in central Cairo, and downtown, the Egyptian Museum and the Cairo Tower are all within a few minutes' drive.",
    imageUrl: STOCK.terrace,
    galleryUrls: [STOCK.terrace, STOCK.cairoRoom],
  },
  {
    slug: "steigenberger-el-tahrir-cairo",
    name: "Steigenberger Hotel El Tahrir",
    regionSlug: "cairo-giza",
    starRating: 4,
    officialRate: 82,
    maxGuests: 3,
    address: "2 Kasr El Nil Street, Tahrir Square, Downtown Cairo",
    lat: 30.0466,
    lng: 31.2366,
    amenities: ["Free Wi-Fi", "Swimming pool", "Spa", "Restaurant", "Gym", "Air conditioning", "Room service", "Family rooms"],
    description:
      "A modern hotel of 295 rooms on Tahrir Square, a short walk from the Egyptian Museum and the Nile. It's the practical choice for exploring downtown and Islamic Cairo — Khan el-Khalili is a quick taxi ride — with a pool, gym and spa to come back to.",
    imageUrl: STOCK.cairoRoom,
    galleryUrls: [STOCK.cairoRoom, STOCK.poolside],
  },

  // ── Luxor & Aswan ────────────────────────────────────────────────────
  {
    slug: "sofitel-winter-palace-luxor",
    name: "Sofitel Winter Palace Luxor",
    regionSlug: "luxor-aswan",
    starRating: 5,
    officialRate: 191,
    maxGuests: 3,
    address: "Corniche El Nil, Luxor",
    lat: 25.6989,
    lng: 32.6392,
    amenities: ["Free Wi-Fi", "Swimming pool", "Spa", "Restaurant", "Bar", "Gym", "Air conditioning", "Room service", "Nile view"],
    description:
      "A Victorian palace on the Nile Corniche, opened in 1907 for Europe's winter visitors, a few minutes' walk from Luxor Temple. Howard Carter announced the discovery of Tutankhamun's tomb here in 1922.\n\nThe hotel's large tropical gardens hide a pool, and the grand staircase and terrace look across the river to the Theban hills.",
    imageUrl: STOCK.palms,
    galleryUrls: [STOCK.palms, STOCK.terrace],
  },
  {
    slug: "hilton-luxor-resort-spa",
    name: "Hilton Luxor Resort & Spa",
    regionSlug: "luxor-aswan",
    starRating: 5,
    officialRate: 150,
    maxGuests: 3,
    address: "New Karnak, Luxor",
    lat: 25.7365,
    lng: 32.6518,
    amenities: ["Free Wi-Fi", "Swimming pool", "Spa", "Restaurant", "Bar", "Gym", "Air conditioning", "Room service", "Nile view", "Family rooms"],
    description:
      "A resort on the Nile's east bank just north of Karnak Temple, with pools facing the river and a large spa. It's quieter than the town centre while staying close to Karnak, and a good base between days on the West Bank.",
    imageUrl: STOCK.poolside,
    galleryUrls: [STOCK.poolside, STOCK.loungers],
  },
  {
    slug: "movenpick-resort-aswan",
    name: "Mövenpick Resort Aswan",
    regionSlug: "luxor-aswan",
    starRating: 5,
    officialRate: 128,
    maxGuests: 3,
    address: "Elephantine Island, Aswan",
    lat: 24.0893,
    lng: 32.8876,
    amenities: ["Free Wi-Fi", "Swimming pool", "Spa", "Restaurant", "Bar", "Gym", "Air conditioning", "Room service", "Nile view", "Family rooms"],
    description:
      "A resort on Elephantine Island in the middle of the Nile at Aswan, reached by the hotel's own ferry from the Corniche. Rooms look over the river, the feluccas and the desert on the west bank, and Nubian villages and the island's ancient ruins are a short walk away.",
    imageUrl: STOCK.loungers,
    galleryUrls: [STOCK.loungers, STOCK.palms],
  },

  // ── North Coast ──────────────────────────────────────────────────────
  {
    slug: "rixos-premium-alamein",
    name: "Rixos Premium Alamein",
    regionSlug: "north-coast",
    starRating: 5,
    officialRate: 157,
    maxGuests: 3,
    address: "New Alamein City, North Coast",
    lat: 30.8335,
    lng: 28.955,
    amenities: ["Free Wi-Fi", "Swimming pool", "Spa", "Restaurant", "Bar", "Gym", "Air conditioning", "Room service", "Private beach", "Family rooms"],
    description:
      "A large all-inclusive resort on the Mediterranean at New Alamein, with a private beach, an infinity pool, a spa and many restaurants. It's a family favourite in summer, and El-Alamein's war memorials and museum are a short drive west.",
    imageUrl: STOCK.poolside,
    galleryUrls: [STOCK.poolside, STOCK.loungers],
  },
  {
    slug: "address-beach-resort-marassi",
    name: "Address Beach Resort Marassi",
    regionSlug: "north-coast",
    starRating: 5,
    officialRate: 235,
    maxGuests: 3,
    address: "Marassi, Sidi Abdel Rahman, North Coast",
    lat: 30.9745,
    lng: 28.7566,
    amenities: ["Free Wi-Fi", "Swimming pool", "Spa", "Restaurant", "Bar", "Gym", "Air conditioning", "Room service", "Private beach", "Family rooms"],
    description:
      "A polished beach resort in Marassi, on the white-sand bay of Sidi Abdel Rahman, close to the marina's restaurants and cafés. It is listed in the Forbes Travel Guide.",
    imageUrl: STOCK.loungers,
    galleryUrls: [STOCK.loungers, STOCK.poolDusk],
  },
  {
    slug: "jaz-almaza-beach-resort",
    name: "Jaz Almaza Beach Resort, Almaza Bay",
    regionSlug: "north-coast",
    starRating: 5,
    officialRate: 105,
    maxGuests: 3,
    address: "Almaza Bay, Marsa Matrouh",
    lat: 31.2968,
    lng: 27.4488,
    amenities: ["Free Wi-Fi", "Swimming pool", "Restaurant", "Bar", "Air conditioning", "Private beach", "Family rooms", "Parking"],
    description:
      "A beach resort in Almaza Bay, near Marsa Matrouh, on some of the clearest turquoise water on the Mediterranean coast. Rates are lowest out of season; July and August are the busiest and most expensive months.",
    imageUrl: STOCK.palms,
    galleryUrls: [STOCK.palms, STOCK.poolside],
  },

  // ── Sinai & the Red Sea ──────────────────────────────────────────────
  {
    slug: "rixos-sharm-el-sheikh-adults-only",
    name: "Rixos Sharm El Sheikh (Adults Only 18+)",
    regionSlug: "sinai-red-sea",
    starRating: 5,
    officialRate: 314,
    maxGuests: 2,
    address: "Nabq Bay, Sharm El Sheikh",
    lat: 27.9713,
    lng: 34.4061,
    amenities: ["Free Wi-Fi", "Swimming pool", "Spa", "Restaurant", "Bar", "Gym", "Air conditioning", "Room service", "Private beach", "Dive centre"],
    description:
      "An adults-only (18+) ultra all-inclusive resort in Nabq Bay, with seven pools, seven à-la-carte restaurants and nine bars. Ras Mohammed National Park and the reefs of Tiran Island are day trips away.",
    imageUrl: STOCK.poolDusk,
    galleryUrls: [STOCK.poolDusk, STOCK.loungers],
  },
  {
    slug: "swiss-inn-resort-dahab",
    name: "Swiss Inn Resort Dahab",
    regionSlug: "sinai-red-sea",
    starRating: 4,
    officialRate: 67,
    maxGuests: 3,
    address: "Dahab Bay, Dahab",
    lat: 28.4852,
    lng: 34.5127,
    amenities: ["Free Wi-Fi", "Swimming pool", "Restaurant", "Bar", "Air conditioning", "Private beach", "Dive centre", "Family rooms"],
    description:
      "A calm beachfront resort on Dahab's bay, with a pool, its own beach and a dive centre, a few minutes from the town's seafront promenade. The Blue Hole, the Canyon and the Lighthouse reef are all nearby.",
    imageUrl: STOCK.palms,
    galleryUrls: [STOCK.palms, STOCK.poolside],
  },
  {
    slug: "morgenland-holly-village-st-catherine",
    name: "Morgenland Holly Village",
    regionSlug: "sinai-red-sea",
    starRating: 3,
    officialRate: 130,
    maxGuests: 3,
    address: "St. Catherine, South Sinai",
    lat: 28.561,
    lng: 33.953,
    amenities: ["Free Wi-Fi", "Swimming pool", "Restaurant", "Bar", "Air conditioning", "Family rooms", "Parking"],
    description:
      "A stone-built mountain hotel in St. Catherine, a practical base for the night climb of Mount Sinai and a visit to St. Catherine's Monastery. Rooms have a balcony or terrace facing the pools or the mountains; breakfast is included.",
    imageUrl: STOCK.terrace,
    galleryUrls: [STOCK.terrace, STOCK.palms],
  },
]

/** The made-up demo hotels the first seed shipped; hidden once real ones load. */
export const RETIRED_HOTEL_SLUGS = [
  "nile-view-boutique-cairo",
  "giza-pyramids-view-resort",
  "luxor-garden-wing-hotel",
  "aswan-nile-terrace-retreat",
  "sidi-abdel-rahman-beach-resort",
  "alamein-marina-suites",
  "sharm-coral-bay-resort",
  "dahab-lagoon-lodge",
]
