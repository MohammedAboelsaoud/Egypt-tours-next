import { NextResponse } from "next/server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { toNumber } from "@/lib/utils"
import { bookingStatusSchema } from "@/lib/validations"

/** GET /api/bookings/[id] — the owner or an admin may read a booking. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const { id } = await params
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      tour: { select: { title: true, slug: true } },
      hotel: { select: { name: true, slug: true } },
      car: { select: { name: true, slug: true } },
    },
  })

  if (!booking) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const isOwner = booking.userId === session.user.id
  if (!isOwner && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  return NextResponse.json({
    booking: { ...booking, totalPrice: toNumber(booking.totalPrice) },
  })
}

/** PATCH /api/bookings/[id] — admin-only status updates. */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const parsed = bookingStatusSchema.safeParse(
    await request.json().catch(() => ({}))
  )
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 })
  }

  const { id } = await params
  const existing = await prisma.booking.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const booking = await prisma.booking.update({
    where: { id },
    data: parsed.data,
  })

  return NextResponse.json({
    booking: { ...booking, totalPrice: toNumber(booking.totalPrice) },
  })
}
