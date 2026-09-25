/**
 * Rule-based travel assistant. Runs entirely in the browser — no API, no
 * cost, works offline. It answers from two sources:
 *
 *   1. KNOWLEDGE below — Egyptian history and practical travel questions.
 *   2. The data files (hotels, transport, destinations), so prices it quotes
 *      always match the rest of the site.
 *
 * To teach it something new, add an entry to KNOWLEDGE: a list of keywords
 * and the answer to give when a question mentions them.
 */
import { DESTINATIONS, type AreaSlug } from "@/data/destinations"
import { GUIDES } from "@/data/guides"
import { HOTELS, type Hotel } from "@/data/hotels"
import { SITE } from "@/data/site"
import { SITES, type HistoricSite } from "@/data/sites"
import { VEHICLES } from "@/data/transport"
import { formatUSD } from "@/lib/utils"

export type BotLink = { label: string; href: string }

export type BotReply = {
  text: string
  links?: BotLink[]
  suggestions?: string[]
}

type Entry = {
  /** Words or phrases that point to this answer. Single words also match plurals ("pyramid" → "pyramids"). */
  keywords: string[]
  reply: BotReply | ((text: string) => BotReply)
}

/** Dispatch this window event (see AskAssistantButton) to open the chat. */
export const OPEN_CHAT_EVENT = "open-chat"

export const STARTER_SUGGESTIONS = [
  "Tell me about the pyramids",
  "Plan a 7-day trip",
  "Hotels under $50",
  "Which car for 6 people?",
  "Best time to visit?",
  "How do I book?",
]

export const WELCOME: BotReply = {
  text: `Hi! I'm the ${SITE.name} assistant. Ask me about Egyptian history, where to go, hotels, transport or how to book.`,
  suggestions: STARTER_SUGGESTIONS,
}

// ─── Text helpers ────────────────────────────────────────────────────────

export function normalize(input: string): string {
  return input
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9$\s-]/g, " ")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function titleCase(text: string): string {
  return text.replace(/\b\w/g, (c) => c.toUpperCase())
}

function tokens(text: string): string[] {
  return text.split(" ").filter(Boolean)
}

/** Does `keyword` appear in the (normalized) text? Phrases must appear whole. */
function matches(text: string, words: string[], keyword: string): boolean {
  const kw = normalize(keyword)
  if (kw.includes(" ")) return ` ${text} `.includes(` ${kw} `)
  return words.some(
    (word) =>
      word === kw ||
      // plurals and simple endings: pyramid → pyramids, dive → diving
      (kw.length >= 4 && word.startsWith(kw) && word.length - kw.length <= 3)
  )
}

function hasAny(text: string, keywords: string[]): boolean {
  const words = tokens(text)
  return keywords.some((kw) => matches(text, words, kw))
}

function score(text: string, keywords: string[]): number {
  const words = tokens(text)
  return keywords.reduce((total, kw) => {
    if (!matches(text, words, kw)) return total
    // Phrases are more specific than single words, so they weigh more.
    return total + normalize(kw).split(" ").length * 2 - 1
  }, 0)
}

// ─── Areas and cities ────────────────────────────────────────────────────

const AREA_ALIASES: Record<AreaSlug, string[]> = {
  "cairo-giza": ["cairo", "giza"],
  "luxor-aswan": ["luxor", "aswan", "upper egypt"],
  "north-coast": ["north coast", "alamein", "sahel", "marassi", "mediterranean"],
  sinai: ["sinai", "dahab", "sharm", "catherine", "red sea"],
}

const CITY_ALIASES: Record<string, string[]> = {
  Dahab: ["dahab"],
  "Sharm El Sheikh": ["sharm"],
  "St. Catherine": ["catherine"],
  Luxor: ["luxor"],
  Aswan: ["aswan"],
}

function detectArea(text: string): AreaSlug | undefined {
  return (Object.keys(AREA_ALIASES) as AreaSlug[]).find((slug) =>
    hasAny(text, AREA_ALIASES[slug])
  )
}

function detectCity(text: string): string | undefined {
  return Object.keys(CITY_ALIASES).find((city) => hasAny(text, CITY_ALIASES[city]))
}

function areaName(slug: AreaSlug): string {
  return DESTINATIONS.find((d) => d.slug === slug)?.name ?? slug
}

// ─── Replies built from the data files ───────────────────────────────────

function hotelLine(hotel: Hotel): string {
  return `• ${hotel.name} (${hotel.city}, ${hotel.stars}★) — about ${formatUSD(hotel.pricePerNight)}/night`
}

const HOTELS_LINK: BotLink = { label: "See all hotels", href: "/hotels/" }
const TRANSPORT_LINK: BotLink = { label: "Transport & prices", href: "/transport/" }
const GUIDES_LINK: BotLink = { label: "Our tour guides", href: "/guides/" }
const CONTACT_LINK: BotLink = { label: "Contact us", href: "/contact/" }

