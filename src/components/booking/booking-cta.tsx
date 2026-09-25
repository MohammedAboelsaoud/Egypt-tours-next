import { MessageCircle, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ButtonLink } from "@/components/ui/button-link"
import { formatPrice } from "@/lib/utils"

/** Sticky price + book panel shared by tour, hotel and car detail pages. */
export function BookingCta({
  price,
  currency,
  unit,
  bookHref,
  facts,
  whatsapp,
  itemName,
  children,
  disabled = false,
  disabledLabel = "Currently unavailable",
}: {
  price: number
  currency: string
  unit: string
  bookHref: string
  facts: { label: string; value: string }[]
  whatsapp: string
  itemName: string
  children?: React.ReactNode
  disabled?: boolean
  disabledLabel?: string
}) {
  const waHref = `https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
    `Hello! I'd like to ask about "${itemName}".`
  )}`

  return (
    <aside className="lg:sticky lg:top-28">
      <div className="overflow-hidden rounded-2xl border border-border bg-papyrus shadow-sm">
        <div className="border-b border-border bg-gradient-to-br from-lapis/10 to-transparent p-6">
          <p className="text-[0.65rem] tracking-[0.16em] text-muted-foreground uppercase">
            From
          </p>
          <p className="mt-1 flex items-baseline gap-2">
            <span className="font-heading text-4xl text-lapis">
              {formatPrice(price, currency, { compact: true })}
            </span>
            <span className="text-sm text-muted-foreground">{unit}</span>
          </p>
        </div>

        <dl className="divide-y divide-border">
          {facts.map((fact) => (
            <div
              key={fact.label}
              className="flex items-center justify-between gap-4 px-6 py-3.5 text-sm"
            >
              <dt className="text-muted-foreground">{fact.label}</dt>
              <dd className="text-right font-medium">{fact.value}</dd>
            </div>
          ))}
        </dl>

        <div className="space-y-3 p-6 pt-5">
          {disabled ? (
            <Button disabled className="h-12 w-full">
              {disabledLabel}
            </Button>
          ) : (
            <ButtonLink
              href={bookHref}
              className="h-12 w-full bg-lapis text-base text-white hover:bg-lapis-deep"
            >
              Book now
            </ButtonLink>
          )}

          {children}

          <ButtonLink href={waHref} external variant="outline"
            className="h-12 w-full gap-2">
            <MessageCircle className="size-4" />
            Ask a question
          </ButtonLink>

          <p className="flex items-start gap-2 pt-2 text-xs leading-relaxed text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-faience" />
            Secure card checkout by Stripe. Free cancellation up to 14 days before
            departure.
          </p>
        </div>
      </div>
    </aside>
  )
}
