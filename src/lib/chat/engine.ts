import { LANGUAGES } from "@/lib/constants"
import type { FaqGroup } from "@/lib/faq"
import { formatPrice } from "@/lib/utils"

/**
 * The chat assistant's brain. Pure and synchronous: it reads a snapshot of the
 * site's own content (FAQ, regions, tours, hotels, cars) and never calls an
 * external service, so it costs nothing to run and answers instantly.
 */

export type ListingKind = "tour" | "hotel" | "car" | "guide"

export type ChatListing = {
  kind: ListingKind
  slug: string
  title: string
  href: string
  imageUrl: string
  regionSlug: string
  regionName: string
  price: number
  currency: string
  /** "per person", "per night" or "per day". */
  unit: string
  /** One short line: "4 days · max 16", "5-star", "SUV · 7 seats". */
  detail: string
  /** Tour length in days. */
  durationDays?: number
  /** Group size, guests or seats. */
  capacity: number
  starRating?: number
  carType?: string
  /** Languages a guide works in. */
  languages?: string[]
  featured?: boolean
  /** Lower-cased title + summary, searched for keyword matches. */
  searchText: string
}

export type ChatRegion = {
  slug: string
  name: string
  tagline: string
  cities: string[]
}

export type ChatKnowledge = {
  faq: FaqGroup[]
  regions: ChatRegion[]
  listings: ChatListing[]
  contact: { phone: string; email: string; whatsapp: string }
}

export type ChatAction = "enquiry" | "handoff"

export type ChatReply = {
  text: string
  listings?: ChatListing[]
  suggestions?: string[]
  action?: ChatAction
}

export const STARTER_SUGGESTIONS = [
  "Do I need a visa?",
  "Nile cruise options",
  "Find a tour guide",
  "Hotels in Cairo",
  "Best time to visit?",
  "Plan a custom trip",
]

const MAX_LISTINGS = 3

// ---------------------------------------------------------------------------
// Text helpers
// ---------------------------------------------------------------------------

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9$]+/g, " ")
    .trim()
}

const STOPWORDS = new Set(
  "a an and are as at be but by can do does for from have how i if in is it me my of on or our please should so that the there this to up was we what when where which who will with would you your any about get go going want need".split(
    " "
  )
)

function tokens(text: string): string[] {
  return normalize(text)
    .split(" ")
    .filter((t) => t.length > 1 && !STOPWORDS.has(t))
    .map(stem)
}

/** Crude plural folding so "hotels" meets "hotel" and "tours" meets "tour". */
function stem(word: string): string {
  if (word.length > 4 && word.endsWith("ies")) return `${word.slice(0, -3)}y`
  if (word.length > 3 && word.endsWith("s") && !word.endsWith("ss")) {
    return word.slice(0, -1)
  }
  return word
}

/** Whole-word / whole-phrase match against normalised text. */
function has(text: string, phrase: string): boolean {
  return ` ${text} `.includes(` ${phrase} `)
}

function hasAny(text: string, phrases: readonly string[]): boolean {
  return phrases.some((p) => has(text, p))
}

// ---------------------------------------------------------------------------
// Vocabulary
// ---------------------------------------------------------------------------

const HANDOFF = [
  "human",
  "real person",
  "a person",
  "agent",
  "staff",
  "talk to",
  "speak to",
  "speak with",
  "call you",
  "phone number",
  "whatsapp",
  "contact",
  "email you",
  "your email",
]

const ENQUIRY = [
  "plan my",
  "plan a",
  "plan our",
  "help me plan",
  "custom trip",
  "custom tour",
  "tailor made",
  "tailormade",
  "private trip",
  "honeymoon",
  "quote",
  "get a price",
  "enquiry",
  "inquiry",
  "send an enquiry",
  "make an enquiry",
  "book a trip",
  "build a trip",
  "build an itinerary",
  "itinerary for",
]

const GREETING = ["hi", "hello", "hey", "salam", "salaam", "marhaba", "ahlan", "good morning", "good afternoon", "good evening"]
const THANKS = ["thanks", "thank you", "thx", "shukran", "cheers", "great", "perfect"]
const IDENTITY = ["who are you", "are you a bot", "are you human", "are you real", "what are you", "what can you do", "help"]

