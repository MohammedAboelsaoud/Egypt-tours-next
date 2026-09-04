import { NextResponse } from "next/server"

import { auth } from "@/lib/auth"
import { calculatePrice } from "@/lib/pricing"
import { prisma } from "@/lib/prisma"
import { getBookableItem } from "@/lib/queries"
import { bookingReference, toNumber } from "@/lib/utils"
import { createBookingSchema } from "@/lib/validations"

/** GET /api/bookings — the signed-in traveller's own bookings. */
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const bookings = await prisma.booking.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      tour: { select: { title: true, slug: true, imageUrl: true } },
      hotel: { select: { name: true, slug: true, imageUrl: true } },
      car: { select: { name: true, slug: true, imageUrl: true } },
    },
  })

  return NextResponse.json({ bookings })
}

/** POST /api/bookings — creates a PENDING booking ahead of payment. */
export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Please sign in to complete a booking." },
      { status: 401 }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const parsed = createBookingSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid booking details" },
      { status: 400 }
    )
  }

  const input = parsed.data
  const kind =
    input.bookingType === "TOUR"
      ? "tour"
      : input.bookingType === "HOTEL"
        ? "hotel"
        : "car"

  const item = await getBookableItem(kind, input.itemId)
  if (!item) {
    return NextResponse.json(
      { error: "That item is no longer available." },
      { status: 404 }
    )
  }

  const checkIn = new Date(input.checkIn)
  const checkOut = new Date(input.checkOut)

  if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) {
    return NextResponse.json({ error: "Invalid dates" }, { status: 400 })
  }
  if (checkOut <= checkIn) {
    return NextResponse.json(
      { error: "The end date must be after the start date." },
      { status: 400 }
    )
  }

  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)
  if (checkIn < startOfToday) {
    return NextResponse.json(
      { error: "The start date cannot be in the past." },
      { status: 400 }
    )
  }

  // Capacity checks per item type.
  if (kind === "tour" && "maxGroupSize" in item && input.guests > item.maxGroupSize) {
    return NextResponse.json(
      { error: `This tour takes a maximum of ${item.maxGroupSize} travellers.` },
      { status: 400 }
    )
  }
  if (kind === "hotel" && "maxGuests" in item && input.guests > item.maxGuests) {
    return NextResponse.json(
      { error: `This room sleeps a maximum of ${item.maxGuests} guests.` },
      { status: 400 }
    )
  }
  if (kind === "car" && "seats" in item && input.guests > item.seats) {
    return NextResponse.json(
      { error: `This vehicle seats a maximum of ${item.seats} passengers.` },
      { status: 400 }
    )
  }

  const unitPrice =
    kind === "tour"
      ? toNumber((item as { priceFrom: unknown }).priceFrom)
      : kind === "hotel"
        ? toNumber((item as { pricePerNight: unknown }).pricePerNight)
        : toNumber((item as { pricePerDay: unknown }).pricePerDay)

  // Price is recomputed server-side; the client's number is never trusted.
  const price = calculatePrice({
    kind: input.bookingType,
    unitPrice,
    currency: item.currency,
    checkIn,
    checkOut,
    guests: input.guests,
  })

  const booking = await prisma.booking.create({
    data: {
      reference: bookingReference(),
      userId: session.user.id,
      bookingType: input.bookingType,
      tourId: kind === "tour" ? item.id : null,
      hotelId: kind === "hotel" ? item.id : null,
      carId: kind === "car" ? item.id : null,
      checkIn,
      checkOut,
      guests: input.guests,
      totalPrice: price.total,
      currency: price.currency,
      status: "PENDING",
      paymentStatus: "PENDING",
      contactName: input.contactName,
      contactEmail: input.contactEmail,
      contactPhone: input.contactPhone,
      nationality: input.nationality || null,
      passportNo: input.passportNo || null,
      specialRequests: input.specialRequests || null,
    },
  })

  // Keep the traveller's profile in step with what they just typed.
  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      phone: input.contactPhone,
      ...(input.nationality ? { nationality: input.nationality } : {}),
      ...(input.passportNo ? { passportNo: input.passportNo } : {}),
    },
  })

  return NextResponse.json(
    {
      booking: {
        id: booking.id,
        reference: booking.reference,
        totalPrice: toNumber(booking.totalPrice),
        currency: booking.currency,
      },
    },
    { status: 201 }
  )
}
