"use client"

import dynamic from "next/dynamic"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CreditCard,
  PartyPopper,
  User,
  Banknote,
} from "lucide-react"


import { Button } from "@/components/ui/button"
import { ButtonLink } from "@/components/ui/button-link"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { NATIONALITIES } from "@/lib/constants"
import { calculatePrice, type BookingKind } from "@/lib/pricing"
import { addDaysISO, cn, formatDate, formatPrice, todayISO } from "@/lib/utils"
import {
  bookingGuestSchema,
  type BookingGuestInput,
} from "@/lib/validations"

export type BookingItem = {
  id: string
  kind: BookingKind
  name: string
  imageUrl: string
  regionName: string
  unitPrice: number
  currency: string
  maxGuests: number
  /** Fixed length in days for tours; null for hotels and cars. */
  fixedDays: number | null
  href: string
}

/** Stripe.js is only needed at step 4, so it loads on demand. */
const StripeCheckout = dynamic(
  () =>
    import("@/components/booking/stripe-checkout").then(
      (mod) => mod.StripeCheckout
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-32 animate-pulse rounded-xl bg-muted" />
    ),
  }
)

const STEPS = [
  { id: 1, label: "Dates & guests", icon: CalendarDays },
  { id: 2, label: "Your details", icon: User },
  { id: 3, label: "Review", icon: Check },
  { id: 4, label: "Payment", icon: CreditCard },
]