const KIND_WORDS: Record<ListingKind, readonly string[]> = {
  tour: ["tour", "tours", "trip", "trips", "excursion", "excursions", "package", "packages", "day trip", "cruise", "cruises", "activities", "things to do"],
  hotel: ["hotel", "hotels", "stay", "staying", "accommodation", "resort", "resorts", "lodge", "room", "rooms", "where to sleep", "place to stay"],
  guide: ["guide", "guides", "tour guide", "tour guides", "egyptologist", "egyptologists", "nubian guide", "bedouin guide", "local guide", "private guide"],
  car: ["car", "cars", "rent", "rental", "rentals", "driver", "vehicle", "vehicles", "transfer", "transfers", "minibus", "van", "suv", "coach", "bus", "chauffeur", "airport pickup", "sedan"],
}

/** Places travellers name that the region records don't list as cities. */
const EXTRA_ALIASES: Record<string, readonly string[]> = {
  "cairo-giza": ["pyramid", "pyramids", "sphinx", "saqqara", "egyptian museum", "grand egyptian museum", "gem", "khan el khalili"],
  "luxor-aswan": ["nile cruise", "cruise", "valley of the kings", "karnak", "abu simbel", "philae", "edfu", "kom ombo", "upper egypt"],
  "north-coast": ["alamein", "el alamein", "sahel", "mediterranean", "marsa matrouh"],
  "sinai-red-sea": ["red sea", "sinai", "sharm", "sharm el sheikh", "dahab", "hurghada", "mount sinai", "saint catherine", "st catherine", "diving", "dive", "snorkel", "snorkelling", "snorkeling"],
}

const CAR_TYPES: Record<string, readonly string[]> = {
  Sedan: ["sedan", "saloon"],
  SUV: ["suv", "4x4", "jeep"],
  Minivan: ["minivan", "minibus", "van"],
  Luxury: ["luxury car", "limousine", "mercedes", "s class"],
  Economy: ["economy", "small car"],
  Coach: ["coach", "bus", "big group"],
}

const NUMBER_WORDS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, fourteen: 14,
}

/**
 * Words that point at one FAQ answer. Keyed by a phrase from the question, so
 * the answer text itself can be edited freely in lib/faq.ts.
 */
const FAQ_TOPICS: { question: string; words: readonly string[] }[] = [
  { question: "How does booking", words: ["how does booking", "how do i book", "booking process", "how to book", "how it works", "how does it work"] },
  { question: "pay in full", words: ["deposit", "pay in full", "full payment", "payment", "pay by card", "stripe", "installment", "instalment"] },
  { question: "cancellation", words: ["cancel", "cancellation", "refund", "refunds", "change my booking", "reschedule"] },
  { question: "isn't listed", words: ["not listed", "isnt listed", "something else", "combine", "customise", "customize", "western desert", "siwa", "white desert"] },
  { question: "visa", words: ["visa", "visas", "e visa", "evisa", "passport", "entry requirements", "entry requirement"] },
  { question: "safe for tourists", words: ["safe", "safety", "dangerous", "danger", "security", "secure", "solo female", "solo traveller", "solo traveler"] },
  { question: "best time", words: ["best time", "when to go", "when to visit", "weather", "season", "seasons", "hot", "heat", "temperature", "climate", "which month", "what month"] },
  { question: "wear", words: ["wear", "dress", "dress code", "clothes", "clothing", "pack", "packing", "outfit", "cover", "scarf", "shorts"] },
  { question: "tip", words: ["tip", "tips", "tipping", "baksheesh", "gratuity", "gratuities"] },
  { question: "drinking water", words: ["water", "drinking water", "tap water", "ice"] },
  { question: "meals", words: ["meal", "meals", "food", "breakfast", "lunch", "dinner", "full board", "eat", "restaurant", "restaurants"] },
  { question: "dietary", words: ["vegetarian", "vegan", "halal", "gluten", "allergy", "allergies", "diet", "dietary", "wheelchair", "accessible", "accessibility", "disabled", "mobility"] },
  { question: "delayed", words: ["delay", "delayed", "flight", "late", "emergency", "goes wrong", "problem", "lost"] },
]

