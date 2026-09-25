import { NextResponse } from "next/server"

/**
 * Receives errors that crashed a page in the visitor's browser (see
 * src/app/error.tsx) and writes them to the server log, where they show up in
 * Vercel's runtime logs. Browser errors never reach the server otherwise.
 */

const clip = (value: unknown, max: number) => (typeof value === "string" ? value.slice(0, max) : undefined)

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
  if (!body) return new NextResponse(null, { status: 204 })

  console.error("[client-error]", {
    path: clip(body.path, 300),
    name: clip(body.name, 100),
    message: clip(body.message, 1000),
    digest: clip(body.digest, 100),
    stack: clip(body.stack, 3000),
    userAgent: request.headers.get("user-agent")?.slice(0, 300),
  })
  return new NextResponse(null, { status: 204 })
}
