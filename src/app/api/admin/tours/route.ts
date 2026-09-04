import { NextResponse } from "next/server"

import { isAdmin } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { slugify } from "@/lib/utils"
import { tourSchema } from "@/lib/validations"

/** GET /api/admin/tours — every tour, published or not. */
export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const tours = await prisma.tour.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    include: { region: { select: { name: true, slug: true } } },
  })

  return NextResponse.json({ tours })
}

/** POST /api/admin/tours — create a tour from JSON. */
export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const parsed = tourSchema.safeParse(await request.json().catch(() => ({})))
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid tour" },
      { status: 400 }
    )
  }

  const data = parsed.data
  const baseSlug = slugify(data.slug || data.title)

  const clash = await prisma.tour.findUnique({ where: { slug: baseSlug } })
  if (clash) {
    return NextResponse.json(
      { error: `A tour with the slug "${baseSlug}" already exists.` },
      { status: 409 }
    )
  }

  const tour = await prisma.tour.create({
    data: {
      ...data,
      slug: baseSlug,
      lat: data.lat ?? null,
      lng: data.lng ?? null,
    },
  })

  return NextResponse.json({ tour }, { status: 201 })
}