// ---------------------------------------------------------------------------
// Parsing a question into search criteria
// ---------------------------------------------------------------------------

export type SearchCriteria = {
  kinds: ListingKind[]
  regionSlugs: string[]
  maxPrice?: number
  days?: number
  people?: number
  carType?: string
  /** A language a guide should speak, e.g. "French". */
  language?: string
  sort: "relevance" | "cheapest" | "premium"
  titleTokens: string[]
}

function regionAliases(region: ChatRegion): string[] {
  return [
    normalize(region.name),
    normalize(region.name.replace(/&/g, "and")),
    ...region.name.split(/&| and /i).map((part) => normalize(part)),
    ...region.cities.map((city) => normalize(city)),
    ...(EXTRA_ALIASES[region.slug] ?? []),
  ].filter((alias) => alias.length > 2)
}

function readNumber(raw: string): number | undefined {
  const cleaned = raw.replace(/,/g, "")
  if (/^\d+$/.test(cleaned)) return Number.parseInt(cleaned, 10)
  return NUMBER_WORDS[cleaned]
}

export function parseCriteria(message: string, kb: ChatKnowledge): SearchCriteria {
  const text = normalize(message)
  const raw = message.toLowerCase()

  const kinds = (Object.keys(KIND_WORDS) as ListingKind[]).filter((kind) =>
    hasAny(text, KIND_WORDS[kind])
  )

  const regionSlugs = kb.regions
    .filter((region) => regionAliases(region).some((alias) => has(text, alias)))
    .map((region) => region.slug)

  let maxPrice: number | undefined
  const budget =
    /(?:under|below|less than|max(?:imum)?|up to|within|budget(?: of)?|cheaper than|no more than)\s*(?:usd|us\$|\$)?\s*(\d[\d,]*)/.exec(raw) ??
    /\$\s*(\d[\d,]*)/.exec(raw) ??
    /(\d[\d,]*)\s*(?:usd|dollars|\$)/.exec(raw)
  if (budget) maxPrice = readNumber(budget[1])

  let days: number | undefined
  const duration = /\b(\d{1,2}|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|fourteen)[\s-]*(day|days|night|nights|week|weeks)\b/.exec(raw)
  if (duration) {
    const n = readNumber(duration[1])
    if (n) days = duration[2].startsWith("week") ? n * 7 : n
  } else if (has(text, "a week")) {
    days = 7
  } else if (has(text, "day trip")) {
    days = 1
  }

  let people: number | undefined
  const group = /\b(\d{1,3}|two|three|four|five|six|seven|eight|nine|ten|twelve)\s*(?:people|persons|person|guests|adults|travellers|travelers|of us|pax|passengers|seats)\b/.exec(raw)
  if (group) people = readNumber(group[1])

  let carType: string | undefined
  for (const [type, words] of Object.entries(CAR_TYPES)) {
    if (hasAny(text, words)) {
      carType = type
      break
    }
  }

  const sort = hasAny(text, ["cheap", "cheapest", "budget", "affordable", "inexpensive", "lowest price", "low cost"])
    ? "cheapest"
    : hasAny(text, ["luxury", "luxurious", "best", "5 star", "five star", "premium", "top"])
      ? "premium"
      : "relevance"

  // A car type is only a car search if nothing else was asked for.
  if (carType && kinds.length === 0) kinds.push("car")

  // "Tour guide" names a guide, not a tour.
  if (kinds.includes("guide")) {
    const tourAt = kinds.indexOf("tour")
    if (tourAt >= 0) kinds.splice(tourAt, 1)
  }

  // "French-speaking guide", "a guide who speaks German"
  const language = LANGUAGES.find((l) => has(text, normalize(l)))

  return {
    kinds,
    regionSlugs,
    maxPrice,
    days,
    people,
    carType,
    language,
    sort,
    titleTokens: tokens(message),
  }
}

