import type { Metadata } from "next"

import { SettingsForm } from "@/components/admin/settings-form"
import { AdminHeader } from "@/components/admin/ui"
import { getSettings } from "@/lib/settings"

export const metadata: Metadata = { title: "Settings" }

export default async function AdminSettingsPage() {
  const settings = await getSettings()

  const integrations = {
    paypal: Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET),
    resend: Boolean(process.env.RESEND_API_KEY),
    cloudinary: Boolean(
      process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
    ),
    maps: Boolean(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY),
    google: Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET),
    facebook: Boolean(
      process.env.AUTH_FACEBOOK_ID && process.env.AUTH_FACEBOOK_SECRET
    ),
  }

  return (
    <>
      <AdminHeader
        title="Settings"
        description="Site-wide details used across the public website."
      />
      <SettingsForm settings={settings} integrations={integrations} />
    </>
  )
}