export function BookingFlow({
  item,
  user,
}: {
  item: BookingItem
  user: {
    name: string | null
    email: string | null
    phone: string | null
    nationality: string | null
    passportNo: string | null
  }
}) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [terms, setTerms] = useState(false)
  const [booking, setBooking] = useState<{
    id: string
    reference: string
  } | null>(null)
  const [confirmedRef, setConfirmedRef] = useState<string | null>(null)
  const [method, setMethod] = useState<"CARD" | "CASH">("CARD")
  const [paidInCash, setPaidInCash] = useState(false)
  const [reserving, setReserving] = useState(false)

  const reserveWithCash = async () => {
    if (!booking) return
    setError(null)
    setReserving(true)
    try {
      const response = await fetch(`/api/bookings/${booking.id}/pay-later`, { method: "POST" })
      const data = (await response.json().catch(() => null)) as { reference?: string; error?: string } | null
      if (!response.ok || !data?.reference) {
        setError(data?.error ?? "We couldn't confirm your booking. Please try again.")
        return
      }
      setPaidInCash(true)
      setConfirmedRef(data.reference)
      router.refresh()
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setReserving(false)
    }
  }

  const defaultCheckIn = addDaysISO(todayISO(), 14)
  const [checkIn, setCheckIn] = useState(defaultCheckIn)
  const [checkOut, setCheckOut] = useState(
    addDaysISO(defaultCheckIn, item.fixedDays ?? 3)
  )
  const [guests, setGuests] = useState(item.kind === "HOTEL" ? 2 : 2)

  const guestForm = useForm<BookingGuestInput>({
    resolver: zodResolver(bookingGuestSchema),
    defaultValues: {
      contactName: user.name ?? "",
      contactEmail: user.email ?? "",
      contactPhone: user.phone ?? "",
      nationality: user.nationality ?? "",
      passportNo: user.passportNo ?? "",
      specialRequests: "",
    },
  })

  const price = useMemo(
    () =>
      calculatePrice({
        kind: item.kind,
        unitPrice: item.unitPrice,
        currency: item.currency,
        checkIn,
        checkOut,
        guests,
      }),
    [item, checkIn, checkOut, guests]
  )

  const guestLabel =
    item.kind === "TOUR"
      ? "Travellers"
      : item.kind === "HOTEL"
        ? "Guests"
        : "Passengers"

  const endLabel =
    item.kind === "HOTEL"
      ? "Check-out"
      : item.kind === "CAR"
        ? "Return date"
        : "End date"

  // Tours have a fixed length — the end date follows the start date.
  const onCheckInChange = (value: string) => {
    setCheckIn(value)
    if (item.fixedDays) {
      setCheckOut(addDaysISO(value, item.fixedDays))
    } else if (new Date(value) >= new Date(checkOut)) {
      setCheckOut(addDaysISO(value, 1))
    }
  }

  const goToPayment = async () => {
    setError(null)

    if (!terms) {
      setError("Please accept the terms and conditions to continue.")
      return
    }

    // Re-use the booking if the traveller steps back and forward again.
    if (booking) {
      setStep(4)
      return
    }

    setCreating(true)
    try {
      const values = guestForm.getValues()
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingType: item.kind,
          itemId: item.id,
          checkIn,
          checkOut,
          guests,
          ...values,
        }),
      })

      const data = (await response.json()) as {
        booking?: { id: string; reference: string }
        error?: string
      }

      if (!response.ok || !data.booking) {
        setError(data.error ?? "We couldn't create your booking.")
        return
      }

      setBooking(data.booking)
      setStep(4)
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setCreating(false)
    }
  }

  if (confirmedRef) {
    return (
      <Confirmation
        reference={confirmedRef}
        item={item}
        checkIn={checkIn}
        checkOut={checkOut}
        guests={guests}
        total={price.total}
        currency={price.currency}
        cash={paidInCash}
      />
    )
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:gap-14">
      <div className="min-w-0">
        {/* Step indicator */}
        <ol className="mb-10 flex items-center gap-2">
          {STEPS.map((entry, index) => {
            const done = step > entry.id
            const active = step === entry.id
            return (
              <li key={entry.id} className="flex flex-1 items-center gap-2">
                <div
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
                    done
                      ? "border-lapis bg-lapis text-white"
                      : active
                        ? "border-lapis bg-lapis/10 text-lapis"
                        : "border-border bg-papyrus text-muted-foreground"
                  )}
                >
                  {done ? <Check className="size-4" /> : entry.id}
                </div>
                <span
                  className={cn(
                    "hidden text-xs font-medium sm:block",
                    active ? "text-basalt" : "text-muted-foreground"
                  )}
                >
                  {entry.label}
                </span>
                {index < STEPS.length - 1 && (
                  <span
                    className={cn(
                      "h-px flex-1",
                      done ? "bg-lapis" : "bg-border"
                    )}
                  />
                )}
              </li>
            )
          })}
        </ol>

        {error && (
          <p className="mb-6 flex items-start gap-2 rounded-lg bg-destructive/10 p-3.5 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            {error}
          </p>
        )}

        {/* Step 1 — dates & guests */}
        {step === 1 && (
          <section>
            <h2 className="font-heading text-2xl">When are you travelling?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {item.fixedDays
                ? `This tour runs for ${item.fixedDays} days — pick your start date and we'll set the rest.`
                : "Choose your dates and party size. The price updates as you go."}
            </p>

            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="checkIn">
                  {item.kind === "HOTEL" ? "Check-in" : "Start date"}
                </Label>
                <Input
                  id="checkIn"
                  type="date"
                  min={todayISO()}
                  value={checkIn}
                  onChange={(event) => onCheckInChange(event.target.value)}
                  className="mt-2 h-11"
                />
              </div>

              <div>
                <Label htmlFor="checkOut">{endLabel}</Label>
                <Input
                  id="checkOut"
                  type="date"
                  min={addDaysISO(checkIn, 1)}
                  value={checkOut}
                  disabled={Boolean(item.fixedDays)}
                  onChange={(event) => setCheckOut(event.target.value)}
                  className="mt-2 h-11"
                />
                {item.fixedDays && (
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    Set automatically from the tour length.
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="guests">{guestLabel}</Label>
                <select
                  id="guests"
                  value={guests}
                  onChange={(event) => setGuests(Number(event.target.value))}
                  className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-lapis focus-visible:ring-3 focus-visible:ring-lapis/20"
                >
                  {Array.from({ length: item.maxGuests }, (_, i) => i + 1).map(
                    (value) => (
                      <option key={value} value={value}>
                        {value} {value === 1 ? "person" : "people"}
                      </option>
                    )
                  )}
                </select>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Maximum {item.maxGuests} for this {item.kind.toLowerCase()}.
                </p>
              </div>
            </div>

            <div className="mt-10 flex justify-end">
              <Button
                className="h-12 gap-2 bg-lapis px-7 text-white hover:bg-lapis-deep"
                onClick={() => {
                  if (new Date(checkOut) <= new Date(checkIn)) {
                    setError("The end date must be after the start date.")
                    return
                  }
                  setError(null)
                  setStep(2)
                }}
              >
                Continue
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </section>
        )}

        {/* Step 2 — traveller details */}
        {step === 2 && (
          <section>
            <h2 className="font-heading text-2xl">Who is travelling?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We use these details for hotel registration and airport permits.
            </p>

            <form
              className="mt-8 space-y-5"
              onSubmit={guestForm.handleSubmit(() => {
                setError(null)
                setStep(3)
              })}
              noValidate
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <Label htmlFor="contactName">Full name</Label>
                  <Input
                    id="contactName"
                    className="mt-2 h-11"
                    {...guestForm.register("contactName")}
                  />
                  <FieldError
                    message={guestForm.formState.errors.contactName?.message}
                  />
                </div>

                <div>
                  <Label htmlFor="contactEmail">Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    className="mt-2 h-11"
                    {...guestForm.register("contactEmail")}
                  />
                  <FieldError
                    message={guestForm.formState.errors.contactEmail?.message}
                  />
                </div>

                <div>
                  <Label htmlFor="contactPhone">Phone (with country code)</Label>
                  <Input
                    id="contactPhone"
                    placeholder="+1 555 0100"
                    className="mt-2 h-11"
                    {...guestForm.register("contactPhone")}
                  />
                  <FieldError
                    message={guestForm.formState.errors.contactPhone?.message}
                  />
                </div>

                <div>
                  <Label htmlFor="nationality">Nationality</Label>
                  <select
                    id="nationality"
                    className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-lapis focus-visible:ring-3 focus-visible:ring-lapis/20"
                    {...guestForm.register("nationality")}
                  >
                    <option value="">Select…</option>
                    {NATIONALITIES.map((nationality) => (
                      <option key={nationality} value={nationality}>
                        {nationality}
                      </option>
                    ))}
                  </select>
                  <FieldError
                    message={guestForm.formState.errors.nationality?.message}
                  />
                </div>

                <div className="sm:col-span-2">
                  <Label htmlFor="passportNo">Passport number (optional)</Label>
                  <Input
                    id="passportNo"
                    className="mt-2 h-11"
                    {...guestForm.register("passportNo")}
                  />
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    Needed for Nile cruises and domestic flights — you can send
                    it later.
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <Label htmlFor="specialRequests">Special requests</Label>
                  <Textarea
                    id="specialRequests"
                    rows={4}
                    placeholder="Dietary needs, accessibility, celebrations, preferred pace…"
                    className="mt-2"
                    {...guestForm.register("specialRequests")}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  className="h-12 gap-2"
                  onClick={() => setStep(1)}
                >
                  <ArrowLeft className="size-4" />
                  Back
                </Button>
                <Button
                  type="submit"
                  className="h-12 gap-2 bg-lapis px-7 text-white hover:bg-lapis-deep"
                >
                  Review booking
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </form>
          </section>
        )}

        {/* Step 3 — review */}
        {step === 3 && (
          <section>
            <h2 className="font-heading text-2xl">Check everything over</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Nothing is charged yet. On the next step you choose to pay by card now or in cash on the day.
            </p>

            <dl className="mt-8 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-papyrus">
              <Row label={item.kind === "TOUR" ? "Tour" : item.kind === "HOTEL" ? "Hotel" : "Vehicle"} value={item.name} />
              <Row
                label={item.kind === "HOTEL" ? "Check-in" : "Start"}
                value={formatDate(checkIn, "long")}
              />
              <Row label={endLabel} value={formatDate(checkOut, "long")} />
              <Row label={guestLabel} value={String(guests)} />
              <Row
                label="Lead traveller"
                value={guestForm.getValues("contactName")}
              />
              <Row label="Email" value={guestForm.getValues("contactEmail")} />
              <Row label="Phone" value={guestForm.getValues("contactPhone")} />
              {guestForm.getValues("nationality") && (
                <Row
                  label="Nationality"
                  value={guestForm.getValues("nationality")!}
                />
              )}
              {guestForm.getValues("specialRequests") && (
                <Row
                  label="Requests"
                  value={guestForm.getValues("specialRequests")!}
                />
              )}
            </dl>

            <label className="mt-7 flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-papyrus p-5">
              <Checkbox
                checked={terms}
                onCheckedChange={(value) => setTerms(value === true)}
                className="mt-0.5"
              />
              <span className="text-sm leading-relaxed text-muted-foreground">
                I accept the booking terms: free cancellation up to 14 days
                before the start date, 50% refundable up to 7 days before, and
                non-refundable inside 7 days. I confirm the details above are
                correct.
              </span>
            </label>

            <div className="mt-8 flex items-center justify-between">
              <Button
                type="button"
                variant="ghost"
                className="h-12 gap-2"
                onClick={() => setStep(2)}
              >
                <ArrowLeft className="size-4" />
                Back
              </Button>
              <Button
                type="button"
                disabled={creating}
                className="h-12 gap-2 bg-lapis px-7 text-white hover:bg-lapis-deep"
                onClick={goToPayment}
              >
                {creating ? "Preparing…" : "Continue to payment"}
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </section>
        )}

        {/* Step 4 — payment */}
        {step === 4 && booking && (
          <section>
            <h2 className="font-heading text-2xl">Payment</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Booking reference{" "}
              <span className="font-medium text-basalt">{booking.reference}</span>
            </p>

            <fieldset className="mt-8">
              <legend className="text-sm font-medium">How would you like to pay?</legend>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {(
                  [
                    { value: "CARD", icon: CreditCard, title: "Pay now by card", body: "Secure card payment through Stripe. Your booking is confirmed straight away." },
                    { value: "CASH", icon: Banknote, title: "Pay in cash on the day", body: "Your booking is confirmed now and you pay the full amount in cash when your trip starts." },
                  ] as const
                ).map((option) => (
                  <label
                    key={option.value}
                    className={cn(
                      "flex cursor-pointer gap-3 rounded-xl border bg-papyrus p-4 transition-colors has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-lapis/30",
                      method === option.value ? "border-lapis bg-accent" : "border-border hover:border-lapis/40"
                    )}
                  >
                    <input
                      type="radio"
                      name="payment-method"
                      value={option.value}
                      checked={method === option.value}
                      onChange={() => {
                        setError(null)
                        setMethod(option.value)
                      }}
                      className="mt-1 size-4 accent-lapis"
                    />
                    <span>
                      <span className="flex items-center gap-2 font-medium">
                        <option.icon className="size-4 text-lapis" />
                        {option.title}
                      </span>
                      <span className="mt-1 block text-sm text-muted-foreground">{option.body}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="mt-8">
              {method === "CARD" ? (
                <StripeCheckout
                  bookingId={booking.id}
                  amount={price.total}
                  currency={price.currency}
                  onPaid={(reference) => {
                    setConfirmedRef(reference)
                    router.refresh()
                  }}
                />
              ) : (
                <div className="rounded-xl border border-border bg-papyrus p-5">
                  <p className="text-sm">
                    You&apos;ll pay{" "}
                    <span className="font-heading text-xl text-lapis">{formatPrice(price.total, price.currency)}</span>{" "}
                    in cash on the first day. Your coordinator confirms who to pay and when.
                  </p>
                  <Button
                    type="button"
                    size="lg"
                    className="mt-4 h-12 px-7"
                    disabled={reserving}
                    onClick={reserveWithCash}
                  >
                    <Banknote />
                    {reserving ? "Confirming…" : "Confirm booking, pay in cash"}
                  </Button>
                </div>
              )}
            </div>

            <Button
              type="button"
              variant="ghost"
              className="mt-8 h-12 gap-2"
              onClick={() => setStep(3)}
            >
              <ArrowLeft className="size-4" />
              Back to review
            </Button>
          </section>
        )}
      </div>

      {/* Summary */}
      <aside className="lg:sticky lg:top-28 lg:h-fit">
        <div className="overflow-hidden rounded-2xl border border-border bg-papyrus">
          <div className="relative aspect-[16/10]">
            <Image
              src={item.imageUrl}
              alt={item.name}
              fill
              sizes="(min-width: 1024px) 33vw, 100vw"
              className="object-cover"
            />
          </div>

          <div className="p-6">
            <p className="text-xs tracking-[0.14em] text-muted-foreground uppercase">
              {item.regionName}
            </p>
            <h3 className="mt-1.5 font-heading text-xl leading-snug">
              <Link href={item.href} className="hover:text-lapis">
                {item.name}
              </Link>
            </h3>

            <dl className="mt-6 space-y-3 border-t border-border pt-5 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Dates</dt>
                <dd className="text-right font-medium">
                  {formatDate(checkIn)} → {formatDate(checkOut)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">{guestLabel}</dt>
                <dd className="font-medium">{guests}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">
                  {formatPrice(price.unitPrice, price.currency, { compact: true })}
                  {" × "}
                  {price.units} {price.unitLabel}
                </dt>
                <dd className="font-medium">
                  {formatPrice(price.subtotal, price.currency)}
                </dd>
              </div>
            </dl>

            <div className="mt-5 flex items-baseline justify-between border-t border-border pt-5">
              <span className="font-medium">Total</span>
              <span className="font-heading text-3xl text-lapis">
                {formatPrice(price.total, price.currency)}
              </span>
            </div>

            <p className="mt-3 text-xs text-muted-foreground">
              All taxes and service charges included.
            </p>
          </div>
        </div>
      </aside>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 px-6 py-4 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="max-w-[60%] text-right font-medium">{value}</dd>
    </div>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1.5 text-xs text-destructive">{message}</p>
}

function Confirmation({
  reference,
  item,
  checkIn,
  checkOut,
  guests,
  total,
  currency,
  cash = false,
}: {
  reference: string
  item: BookingItem
  checkIn: string
  checkOut: string
  guests: number
  total: number
  currency: string
  cash?: boolean
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-faience/10 text-faience">
        <PartyPopper className="size-7" />
      </div>

      <h2 className="mt-7 font-heading text-3xl sm:text-4xl">
        Your booking is confirmed
      </h2>
      <p className="mt-4 leading-relaxed text-muted-foreground">
        We&apos;ve emailed your confirmation. A trip coordinator will be in touch
        within one business day to arrange timings and pickup details.
      </p>

      <div className="mt-9 rounded-2xl border border-border bg-papyrus p-7 text-left">
        <p className="text-center text-xs tracking-[0.16em] text-muted-foreground uppercase">
          Booking reference
        </p>
        <p className="mt-2 text-center font-heading text-3xl tracking-wide text-lapis">
          {reference}
        </p>

        <dl className="mt-7 space-y-3 border-t border-border pt-6 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Booking</dt>
            <dd className="text-right font-medium">{item.name}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Dates</dt>
            <dd className="font-medium">
              {formatDate(checkIn)} → {formatDate(checkOut)}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Guests</dt>
            <dd className="font-medium">{guests}</dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-border pt-3">
            <dt className="font-medium">{cash ? "To pay in cash on the day" : "Paid"}</dt>
            <dd className="font-heading text-xl text-lapis">
              {formatPrice(total, currency)}
            </dd>
          </div>
        </dl>
      </div>

      <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
        <ButtonLink
          href="/account/bookings"
          className="h-12 bg-lapis px-7 text-white hover:bg-lapis-deep"
        >
          View my bookings
        </ButtonLink>
        <ButtonLink href="/tours" variant="outline" className="h-12 px-7">
          Keep exploring
        </ButtonLink>
      </div>
    </div>
  )
}
