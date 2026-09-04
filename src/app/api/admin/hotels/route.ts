import { NextResponse } from "next/server"

import { isAdmin } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { slugify } from "@/lib/utils"
import { hotelSchema } from "@/lib/validations"

/** GET /api/admin/hotels — every hotel, published or not. */
export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const hotels = await prisma.hotel.findMany({
    orderBy: { createdAt: "desc" },
    include: { region: { select: { name: true, slug: true } } },
  })

  return NextResponse.json({ hotels })
}

/** POST /api/admin/hotels — create a hotel from JSON. */
export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const parsed = hotelSchema.safeParse(await request.json().catch(() => ({})))
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid hotel" },
      { status: 400 }
    )
  }

  const data = parsed.data
  const baseSlug = slugify(data.slug || data.name)

  const clash = await prisma.hotel.findUnique({ where: { slug: baseSlug } })
  if (clash) {
    return NextResponse.json(
      { error: `A hotel with the slug "${baseSlug}" already exists.` },
      { status: 409 }
    )
  }

  const hotel = await prisma.hotel.create({
    data: {
      ...data,
      slug: baseSlug,
      address: data.address || null,
      lat: data.lat ?? null,
      lng: data.lng ?? null,
    },
  })

  return NextResponse.json({ hotel }, { status: 201 })
}
