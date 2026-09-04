import { cn } from "cn"

export { cn }

/** Prisma Decimal, string or number → number. */
export function toNumber(value: unknown): number {
  if (value === null || value === undefined) return 0
  if (typeof value === "number") return value
  if (typeof value === "string") return Number.parseFloat(value) || 0
  if (typeof value === "object" && "toString" in (value as object)) {
    return Number.parseFloat(String(value)) || 0
  }
  return 0
}

export function formatPrice(
  value: unknown,
  currency = "USD",
  opts: { compact?: boolean } = {}
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: opts.compact ? 0 : 2,
  }).format(toNumber(value))
}

export function formatDate(
  date: Date | string | null | undefined,
  style: "short" | "long" = "short"
): string {
  if (!date) return "—"
  const d = typeof date === "string" ? new Date(date) : date
  if (Number.isNaN(d.getTime())) return "—"
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: style === "long" ? "long" : "short",
    year: "numeric",
  }).format(d)
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "—"
  const d = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d)
}

/** Whole nights between two dates, minimum 1. */
export function nightsBetween(from: Date | string, to: Date | string): number {
  const a = new Date(from)
  const b = new Date(to)
  const ms = b.setHours(12, 0, 0, 0) - a.setHours(12, 0, 0, 0)
  return Math.max(1, Math.round(ms / 86_400_000))
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
}

/** Human-friendly booking reference, e.g. EJ-8FK3D2. */
export function bookingReference(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let out = ""
  for (let i = 0; i < 6; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  return `EJ-${out}`
}

/** Split a textarea value into a clean string[] (one item per line). */
export function linesToArray(value: string | null | undefined): string[] {
  if (!value) return []
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
}

export function arrayToLines(value: string[] | null | undefined): string {
  return (value ?? []).join("\n")
}

export function truncate(text: string, length = 160): string {
  if (text.length <= length) return text
  return `${text.slice(0, length).trimEnd()}…`
}

export function initials(name?: string | null): string {
  if (!name) return "EJ"
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

/** Today at midnight, as a yyyy-mm-dd string for <input type="date" min>. */
export function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

export function addDaysISO(iso: string, days: number): string {
  const d = new Date(iso)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}
