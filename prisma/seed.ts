/**
 * Seed content for Egypt Journeys.
 *
 * Regions and tours are migrated from the original Flask app's seed_data.py;
 * hotels, cars, reviews and the admin account are new for this platform.
 *
 * Run with:  bun run db:seed   (safe to re-run — everything upserts by slug)
 */
import { PrismaClient, type Prisma } from "@prisma/client"
import bcrypt from "bcryptjs"

import { addDays, fromISODate, todayInEgypt } from "../src/lib/guides/availability"
import { STARTER_SITES } from "../src/lib/sites/starter"

const prisma = new PrismaClient()

const IMG = {
  cairo: "/img/cairo-giza.jpg",
  luxor: "/img/luxor-aswan.jpg",
  nile: "/img/nile-felucca.jpg",
  north: "/img/north-coast.jpg",
  alamein: "/img/el-alamein.jpg",
  sinai: "/img/sinai-red-sea.jpg",
  catherine: "/img/saint-catherine.jpg",
  hero: "/img/hero.jpg",
}

const U = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=80`

const HOTEL_IMG = {
  cairoRoom: U("photo-1618773928121-c32242e63f39"),
  poolDusk: U("photo-1571896349842-33c89424de2d"),
  poolside: U("photo-1566073771259-6a8506099945"),
  terrace: U("photo-1596394516093-501ba68a0ba6"),
  palms: U("photo-1551882547-ff40c63fe5fa"),
  loungers: U("photo-1582719508461-905c673771fd"),
}

const CAR_IMG = {
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

// ---------------------------------------------------------------- regions

const REGIONS = [
  {
    slug: "cairo-giza",
    name: "Cairo & Giza",
    tagline: "Pyramids, the Egyptian Museum, and a city that never sleeps",
    cities: ["Cairo", "Giza"],
    imageUrl: IMG.cairo,
    galleryUrls: [IMG.cairo, IMG.hero],
    lat: 30.0444,
    lng: 31.2357,
    zoom: 10,
    sortOrder: 1,
    summary:
      "Start where ancient Egypt began. Stand at the foot of the Great Pyramid, meet the Sphinx, and walk the halls of the Grand Egyptian Museum. Then dive into medieval Islamic Cairo, the Coptic quarter, and the colour and noise of Khan el-Khalili bazaar.",
  },
  {
    slug: "luxor-aswan",
    name: "Luxor & Aswan",
    tagline: "The open-air museum of the Nile Valley",
    cities: ["Luxor", "Aswan"],
    imageUrl: IMG.luxor,
    galleryUrls: [IMG.luxor, IMG.nile],
    lat: 25.6872,
    lng: 32.6396,
    zoom: 8,
    sortOrder: 2,
    summary:
      "Karnak and Luxor temples, the Valley of the Kings, and Hatshepsut's terraces on the West Bank. Sail south to Aswan for the Philae temple, the High Dam, and a felucca ride at sunset — with the option of a day trip to Abu Simbel.",
  },
  {
    slug: "north-coast",
    name: "North Coast",
    tagline: "Marsa Matrouh, El Alamein & the turquoise Mediterranean",
    cities: ["Marsa Matrouh", "El Alamein", "Sidi Abdel Rahman"],
    imageUrl: IMG.north,
    galleryUrls: [IMG.north, IMG.alamein],
    lat: 31.0,
    lng: 28.4,
    zoom: 8,
    sortOrder: 3,
    summary:
      "Egypt's Mediterranean summer: white sand and clear shallow water at Marsa Matrouh, the calm bays around Sidi Abdel Rahman, and the WWII history of El Alamein with its war cemeteries and museum. Best from June to September.",
  },
  {
    slug: "sinai-red-sea",
    name: "Sinai & the Red Sea",
    tagline: "Sharm El Sheikh, Dahab, Saint Catherine & world-class reefs",
    cities: ["Sharm El Sheikh", "Dahab", "Saint Catherine"],
    imageUrl: IMG.sinai,
    galleryUrls: [IMG.sinai, IMG.catherine],
    lat: 28.2,
    lng: 34.0,
    zoom: 8,
    sortOrder: 4,
    summary:
      "Dive or snorkel Ras Mohammed and the Straits of Tiran from Sharm El Sheikh, slow down in laid-back Dahab and its Blue Hole, and climb Mount Sinai for sunrise before visiting the 6th-century Saint Catherine's Monastery.",
  },
]

// ------------------------------------------------------------------ tours

type SeedTour = Omit<
  Prisma.TourCreateInput,
  "region" | "itinerary" | "createdAt" | "updatedAt"
> & { region: string; itinerary: { day: number; title: string; description: string }[] }

const STANDARD_EXCLUDES = [
  "International flights",
  "Egypt entry visa",
  "Travel insurance",
  "Personal expenses and tipping",
]

const TOURS: SeedTour[] = [
  {
    region: "cairo-giza",
    slug: "pyramids-and-old-cairo-3-days",
    title: "Pyramids & Old Cairo — 3 Days",
    durationDays: 3,
    priceFrom: 260,
    currency: "USD",
    maxGroupSize: 12,
    imageUrl: IMG.cairo,
    galleryUrls: [IMG.cairo, IMG.hero, IMG.nile],
    lat: 29.9773,
    lng: 31.1325,
    featured: true,
    sortOrder: 1,
    summary:
      "A first-timer's three days in the capital: the Giza plateau, the great museums, and the old Islamic and Coptic city, at a comfortable pace with a private guide.",
    description:
      "Three days is exactly enough to meet Cairo properly without rushing it. You begin on the Giza plateau in the early morning, before the coaches arrive, with an Egyptologist who can read the walls for you. The afternoon belongs to the Grand Egyptian Museum, where Tutankhamun's collection is displayed in full for the first time.\n\nDay two moves forward a few thousand years into medieval Cairo — the Citadel above the city, the vast Sultan Hassan mosque, and the workshops and spice stalls of Khan el-Khalili. The last day is quieter: Coptic Cairo's churches and the Royal Mummies gallery at the National Museum of Egyptian Civilization.\n\nEverything is private. The pace, the lunch stops, and the balance between sites and rest are yours to set on the day.",
    highlights: [
      "Great Pyramid, Sphinx and a camel ride on the plateau",
      "Grand Egyptian Museum",
      "Khan el-Khalili bazaar and historic Muizz Street",
      "Coptic Cairo: the Hanging Church and Ben Ezra Synagogue",
    ],
    itinerary: [
      {
        day: 1,
        title: "Giza plateau & the Grand Egyptian Museum",
        description:
          "An early start for the Giza pyramids, the Sphinx and the Valley Temple, with time for photographs from the panorama point and an optional camel ride. After lunch, the Grand Egyptian Museum and the Tutankhamun galleries.",
      },
      {
        day: 2,
        title: "Islamic Cairo & Khan el-Khalili",
        description:
          "The Citadel of Saladin and the Mohamed Ali Mosque, then the Sultan Hassan and Al-Rifa'i mosques. The afternoon is spent walking Al-Muizz Street into Khan el-Khalili, ending with mint tea at El Fishawy.",
      },
      {
        day: 3,
        title: "Coptic Cairo & the Royal Mummies",
        description:
          "The Hanging Church, Ben Ezra Synagogue and the Coptic Museum in Old Cairo, followed by the National Museum of Egyptian Civilization to see the Royal Mummies gallery.",
      },
    ],
    includes: [
      "Private Egyptologist guide",
      "Air-conditioned car and driver",
      "All entry tickets listed in the itinerary",
      "Hotel pickup and drop-off",
      "Bottled water throughout",
    ],
    excludes: STANDARD_EXCLUDES,
  },
  {
    region: "cairo-giza",
    slug: "cairo-museums-and-islamic-cairo-2-days",
    title: "Museums & Islamic Cairo — 2 Days",
    durationDays: 2,
    priceFrom: 170,
    currency: "USD",
    maxGroupSize: 12,
    imageUrl: IMG.hero,
    galleryUrls: [IMG.hero, IMG.cairo],
    lat: 30.0459,
    lng: 31.2243,
    sortOrder: 2,
    summary:
      "A culture-focused two days for travellers who have already seen the pyramids.",
    description:
      "For repeat visitors, or anyone who would rather spend a full morning in one museum than tick off five sites in a day. You get the Grand Egyptian Museum unhurried, the Coptic quarter at its quietest, and Islamic Cairo in the late afternoon light that photographers come for.",
    highlights: [
      "Grand Egyptian Museum, unhurried",
      "The Citadel and its mosques",
      "Al-Muizz Street at golden hour",
      "Coptic quarter and the Coptic Museum",
    ],
    itinerary: [
      {
        day: 1,
        title: "Grand Egyptian Museum & Old Cairo",
        description:
          "A long morning at the Grand Egyptian Museum with your guide, then Old Cairo and the Coptic Museum in the afternoon.",
      },
      {
        day: 2,
        title: "The Citadel & Al-Muizz Street",
        description:
          "The Citadel, Sultan Hassan and Al-Rifa'i mosques, then Al-Muizz Street and Khan el-Khalili as the light drops.",
      },
    ],
    includes: [
      "Private guide",
      "Air-conditioned car and driver",
      "Entry tickets",
      "Bottled water",
    ],
    excludes: STANDARD_EXCLUDES,
  },
  {
    region: "luxor-aswan",
    slug: "nile-cruise-luxor-to-aswan-4-days",
    title: "Nile Cruise: Luxor to Aswan — 4 Days",
    durationDays: 4,
    priceFrom: 520,
    currency: "USD",
    maxGroupSize: 16,
    imageUrl: IMG.nile,
    galleryUrls: [IMG.nile, IMG.luxor, IMG.hero],
    lat: 25.6989,
    lng: 32.6421,
    featured: true,
    sortOrder: 1,
    summary:
      "The classic southbound cruise, stopping at the great temples of the Nile Valley with nights aboard a five-star boat.",
    description:
      "The stretch of river between Luxor and Aswan is the reason people come to Egypt twice. You board in Luxor, and for four days the temples come to you: Karnak's forest of columns, the painted tombs of the Valley of the Kings, Edfu's falcon god, Kom Ombo at the water's edge, and finally Philae on its island.\n\nBetween sites the boat simply sails. Breakfast on deck, the green ribbon of the valley on both banks, and villages that have farmed the same fields for five thousand years.",
    highlights: [
      "Karnak and Luxor temples",
      "Valley of the Kings and Hatshepsut Temple",
      "Edfu and Kom Ombo temples",
      "Philae Temple and a felucca sail in Aswan",
    ],
    itinerary: [
      {
        day: 1,
        title: "Board in Luxor — the East Bank",
        description:
          "Embarkation and lunch aboard, then Karnak Temple and Luxor Temple with your Egyptologist. Overnight moored in Luxor.",
      },
      {
        day: 2,
        title: "The West Bank, then sail to Edfu",
        description:
          "Valley of the Kings, Hatshepsut's terraced temple and the Colossi of Memnon in the morning. The boat sails south through the Esna lock in the afternoon.",
      },
      {
        day: 3,
        title: "Edfu & Kom Ombo",
        description:
          "The Temple of Horus at Edfu by horse carriage, then the twin temple of Kom Ombo at sunset, right on the riverbank. Sail on to Aswan.",
      },
      {
        day: 4,
        title: "Philae Temple & the High Dam",
        description:
          "A short boat ride to Philae Temple on Agilkia Island, the High Dam and the unfinished obelisk, then disembarkation. Abu Simbel can be added as a day trip.",
      },
    ],
    includes: [
      "3 nights full-board on a 5-star Nile cruiser",
      "Guided temple visits and all entry tickets",
      "Transfers to and from the boat",
      "Felucca ride in Aswan",
    ],
    excludes: [...STANDARD_EXCLUDES, "Abu Simbel day trip (quoted separately)"],
  },
  {
    region: "luxor-aswan",
    slug: "luxor-highlights-2-days",
    title: "Luxor Highlights — 2 Days",
    durationDays: 2,
    priceFrom: 190,
    currency: "USD",
    maxGroupSize: 10,
    imageUrl: IMG.luxor,
    galleryUrls: [IMG.luxor, IMG.nile],
    lat: 25.7188,
    lng: 32.6573,
    sortOrder: 2,
    summary:
      "Both banks of Luxor in two focused days, with an optional dawn balloon flight.",
    description:
      "Luxor holds roughly a third of the world's ancient monuments, and two well-planned days will show you the best of them. East Bank temples on day one, the necropolis on day two — and if you are willing to be awake at 4am, the balloon flight over the West Bank at sunrise is the single best view in Egypt.",
    highlights: [
      "Karnak's hypostyle hall",
      "Valley of the Kings",
      "Hatshepsut Temple and Deir el-Medina",
      "Optional sunrise hot-air balloon",
    ],
    itinerary: [
      {
        day: 1,
        title: "East Bank temples",
        description:
          "Karnak and Luxor temples with your guide, and the Luxor Museum in the evening when it is cool and quiet.",
      },
      {
        day: 2,
        title: "West Bank necropolis",
        description:
          "An optional balloon flight at dawn, then the Valley of the Kings, Hatshepsut Temple, Deir el-Medina and the Colossi of Memnon.",
      },
    ],
    includes: [
      "Private guide",
      "Air-conditioned car and driver",
      "Entry tickets (balloon quoted separately)",
      "Hotel pickup and drop-off",
    ],
    excludes: STANDARD_EXCLUDES,
  },
  {
    region: "north-coast",
    slug: "north-coast-summer-escape-4-days",
    title: "North Coast Summer Escape — 4 Days",
    durationDays: 4,
    priceFrom: 300,
    currency: "USD",
    maxGroupSize: 14,
    imageUrl: IMG.north,
    galleryUrls: [IMG.north, IMG.alamein],
    lat: 31.3543,
    lng: 27.2373,
    featured: true,
    sortOrder: 1,
    summary:
      "Four slow days on the Mediterranean between Marsa Matrouh and Sidi Abdel Rahman, with one afternoon of El Alamein history.",
    description:
      "Egyptians keep this coast to themselves, and once you have seen the water at Ageeba you will understand why — it is the clearest, palest turquoise in the country, in shallow bays sheltered by limestone cliffs.\n\nThis is a holiday rather than a tour. Three of the four days are yours to spend on the sand, with one afternoon set aside for the war cemeteries and museum at El Alamein.",
    highlights: [
      "Ageeba and Cleopatra beaches near Marsa Matrouh",
      "Swimming in the calm bay at Sidi Abdel Rahman",
      "El Alamein war cemeteries and museum",
      "Fresh seafood by the water",
    ],
    itinerary: [
      {
        day: 1,
        title: "Transfer to the coast",
        description:
          "A private transfer from Cairo or Alexandria along the coast road, with a stop for lunch. The evening is free.",
      },
      {
        day: 2,
        title: "Marsa Matrouh beaches",
        description:
          "Ageeba Beach in the morning and Cleopatra's Bath in the afternoon, with time to swim at both.",
      },
      {
        day: 3,
        title: "El Alamein",
        description:
          "The Commonwealth and German war cemeteries and the El Alamein Military Museum, with your guide, then back to the coast.",
      },
      {
        day: 4,
        title: "Free morning & return",
        description: "A last morning on the beach before the transfer back.",
      },
    ],
    includes: [
      "3 nights on the North Coast",
      "Private air-conditioned transfers",
      "Driver-guide",
      "El Alamein entry tickets",
    ],
    excludes: STANDARD_EXCLUDES,
  },
  {
    region: "north-coast",
    slug: "el-alamein-history-and-beach-2-days",
    title: "El Alamein History & Beach — 2 Days",
    durationDays: 2,
    priceFrom: 160,
    currency: "USD",
    maxGroupSize: 12,
    imageUrl: IMG.alamein,
    galleryUrls: [IMG.alamein, IMG.north],
    lat: 30.8283,
    lng: 28.9498,
    sortOrder: 2,
    summary:
      "A focused weekend for history travellers, paired with a beach afternoon.",
    description:
      "The two battles of El Alamein turned the North African campaign, and the ground still shows it. This short trip visits the Commonwealth cemetery with its 7,000 graves, the German and Italian memorials on the ridge, and the military museum — then gives you an afternoon on the beach at Sidi Abdel Rahman to sit with it.",
    highlights: [
      "Commonwealth War Cemetery",
      "German and Italian memorials",
      "El Alamein Military Museum",
      "Afternoon at Sidi Abdel Rahman beach",
    ],
    itinerary: [
      {
        day: 1,
        title: "The battlefield",
        description:
          "Drive from Cairo or Alexandria, then the cemeteries, memorials and military museum with a guide. Overnight on the coast.",
      },
      {
        day: 2,
        title: "Beach morning & return",
        description: "A morning at Sidi Abdel Rahman, then the return transfer.",
      },
    ],
    includes: [
      "1 night on the coast",
      "Private transfers",
      "Guide",
      "Museum and cemetery entries",
    ],
    excludes: STANDARD_EXCLUDES,
  },
  {
    region: "sinai-red-sea",
    slug: "sharm-el-sheikh-diving-week-6-days",
    title: "Sharm El Sheikh Diving Week — 6 Days",
    durationDays: 6,
    priceFrom: 640,
    currency: "USD",
    maxGroupSize: 8,
    imageUrl: IMG.sinai,
    galleryUrls: [IMG.sinai, IMG.catherine],
    lat: 27.9158,
    lng: 34.33,
    featured: true,
    sortOrder: 1,
    summary:
      "A full week of Red Sea diving from Sharm, covering Ras Mohammed, the Tiran reefs, and the wreck of the SS Thistlegorm.",
    description:
      "The northern Red Sea has the reef walls, the visibility and the wreck — and this week covers all three. You dive Ras Mohammed's Shark and Yolanda reefs, the four reefs of the Tiran Strait, and take the early boat out to the Thistlegorm, still loaded with the motorcycles and rifles it was carrying when it was bombed in 1941.\n\nSuitable for certified divers; a refresher is included on the first day if you have been out of the water for a while.",
    highlights: [
      "Ras Mohammed National Park walls",
      "Tiran Strait: Jackson and Gordon reefs",
      "SS Thistlegorm wreck dive",
      "Optional night dive",
    ],
    itinerary: [
      {
        day: 1,
        title: "Arrival & check dive",
        description:
          "Airport transfer, hotel check-in and an easy house-reef check dive to sort weights and kit.",
      },
      {
        day: 2,
        title: "Ras Mohammed",
        description:
          "Two-tank boat day at Shark Reef and Yolanda Reef inside the national park.",
      },
      {
        day: 3,
        title: "Local reefs",
        description:
          "Two dives on the local Sharm reefs — Temple, Ras Katy or Middle Garden depending on conditions.",
      },
      {
        day: 4,
        title: "Tiran Strait",
        description:
          "A full day boat to the Tiran reefs: Jackson, Woodhouse, Thomas and Gordon.",
      },
      {
        day: 5,
        title: "SS Thistlegorm",
        description:
          "An early start for the crossing to the wreck, with two dives — the cargo holds and then the exterior and guns.",
      },
      {
        day: 6,
        title: "Last dive & departure",
        description:
          "A relaxed morning dive or free time, then the airport transfer (no diving within 18 hours of your flight).",
      },
    ],
    includes: [
      "5 nights hotel with breakfast",
      "5 days of guided boat diving (2 dives per day)",
      "Tanks, weights and marine park fees",
      "Airport transfers",
    ],
    excludes: [
      ...STANDARD_EXCLUDES,
      "Dive equipment rental",
      "Nitrox and specialty courses",
    ],
  },
  {
    region: "sinai-red-sea",
    slug: "dahab-and-mount-sinai-4-days",
    title: "Dahab & Mount Sinai — 4 Days",
    durationDays: 4,
    priceFrom: 330,
    currency: "USD",
    maxGroupSize: 10,
    imageUrl: IMG.catherine,
    galleryUrls: [IMG.catherine, IMG.sinai],
    lat: 28.5091,
    lng: 34.5136,
    sortOrder: 2,
    summary:
      "Laid-back Dahab as a base, with a sunrise climb of Mount Sinai and a visit to Saint Catherine's Monastery.",
    description:
      "Dahab moves at a different speed to the rest of the Red Sea — cushions on the sand, no big resorts, and a reef you can swim to from the shore. It makes a good base for the one thing worth losing sleep over: the night climb up Mount Sinai to be on the summit at first light, followed by breakfast and the 6th-century monastery at the foot of the mountain.",
    highlights: [
      "Snorkelling the Blue Hole and the Canyon",
      "Sunrise from the summit of Mount Sinai",
      "Saint Catherine's Monastery and the Burning Bush",
      "Bedouin dinner under the stars",
    ],
    itinerary: [
      {
        day: 1,
        title: "Transfer to Dahab",
        description:
          "Private transfer to Dahab and check-in, with the evening free on the promenade.",
      },
      {
        day: 2,
        title: "Snorkelling day",
        description:
          "The Blue Hole, the Bells and the Canyon by jeep, with lunch at a Bedouin camp on the shore.",
      },
      {
        day: 3,
        title: "Free day, then the night drive",
        description:
          "A free day in Dahab, an early dinner, then the late-night drive to Saint Catherine to begin the climb around 1am.",
      },
      {
        day: 4,
        title: "Sunrise & the monastery",
        description:
          "Sunrise from the summit, the descent by the Steps of Repentance or the camel path, then Saint Catherine's Monastery before the transfer out.",
      },
    ],
    includes: [
      "3 nights in Dahab with breakfast",
      "Private transfers",
      "Mount Sinai guide and camel option",
      "Monastery entry",
    ],
    excludes: STANDARD_EXCLUDES,
  },
]

// ----------------------------------------------------------------- hotels

const HOTELS = [
  {
    region: "cairo-giza",
    slug: "nile-view-boutique-cairo",
    name: "Nile View Boutique, Zamalek",
    starRating: 5,
    pricePerNight: 180,
    maxGuests: 2,
    imageUrl: HOTEL_IMG.cairoRoom,
    galleryUrls: [HOTEL_IMG.cairoRoom, HOTEL_IMG.poolside],
    address: "Zamalek Island, Cairo",
    lat: 30.0614,
    lng: 31.2197,
    amenities: [
      "Free Wi-Fi",
      "Swimming pool",
      "Restaurant",
      "Bar",
      "Airport transfer",
      "Air conditioning",
      "Room service",
      "Nile view",
    ],
    roomTypes: [
      { name: "Deluxe Nile View", price: 180, capacity: 2 },
      { name: "Junior Suite", price: 265, capacity: 3 },
      { name: "Family Room", price: 310, capacity: 4 },
    ],
    description:
      "A 24-room townhouse hotel on the quiet western side of Zamalek, five minutes from the Cairo Tower and twenty from the Egyptian Museum. Rooms on the upper floors look straight down the river; the roof terrace serves breakfast until noon, which is the civilised way to start a day in Cairo.",
  },
  {
    region: "cairo-giza",
    slug: "giza-pyramids-view-resort",
    name: "Giza Pyramids View Resort",
    starRating: 5,
    pricePerNight: 240,
    maxGuests: 3,
    imageUrl: HOTEL_IMG.poolDusk,
    galleryUrls: [HOTEL_IMG.poolDusk, HOTEL_IMG.cairoRoom],
    address: "Pyramids Road, Giza",
    lat: 29.9765,
    lng: 31.1442,
    amenities: [
      "Free Wi-Fi",
      "Swimming pool",
      "Spa",
      "Restaurant",
      "Gym",
      "Air conditioning",
      "Airport transfer",
      "Family rooms",
    ],
    roomTypes: [
      { name: "Garden Room", price: 240, capacity: 2 },
      { name: "Pyramid View Room", price: 320, capacity: 2 },
      { name: "Pyramid View Suite", price: 460, capacity: 4 },
    ],
    description:
      "Close enough to the plateau that the Great Pyramid fills the window of every front-facing room, and close enough to walk to the site gate before the queues form. Large pool, three restaurants, and a spa that is genuinely worth using after a day of walking on sand.",
  },
  {
    region: "luxor-aswan",
    slug: "luxor-garden-wing-hotel",
    name: "Luxor Garden Wing Hotel",
    starRating: 5,
    pricePerNight: 165,
    maxGuests: 2,
    imageUrl: HOTEL_IMG.poolside,
    galleryUrls: [HOTEL_IMG.poolside, HOTEL_IMG.terrace],
    address: "Corniche El Nil, Luxor",
    lat: 25.6989,
    lng: 32.6396,
    amenities: [
      "Free Wi-Fi",
      "Swimming pool",
      "Spa",
      "Restaurant",
      "Bar",
      "Air conditioning",
      "Nile view",
      "Parking",
    ],
    roomTypes: [
      { name: "Garden Room", price: 165, capacity: 2 },
      { name: "Nile View Room", price: 215, capacity: 2 },
      { name: "Terrace Suite", price: 340, capacity: 3 },
    ],
    description:
      "A colonial-era garden hotel on the Corniche, a ten-minute walk from Luxor Temple and directly opposite the West Bank ferry. Old trees, a long pool, and staff who will have your breakfast packed at 4am if you are going up in a balloon.",
  },
  {
    region: "luxor-aswan",
    slug: "aswan-nile-terrace-retreat",
    name: "Aswan Nile Terrace Retreat",
    starRating: 4,
    pricePerNight: 130,
    maxGuests: 2,
    imageUrl: HOTEL_IMG.terrace,
    galleryUrls: [HOTEL_IMG.terrace, HOTEL_IMG.poolside],
    address: "West Bank, Aswan",
    lat: 24.0889,
    lng: 32.8998,
    amenities: [
      "Free Wi-Fi",
      "Swimming pool",
      "Restaurant",
      "Air conditioning",
      "Nile view",
      "Airport transfer",
    ],
    roomTypes: [
      { name: "Nubian Room", price: 130, capacity: 2 },
      { name: "River Terrace Room", price: 175, capacity: 2 },
    ],
    description:
      "A small Nubian-built guesthouse on the west bank, reached by the hotel's own boat. Domed ceilings, painted walls, and a terrace over the water where the only sound after dark is the current. Aswan's souk is a five-minute crossing away.",
  },
  {
    region: "north-coast",
    slug: "sidi-abdel-rahman-beach-resort",
    name: "Sidi Abdel Rahman Beach Resort",
    starRating: 5,
    pricePerNight: 210,
    maxGuests: 4,
    imageUrl: HOTEL_IMG.palms,
    galleryUrls: [HOTEL_IMG.palms, HOTEL_IMG.loungers],
    address: "Sidi Abdel Rahman, North Coast",
    lat: 30.9645,
    lng: 28.7,
    amenities: [
      "Free Wi-Fi",
      "Private beach",
      "Swimming pool",
      "Restaurant",
      "Bar",
      "Family rooms",
      "Air conditioning",
      "Parking",
    ],
    roomTypes: [
      { name: "Garden Chalet", price: 210, capacity: 3 },
      { name: "Sea View Room", price: 275, capacity: 3 },
      { name: "Beach Villa", price: 480, capacity: 6 },
    ],
    description:
      "On the calmest bay of the North Coast, where the water stays waist-deep for a hundred metres and turns the colour of a swimming pool. Low-rise chalets set back among palms, a beach club at the water's edge, and El Alamein forty minutes east.",
  },
  {
    region: "north-coast",
    slug: "alamein-marina-suites",
    name: "Alamein Marina Suites",
    starRating: 4,
    pricePerNight: 145,
    maxGuests: 4,
    imageUrl: HOTEL_IMG.loungers,
    galleryUrls: [HOTEL_IMG.loungers, HOTEL_IMG.palms],
    address: "El Alamein Marina, North Coast",
    lat: 30.8283,
    lng: 28.9498,
    amenities: [
      "Free Wi-Fi",
      "Swimming pool",
      "Restaurant",
      "Air conditioning",
      "Family rooms",
      "Parking",
      "Gym",
    ],
    roomTypes: [
      { name: "Marina Studio", price: 145, capacity: 2 },
      { name: "Two-Bedroom Suite", price: 245, capacity: 5 },
    ],
    description:
      "Apartment-style suites above the new marina, with kitchens, laundry and enough space for a family that has had enough of hotel rooms. Ten minutes from the war cemeteries and the museum.",
  },
  {
    region: "sinai-red-sea",
    slug: "sharm-coral-bay-resort",
    name: "Sharm Coral Bay Resort",
    starRating: 5,
    pricePerNight: 195,
    maxGuests: 3,
    imageUrl: HOTEL_IMG.poolDusk,
    galleryUrls: [HOTEL_IMG.poolDusk, HOTEL_IMG.palms],
    address: "Nabq Bay, Sharm El Sheikh",
    lat: 27.9654,
    lng: 34.3908,
    amenities: [
      "Free Wi-Fi",
      "Private beach",
      "Dive centre",
      "Swimming pool",
      "Spa",
      "Restaurant",
      "Bar",
      "Airport transfer",
      "Air conditioning",
    ],
    roomTypes: [
      { name: "Standard Room", price: 195, capacity: 2 },
      { name: "Sea View Room", price: 250, capacity: 3 },
      { name: "Swim-up Suite", price: 395, capacity: 3 },
    ],
    description:
      "A dive resort first and a beach hotel second: the house reef is reached by a jetty over the seagrass, tanks are filled on site, and the boat leaves from the resort's own pontoon. Ras Mohammed is a forty-minute crossing.",
  },
  {
    region: "sinai-red-sea",
    slug: "dahab-lagoon-lodge",
    name: "Dahab Lagoon Lodge",
    starRating: 3,
    pricePerNight: 85,
    maxGuests: 2,
    imageUrl: HOTEL_IMG.terrace,
    galleryUrls: [HOTEL_IMG.terrace, HOTEL_IMG.loungers],
    address: "Lagoon, Dahab",
    lat: 28.5091,
    lng: 34.5136,
    amenities: [
      "Free Wi-Fi",
      "Swimming pool",
      "Restaurant",
      "Dive centre",
      "Air conditioning",
      "Parking",
    ],
    roomTypes: [
      { name: "Garden Room", price: 85, capacity: 2 },
      { name: "Lagoon View Room", price: 115, capacity: 2 },
    ],
    description:
      "Twelve rooms around a courtyard at the quiet lagoon end of Dahab, with kite-surfing on the doorstep and the Blue Hole twenty minutes north. Simple, spotless, and the best value on this coast.",
  },
]

// ------------------------------------------------------------------- cars

const CARS = [
  {
    region: "cairo-giza",
    slug: "vw-passat-sedan-cairo",
    name: "Volkswagen Passat — Private Sedan",
    brand: "Volkswagen",
    model: "Passat",
    year: 2023,
    type: "Sedan",
    seats: 4,
    transmission: "Automatic",
    fuelType: "Petrol",
    pricePerDay: 65,
    imageUrl: CAR_IMG.sedan,
    galleryUrls: [CAR_IMG.sedan, CAR_IMG.interior],
    features: [
      "Air conditioning",
      "Automatic",
      "English-speaking driver",
      "Bottled water",
      "Bluetooth",
      "Unlimited mileage",
    ],
    description:
      "Our standard city car for couples and solo travellers: comfortable for airport runs, museum days and the drive out to Giza, with a driver who knows which gate to use.",
  },
  {
    region: "cairo-giza",
    slug: "ford-expedition-family-suv",
    name: "Ford Expedition — Family SUV",
    brand: "Ford",
    model: "Expedition",
    year: 2023,
    type: "SUV",
    seats: 7,
    transmission: "Automatic",
    fuelType: "Petrol",
    pricePerDay: 110,
    imageUrl: CAR_IMG.suv,
    galleryUrls: [CAR_IMG.suv, CAR_IMG.compactSuv],
    features: [
      "Air conditioning",
      "Automatic",
      "Child seat available",
      "GPS navigation",
      "English-speaking driver",
      "Unlimited mileage",
    ],
    description:
      "Seven seats and a boot that takes the luggage as well as the people — the usual choice for families combining Cairo with a few days on the coast or in the desert.",
  },
  {
    region: "cairo-giza",
    slug: "mercedes-s-class-luxury",
    name: "Mercedes-Benz S-Class — Chauffeured",
    brand: "Mercedes-Benz",
    model: "S-Class",
    year: 2024,
    type: "Luxury",
    seats: 3,
    transmission: "Automatic",
    fuelType: "Petrol",
    pricePerDay: 190,
    imageUrl: CAR_IMG.luxury,
    galleryUrls: [CAR_IMG.luxury, CAR_IMG.luxuryAlt],
    features: [
      "Air conditioning",
      "Automatic",
      "English-speaking driver",
      "Bottled water",
      "Bluetooth",
      "GPS navigation",
    ],
    description:
      "For arrivals that matter and evenings that run late. Chauffeured only, with a driver in uniform, and available for airport meet-and-greet with fast-track through immigration.",
  },
  {
    region: "luxor-aswan",
    slug: "toyota-crossover-luxor",
    name: "Toyota Crossover — Nile Valley",
    brand: "Toyota",
    model: "RAV4",
    year: 2023,
    type: "SUV",
    seats: 5,
    transmission: "Automatic",
    fuelType: "Petrol",
    pricePerDay: 85,
    imageUrl: CAR_IMG.crossover,
    galleryUrls: [CAR_IMG.crossover, CAR_IMG.compactSuv],
    features: [
      "Air conditioning",
      "Automatic",
      "English-speaking driver",
      "GPS navigation",
      "Unlimited mileage",
      "Bottled water",
    ],
    description:
      "Based in Luxor and sized for the West Bank's rougher tracks. The standard vehicle for Valley of the Kings mornings, Dendera and Abydos day trips, and the road down to Aswan.",
  },
  {
    region: "sinai-red-sea",
    slug: "toyota-hiace-minibus-sinai",
    name: "Toyota Hiace — 12-Seat Minibus",
    brand: "Toyota",
    model: "Hiace",
    year: 2022,
    type: "Minivan",
    seats: 12,
    transmission: "Manual",
    fuelType: "Diesel",
    pricePerDay: 125,
    imageUrl: CAR_IMG.coach,
    galleryUrls: [CAR_IMG.coach, CAR_IMG.coachNight],
    features: [
      "Air conditioning",
      "English-speaking driver",
      "Bottled water",
      "Child seat available",
      "Unlimited mileage",
    ],
    description:
      "The workhorse of Sinai: dive groups to Ras Mohammed, the night run to Saint Catherine, and Dahab transfers. Roof rack for tanks and boards on request.",
  },
  {
    region: "north-coast",
    slug: "coach-45-seat-north-coast",
    name: "45-Seat Touring Coach",
    brand: "Mercedes-Benz",
    model: "Travego",
    year: 2021,
    type: "Coach",
    seats: 45,
    transmission: "Automatic",
    fuelType: "Diesel",
    pricePerDay: 340,
    imageUrl: CAR_IMG.coachNight,
    galleryUrls: [CAR_IMG.coachNight, CAR_IMG.coach],
    features: [
      "Air conditioning",
      "English-speaking driver",
      "Bottled water",
      "Unlimited mileage",
    ],
    description:
      "Full-size coach for groups moving between Cairo, Alexandria and the North Coast. Reclining seats, PA system for your guide, and a licensed long-distance driver.",
  },
]

// ----------------------------------------------------------------- reviews

const REVIEWS = [
  {
    tourSlug: "pyramids-and-old-cairo-3-days",
    author: "Sarah Whitfield",
    email: "sarah.whitfield@example.com",
    rating: 5,
    comment:
      "Our guide Mahmoud was an actual Egyptologist and it showed — he read hieroglyphs off the walls for us. Being at the pyramids at 7am before the crowds was worth the early alarm.",
  },
  {
    tourSlug: "pyramids-and-old-cairo-3-days",
    author: "David Chen",
    email: "david.chen@example.com",
    rating: 5,
    comment:
      "Everything ran to the minute and nothing felt rushed. The Grand Egyptian Museum alone justified the trip. One point of contact for the whole three days made it painless.",
  },
  {
    tourSlug: "nile-cruise-luxor-to-aswan-4-days",
    author: "Emma Lindqvist",
    email: "emma.lindqvist@example.com",
    rating: 5,
    comment:
      "Four days of temples with the boat doing the travelling for you. Kom Ombo at sunset was the highlight of two weeks in Egypt.",
  },
  {
    tourSlug: "sharm-el-sheikh-diving-week-6-days",
    author: "Marco Rossi",
    email: "marco.rossi@example.com",
    rating: 4,
    comment:
      "Thistlegorm was everything I hoped for. Boat was well run and the guides were careful about air and depth. Only note: bring your own regulator if you are fussy.",
  },
  {
    tourSlug: "dahab-and-mount-sinai-4-days",
    author: "Aisha Rahman",
    email: "aisha.rahman@example.com",
    rating: 5,
    comment:
      "The night climb is hard and completely worth it. Watching the sun come up over Sinai with tea from a Bedouin stall is something I'll remember for a long time.",
  },
]

// -------------------------------------------------------------------- run

async function main() {
  console.log("→ Seeding Egypt Journeys…")

  // Regions
  const regionIds = new Map<string, string>()
  for (const region of REGIONS) {
    const saved = await prisma.region.upsert({
      where: { slug: region.slug },
      update: region,
      create: region,
    })
    regionIds.set(region.slug, saved.id)
  }
  console.log(`  ✓ ${REGIONS.length} regions`)

  // Tours
  const tourIds = new Map<string, string>()
  for (const { region, itinerary, ...tour } of TOURS) {
    const regionId = regionIds.get(region)
    if (!regionId) throw new Error(`Unknown region ${region}`)
    const data = {
      ...tour,
      itinerary: itinerary as unknown as Prisma.InputJsonValue,
      regionId,
    }
    const saved = await prisma.tour.upsert({
      where: { slug: tour.slug },
      update: data,
      create: data,
    })
    tourIds.set(tour.slug, saved.id)
  }
  console.log(`  ✓ ${TOURS.length} tours`)

  // Hotels
  for (const { region, roomTypes, ...hotel } of HOTELS) {
    const regionId = regionIds.get(region)!
    const data = {
      ...hotel,
      roomTypes: roomTypes as unknown as Prisma.InputJsonValue,
      regionId,
    }
    await prisma.hotel.upsert({
      where: { slug: hotel.slug },
      update: data,
      create: data,
    })
  }
  console.log(`  ✓ ${HOTELS.length} hotels`)

  // Cars
  for (const { region, ...car } of CARS) {
    const data = { ...car, regionId: regionIds.get(region)! }
    await prisma.car.upsert({
      where: { slug: car.slug },
      update: data,
      create: data,
    })
  }
  console.log(`  ✓ ${CARS.length} cars`)

  // Admin + demo customer
  const adminEmail = (process.env.SEED_ADMIN_EMAIL || "admin@egyptjourneys.com").toLowerCase()
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "Admin123!"
  const adminHash = await bcrypt.hash(adminPassword, 12)

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: "ADMIN", passwordHash: adminHash },
    create: {
      email: adminEmail,
      name: "Egypt Journeys Admin",
      role: "ADMIN",
      passwordHash: adminHash,
    },
  })

  const demo = await prisma.user.upsert({
    where: { email: "traveller@example.com" },
    update: {},
    create: {
      email: "traveller@example.com",
      name: "Demo Traveller",
      role: "CUSTOMER",
      phone: "+1 555 0100",
      nationality: "United States",
      languages: ["English"],
      passwordHash: await bcrypt.hash("Traveller123!", 12),
    },
  })
  console.log(`  ✓ admin (${adminEmail}) + demo customer`)

  // Reviews — each from its own reviewer account.
  for (const review of REVIEWS) {
    const tourId = tourIds.get(review.tourSlug)
    if (!tourId) continue
    const reviewer = await prisma.user.upsert({
      where: { email: review.email },
      update: {},
      create: { email: review.email, name: review.author, role: "CUSTOMER" },
    })
    const existing = await prisma.review.findFirst({
      where: { tourId, userId: reviewer.id },
    })
    if (existing) continue
    await prisma.review.create({
      data: {
        tourId,
        userId: reviewer.id,
        rating: review.rating,
        comment: review.comment,
        approved: true,
      },
    })
  }
  console.log(`  ✓ ${REVIEWS.length} reviews`)

  // A sample booking so the admin dashboard is not empty on first run.
  const sampleTourId = tourIds.get("pyramids-and-old-cairo-3-days")!
  const existingBooking = await prisma.booking.findUnique({
    where: { reference: "EJ-DEMO01" },
  })
  if (!existingBooking) {
    const checkIn = new Date()
    checkIn.setDate(checkIn.getDate() + 21)
    const checkOut = new Date(checkIn)
    checkOut.setDate(checkOut.getDate() + 3)

    await prisma.booking.create({
      data: {
        reference: "EJ-DEMO01",
        userId: demo.id,
        bookingType: "TOUR",
        tourId: sampleTourId,
        checkIn,
        checkOut,
        guests: 2,
        totalPrice: 520,
        status: "CONFIRMED",
        paymentStatus: "PAID",
        paymentId: "DEMO-PAYMENT",
        contactName: "Demo Traveller",
        contactEmail: "traveller@example.com",
        contactPhone: "+1 555 0100",
        nationality: "United States",
        specialRequests: "Vegetarian meals, please.",
      },
    })
    console.log("  ✓ demo booking EJ-DEMO01")
  }

  await seedGuides(demo.id)

  // Site settings singleton
  // Historic sites catalog — `update: {}` keeps edits made in the admin.
  for (const { regionSlug, ...site } of STARTER_SITES) {
    const regionId = regionIds.get(regionSlug)
    if (!regionId) continue
    await prisma.historicSite.upsert({
      where: { slug: site.slug },
      update: {},
      create: { ...site, regionId },
    })
  }
  console.log(`  ✓ ${STARTER_SITES.length} historic sites`)

  await prisma.siteSetting.upsert({
    where: { id: "site" },
    update: {},
    create: { id: "site", catalogSeededAt: new Date() },
  })
  // The catalog is loaded now, so the server's one-time load has nothing to do.
  await prisma.siteSetting.updateMany({
    where: { id: "site", catalogSeededAt: null },
    data: { catalogSeededAt: new Date() },
  })
  console.log("  ✓ site settings")

  console.log("\nDone. Sign in at /admin/login with:")
  console.log(`  ${adminEmail} / ${adminPassword}\n`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

// ---------------------------------------------------------------------------
// Tour guides — the three kinds of guide from the static site, as demo
// profiles, plus one application waiting for approval.
// ---------------------------------------------------------------------------

const GUIDES = [
  {
    email: "guide.amira@example.com",
    name: "Amira Hassan",
    slug: "amira-hassan",
    guideType: "Egyptologist",
    regions: ["cairo-giza", "luxor-aswan"],
    bio: "Licensed guide with a university degree in Egyptology. I bring the pyramids, temples and tombs to life: who built them, how, and why. I trained at Cairo University and have guided at Giza, Saqqara and Luxor for nine years.",
    specialties: [
      "Pyramids of Giza & Saqqara",
      "Egyptian Museum & Grand Egyptian Museum",
      "Karnak, Luxor Temple & the Valley of the Kings",
      "Reading hieroglyphs on site",
    ],
    languages: ["English", "Arabic", "French"],
    yearsExperience: 9,
    dayRate: 75,
    whatsapp: "+20 100 555 0101",
    licenceNumber: "MOT-EG-20417",
    status: "APPROVED" as const,
  },
  {
    email: "guide.hamdy@example.com",
    name: "Hamdy Nour",
    slug: "hamdy-nour",
    guideType: "Nubian guide",
    regions: ["luxor-aswan"],
    bio: "Born in the Nubian villages of Aswan. Expect felucca rides, a visit to a colourful Nubian home, local food and the story of the Nubian people, told by someone who grew up there.",
    specialties: [
      "Philae Temple & Abu Simbel",
      "Nubian villages & culture",
      "Felucca trips on the Nile",
      "Aswan's islands & markets",
    ],
    languages: ["English", "Arabic", "Nubian"],
    yearsExperience: 12,
    dayRate: 55,
    whatsapp: "+20 100 555 0102",
    licenceNumber: "MOT-EG-18852",
    status: "APPROVED" as const,
  },
  {
    email: "guide.salem@example.com",
    name: "Salem Abu Mousa",
    slug: "salem-abu-mousa",
    guideType: "Bedouin guide",
    regions: ["sinai-red-sea"],
    bio: "From the Jebeleya Bedouin of South Sinai. I know the mountains and desert around St. Catherine better than anyone, and a Bedouin guide is required for treks there. I cook a very good dinner under the stars.",
    specialties: [
      "Mount Sinai sunrise climb",
      "Multi-day mountain treks",
      "Jeep & camel desert trips",
      "Bedouin dinner under the stars",
    ],
    languages: ["English", "Arabic"],
    yearsExperience: 15,
    dayRate: null,
    whatsapp: "+20 100 555 0103",
    licenceNumber: null,
    status: "APPROVED" as const,
  },
  {
    email: "guide.youssef@example.com",
    name: "Youssef Adel",
    slug: "youssef-adel",
    guideType: "Local guide",
    regions: ["north-coast"],
    bio: "Alexandria-born guide for El Alamein and the North Coast: the war cemeteries and museum, Marsa Matrouh's bays and the best fish in Sidi Abdel Rahman.",
    specialties: ["El Alamein battlefields & museum", "Marsa Matrouh beaches"],
    languages: ["English", "Arabic", "German"],
    yearsExperience: 4,
    dayRate: 45,
    whatsapp: "+20 100 555 0104",
    licenceNumber: null,
    status: "PENDING" as const,
  },
]

async function seedGuides(demoTravellerId: string) {
  const passwordHash = await bcrypt.hash("Guide123!", 12)
  const regions = await prisma.region.findMany({ select: { id: true, slug: true } })
  const regionId = new Map(regions.map((r) => [r.slug, r.id]))
  const ids = new Map<string, string>()

  for (const g of GUIDES) {
    const user = await prisma.user.upsert({
      where: { email: g.email },
      update: {},
      create: {
        email: g.email,
        name: g.name,
        role: "GUIDE",
        phone: g.whatsapp,
        languages: g.languages,
        passwordHash,
      },
    })
    const connect = g.regions.map((slug) => ({ id: regionId.get(slug)! })).filter((r) => r.id)
    const profile = await prisma.guideProfile.upsert({
      where: { slug: g.slug },
      update: {},
      create: {
        userId: user.id,
        slug: g.slug,
        displayName: g.name,
        guideType: g.guideType,
        bio: g.bio,
        specialties: g.specialties,
        languages: g.languages,
        yearsExperience: g.yearsExperience,
        dayRate: g.dayRate,
        whatsapp: g.whatsapp,
        licenceNumber: g.licenceNumber,
        status: g.status,
        regions: { connect },
      },
    })
    ids.set(g.slug, profile.id)
  }
  console.log(`  ✓ ${GUIDES.length} guides (password Guide123!)`)

  // Past trips, relative to today so the demo never goes stale.
  const today = todayInEgypt()
  const reviewer = await prisma.user.upsert({
    where: { email: "claire.martin@example.com" },
    update: {},
    create: {
      email: "claire.martin@example.com",
      name: "Claire Martin",
      role: "CUSTOMER",
      phone: "+33 6 12 34 56 78",
      nationality: "France",
      languages: ["French", "English"],
      passwordHash: await bcrypt.hash("Traveller123!", 12),
    },
  })

  const trips = [
    {
      reference: "GR-DEMO01",
      guide: "amira-hassan",
      touristId: reviewer.id,
      start: addDays(today, -60),
      end: addDays(today, -58),
      review: {
        rating: 5,
        comment: "Amira read the hieroglyphs at Saqqara as if they were a newspaper. Three days, and my teenagers asked questions the whole time.",
      },
    },
    {
      reference: "GR-DEMO02",
      guide: "hamdy-nour",
      touristId: reviewer.id,
      start: addDays(today, -45),
      end: addDays(today, -45),
      review: {
        rating: 5,
        comment: "Lunch in his aunt's house on Elephantine Island was the best meal of our trip. Warm, funny and full of stories.",
      },
    },
    // The demo traveller's finished trip, left unreviewed so the review form shows.
    { reference: "GR-DEMO03", guide: "hamdy-nour", touristId: demoTravellerId, start: addDays(today, -20), end: addDays(today, -19), review: null },
  ]

  for (const t of trips) {
    const guideId = ids.get(t.guide)
    if (!guideId) continue
    const request = await prisma.guideRequest.upsert({
      where: { reference: t.reference },
      update: {},
      create: {
        reference: t.reference,
        guideId,
        touristId: t.touristId,
        startDate: fromISODate(t.start),
        endDate: fromISODate(t.end),
        groupSize: 2,
        message: "Private day with plenty of time at each site, please.",
        status: "ACCEPTED",
        respondedAt: fromISODate(addDays(t.start, -10)),
      },
    })
    if (t.review) {
      await prisma.guideReview.upsert({
        where: { requestId: request.id },
        update: {},
        create: { guideId, touristId: t.touristId, requestId: request.id, ...t.review },
      })
    }
  }
  console.log("  ✓ demo guide trips and reviews")
}