function hasCatalogueSignal(c: SearchCriteria): boolean {
  return (
    c.kinds.length > 0 ||
    c.regionSlugs.length > 0 ||
    c.maxPrice !== undefined ||
    c.days !== undefined ||
    c.carType !== undefined
  )
}

// ---------------------------------------------------------------------------
// Catalogue search
// ---------------------------------------------------------------------------

type Ranked = { listing: ChatListing; score: number }

function titleOverlap(listing: ChatListing, titleTokens: string[]): number {
  if (titleTokens.length === 0) return 0
  const words = new Set(tokens(listing.searchText))
  return titleTokens.filter((t) => t.length > 2 && words.has(t)).length
}

export function searchListings(
  criteria: SearchCriteria,
  kb: ChatKnowledge,
  opts: { ignoreBudget?: boolean } = {}
): ChatListing[] {
  const kinds = criteria.kinds.length > 0 ? criteria.kinds : (["tour"] as ListingKind[])

  const ranked: Ranked[] = []
  for (const listing of kb.listings) {
    if (!kinds.includes(listing.kind)) continue
    if (criteria.regionSlugs.length > 0 && !criteria.regionSlugs.includes(listing.regionSlug)) continue
    if (!opts.ignoreBudget && criteria.maxPrice !== undefined && listing.price > criteria.maxPrice) continue
    if (criteria.people !== undefined && listing.capacity < criteria.people) continue
    if (criteria.carType && listing.kind === "car" && listing.carType !== criteria.carType) continue
    if (criteria.language && listing.kind === "guide" && !listing.languages?.includes(criteria.language)) continue
    if (
      criteria.days !== undefined &&
      listing.kind === "tour" &&
      listing.durationDays !== undefined &&
      listing.durationDays > criteria.days
    ) {
      continue
    }

    let score = titleOverlap(listing, criteria.titleTokens) * 2
    if (listing.featured) score += 1
    if (criteria.days !== undefined && listing.durationDays !== undefined) {
      score -= Math.abs(criteria.days - listing.durationDays) * 0.5
    }
    if (criteria.sort === "premium") score += (listing.starRating ?? 0) + listing.price / 1000
    ranked.push({ listing, score })
  }

  ranked.sort((a, b) => {
    if (criteria.sort === "cheapest") return a.listing.price - b.listing.price
    if (criteria.sort === "premium") return b.score - a.score || b.listing.price - a.listing.price
    return b.score - a.score || a.listing.price - b.listing.price
  })

  return uniqueListings(ranked.map((r) => r.listing))
}

