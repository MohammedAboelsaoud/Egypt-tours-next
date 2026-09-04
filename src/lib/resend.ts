import "server-only"
import { Resend } from "resend"

import { formatDate, formatPrice } from "@/lib/utils"

const API_KEY = process.env.RESEND_API_KEY ?? ""
const FROM = process.env.EMAIL_FROM || "Egypt Journeys <noreply@egyptjourneys.com>"
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@egyptjourneys.com"

export const emailConfigured = Boolean(API_KEY)

const resend = API_KEY ? new Resend(API_KEY) : null

type SendArgs = {
  to: string | string[]
  subject: string
  html: string
  replyTo?: string
}

/** Sends through Resend, or logs to the server console when unconfigured. */
async function send({ to, subject, html, replyTo }: SendArgs) {
  if (!resend) {
    console.info(
      `[email:skipped] RESEND_API_KEY missing — would have sent "${subject}" to ${
        Array.isArray(to) ? to.join(", ") : to
      }`
    )
    return { skipped: true as const }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM,
      to,
      subject,
      html,
      replyTo,
    })
    if (error) {
      console.error("[email:error]", error)
      return { skipped: false as const, error }
    }
    return { skipped: false as const, id: data?.id }
  } catch (error) {
    console.error("[email:error]", error)
    return { skipped: false as const, error }
  }
}

function shell(title: string, body: string) {
  return `<!doctype html>
<html>
  <body style="margin:0;background:#faf7f2;padding:32px 16px;font-family:Inter,Helvetica,Arial,sans-serif;color:#1c1917">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center">
        <table role="presentation" width="100%" style="max-width:560px;background:#fffef9;border:1px solid #e7ded0;border-radius:14px;overflow:hidden">
          <tr><td style="padding:24px 28px;border-bottom:1px solid #f0e8da">
            <div style="font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#b8860b;font-weight:600">Egypt Journeys</div>
            <div style="font-size:22px;margin-top:6px;font-family:Georgia,serif">${title}</div>
          </td></tr>
          <tr><td style="padding:24px 28px;font-size:14px;line-height:1.65">${body}</td></tr>
          <tr><td style="padding:18px 28px;background:#faf7f2;font-size:12px;color:#78706a">
            Egypt Journeys · Zamalek, Cairo · <a href="mailto:${ADMIN_EMAIL}" style="color:#b8860b">${ADMIN_EMAIL}</a>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`
}

function row(label: string, value: string) {
  return `<tr>
    <td style="padding:6px 0;color:#78706a;width:45%">${label}</td>
    <td style="padding:6px 0;font-weight:600;text-align:right">${value}</td>
  </tr>`
}

export type BookingEmailData = {
  reference: string
  itemName: string
  itemType: string
  checkIn: Date | string
  checkOut: Date | string
  guests: number
  totalPrice: number
  currency: string
  customerName: string
  customerEmail: string
  specialRequests?: string | null
}

export async function sendBookingConfirmation(booking: BookingEmailData) {
  const details = `
    <p>Hi ${booking.customerName}, your booking is confirmed and paid. We have you down for:</p>
    <table role="presentation" width="100%" style="margin:18px 0;border-top:1px solid #f0e8da;border-bottom:1px solid #f0e8da">
      ${row("Booking reference", booking.reference)}
      ${row(booking.itemType, booking.itemName)}
      ${row("Start", formatDate(booking.checkIn, "long"))}
      ${row("End", formatDate(booking.checkOut, "long"))}
      ${row("Guests", String(booking.guests))}
      ${row("Total paid", formatPrice(booking.totalPrice, booking.currency))}
    </table>
    ${
      booking.specialRequests
        ? `<p style="color:#78706a"><strong>Your notes:</strong> ${booking.specialRequests}</p>`
        : ""
    }
    <p>A trip coordinator will be in touch within one business day to confirm timings and pickup details.</p>
    <p style="margin-top:24px">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/account/bookings"
         style="background:#b8860b;color:#fffef9;text-decoration:none;padding:11px 20px;border-radius:8px;display:inline-block;font-weight:600">
        View my bookings
      </a>
    </p>`

  return send({
    to: booking.customerEmail,
    subject: `Booking confirmed — ${booking.reference} · Egypt Journeys`,
    html: shell("Your booking is confirmed", details),
  })
}

export async function sendAdminBookingAlert(booking: BookingEmailData) {
  const details = `
    <p>A new booking has been paid.</p>
    <table role="presentation" width="100%" style="margin:18px 0;border-top:1px solid #f0e8da;border-bottom:1px solid #f0e8da">
      ${row("Reference", booking.reference)}
      ${row("Customer", `${booking.customerName} (${booking.customerEmail})`)}
      ${row(booking.itemType, booking.itemName)}
      ${row("Dates", `${formatDate(booking.checkIn)} → ${formatDate(booking.checkOut)}`)}
      ${row("Guests", String(booking.guests))}
      ${row("Total", formatPrice(booking.totalPrice, booking.currency))}
    </table>`

  return send({
    to: ADMIN_EMAIL,
    subject: `New booking ${booking.reference} — ${formatPrice(booking.totalPrice, booking.currency)}`,
    html: shell("New booking received", details),
    replyTo: booking.customerEmail,
  })
}

export async function sendInquiryNotification(inquiry: {
  name: string
  email: string
  phone?: string | null
  destination?: string | null
  travelDates?: string | null
  partySize?: string | null
  message: string
  planTitle?: string | null
}) {
  const details = `
    <table role="presentation" width="100%" style="margin:0 0 18px;border-bottom:1px solid #f0e8da">
      ${row("Name", inquiry.name)}
      ${row("Email", inquiry.email)}
      ${inquiry.phone ? row("Phone", inquiry.phone) : ""}
      ${inquiry.destination ? row("Destination", inquiry.destination) : ""}
      ${inquiry.travelDates ? row("Travel dates", inquiry.travelDates) : ""}
      ${inquiry.partySize ? row("Party size", inquiry.partySize) : ""}
      ${inquiry.planTitle ? row("About", inquiry.planTitle) : ""}
    </table>
    <p style="white-space:pre-wrap">${inquiry.message}</p>`

  return send({
    to: ADMIN_EMAIL,
    subject: `New enquiry from ${inquiry.name}`,
    html: shell("New website enquiry", details),
    replyTo: inquiry.email,
  })
}

export async function sendInquiryAcknowledgement(inquiry: {
  name: string
  email: string
}) {
  return send({
    to: inquiry.email,
    subject: "We received your enquiry — Egypt Journeys",
    html: shell(
      "Thank you for getting in touch",
      `<p>Hi ${inquiry.name},</p>
       <p>Thanks for telling us about your trip. One of our Egypt specialists will read your notes
       and reply within one business day with a first draft itinerary and pricing.</p>
       <p>If anything is urgent, reply to this email and it will reach the same person.</p>
       <p style="margin-top:20px;color:#78706a">— The Egypt Journeys team</p>`
    ),
  })
}
