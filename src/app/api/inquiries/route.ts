import { NextResponse } from "next/server"

import { isAdmin } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  sendInquiryAcknowledgement,
  sendInquiryNotification,
} from "@/lib/resend"
import { inquirySchema } from "@/lib/validations"

/** GET /api/inquiries — admin only. */
export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const inquiries = await prisma.inquiry.findMany({
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json({ inquiries })
}

/** POST /api/inquiries — public contact form. */
export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const parsed = inquirySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Please check the form." },
      { status: 400 }
    )
  }

  const data = parsed.data

  const inquiry = await prisma.inquiry.create({
    data: {
      name: data.name,
      email: data.email.toLowerCase(),
      phone: data.phone || null,
      destination: data.destination || null,
      travelDates: data.travelDates || null,
      partySize: data.partySize || null,
      message: data.message,
      planTitle: data.planTitle || null,
    },
  })

  // Email delivery must not block the submission from succeeding.
  await Promise.allSettled([
    sendInquiryNotification(inquiry),
    sendInquiryAcknowledgement({ name: inquiry.name, email: inquiry.email }),
  ])

  return NextResponse.json({ ok: true, id: inquiry.id }, { status: 201 })
}