/** Guides covering several regions appear once per region; keep the first of each. */
function uniqueListings(listings: ChatListing[]): ChatListing[] {
  const seen = new Set<string>()
  return listings
    .filter((listing) => {
      const key = `${listing.kind}:${listing.slug}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .slice(0, MAX_LISTINGS)
}

const KIND_NOUN: Record<ListingKind, [string, string]> = {
  tour: ["tour", "tours"],
  hotel: ["hotel", "hotels"],
  car: ["car", "cars"],
  guide: ["guide", "guides"],
}

function describeSearch(c: SearchCriteria, kb: ChatKnowledge, count: number): string {
  const kinds = c.kinds.length > 0 ? c.kinds : (["tour"] as ListingKind[])
  const noun =
    kinds.length === 1
      ? KIND_NOUN[kinds[0]][count === 1 ? 0 : 1]
      : count === 1
        ? "option"
        : "options"
  const parts = [noun]
  if (c.carType && kinds.includes("car")) parts.unshift(c.carType === "SUV" ? "SUV" : c.carType.toLowerCase())
  if (c.language && kinds.includes("guide")) parts.unshift(`${c.language}-speaking`)
  const regionNames = c.regionSlugs
    .map((slug) => kb.regions.find((r) => r.slug === slug)?.name)
    .filter(Boolean)
  if (regionNames.length > 0) parts.push(`in ${regionNames.join(" or ")}`)
  if (c.days !== undefined && kinds.includes("tour")) parts.push(`of up to ${c.days} ${c.days === 1 ? "day" : "days"}`)
  if (c.people !== undefined) parts.push(`for ${c.people}`)
  if (c.maxPrice !== undefined) parts.push(`under ${formatPrice(c.maxPrice, "USD", { compact: true })}`)
  return parts.join(" ")
}

function catalogueReply(criteria: SearchCriteria, kb: ChatKnowledge): ChatReply {
  const results = searchListings(criteria, kb)
  const followUps = catalogueFollowUps(criteria, kb)

  if (results.length > 0) {
    const lead =
      criteria.sort === "cheapest"
        ? `The best-value ${describeSearch(criteria, kb, results.length)} we have.`
        : `Here ${results.length === 1 ? "is" : "are"} ${results.length === 1 ? "one" : results.length} ${describeSearch(criteria, kb, results.length)} you might like.`
    return {
      text: `${lead} Tap one to see the full details and book. Every trip can be adjusted, so if nothing fits exactly, ask us for a custom plan.`,
      listings: results,
      suggestions: followUps,
    }
  }

  // Nothing inside the budget: show the closest options instead of a dead end.
  if (criteria.maxPrice !== undefined) {
    const closest = searchListings({ ...criteria, sort: "cheapest" }, kb, { ignoreBudget: true })
    if (closest.length > 0) {
      return {
        text: `Nothing matches ${describeSearch(criteria, kb, 2)} right now. These are the closest, starting from ${formatPrice(closest[0].price, closest[0].currency, { compact: true })}. A planner can often build something cheaper, for example by changing the dates or the hotel.`,
        listings: closest,
        suggestions: ["Plan a custom trip", ...followUps.slice(0, 2)],
      }
    }
  }

  return {
    text: `I couldn't find ${describeSearch(criteria, kb, 2)} on the site. Our planners arrange far more than what's listed, so send us your idea and we'll price it.`,
    suggestions: ["Plan a custom trip", "Talk to a person", "Show all tours"],
    action: "enquiry",
  }
}

function catalogueFollowUps(c: SearchCriteria, kb: ChatKnowledge): string[] {
  const region = kb.regions.find((r) => r.slug === c.regionSlugs[0])
  const place = region ? region.name : "Cairo"
  const kinds = c.kinds.length > 0 ? c.kinds : ["tour"]
  const out: string[] = []
  if (!kinds.includes("hotel")) out.push(`Hotels in ${place}`)
  if (kinds.includes("tour")) out.push(`Guides in ${place}`)
  if (!kinds.includes("tour")) out.push(`Tours in ${place}`)
  if (!kinds.includes("car")) out.push("Car with a driver")
  out.push("Plan a custom trip")
  return out.slice(0, 3)
}

// ---------------------------------------------------------------------------
// FAQ matching
// ---------------------------------------------------------------------------

type FaqHit = { question: string; answer: string; score: number; strong: boolean }

export function matchFaq(message: string, kb: ChatKnowledge): FaqHit | null {
  const text = normalize(message)
  const words = tokens(message)
  let best: FaqHit | null = null

  for (const group of kb.faq) {
    for (const item of group.items) {
      const topic = FAQ_TOPICS.find((t) => item.q.toLowerCase().includes(t.question.toLowerCase()))
      const topicHits = topic ? topic.words.filter((w) => has(text, w)).length : 0

      const qWords = new Set(tokens(item.q))
      const overlap = words.filter((w) => qWords.has(w)).length

      const score = topicHits * 3 + overlap
      if (score > 0 && (!best || score > best.score)) {
        best = { question: item.q, answer: item.a, score, strong: topicHits > 0 }
      }
    }
  }
  return best
}

// ---------------------------------------------------------------------------
// Replies that don't need data
// ---------------------------------------------------------------------------

function handoffReply(kb: ChatKnowledge): ChatReply {
  return {
    text: `Of course. Our planners are on WhatsApp seven days a week, and you can also call ${kb.contact.phone} or email ${kb.contact.email}. If you'd rather we come to you, leave your details and a planner replies within one business day.`,
    suggestions: ["Plan a custom trip", "Do I need a visa?"],
    action: "handoff",
  }
}

function enquiryReply(): ChatReply {
  return {
    text: "Happy to help you plan it. Tell us your dates, who's travelling and what you'd love to see, and a planner will send a draft itinerary with a real price within one business day. Nothing is charged until you're happy with the plan.",
    suggestions: ["Talk to a person", "Best time to visit?"],
    action: "enquiry",
  }
}

function regionOverview(kb: ChatKnowledge): ChatReply {
  const lines = kb.regions.map((r) => `${r.name}${r.tagline ? `: ${r.tagline}` : ""}`)
  return {
    text: `Egypt splits into ${kb.regions.length} regions we plan trips in. ${lines.join(". ")}. Most trips combine two. Which one sounds like you?`,
    suggestions: kb.regions.slice(0, 4).map((r) => `Tours in ${r.name}`),
  }
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

export function respond(message: string, kb: ChatKnowledge): ChatReply {
  const text = normalize(message)

  if (!text) {
    return {
      text: "Ask me anything about travelling in Egypt: visas, the best season, tours, hotels or cars.",
      suggestions: STARTER_SUGGESTIONS,
    }
  }

  if (hasAny(text, HANDOFF)) return handoffReply(kb)
  if (hasAny(text, ENQUIRY)) return enquiryReply()

  const criteria = parseCriteria(message, kb)
  const faq = matchFaq(message, kb)

  // A clear FAQ topic ("are meals included on the cruise?") beats a place name.
  if (faq?.strong) {
    return {
      text: faq.answer,
      suggestions: hasCatalogueSignal(criteria)
        ? [...catalogueFollowUps(criteria, kb).slice(0, 2), "Talk to a person"]
        : ["Plan a custom trip", "Show all tours", "Talk to a person"],
    }
  }

  if (hasCatalogueSignal(criteria) || has(text, "show all tours")) {
    return catalogueReply(criteria, kb)
  }

  if (hasAny(text, ["where should i go", "which region", "destinations", "destination", "where to go", "regions"])) {
    return regionOverview(kb)
  }

  if (faq && faq.score >= 2) {
    return { text: faq.answer, suggestions: ["Plan a custom trip", "Talk to a person"] }
  }

  // A listing named directly: "how much is the Luxor Highlights tour?"
  const named = kb.listings
    .map((listing) => ({ listing, overlap: titleOverlap(listing, criteria.titleTokens) }))
    .filter((r) => r.overlap >= 2)
    .sort((a, b) => b.overlap - a.overlap)
  if (named.length > 0) {
    return {
      text: "Here's what I found:",
      listings: uniqueListings(named.map((r) => r.listing)),
      suggestions: ["Plan a custom trip", "Talk to a person"],
    }
  }

  if (hasAny(text, GREETING)) {
    return {
      text: "Ahlan! I'm Nefer, the Egypt Journeys assistant. I can suggest tours, hotels and cars, answer practical questions, or pass you to a planner. What are you thinking of?",
      suggestions: STARTER_SUGGESTIONS,
    }
  }

  if (hasAny(text, THANKS)) {
    return {
      text: "You're welcome! Anything else I can help with?",
      suggestions: ["Plan a custom trip", "Talk to a person"],
    }
  }

  if (hasAny(text, IDENTITY)) {
    return {
      text: "I'm Nefer, an automated assistant. I know our tours, hotels, cars and the practical questions travellers ask, and I can hand you to a human planner at any point.",
      suggestions: STARTER_SUGGESTIONS,
    }
  }

  if (faq) {
    return {
      text: `I'm not completely sure, but this may help: ${faq.answer}`,
      suggestions: ["Talk to a person", "Plan a custom trip"],
    }
  }

  return {
    text: "I didn't quite catch that. I can suggest tours, hotels and cars by place, budget or trip length, answer questions about visas, safety, seasons and tipping, or connect you with a planner.",
    suggestions: STARTER_SUGGESTIONS,
  }
}
