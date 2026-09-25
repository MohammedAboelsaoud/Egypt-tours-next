import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

import { prisma } from "@/lib/prisma"
import { sendGuideApplicationToAdmin } from "@/lib/resend"
import { slugify } from "@/lib/utils"
import { guideSignupSchema } from "@/lib/validations"

/** Paths under /guides that are pages, not guide profiles. */
const RESERVED = new Set(["join", "login", "register"])

async function uniqueSlug(name: string) {
  const slugged = slugify(name) || "guide"
  const base = RESERVED.has(slugged) ? `${slugged}-guide` : slugged
  for (let n = 1; ; n++) {
    const slug = n === 1 ? base : `${base}-${n}`
    const taken = await prisma.guideProfile.findUnique({ where: { slug }, select: { id: true } })
    if (!taken) return slug
  }
}

/**
 * POST /api/guides/register — creates a guide account and profile in one go.
 * The profile stays hidden (PENDING) until an admin approves it.
 */
export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const parsed = guideSignupSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Please check the form." },
      { status: 400 }
    )
  }

  const { name, password, profile } = parsed.data
  const email = parsed.data.email.toLowerCase()

  if (await prisma.user.findUnique({ where: { email }, select: { id: true } })) {
    return NextResponse.json(
      { error: "An account with this email already exists. Sign in, or use another email for your guide account." },
      { status: 409 }
    )
  }

  const regions = await prisma.region.findMany({
    where: { id: { in: profile.regionIds } },
    select: { id: true },
  })
  if (regions.length === 0) {
    return NextResponse.json({ error: "Choose where you guide." }, { status: 400 })
  }

  const { regionIds: _regionIds, dayRate, ...fields } = profile
  await prisma.user.create({
    data: {
      email,
      name,
      passwordHash: await bcrypt.hash(password, 12),
      role: "GUIDE",
      phone: profile.whatsapp,
      languages: profile.languages,
      guideProfile: {
        create: {
          ...fields,
          slug: await uniqueSlug(profile.displayName),
          photoUrl: fields.photoUrl || null,
          licenceNumber: fields.licenceNumber || null,
          dayRate: dayRate ?? null,
          regions: { connect: regions },
        },
      },
    },
  })

  await sendGuideApplicationToAdmin({
    displayName: profile.displayName,
    email,
    guideType: profile.guideType,
  }).catch(() => undefined)

  return NextResponse.json({ ok: true }, { status: 201 })
}
