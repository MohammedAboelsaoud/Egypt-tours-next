import "server-only"
import { Resend } from "resend"

import { formatDay } from "@/lib/guides/availability"
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
  <body style="margin:0;background:#f4f3ef;padding:32px 16px;font-family:"Hanken Grotesk",Helvetica,Arial,sans-serif;color:#161a22">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center">
        <table role="presentation" width="100%" style="max-width:560px;background:#fbfaf7;border:1px solid #dddbd3;border-radius:10px;overflow:hidden">
          <tr><td style="padding:24px 28px;border-bottom:1px solid #e3e1da">
            <div style="font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#8d5c0f;font-weight:600">Egypt Journeys</div>
            <div style="font-size:22px;margin-top:6px;font-family:Georgia,serif">${title}</div>
          </td></tr>
          <tr><td style="padding:24px 28px;font-size:14px;line-height:1.65">${body}</td></tr>
          <tr><td style="padding:18px 28px;background:#f4f3ef;font-size:12px;color:#5a6170">
            Egypt Journeys · Zamalek, Cairo · <a href="mailto:${ADMIN_EMAIL}" style="color:#1d4e89">${ADMIN_EMAIL}</a>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`
}

function row(label: string, value: string) {
  return `<tr>
    <td style="padding:6px 0;color:#5a6170;width:45%">${label}</td>
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
  /** CASH bookings are confirmed now and paid on the day. */
  paymentMethod?: "CARD" | "CASH"
}

export async function sendBookingConfirmation(booking: BookingEmailData) {
  const details = `
    <p>Hi ${booking.customerName}, your booking is confirmed${
      booking.paymentMethod === "CASH" ? "" : " and paid"
    }. We have you down for:</p>
    <table role="presentation" width="100%" style="margin:18px 0;border-top:1px solid #e3e1da;border-bottom:1px solid #e3e1da">
      ${row("Booking reference", booking.reference)}
      ${row(booking.itemType, booking.itemName)}
      ${row("Start", formatDate(booking.checkIn, "long"))}
      ${row("End", formatDate(booking.checkOut, "long"))}
      ${row("Guests", String(booking.guests))}
      ${row(
        booking.paymentMethod === "CASH" ? "To pay in cash on the day" : "Total paid",
        formatPrice(booking.totalPrice, booking.currency)
      )}
    </table>
    ${
      booking.paymentMethod === "CASH"
        ? `<p>You chose to pay in cash. Please have the amount ready on the first day; your coordinator will confirm who to pay and when.</p>`
        : ""
    }
    ${
      booking.specialRequests
        ? `<p style="color:#5a6170"><strong>Your notes:</strong> ${booking.specialRequests}</p>`
        : ""
    }
    <p>A trip coordinator will be in touch within one business day to confirm timings and pickup details.</p>
    <p style="margin-top:24px">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/account/bookings"
         style="background:#1d4e89;color:#ffffff;text-decoration:none;padding:11px 20px;border-radius:6px;display:inline-block;font-weight:600">
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
    <p>${
      booking.paymentMethod === "CASH"
        ? "A new booking has been reserved. <strong>Payment: cash on the day</strong> — mark it paid in the admin once collected."
        : "A new booking has been paid."
    }</p>
    <table role="presentation" width="100%" style="margin:18px 0;border-top:1px solid #e3e1da;border-bottom:1px solid #e3e1da">
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
    <table role="presentation" width="100%" style="margin:0 0 18px;border-bottom:1px solid #e3e1da">
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
       <p style="margin-top:20px;color:#5a6170">— The Egypt Journeys team</p>`
    ),
  })
}

// ---------------------------------------------------------------------------
// Tour guides
// ---------------------------------------------------------------------------

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