function hotelsFor(text: string): BotReply {
  const city = detectCity(text)
  const area = detectArea(text)
  const list = city
    ? HOTELS.filter((h) => h.city === city)
    : area
      ? HOTELS.filter((h) => h.area === area)
      : HOTELS
  const where = city ?? (area ? areaName(area) : "Egypt")

  return {
    text: `Our hotel picks in ${where}:\n${list.map(hotelLine).join("\n")}\n\nPrices are approximate per room per night. Tap "Request on WhatsApp" on any hotel to check your dates.`,
    links: [HOTELS_LINK],
    suggestions: ["Hotels under $50", "Luxury hotels", "Which car for 4 people?"],
  }
}

function hotelsUnder(budget: number, text: string): BotReply {
  const area = detectArea(text)
  const city = detectCity(text)
  const pool = HOTELS.filter((h) =>
    city ? h.city === city : area ? h.area === area : true
  )
  const fits = pool
    .filter((h) => h.pricePerNight <= budget)
    .sort((a, b) => a.pricePerNight - b.pricePerNight)

  if (fits.length === 0) {
    const cheapest = [...pool].sort((a, b) => a.pricePerNight - b.pricePerNight)[0]
    return {
      text: `Nothing in our list is under ${formatUSD(budget)} a night there. The best value is:\n${hotelLine(cheapest)}\n\nMessage us on WhatsApp and we'll look for something closer to your budget.`,
      links: [HOTELS_LINK, CONTACT_LINK],
    }
  }

  return {
    text: `Hotels at or under ${formatUSD(budget)}/night:\n${fits.map(hotelLine).join("\n")}`,
    links: [HOTELS_LINK],
    suggestions: ["Tell me about Dahab", "Mount Sinai climb", "How do I book?"],
  }
}

function priceOf(id: string): string {
  const price = VEHICLES.find((v) => v.id === id)?.pricePerDay
  return price == null ? "price on request" : `${formatUSD(price)}/day`
}

function vehicleFor(people: number): BotReply {
  let text: string
  if (people <= 2) {
    text = `For ${people} ${people === 1 ? "person" : "people"} the Economy sedan (Hyundai Elantra, ${priceOf("economy-sedan")}) is perfect. Want more comfort? The Premium Mercedes is ${priceOf("premium-sedan")}.`
  } else if (people <= 4) {
    text = `For ${people} people take the SUV (Nissan X-Trail, ${priceOf("suv")}) — more room for luggage. On a tight budget the Economy sedan (${priceOf("economy-sedan")}) also fits 4.`
  } else if (people <= 7) {
    text = `For ${people} people the VIP minivan (Mercedes Vito, ${priceOf("vip-minivan")}) is the right choice — it seats up to 7.`
  } else if (people <= 14) {
    text = `For ${people} people you can book two VIP minivans (${priceOf("vip-minivan")} each), or charter the 49-seat Superjet bus — ask us on WhatsApp for a bus quote.`
  } else {
    text = `For a group of ${people}, charter the 49-seat Superjet bus. The price depends on your route and dates, so send us the details on WhatsApp for a quote.`
  }
  return {
    text: `${text}\n\nEvery vehicle comes with a driver and air conditioning.`,
    links: [TRANSPORT_LINK],
    suggestions: ["How do I book?", "Hotels in Cairo", "Plan a 7-day trip"],
  }
}

function transportOverview(): BotReply {
  const lines = VEHICLES.map(
    (v) =>
      `• ${v.name} (${v.model}, up to ${v.seats}) — ${v.pricePerDay == null ? "price on request" : `${formatUSD(v.pricePerDay)}/day`}`
  )
  return {
    text: `All our vehicles come with a driver:\n${lines.join("\n")}\n\nTell me how many people are travelling and I'll suggest one.`,
    links: [TRANSPORT_LINK],
    suggestions: ["Which car for 6 people?", "Group of 30 people"],
  }
}

function guidesOverview(): BotReply {
  const lines = GUIDES.map((g) => `• ${g.title} — ${g.coverage}`)
  return {
    text: `We work with three kinds of local guide:\n${lines.join("\n")}\n\nGuide fees depend on the day's programme — send us your plan on WhatsApp for a price.`,
    links: [GUIDES_LINK],
    suggestions: ["What does an Egyptologist do?", "Mount Sinai climb", "Nubian villages"],
  }
}

function destinationReply(slug: AreaSlug): BotReply {
  const d = DESTINATIONS.find((x) => x.slug === slug)!
  const highlights = d.highlights.slice(0, 4).map((h) => `• ${h.title}`)
  const spots = d.spots ? `\n\nMain spots: ${d.spots.map((s) => s.name).join(", ")}.` : ""
  return {
    text: `${d.name}: ${d.summary}\n\nTop things to do:\n${highlights.join("\n")}${spots}\n\nBest time: ${d.bestTime}`,
    links: [{ label: `Explore ${d.name}`, href: `/destinations/${d.slug}/` }],
    suggestions: [`Hotels in ${titleCase(AREA_ALIASES[slug][0])}`, "Best time to visit?", "Plan a 7-day trip"],
  }
}

