/**
 * Describes every editable file for the admin page: which fields it has and
 * how to edit them. The admin renders its forms from this, so adding a field
 * here (and to the matching type in src/data/) is all it takes to make it
 * editable.
 */

export type Option = { value: string; label: string }

type Base = { key: string; label: string; help?: string; required?: boolean }

export type Field =
  | (Base & { type: "text" | "textarea" | "image" })
  | (Base & { type: "number"; min?: number; max?: number; step?: number })
  /** A number, or empty for null (e.g. "price on request"). */
  | (Base & { type: "optionalNumber"; emptyLabel: string })
  /** `numeric` stores the chosen value as a number. */
  | (Base & { type: "select"; options: Option[] | "areas"; numeric?: boolean })
  | (Base & { type: "multiselect"; options: Option[] | "areas" })
  | (Base & { type: "strings"; placeholder?: string })
  | (Base & { type: "list"; fields: Field[]; itemLabel: string; titleKey: string; newItem: () => Record<string, unknown> })

export type Collection = {
  id: string
  label: string
  /** Path of the JSON file in the repository. */
  file: string
  description: string
  fields: Field[]
} & (
  | { kind: "object" }
  | {
      kind: "list"
      /** Unique key for each item (also used in web addresses). */
      idKey: string
      titleKey: string
      subtitle?: (item: Record<string, unknown>) => string
      imageKey?: string
      /** Items can't be added or removed (e.g. the four areas). */
      fixed?: boolean
      newItem?: () => Record<string, unknown>
      itemLabel: string
    }
)

export const DEFAULT_REPO = {
  owner: "MohammedAboelsaoud",
  repo: "Egypt-tours-next",
  branch: "main",
}

/** Where uploaded photos are stored in the repository. */
export const UPLOAD_DIR = "public/img/uploads"

const photosField = (key = "gallery", label = "Photo gallery"): Field => ({
  key,
  label,
  type: "list",
  itemLabel: "photo",
  titleKey: "caption",
  help: "Extra photos. The first one is shown largest.",
  newItem: () => ({ src: "", caption: "", credit: "" }),
  fields: [
    { key: "src", label: "Photo", type: "image", required: true },
    { key: "caption", label: "Caption", type: "text" },
    { key: "credit", label: "Credit", type: "text", help: "Photographer and licence, if the photo isn't yours." },
  ],
})

const idField = (key: string): Field => ({
  key,
  label: key === "slug" ? "Web address" : "ID",
  type: "text",
  required: true,
  help: "Lowercase letters, numbers and dashes only. Filled in from the name for new items — avoid changing it afterwards, as links use it.",
})