/** Text from travellers and guides goes into HTML email: never trust it raw. */
function esc(text: string | number | null | undefined): string {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function button(href: string, label: string) {
  return `<p style="margin-top:24px">
    <a href="${SITE_URL}${href}"
       style="background:#1d4e89;color:#ffffff;text-decoration:none;padding:11px 20px;border-radius:6px;display:inline-block;font-weight:600">${esc(label)}</a>
  </p>`
}

export type GuideRequestEmail = {
  reference: string
  guideName: string
  guideEmail: string
  touristName: string
  touristEmail: string
  startDate: Date | string
  endDate: Date | string
  groupSize: number
  message?: string
  reply?: string | null
}

function tripRows(r: GuideRequestEmail) {
  return `<table role="presentation" width="100%" style="margin:18px 0;border-top:1px solid #e3e1da;border-bottom:1px solid #e3e1da">
    ${row("Reference", esc(r.reference))}
    ${row("Dates", `${esc(formatDay(r.startDate, "long"))} – ${esc(formatDay(r.endDate, "long"))}`)}
    ${row("Travellers", esc(r.groupSize))}
  </table>`
}

export async function sendGuideNewRequest(r: GuideRequestEmail) {
  return send({
    to: r.guideEmail,
    subject: `New request from ${r.touristName} — ${r.reference}`,
    html: shell(
      "You have a new trip request",
      `<p>Hi ${esc(r.guideName)}, ${esc(r.touristName)} would like you to guide them.</p>
       ${tripRows(r)}
       <p style="white-space:pre-wrap">${esc(r.message)}</p>
       <p style="color:#5a6170">Please answer within 48 hours. After that the request lapses and the traveller is asked to choose another guide.</p>
       ${button("/guide/requests", "Accept or decline")}`
    ),
  })
}

export async function sendGuideRequestAccepted(r: GuideRequestEmail) {
  return send({
    to: r.touristEmail,
    subject: `${r.guideName} accepted your request — ${r.reference}`,
    html: shell(
      "Your guide is confirmed",
      `<p>Hi ${esc(r.touristName)}, good news: ${esc(r.guideName)} will guide you.</p>
       ${tripRows(r)}
       ${r.reply ? `<p><strong>${esc(r.guideName)} says:</strong></p><p style="white-space:pre-wrap">${esc(r.reply)}</p>` : ""}
       <p>Your guide's phone, WhatsApp and email are now in your account, so you can agree the programme and the fee directly.</p>
       ${button("/account/guides", "See your guide's contact details")}`
    ),
  })
}

export async function sendGuideRequestDeclined(
  r: GuideRequestEmail & { reason: "declined" | "booked" | "expired" }
) {
  const lead =
    r.reason === "booked"
      ? `${esc(r.guideName)} has been booked by another group on those dates.`
      : r.reason === "expired"
        ? `${esc(r.guideName)} didn't answer in time, so your request has lapsed.`
        : `${esc(r.guideName)} can't take your trip this time.`
  return send({
    to: r.touristEmail,
    subject: `Your guide request ${r.reference} — let's find you another guide`,
    html: shell(
      "Let's find you another guide",
      `<p>Hi ${esc(r.touristName)}, ${lead}</p>
       ${tripRows(r)}
       ${r.reply ? `<p style="white-space:pre-wrap">${esc(r.reply)}</p>` : ""}
       <p>Other guides may well be free on your dates.</p>
       ${button(`/guides?from=${formatISO(r.startDate)}&to=${formatISO(r.endDate)}`, "See guides free on your dates")}`
    ),
  })
}

export async function sendGuideApplicationToAdmin(guide: { displayName: string; email: string; guideType: string }) {
  return send({
    to: ADMIN_EMAIL,
    subject: `New guide application: ${guide.displayName}`,
    html: shell(
      "A guide wants to join",
      `<p>${esc(guide.displayName)} (${esc(guide.guideType)}, ${esc(guide.email)}) has applied. Their profile stays hidden until you approve it.</p>
       ${button("/admin/guides", "Review the application")}`
    ),
    replyTo: guide.email,
  })
}

export async function sendGuideStatusChange(guide: {
  displayName: string
  email: string
  status: "APPROVED" | "REJECTED" | "SUSPENDED"
  note?: string | null
}) {
  const copy = {
    APPROVED: ["You're live on Egypt Journeys", "Your profile is approved and travellers can now find and request you. Keep your calendar up to date so you only get requests you can take."],
    REJECTED: ["About your guide application", "We couldn't approve your profile yet."],
    SUSPENDED: ["Your guide profile is paused", "Your profile is hidden from travellers for now."],
  }[guide.status]
  return send({
    to: guide.email,
    subject: copy[0],
    html: shell(
      copy[0],
      `<p>Hi ${esc(guide.displayName)}, ${copy[1]}</p>
       ${guide.note ? `<p><strong>Note from our team:</strong> ${esc(guide.note)}</p>` : ""}
       ${button("/guide", "Open your guide dashboard")}`
    ),
  })
}

function formatISO(date: Date | string) {
  return (typeof date === "string" ? new Date(date) : date).toISOString().slice(0, 10)
}

export async function sendGuideTripCancelled(r: GuideRequestEmail) {
  return send({
    to: r.guideEmail,
    subject: `Trip cancelled — ${r.reference}`,
    html: shell(
      "A traveller cancelled their trip",
      `<p>Hi ${esc(r.guideName)}, ${esc(r.touristName)} has cancelled this trip. The days are free again on your calendar.</p>
       ${tripRows(r)}
       ${button("/guide/calendar", "Open your calendar")}`
    ),
  })
}

export async function sendBookingCancelled(booking: {
  reference: string
  itemName: string
  checkIn: Date | string
  checkOut: Date | string
  customerName: string
  customerEmail: string
  total: number
  refund: number
  currency: string
  paid: boolean
}) {
  const refundLine = !booking.paid
    ? "Nothing was charged, so there is nothing to refund."
    : booking.refund > 0
      ? `We've refunded <strong>${esc(formatPrice(booking.refund, booking.currency))}</strong> to your card. It usually appears within 5–10 business days.`
      : "Under the booking terms, cancellations within 7 days of the start aren't refundable."
  const rows = `<table role="presentation" width="100%" style="margin:18px 0;border-top:1px solid #e3e1da;border-bottom:1px solid #e3e1da">
      ${row("Booking reference", esc(booking.reference))}
      ${row("Booking", esc(booking.itemName))}
      ${row("Dates", `${esc(formatDay(booking.checkIn))} – ${esc(formatDay(booking.checkOut))}`)}
      ${booking.paid ? row("Refunded", esc(formatPrice(booking.refund, booking.currency))) : ""}
    </table>`

  await Promise.allSettled([
    send({
      to: booking.customerEmail,
      subject: `Booking cancelled — ${booking.reference} · Egypt Journeys`,
      html: shell(
        "Your booking is cancelled",
        `<p>Hi ${esc(booking.customerName)}, your booking has been cancelled as you asked.</p>${rows}<p>${refundLine}</p>
         ${button("/account/bookings", "View my bookings")}`
      ),
    }),
    send({
      to: ADMIN_EMAIL,
      subject: `Cancelled by traveller: ${booking.reference}`,
      html: shell(
        "A booking was cancelled",
        `<p>${esc(booking.customerName)} (${esc(booking.customerEmail)}) cancelled this booking.</p>${rows}
         <p>${booking.paid ? `Automatic refund: ${esc(formatPrice(booking.refund, booking.currency))} of ${esc(formatPrice(booking.total, booking.currency))}.` : "It was not paid."}</p>`
      ),
    }),
  ])
}
