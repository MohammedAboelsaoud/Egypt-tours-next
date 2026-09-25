"use client"

import { useActionState } from "react"
import { CheckCircle2 } from "lucide-react"

import { saveSettings, type AdminState } from "@/actions/admin"
import {
  FormSection,
  TextField,
  TextareaField,
} from "@/components/admin/form-fields"
import { Button } from "@/components/ui/button"
import type { SiteSettings } from "@/lib/settings"
import { cn } from "@/lib/utils"

export function SettingsForm({
  settings,
  hotelMarkupPercent,
  integrations,
}: {
  settings: SiteSettings
  hotelMarkupPercent: number
  integrations: {
    stripe: boolean
    stripeWebhook: boolean
    resend: boolean
    cloudinary: boolean
    maps: boolean
    google: boolean
    facebook: boolean
  }
}) {
  const [state, formAction, pending] = useActionState<AdminState, FormData>(
    saveSettings,
    null
  )

  const rows = [
    { label: "Stripe payments", ok: integrations.stripe, env: "STRIPE_SECRET_KEY" },
    {
      label: "Stripe webhook",
      ok: integrations.stripeWebhook,
      env: "STRIPE_WEBHOOK_SECRET",
    },
    { label: "Resend email", ok: integrations.resend, env: "RESEND_API_KEY" },
    {
      label: "Cloudinary uploads",
      ok: integrations.cloudinary,
      env: "CLOUDINARY_CLOUD_NAME",
    },
    {
      label: "Google Maps",
      ok: integrations.maps,
      env: "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY",
    },
    { label: "Google sign-in", ok: integrations.google, env: "AUTH_GOOGLE_ID" },
    {
      label: "Facebook sign-in",
      ok: integrations.facebook,
      env: "AUTH_FACEBOOK_ID",
    },
  ]

  return (
    <form action={formAction} className="space-y-6">
      <FormSection title="Site identity">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            name="siteName"
            label="Site name"
            required
            defaultValue={settings.siteName}
          />
          <TextField
            name="tagline"
            label="Tagline"
            defaultValue={settings.tagline}
          />
        </div>
      </FormSection>

      <FormSection
        title="Contact details"
        description="Shown in the header, footer and contact page."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            name="contactEmail"
            label="Contact email"
            type="email"
            required
            defaultValue={settings.contactEmail}
          />
          <TextField
            name="contactPhone"
            label="Contact phone"
            defaultValue={settings.contactPhone}
          />
          <TextField
            name="whatsappNumber"
            label="WhatsApp number"
            defaultValue={settings.whatsappNumber}
            hint="Digits only, including country code — e.g. 201029350015"
          />
          <TextField
            name="address"
            label="Office address"
            defaultValue={settings.address}
          />
          <TextField
            name="facebookUrl"
            label="Facebook URL"
            defaultValue={settings.facebookUrl}
            placeholder="https://facebook.com/…"
          />
          <TextField
            name="instagramUrl"
            label="Instagram URL"
            defaultValue={settings.instagramUrl}
            placeholder="https://instagram.com/…"
          />
        </div>
      </FormSection>

      <FormSection
        title="Pricing"
        description="Each hotel stores its official rate. Travellers see and pay that rate plus this markup."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            name="hotelMarkupPercent"
            label="Hotel markup (%)"
            type="number"
            min={0}
            max={100}
            step="0.5"
            required
            defaultValue={hotelMarkupPercent}
            hint="e.g. 10 — an official rate of $200 is shown as $220"
          />
        </div>
      </FormSection>

      <FormSection
        title="Integration status"
        description="Read-only — driven by the environment variables on this deployment."
      >
        <ul className="divide-y divide-border rounded-xl border border-border bg-background">
          {rows.map((row) => (
            <li
              key={row.label}
              className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
            >
              <span>
                {row.label}
                <code className="ml-2 rounded bg-muted px-1.5 py-0.5 text-[0.7rem] text-muted-foreground">
                  {row.env}
                </code>
              </span>
              <span
                className={cn(
                  "rounded-full px-2.5 py-1 text-xs font-medium",
                  row.ok
                    ? "bg-faience/12 text-faience"
                    : "bg-amber-500/12 text-amber-700"
                )}
              >
                {row.ok ? "Connected" : "Not configured"}
              </span>
            </li>
          ))}
        </ul>
      </FormSection>

      <div className="flex items-center justify-end gap-4">
        {state && (
          <p
            className={cn(
              "flex items-center gap-2 text-sm",
              state.ok ? "text-faience" : "text-destructive"
            )}
          >
            {state.ok && <CheckCircle2 className="size-4" />}
            {state.message}
          </p>
        )}
        <Button
          type="submit"
          disabled={pending}
          className="h-11 bg-lapis px-7 text-white hover:bg-lapis-deep"
        >
          {pending ? "Saving…" : "Save settings"}
        </Button>
      </div>
    </form>
  )
}