export const COLLECTIONS: Collection[] = [
  {
    id: "settings",
    label: "Settings",
    file: "src/content/site.json",
    kind: "object",
    description: "Your business name, WhatsApp number and contact details.",
    fields: [
      { key: "name", label: "Business name", type: "text", required: true },
      { key: "tagline", label: "Tagline", type: "text" },
      { key: "description", label: "Short description", type: "textarea", help: "Used in the footer and in search results." },
      { key: "whatsapp", label: "WhatsApp number", type: "text", required: true, help: "Country code + number, digits only. +20 102 935 0015 → 201029350015" },
      { key: "email", label: "Email", type: "text", required: true },
      { key: "location", label: "Location", type: "text" },
      { key: "hours", label: "Opening hours", type: "text" },
      { key: "url", label: "Website address", type: "text", help: "e.g. https://egypt-tours.vercel.app — used for link previews." },
      { key: "facebook", label: "Facebook page link", type: "text", help: "Leave empty to hide." },
      { key: "instagram", label: "Instagram link", type: "text", help: "Leave empty to hide." },
    ],
  },
  {
    id: "destinations",
    label: "Destinations",
    file: "src/content/destinations.json",
    kind: "list",
    idKey: "slug",
    titleKey: "name",
    imageKey: "image",
    fixed: true,
    itemLabel: "destination",
    subtitle: (d) => String(d.tagline ?? ""),
    description: "The four regions. Edit their text, highlights and photos.",
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      { key: "tagline", label: "Tagline", type: "text" },
      { key: "image", label: "Main photo", type: "image", required: true },
      { key: "summary", label: "Introduction", type: "textarea" },
      { key: "bestTime", label: "Best time to visit", type: "text" },
      { key: "idealFor", label: "Ideal for", type: "strings", placeholder: "e.g. Families" },
      {
        key: "highlights",
        label: "Highlights",
        type: "list",
        itemLabel: "highlight",
        titleKey: "title",
        newItem: () => ({ title: "", text: "" }),
        fields: [
          { key: "title", label: "Title", type: "text", required: true },
          { key: "text", label: "Description", type: "textarea" },
        ],
      },
      photosField(),
      {
        key: "spots",
        label: "Places within this region",
        type: "list",
        itemLabel: "place",
        titleKey: "name",
        help: "Used for Sinai (Dahab, St. Catherine, Sharm). Leave empty for none.",
        newItem: () => ({ name: "", tagline: "", text: "", image: "", highlights: [] }),
        fields: [
          { key: "name", label: "Name", type: "text", required: true },
          { key: "tagline", label: "Tagline", type: "text" },
          { key: "image", label: "Photo", type: "image", required: true },
          { key: "text", label: "Description", type: "textarea" },
          { key: "highlights", label: "Highlights", type: "strings" },
        ],
      },
    ],
  },
  {
    id: "sites",
    label: "Historic sites",
    file: "src/content/sites.json",
    kind: "list",
    idKey: "slug",
    titleKey: "name",
    imageKey: "image",
    itemLabel: "historic site",
    subtitle: (s) => String(s.period ?? ""),
    description: "The catalog of historic sites, with their history and photos.",
    newItem: () => ({
      slug: "", name: "", area: "cairo-giza", location: "", period: "", image: "", imageCredit: "", summary: "",
      facts: [], chapters: [{ heading: "History", body: "" }], tips: [], gallery: [], keywords: [],
    }),
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      idField("slug"),
      { key: "area", label: "Region", type: "select", options: "areas", required: true },
      { key: "location", label: "Location", type: "text" },
      { key: "period", label: "Period / date", type: "text", help: "e.g. c. 2560 BC" },
      { key: "image", label: "Main photo", type: "image", required: true },
      { key: "imageCredit", label: "Main photo credit", type: "text" },
      { key: "summary", label: "Summary", type: "textarea", required: true, help: "One or two sentences for the catalog card." },
      {
        key: "facts",
        label: "Key facts",
        type: "list",
        itemLabel: "fact",
        titleKey: "label",
        newItem: () => ({ label: "", value: "" }),
        fields: [
          { key: "label", label: "Label", type: "text", required: true },
          { key: "value", label: "Value", type: "text", required: true },
        ],
      },
      {
        key: "chapters",
        label: "History chapters",
        type: "list",
        itemLabel: "chapter",
        titleKey: "heading",
        newItem: () => ({ heading: "", body: "" }),
        fields: [
          { key: "heading", label: "Heading", type: "text", required: true },
          { key: "body", label: "Text", type: "textarea", required: true, help: "Leave an empty line between paragraphs." },
        ],
      },
      { key: "tips", label: "Visiting tips", type: "strings" },
      photosField(),
      { key: "keywords", label: "Chat assistant keywords", type: "strings", help: "Words that make the assistant link to this page, e.g. karnak, amun." },
    ],
  },
  {
    id: "hotels",
    label: "Hotels",
    file: "src/content/hotels.json",
    kind: "list",
    idKey: "id",
    titleKey: "name",
    imageKey: "image",
    itemLabel: "hotel",
    subtitle: (h) => `${h.city ?? ""} · $${h.pricePerNight ?? "?"}/night`,
    description: "Hotels, prices and photos.",
    newItem: () => ({ id: "", name: "", area: "cairo-giza", city: "", stars: 4, rating: 8.5, pricePerNight: 50, image: "", imageCredit: "", description: "", features: [] }),
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      idField("id"),
      { key: "area", label: "Region", type: "select", options: "areas", required: true },
      { key: "city", label: "City", type: "text", required: true },
      { key: "stars", label: "Stars", type: "select", numeric: true, required: true, options: [1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: "★".repeat(n) })) },
      { key: "rating", label: "Guest rating (out of 10)", type: "number", min: 0, max: 10, step: 0.1, required: true },
      { key: "pricePerNight", label: "Price per night (USD)", type: "number", min: 0, step: 1, required: true },
      { key: "image", label: "Photo", type: "image", required: true },
      { key: "imageCredit", label: "Photo credit", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "features", label: "Features", type: "strings", placeholder: "e.g. Pool" },
    ],
  },
  {
    id: "transport",
    label: "Transport",
    file: "src/content/transport.json",
    kind: "list",
    idKey: "id",
    titleKey: "name",
    imageKey: "image",
    itemLabel: "vehicle",
    subtitle: (v) => `${v.model ?? ""} · ${v.pricePerDay == null ? "on request" : `$${v.pricePerDay}/day`}`,
    description: "Cars, minivans and buses with prices.",
    newItem: () => ({ id: "", name: "", model: "", kind: "car", seats: 4, pricePerDay: 40, image: "", imageCredit: "", description: "", features: [] }),
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      idField("id"),
      { key: "model", label: "Model", type: "text" },
      {
        key: "kind", label: "Type", type: "select", required: true, help: "Buses are shown in the big group banner.",
        options: [
          { value: "car", label: "Car" },
          { value: "suv", label: "SUV" },
          { value: "van", label: "Minivan" },
          { value: "bus", label: "Bus" },
        ],
      },
      { key: "seats", label: "Passengers", type: "number", min: 1, step: 1, required: true },
      { key: "pricePerDay", label: "Price per day (USD)", type: "optionalNumber", emptyLabel: "Price on request" },
      { key: "image", label: "Photo", type: "image" },
      { key: "imageCredit", label: "Photo credit", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "features", label: "Features", type: "strings" },
    ],
  },
  {
    id: "guides",
    label: "Tour guides",
    file: "src/content/guides.json",
    kind: "list",
    idKey: "id",
    titleKey: "title",
    imageKey: "image",
    itemLabel: "guide",
    subtitle: (g) => String(g.coverage ?? ""),
    description: "Guide profiles.",
    newItem: () => ({ id: "", title: "", areas: [], coverage: "", description: "", specialties: [], languages: ["English", "Arabic"], image: "" }),
    fields: [
      { key: "title", label: "Name or title", type: "text", required: true },
      idField("id"),
      { key: "areas", label: "Regions", type: "multiselect", options: "areas" },
      { key: "coverage", label: "Where they guide", type: "text", help: "Shown on the card, e.g. Cairo & Giza · Luxor" },
      { key: "image", label: "Photo", type: "image" },
      { key: "description", label: "About", type: "textarea" },
      { key: "specialties", label: "Specialties", type: "strings" },
      { key: "languages", label: "Languages", type: "strings" },
    ],
  },
]

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/['’.]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
}

