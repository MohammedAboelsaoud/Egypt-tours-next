import { isAdmin } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/** Escapes a value for CSV — quotes wrap it, inner quotes are doubled. */
function cell(value: unknown): string {
  if (value === null || value === undefined) return '""'
  const text = value instanceof Date ? value.toISOString() : String(value)
  return `"${text.replace(/"/g, '""')}"`
}

/** GET /api/admin/inquiries/export — downloads every enquiry as CSV. */
export async function GET() {
  if (!(await isAdmin())) {
    return new Response("Forbidden", { status: 403 })
  }

  const inquiries = await prisma.inquiry.findMany({
    orderBy: { createdAt: "desc" },
  })

  const header = [
    "Received",
    "Name",
    "Email",
    "Phone",
    "Destination",
    "Travel dates",
    "Party size",
    "Message",
    "About",
    "Handled",
  ]

  const rows = inquiries.map((inquiry) =>
    [
      inquiry.createdAt,
      inquiry.name,
      inquiry.email,
      inquiry.phone,
      inquiry.destination,
      inquiry.travelDates,
      inquiry.partySize,
      inquiry.message,
      inquiry.planTitle,
      inquiry.handled ? "yes" : "no",
    ]
      .map(cell)
      .join(",")
  )

  const csv = [header.map(cell).join(","), ...rows].join("\r\n")
  const filename = `egypt-journeys-inquiries-${new Date()
    .toISOString()
    .slice(0, 10)}.csv`

  return new Response(`﻿${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  })
}