function itinerary(days: number): BotReply {
  let plan: string
  if (days <= 4) {
    plan = `With ${days} days, focus on Cairo & Giza:\n• Day 1: Pyramids of Giza & the Sphinx\n• Day 2: Grand Egyptian Museum, then a Nile felucca at sunset\n• Day 3: Saqqara & Memphis, or Islamic Cairo and Khan el-Khalili${days === 4 ? "\n• Day 4: Egyptian Museum (Tahrir) and Coptic Cairo" : ""}`
  } else if (days <= 8) {
    plan = `A classic ${days}-day trip:\n• Days 1–3: Cairo & Giza — pyramids, museums, old Cairo\n• Day 4: Fly or take the sleeper train to Luxor — Karnak & Luxor Temple\n• Day 5: West Bank — Valley of the Kings & Hatshepsut's temple\n• Day 6: Drive to Aswan via Edfu & Kom Ombo — or join a Nile cruise\n• Day 7: Abu Simbel early, Philae in the afternoon${days === 8 ? "\n• Day 8: Nubian village & felucca, then fly back to Cairo" : ""}`
  } else {
    plan = `A full ${days}-day Egypt trip:\n• Days 1–3: Cairo & Giza\n• Days 4–8: Luxor & Aswan (a 3–4 night Nile cruise fits here)\n• Days 9–10: St. Catherine — Mount Sinai at sunrise\n• Days 11+: Relax in Dahab or Sharm El Sheikh on the Red Sea\n\nIn summer (June–September) swap Sinai for the North Coast beaches.`
  }
  return {
    text: `${plan}\n\nWe can arrange the guides, hotels and driver for every day — send us your dates on WhatsApp.`,
    links: [{ label: "Plan it with us", href: "/contact/" }],
    suggestions: ["Hotels in Luxor", "Which car for 4 people?", "Best time to visit?"],
  }
}

/** The catalog page that best matches the question, if any. */
function matchSite(text: string): HistoricSite | undefined {
  let best: HistoricSite | undefined
  let bestScore = 0
  for (const site of SITES) {
    const s = score(text, [site.name, ...site.keywords])
    if (s > bestScore) {
      best = site
      bestScore = s
    }
  }
  return best
}

/** Adds a "Read the history" link to the matching catalog page. */
function withSiteLink(reply: BotReply, site: HistoricSite | undefined): BotReply {
  if (!site) return reply
  const href = `/sites/${site.slug}/`
  if (reply.links?.some((l) => l.href === href)) return reply
  return { ...reply, links: [{ label: `History of ${site.name}`, href }, ...(reply.links ?? [])] }
}

// ─── Knowledge base ──────────────────────────────────────────────────────

