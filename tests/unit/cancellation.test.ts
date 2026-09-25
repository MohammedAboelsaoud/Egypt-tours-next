import { describe, expect, it } from "vitest"

import { cancellationTerms } from "@/lib/cancellation"

const today = "2027-03-01"
const paid = { total: 520, status: "CONFIRMED", paymentStatus: "PAID", today }

describe("cancellationTerms", () => {
  it("refunds in full from 14 days before the start", () => {
    expect(cancellationTerms({ ...paid, checkIn: "2027-03-15" })).toMatchObject({ allowed: true, daysBefore: 14, percent: 100, refund: 520 })
  })

  it("refunds half from 7 to 13 days before", () => {
    expect(cancellationTerms({ ...paid, checkIn: "2027-03-14" })).toMatchObject({ daysBefore: 13, percent: 50, refund: 260 })
    expect(cancellationTerms({ ...paid, checkIn: "2027-03-08" })).toMatchObject({ daysBefore: 7, percent: 50, refund: 260 })
  })

  it("allows cancelling inside 7 days, without a refund", () => {
    expect(cancellationTerms({ ...paid, checkIn: "2027-03-07" })).toMatchObject({ allowed: true, daysBefore: 6, percent: 0, refund: 0 })
  })

  it("works from the stored date, whatever time it was saved at", () => {
    expect(cancellationTerms({ ...paid, checkIn: new Date("2027-03-15T00:00:00Z") }).refund).toBe(520)
  })

  it("refunds nothing when nothing was paid (cash or unfinished)", () => {
    expect(cancellationTerms({ ...paid, paymentStatus: "PENDING", checkIn: "2027-04-01" })).toMatchObject({ allowed: true, refund: 0, percent: 0 })
  })

  it("rounds half refunds to the cent", () => {
    expect(cancellationTerms({ ...paid, total: 195.55, checkIn: "2027-03-10" }).refund).toBe(97.78)
  })

  it("refuses started, completed and cancelled bookings", () => {
    expect(cancellationTerms({ ...paid, checkIn: "2027-03-01" }).allowed).toBe(false)
    expect(cancellationTerms({ ...paid, checkIn: "2027-04-01", status: "COMPLETED" }).allowed).toBe(false)
    expect(cancellationTerms({ ...paid, checkIn: "2027-04-01", status: "CANCELLED" }).reason).toMatch(/already cancelled/)
  })
})
