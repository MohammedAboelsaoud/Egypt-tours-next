import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

import { prisma } from "@/lib/prisma"
import { registerSchema, type RegisterInput } from "@/lib/validations"

/** The travel profile collected once at sign-up and reused on every request. */
function profileFields(data: RegisterInput) {
  return {
    phone: data.phone,
    nationality: data.nationality,
    languages: data.languages,
    passportNo: data.passportNo || null,
  }
}

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const parsed = registerSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid details" },
      { status: 400 }
    )
  }

  const email = parsed.data.email.toLowerCase()
  const existing = await prisma.user.findUnique({ where: { email } })

  if (existing) {
    // An OAuth-only account can add a password; a password account cannot re-register.
    if (existing.passwordHash) {
      return NextResponse.json(
        { error: "An account with this email already exists. Try signing in." },
        { status: 409 }
      )
    }

    await prisma.user.update({
      where: { id: existing.id },
      data: {
        passwordHash: await bcrypt.hash(parsed.data.password, 12),
        name: existing.name ?? parsed.data.name,
        ...profileFields(parsed.data),
      },
    })
    return NextResponse.json({ ok: true, linked: true })
  }

  await prisma.user.create({
    data: {
      email,
      name: parsed.data.name,
      passwordHash: await bcrypt.hash(parsed.data.password, 12),
      role: "CUSTOMER",
      ...profileFields(parsed.data),
    },
  })

  return NextResponse.json({ ok: true }, { status: 201 })
}