const KNOWLEDGE: Entry[] = [
  // History
  {
    keywords: ["pyramid", "khufu", "cheops", "khafre", "menkaure", "great pyramid"],
    reply: {
      text: "The three pyramids of Giza were built for the pharaohs Khufu, Khafre and Menkaure around 2600–2500 BC. The Great Pyramid of Khufu was about 146 m tall and remained the tallest human-made structure for roughly 3,800 years. It holds around 2.3 million stone blocks.\n\nThey weren't built by slaves: archaeologists found the villages, bakeries and tombs of paid workers who built them.\n\nTip: arrive at opening time, and consider going inside one of the smaller pyramids — it's usually quieter.",
      links: [{ label: "Cairo & Giza", href: "/destinations/cairo-giza/" }],
      suggestions: ["Tell me about the Sphinx", "The Step Pyramid", "Grand Egyptian Museum"],
    },
  },
  {
    keywords: ["sphinx"],
    reply: {
      text: "The Great Sphinx of Giza was carved straight out of the limestone bedrock, most likely for the pharaoh Khafre (around 2500 BC). It is about 73 m long and 20 m high — a lion's body with a king's head, guarding the way to Khafre's pyramid.\n\nIts nose was already missing centuries ago; it wasn't shot off by Napoleon's soldiers, despite the popular story.",
      suggestions: ["Tell me about the pyramids", "Who was Ramses II?"],
    },
  },
  {
    keywords: ["step pyramid", "saqqara", "djoser", "zoser", "imhotep", "memphis"],
    reply: {
      text: "Djoser's Step Pyramid at Saqqara (around 2670 BC) is the oldest of Egypt's pyramids and one of the first large buildings made of cut stone. It was designed by Imhotep, the king's architect, who was later worshipped as a god of wisdom and medicine.\n\nNearby Memphis was the capital of the Old Kingdom. Saqqara and Memphis make an easy half-day from Giza.",
      links: [{ label: "Cairo & Giza", href: "/destinations/cairo-giza/" }],
    },
  },
  {
    keywords: ["tutankhamun", "tutankhamen", "king tut", "tut", "boy king", "howard carter"],
    reply: {
      text: "Tutankhamun became pharaoh at about nine years old and died around 18–19, roughly 1323 BC. He was a minor king — he's famous because his tomb (KV62 in the Valley of the Kings) was found almost untouched by Howard Carter in 1922, with more than 5,000 objects including the solid-gold funerary mask.\n\nHis tomb can be visited in Luxor (extra ticket), and his treasures are displayed at the Grand Egyptian Museum in Giza.",
      suggestions: ["Valley of the Kings", "Grand Egyptian Museum", "How were mummies made?"],
    },
  },
  {
    keywords: ["ramses", "rameses", "ramesses", "kadesh"],
    reply: {
      text: "Ramses II (reigned about 1279–1213 BC) ruled for 66 years and is often called Egypt's greatest pharaoh. He fought the Hittites at the Battle of Kadesh and later signed one of the first known peace treaties with them.\n\nHe built more than any other pharaoh: Abu Simbel, the Ramesseum in Luxor and major additions to Karnak and Luxor Temple. A colossal statue of him greets visitors at the Grand Egyptian Museum.",
      suggestions: ["Abu Simbel", "Karnak Temple", "Who was Hatshepsut?"],
    },
  },
  {
    keywords: ["cleopatra", "ptolemy", "ptolemaic", "mark antony"],
    reply: {
      text: "Cleopatra VII (69–30 BC) was the last active ruler of the Ptolemaic dynasty — a Greek-Macedonian family that ruled Egypt after Alexander the Great. She was the first of her line to learn Egyptian. Her alliances with Julius Caesar and Mark Antony ended with defeat by Octavian, and Egypt became a Roman province.\n\nFun fact: Cleopatra lived closer in time to the Moon landing than to the building of the Great Pyramid.",
      suggestions: ["Alexandria's history", "Timeline of ancient Egypt"],
    },
  },
  {
    keywords: ["hatshepsut", "deir el bahari", "deir el bahri", "punt"],
    reply: {
      text: "Hatshepsut ruled about 1479–1458 BC and was one of Egypt's most successful pharaohs — a woman who took the full royal titles and is often shown with a false beard. Her reign was peaceful and rich; she sent a famous trade expedition to the land of Punt.\n\nHer terraced mortuary temple at Deir el-Bahari, on Luxor's West Bank, is one of the most striking buildings in Egypt.",
      links: [{ label: "Luxor & Aswan", href: "/destinations/luxor-aswan/" }],
    },
  },
  {
    keywords: ["akhenaten", "nefertiti", "amarna", "aten"],
    reply: {
      text: "Akhenaten (about 1353–1336 BC) tried to replace Egypt's many gods with the worship of one — the Aten, the sun disc — and built a new capital at Amarna. His queen was Nefertiti, famous for her painted bust in Berlin. After his death the old gods returned, and his son, probably Tutankhamun, moved the court back.",
      suggestions: ["Who was Tutankhamun?", "Egyptian gods"],
    },
  },
  {
    keywords: ["karnak", "luxor temple", "avenue of sphinxes", "hypostyle", "amun"],
    reply: {
      text: "Karnak is a vast temple complex dedicated to the god Amun-Ra, added to by pharaohs for about 2,000 years. Its Great Hypostyle Hall has 134 giant columns.\n\nLuxor Temple, built mainly by Amenhotep III and Ramses II, is 3 km away — the two are joined by the Avenue of Sphinxes, reopened in 2021. Visit Luxor Temple after dark, when it's lit up.",
      links: [{ label: "Luxor & Aswan", href: "/destinations/luxor-aswan/" }],
      suggestions: ["Valley of the Kings", "Who was Hatshepsut?"],
    },
  },
  {
    keywords: ["valley of the kings", "royal tomb", "tomb", "west bank", "seti", "nefertari"],
    reply: {
      text: "The Valley of the Kings, on Luxor's West Bank, was the burial ground of New Kingdom pharaohs (about 1550–1070 BC). More than 60 tombs have been found, their walls painted with texts to guide the king through the underworld.\n\nA standard ticket covers a set number of tombs; famous ones such as Tutankhamun's and Seti I's need extra tickets. An Egyptologist guide makes a huge difference here.",
      links: [GUIDES_LINK],
      suggestions: ["Who was Tutankhamun?", "Temple of Hatshepsut"],
    },
  },
  {
    keywords: ["abu simbel", "sun festival"],
    reply: {
      text: "Abu Simbel's two rock-cut temples were built by Ramses II, with four 20 m statues of the king at the entrance. When the Aswan High Dam was built, UNESCO moved the whole site block by block to higher ground (1964–1968).\n\nTwice a year, around 22 February and 22 October, sunlight reaches the statues in the innermost sanctuary. It's about 3.5 hours' drive south of Aswan, so most visitors leave before dawn.",
      links: [TRANSPORT_LINK],
      suggestions: ["Philae Temple", "Who was Ramses II?"],
    },
  },
  {
    keywords: ["balloon", "hot air"],
    reply: {
      text: "A sunrise hot-air balloon flight over Luxor's West Bank is one of the most memorable things to do in Egypt — you float over the Valley of the Kings, Hatshepsut's temple and the green fields along the Nile. Flights leave around dawn and depend on the wind, so plan it early in your stay in case it's postponed.",
      links: [{ label: "Luxor & Aswan", href: "/destinations/luxor-aswan/" }],
    },
  },
  {
    keywords: ["philae", "isis temple", "temple of isis"],
    reply: {
      text: "Philae is the island temple of the goddess Isis near Aswan. Flooded by the first Aswan dam, it was taken apart and rebuilt on nearby Agilkia Island in the 1970s. The last known hieroglyphic inscription, from AD 394, was carved here. You reach it by a short boat ride.",
      suggestions: ["Nubian villages", "Abu Simbel"],
    },
  },
  {
    keywords: ["hieroglyph", "rosetta", "champollion", "writing", "scribe"],
    reply: {
      text: "Hieroglyphs mix sound signs and picture signs — about 700–1,000 symbols were in common use. The key to reading them was the Rosetta Stone (196 BC), which carries the same decree in hieroglyphs, Demotic and Greek. Jean-François Champollion cracked the code in 1822. The Stone itself is in the British Museum in London.",
      suggestions: ["Egyptian gods", "How were mummies made?"],
    },
  },
  {
    keywords: ["mummy", "mummies", "mummification", "embalm", "canopic", "afterlife"],
    reply: {
      text: "Mummification took about 70 days. Embalmers removed the brain and most organs (the heart was left in, to be weighed in the afterlife), dried the body with natron salt for around 40 days, then wrapped it in linen with protective amulets. The organs were stored in canopic jars.\n\nYou can see royal mummies at the National Museum of Egyptian Civilization in Cairo.",
      suggestions: ["Egyptian gods", "Who was Tutankhamun?"],
    },
  },
  {
    keywords: ["god", "gods", "goddess", "osiris", "anubis", "horus", "thoth", "religion"],
    reply: {
      text: "Some of the main Egyptian gods:\n• Ra — the sun god\n• Amun — king of the gods, worshipped at Karnak\n• Osiris — god of the afterlife\n• Isis — goddess of magic and motherhood\n• Horus — falcon god of the sky and kingship\n• Anubis — jackal god of embalming\n• Thoth — ibis god of wisdom and writing",
      suggestions: ["How were mummies made?", "Philae Temple"],
    },
  },
  {
    keywords: ["timeline", "history of egypt", "dynasty", "dynasties", "old kingdom", "new kingdom", "middle kingdom", "ancient egypt"],
    reply: {
      text: "Ancient Egypt in brief:\n• c. 3100 BC — Upper and Lower Egypt unified\n• c. 2686–2181 BC — Old Kingdom: the age of the pyramids\n• c. 2055–1650 BC — Middle Kingdom\n• c. 1550–1070 BC — New Kingdom: Luxor, the Valley of the Kings, Ramses II\n• 332 BC — Alexander the Great; the Ptolemies rule\n• 30 BC — Cleopatra dies; Egypt becomes Roman\n• AD 641 — Arab conquest\n• AD 969 — the Fatimids found Cairo",
      suggestions: ["Tell me about the pyramids", "Who was Cleopatra?"],
    },
  },
  {
    keywords: ["grand egyptian museum", "gem", "egyptian museum", "museum", "tahrir", "nmec"],
    reply: {
      text: "Cairo has three essential museums:\n• Grand Egyptian Museum — next to the Giza pyramids, home to Tutankhamun's treasures and a colossal Ramses II\n• Egyptian Museum (Tahrir) — the historic 1902 museum, crammed with statues, coffins and jewellery\n• National Museum of Egyptian Civilization — the royal mummies\n\nAn Egyptologist guide can plan a route so you see the highlights without getting lost.",
      links: [GUIDES_LINK],
    },
  },
  {
    keywords: ["islamic cairo", "khan el khalili", "khan", "bazaar", "citadel", "saladin", "mosque", "al azhar", "coptic", "hanging church"],
    reply: {
      text: "Medieval Cairo was founded by the Fatimids in 969. Don't miss the Citadel of Saladin (1176) with the Muhammad Ali Mosque, Al-Azhar Mosque, Al-Muizz Street, and the Khan el-Khalili bazaar, trading since the 14th century.\n\nCoptic Cairo nearby has the Hanging Church and the Ben Ezra Synagogue. Dress modestly for mosques and churches.",
    },
  },
  {
    keywords: ["alexandria", "alexander", "library", "lighthouse", "pharos", "qaitbay"],
    reply: {
      text: "Alexandria was founded by Alexander the Great in 331 BC and became the capital of Ptolemaic Egypt. Its lighthouse (the Pharos) was one of the Seven Wonders, and its Library the greatest of the ancient world. Today visit the Bibliotheca Alexandrina, the Citadel of Qaitbay (built on the lighthouse site) and the Roman catacombs. It's about two hours from Cairo or the North Coast.",
      links: [{ label: "North Coast & El-Alamein", href: "/destinations/north-coast/" }],
    },
  },
  {
    keywords: ["el alamein", "alamein", "ww2", "wwii", "world war", "rommel", "montgomery", "war cemetery"],
    reply: {
      text: "El-Alamein was the scene of two decisive WWII battles in 1942. In the Second Battle (23 October – 11 November), Montgomery's Eighth Army defeated Rommel's Afrika Korps, ending the Axis advance on Egypt and the Suez Canal. Churchill later wrote: \"Before Alamein we never had a victory. After Alamein we never had a defeat.\"\n\nToday you can visit the Commonwealth, German and Italian memorials and the Military Museum.",
      links: [{ label: "North Coast & El-Alamein", href: "/destinations/north-coast/" }],
      suggestions: ["Hotels in Alamein", "Best time to visit?"],
    },
  },
  {
    keywords: ["mount sinai", "mount moses", "jebel musa", "moses", "sunrise", "climb", "hike", "trek", "hiking"],
    reply: {
      text: "Mount Sinai (Jebel Musa, 2,285 m) is where tradition says Moses received the Ten Commandments. Most people climb at night — starting around 1–2 am — to watch sunrise from the summit.\n\nThere are two routes: the gentler Camel Path (about 2.5–3 hours) and the 3,750 Steps of Repentance. A Bedouin guide is required. Bring warm layers: it's cold at the top, even in spring.",
      links: [GUIDES_LINK, { label: "Sinai", href: "/destinations/sinai/" }],
      suggestions: ["St. Catherine's Monastery", "Hotels in St. Catherine"],
    },
  },
  {
    keywords: ["monastery", "st catherine", "saint catherine", "catherine", "burning bush", "justinian"],
    reply: {
      text: "St. Catherine's Monastery was built between 548 and 565 on the orders of the Byzantine emperor Justinian, at the foot of Mount Sinai. It's one of the oldest working Christian monasteries in the world, with a remarkable library of ancient manuscripts and a bush said to descend from the Burning Bush. It's part of a UNESCO World Heritage Site. Opening hours are limited, so check before you go.",
      suggestions: ["Mount Sinai climb", "Hotels in St. Catherine"],
    },
  },
  {
    keywords: ["blue hole", "dahab", "freedive", "freediving"],
    reply: {
      text: "Dahab is a relaxed seaside town famous for shore diving. The Blue Hole is a sinkhole more than 100 m deep — its rim is fantastic for snorkelling, but deep dives there are only for trained technical divers. The Canyon, the Lighthouse and Three Pools are great for all levels, and the Lagoon is a top windsurf and kitesurf spot.",
      links: [{ label: "Sinai", href: "/destinations/sinai/" }],
      suggestions: ["Hotels in Dahab", "Mount Sinai climb"],
    },
  },
  {
    keywords: ["ras mohammed", "sharm", "tiran", "naama", "snorkel", "diving", "dive", "reef", "coral"],
    reply: {
      text: "The Red Sea off South Sinai has some of the best reefs in the world. Near Sharm El Sheikh, Ras Mohammed National Park — Egypt's first, from 1983 — and the reefs of Tiran Island are reached by day boat. Dahab offers easy shore dives. The water is warm enough to dive all year (around 22 °C in winter, 28 °C in summer).",
      links: [{ label: "Sinai", href: "/destinations/sinai/" }],
      suggestions: ["Hotels in Sharm", "Tell me about Dahab"],
    },
  },
  {
    keywords: ["nubian", "nubia", "nubians"],
    reply: {
      text: "The Nubians are the indigenous people of southern Egypt and northern Sudan, with their own languages, music and brightly painted houses. Many Nubian villages were flooded by Lake Nasser after the Aswan High Dam was built, and families were resettled. Visit Gharb Soheil or the islands near Aswan by felucca with a Nubian guide.",
      links: [GUIDES_LINK],
    },
  },
  {
    keywords: ["nile cruise", "cruise", "nile", "felucca", "dahabiya", "dahabeya"],
    reply: {
      text: "The Nile flows about 6,650 km, south to north. The classic cruise runs between Luxor and Aswan in 3–4 nights, stopping at the temples of Edfu and Kom Ombo. For something quieter, a dahabiya (a small sailing boat) takes 4–5 nights. In Cairo or Aswan, a sunset felucca ride is a must.\n\nTell us your dates and we'll suggest a cruise.",
      links: [CONTACT_LINK],
    },
  },

  // Travel practicalities
  {
    keywords: ["best time", "when to go", "when to visit", "weather", "season", "temperature", "hot", "summer", "winter", "climate"],
    reply: {
      text: "Egypt at a glance:\n• Cairo, Luxor & Aswan — best October to April. Summer is very hot (Luxor often passes 40 °C).\n• North Coast — beach season June to September.\n• Red Sea (Dahab, Sharm) — good all year; spring and autumn are ideal.\n• St. Catherine — cold nights all winter, near freezing on the summit.",
      suggestions: ["Plan a 7-day trip", "What should I wear?"],
    },
  },
  {
    keywords: ["visa", "passport"],
    reply: {
      text: "Many nationalities can get an Egyptian e-visa online before travel or a visa on arrival at the airport, but the rules depend on your passport and do change. Please check the official portal visa2egypt.gov.eg or your nearest Egyptian embassy before you book flights.",
    },
  },
  {
    keywords: ["currency", "money", "cash", "atm", "card", "pound", "egp", "exchange"],
    reply: {
      text: "The currency is the Egyptian pound (EGP). Cards are accepted in hotels, restaurants and big shops; carry cash for taxis, markets, entry to smaller sites and tips. ATMs are easy to find in cities.",
      suggestions: ["Do I need to tip?", "What should I wear?"],
    },
  },
  {
    keywords: ["ticket", "tickets", "entrance fee", "entry fee", "admission", "opening hours"],
    reply: {
      text: "Entry tickets are bought at each site, and many now take cards only. Prices and opening hours change from time to time, so check the official Ministry of Tourism and Antiquities website (egymonuments.gov.eg) for current prices. Your guide can handle tickets for you on the day.",
      links: [GUIDES_LINK],
    },
  },
  {
    keywords: ["tip", "tips", "tipping", "baksheesh", "bakshish"],
    reply: {
      text: "Tipping (baksheesh) is part of daily life in Egypt. Keep small notes for restaurant staff, drivers, guides, and people who help you at sites. For a full day with a guide or driver, a tip is customary if you're happy with the service.",
    },
  },
  {
    keywords: ["wear", "dress", "clothes", "clothing", "pack", "packing"],
    reply: {
      text: "Light, breathable clothes plus a hat, sunglasses and sunscreen. Cover shoulders and knees for mosques and churches (women also need a headscarf in mosques). Beach resorts are relaxed. Bring comfortable walking shoes and a warm layer for desert nights, winter evenings and Mount Sinai.",
    },
  },
  {
    keywords: ["safe", "safety", "dangerous", "security"],
    reply: {
      text: "The main tourist areas are well used to visitors and have a visible security presence. Take the usual precautions with valuables, agree taxi prices in advance, and check your own government's travel advice before you go. With our driver and guides you'll always have a local contact.",
    },
  },
  {
    keywords: ["language", "arabic", "english", "speak"],
    reply: {
      text: "Arabic is the official language. English is widely spoken in hotels, at tourist sites and by our guides and drivers. A few words go a long way: \"shukran\" (thank you) and \"salam alaykum\" (hello).",
    },
  },
  {
    keywords: ["water", "drink", "food", "eat", "koshari", "cuisine"],
    reply: {
      text: "Drink bottled water. Try koshari (rice, lentils, pasta and spicy tomato sauce), ful and ta'meya (Egyptian falafel), molokhia and fresh fish on the coast. Street food is great where it's busy and freshly cooked.",
    },
  },

  // The service
  {
    keywords: ["book", "booking", "reserve", "reservation", "how does it work", "order"],
    reply: {
      text: `Booking is simple:\n1. Find a hotel, vehicle or guide on the site.\n2. Tap "Request on WhatsApp" — your message is written for you.\n3. We check availability and confirm with you personally.\n\nThere are no accounts and no payments on this website.`,
      links: [CONTACT_LINK],
    },
  },
  {
    keywords: ["pay", "payment", "deposit", "refund", "cancel", "cancellation"],
    reply: {
      text: "Nothing is paid on this website. When you send a request on WhatsApp, we confirm availability and agree payment and cancellation details with you directly before anything is booked.",
      links: [CONTACT_LINK],
    },
  },
  {
    keywords: ["contact", "whatsapp", "phone", "email", "call", "talk to", "human", "agent"],
    reply: {
      text: `The fastest way to reach us is WhatsApp. We reply ${SITE.hours.toLowerCase()}.`,
      links: [CONTACT_LINK],
    },
  },
  {
    keywords: ["car", "cars", "transport", "driver", "vehicle", "transfer", "taxi", "bus", "van", "minivan", "airport"],
    reply: transportOverview,
  },
  {
    keywords: ["guide", "guides", "egyptologist", "bedouin", "tour guide"],
    reply: guidesOverview,
  },
  {
    keywords: ["luxury", "best hotel", "5 star", "five star", "honeymoon", "romantic"],
    reply: () => {
      const picks = ["marriott-mena-house", "sofitel-old-cataract", "address-marassi"]
      const hotels = HOTELS.filter((h) => picks.includes(h.id))
      return {
        text: `For a special trip:\n${hotels.map(hotelLine).join("\n")}\n\nPair the Old Cataract with a sunset felucca in Aswan, or a Nile cruise between Luxor and Aswan.`,
        links: [HOTELS_LINK],
      }
    },
  },
  {
    keywords: ["family", "families", "kids", "children", "child"],
    reply: () => ({
      text: `Family favourites:\n• Rixos Alamein or Rixos Sharm — all-inclusive with kids' clubs\n• The pyramids and the Grand Egyptian Museum hold children's attention well\n• Snorkelling in the Red Sea\n\nFor transport, the VIP minivan (Mercedes Vito, ${priceOf("vip-minivan")}) seats up to 7.`,
      links: [HOTELS_LINK, TRANSPORT_LINK],
    }),
  },
  {
    keywords: ["cheap", "budget", "backpack", "backpacker", "affordable", "cheapest"],
    reply: (text) => hotelsUnder(50, text),
  },
  {
    keywords: ["recommend", "suggest", "where should", "first time", "plan", "itinerary", "trip", "idea"],
    reply: {
      text: "Happy to help you choose! What matters most to you?\n• Ancient history → Cairo & Giza, then Luxor & Aswan\n• Beaches → North Coast (summer) or Sharm El Sheikh\n• Diving & a relaxed vibe → Dahab\n• Mountains & sunrise hikes → St. Catherine\n\nOr tell me how many days you have, e.g. \"plan a 10-day trip\".",
      suggestions: ["Plan a 7-day trip", "Plan a 12-day trip", "I love diving"],
    },
  },
]

