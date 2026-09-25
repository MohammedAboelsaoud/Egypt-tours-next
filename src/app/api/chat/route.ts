import { NextResponse } from "next/server"

import { respond } from "@/lib/chat/engine"
import { getChatKnowledge } from "@/lib/chat/knowledge"
import { chatRequestSchema } from "@/lib/validations"

const WINDOW_MS = 60_000
const MAX_PER_WINDOW = 30

// Per-instance and best-effort: enough to stop a script hammering one server.
const hits = new Map<string, { count: number; resetAt: number }>()

function rateLimited(key: string): boolean {
  const now = Date.now()
  const entry = hits.get(key)
  if (!entry || entry.resetAt < now) {
    if (hits.size > 5_000) hits.clear()
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS })
    return false
  }
  entry.count += 1
  return entry.count > MAX_PER_WINDOW
}

/** POST /api/chat — the site's free, self-hosted travel assistant. */
export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local"
  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "You're sending messages very quickly. Wait a moment and try again." },
      { status: 429 }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const parsed = chatRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Please check your message." },
      { status: 400 }
    )
  }

  const knowledge = await getChatKnowledge()
  const reply = respond(parsed.data.message, knowledge)

  // searchText is only for matching; keep the payload to what the widget shows.
  const listings = reply.listings?.map(
    ({ searchText: _searchText, keywords: _keywords, ...listing }) => listing
  )
  return NextResponse.json({ reply: { ...reply, listings } })
}
