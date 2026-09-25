import { NextResponse } from "next/server"

import { auth } from "@/lib/auth"
import { reserveBookingForCash } from "@/lib/payments"

/**
 * POST /api/bookings/[id]/pay-later — the owner confirms their booking and
 * pays in cash on the day instead of by card now.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Please sign in again." }, { status: 401 })
  }

  const { id } = await params
  const reference = await reserveBookingForCash(id, session.user.id)
  if (!reference) {
    return NextResponse.json(
      { error: "This booking can no longer be switched to cash. Check My bookings." },
      { status: 409 }
    )
  }

  return NextResponse.json({ ok: true, reference })
}