const GREETING = /^(hi|hello|hey|hiya|salam|salaam|good (morning|afternoon|evening)|marhaba|ahlan)\b/
const THANKS = /\b(thanks|thank you|thx|shukran|cheers)\b/
const BYE = /^(bye|goodbye|see you|ciao)\b/
const HELP = /^(help|menu|what can you do|who are you|options)\b/

const HOTEL_WORDS = ["hotel", "stay", "accommodation", "resort", "room", "sleep", "lodging"]
const TRANSPORT_WORDS = ["car", "transport", "vehicle", "van", "minivan", "bus", "driver", "suv", "sedan", "transfer"]
const PEOPLE =
  /\b(\d{1,3})\s*(people|persons|person|pax|guests|travellers|travelers|adults|of us|passengers|friends)\b|\b(?:group of|we are|were|for)\s*(\d{1,3})\b/

// ─── Entry point ─────────────────────────────────────────────────────────

export function getBotReply(input: string): BotReply {
  const text = normalize(input)

  if (!text) return WELCOME
  if (HELP.test(text)) return WELCOME
  if (BYE.test(text)) return { text: "Have a wonderful trip! Message us on WhatsApp whenever you're ready to book." }
  if (THANKS.test(text) && text.split(" ").length <= 3) {
    return { text: "You're welcome! Anything else you'd like to know?", suggestions: STARTER_SUGGESTIONS.slice(0, 3) }
  }
  if (GREETING.test(text) && text.split(" ").length <= 4) return WELCOME

  const wantsHotel = hasAny(text, HOTEL_WORDS)
  const wantsTransport = hasAny(text, TRANSPORT_WORDS)

  // "Hotels under $60", "a room for 40 dollars in Dahab"
  const budget = text.match(/(?:\$\s*(\d{2,4}))|(?:(\d{2,4})\s*(?:\$|usd|dollars?))|(?:(?:under|below|less than|max|up to|budget)\s*(\d{2,4}))/)
  if (wantsHotel && budget) {
    return hotelsUnder(Number(budget[1] ?? budget[2] ?? budget[3]), text)
  }

  // "Which car for 6 people?", "we are a group of 20"
  const people = text.match(PEOPLE)
  const count = people ? Number(people[1] ?? people[3]) : 0
  if (count > 0 && !wantsHotel && (wantsTransport || /people|pax|group|of us|passengers/.test(text))) {
    return vehicleFor(count)
  }

  // "Plan a 10-day trip", "2 weeks in Egypt"
  const duration = text.match(/\b(\d{1,2})\s*(day|days|night|nights|week|weeks)\b/)
  if (duration && hasAny(text, ["plan", "trip", "itinerary", "days", "week", "weeks", "holiday", "vacation", "tour"]) && !wantsHotel) {
    const n = Number(duration[1])
    return itinerary(duration[2].startsWith("week") ? n * 7 : n)
  }

  // "Hotels in Dahab" lists that place; "luxury hotels" falls through to the
  // matching knowledge entry below.
  const hotelTheme = hasAny(text, ["luxury", "best hotel", "family", "kids", "honeymoon", "cheap", "budget"])
  if (wantsHotel && (!hotelTheme || detectArea(text))) {
    return hotelsFor(text)
  }

  // Best-matching knowledge entry.
  let best: Entry | undefined
  let bestScore = 0
  for (const entry of KNOWLEDGE) {
    const s = score(text, entry.keywords)
    if (s > bestScore) {
      best = entry
      bestScore = s
    }
  }

  // A bare place name ("tell me about Luxor") gets the destination overview,
  // unless a more specific topic matched more strongly.
  const area = detectArea(text)
  if (area && bestScore === 0) return destinationReply(area)

  const site = matchSite(text)
  if (best) return withSiteLink(typeof best.reply === "function" ? best.reply(text) : best.reply, site)

  // Sites added through the admin page are answered from the catalog itself.
  if (site) {
    return {
      text: `${site.name} (${site.period}): ${site.summary}`,
      links: [{ label: `History of ${site.name}`, href: `/sites/${site.slug}/` }],
      suggestions: ["Best time to visit?", "How do I book?"],
    }
  }

  return {
    text: "Sorry, I didn't quite catch that. I can help with Egyptian history, destinations, hotels, transport, guides and booking. Try one of these — or message us on WhatsApp and a person will answer.",
    links: [CONTACT_LINK],
    suggestions: STARTER_SUGGESTIONS,
  }
}