/** Problems that would break the site, listed in plain words. */
export function validate(collection: Collection, data: unknown): string[] {
  const errors: string[] = []

  const check = (fields: Field[], value: Record<string, unknown>, where: string) => {
    for (const f of fields) {
      const v = value[f.key]
      const name = `${where}${f.label}`
      if (f.required && (v === undefined || v === null || (typeof v === "string" && v.trim() === ""))) {
        errors.push(`${name} is required.`)
      }
      if ((f.type === "number" || f.type === "optionalNumber") && v !== null && v !== undefined && typeof v === "number") {
        if (Number.isNaN(v)) errors.push(`${name} must be a number.`)
        if ("min" in f && f.min !== undefined && v < f.min) errors.push(`${name} must be at least ${f.min}.`)
        if ("max" in f && f.max !== undefined && v > f.max) errors.push(`${name} must be at most ${f.max}.`)
      }
      if (f.type === "list" && Array.isArray(v)) {
        v.forEach((item, i) => check(f.fields, item as Record<string, unknown>, `${where}${f.label} #${i + 1} → `))
      }
    }
  }

  if (collection.kind === "object") {
    check(collection.fields, data as Record<string, unknown>, "")
  } else {
    const items = data as Record<string, unknown>[]
    const seen = new Set<string>()
    items.forEach((item, i) => {
      const title = String(item[collection.titleKey] || `${collection.itemLabel} #${i + 1}`)
      check(collection.fields, item, `${title}: `)
      const id = String(item[collection.idKey] ?? "")
      if (id && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) errors.push(`${title}: the ${collection.idKey === "slug" ? "web address" : "ID"} "${id}" may only use lowercase letters, numbers and dashes.`)
      if (id && seen.has(id)) errors.push(`${title}: another ${collection.itemLabel} already uses "${id}".`)
      seen.add(id)
    })
  }
  return errors
}
