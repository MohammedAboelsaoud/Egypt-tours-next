import type { Metadata } from "next"
import { CalendarDays, Download, Mail, MapPin, Phone, Users } from "lucide-react"

import { InquiryActions } from "@/components/admin/inquiry-actions"
import { AdminHeader, TableEmpty } from "@/components/admin/ui"
import { prisma } from "@/lib/prisma"
import { formatDateTime } from "@/lib/utils"

export const metadata: Metadata = { title: "Inquiries" }

export default async function AdminInquiriesPage({
  searchParams,
}: PageProps<"/admin/inquiries">) {
  const params = await searchParams
  const filter = typeof params.filter === "string" ? params.filter : "open"

  const where =
    filter === "handled"
      ? { handled: true }
      : filter === "all"
        ? {}
        : { handled: false }

  const [inquiries, openCount, totalCount] = await Promise.all([
    prisma.inquiry.findMany({ where, orderBy: { createdAt: "desc" }, take: 200 }),
    prisma.inquiry.count({ where: { handled: false } }),
    prisma.inquiry.count(),
  ])

  const tabs = [
    { key: "open", label: `Open (${openCount})` },
    { key: "handled", label: "Handled" },
    { key: "all", label: `All (${totalCount})` },
  ]

  return (
    <>
      <AdminHeader
        title="Inquiries"
        description="Enquiries from the contact form and plan requests."
        action={
          <a
            href="/api/admin/inquiries/export"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:border-gold hover:text-gold"
          >
            <Download className="size-4" />
            Export CSV
          </a>
        }
      />

      <div className="mb-6 flex gap-2">
        {tabs.map((tab) => (
          <a
            key={tab.key}
            href={`/admin/inquiries?filter=${tab.key}`}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filter === tab.key
                ? "bg-gold/12 text-gold"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {tab.label}
          </a>
        ))}
      </div>

      {inquiries.length > 0 ? (
        <ul className="space-y-4">
          {inquiries.map((inquiry) => (
            <li
              key={inquiry.id}
              className="rounded-2xl border border-border bg-ivory p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="font-heading text-lg">
                    {inquiry.name}
                    {inquiry.handled && (
                      <span className="ml-3 rounded-full bg-teal/12 px-2.5 py-1 align-middle text-xs font-medium text-teal">
                        Handled
                      </span>
                    )}
                  </h2>

                  <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
                    <a
                      href={`mailto:${inquiry.email}`}
                      className="flex items-center gap-1.5 hover:text-gold"
                    >
                      <Mail className="size-3.5" />
                      {inquiry.email}
                    </a>
                    {inquiry.phone && (
                      <a
                        href={`tel:${inquiry.phone.replace(/\s/g, "")}`}
                        className="flex items-center gap-1.5 hover:text-gold"
                      >
                        <Phone className="size-3.5" />
                        {inquiry.phone}
                      </a>
                    )}
                    {inquiry.destination && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="size-3.5" />
                        {inquiry.destination}
                      </span>
                    )}
                    {inquiry.travelDates && (
                      <span className="flex items-center gap-1.5">
                        <CalendarDays className="size-3.5" />
                        {inquiry.travelDates}
                      </span>
                    )}
                    {inquiry.partySize && (
                      <span className="flex items-center gap-1.5">
                        <Users className="size-3.5" />
                        {inquiry.partySize}
                      </span>
                    )}
                  </div>
                </div>

                <InquiryActions
                  id={inquiry.id}
                  handled={inquiry.handled}
                  name={inquiry.name}
                />
              </div>

              <p className="mt-5 border-t border-border pt-5 text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
                {inquiry.message}
              </p>

              <p className="mt-4 text-xs text-muted-foreground">
                Received {formatDateTime(inquiry.createdAt)}
                {inquiry.planTitle ? ` · about “${inquiry.planTitle}”` : ""}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-2xl border border-border bg-ivory">
          <TableEmpty
            message={
              filter === "open"
                ? "No open enquiries — everything has been handled."
                : "No enquiries here."
            }
          />
        </div>
      )}
    </>
  )
}
