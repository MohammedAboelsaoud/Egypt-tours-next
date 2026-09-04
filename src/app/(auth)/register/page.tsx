import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { Suspense } from "react"

import { RegisterForm } from "@/components/auth/register-form"
import { auth, enabledOAuthProviders } from "@/lib/auth"

export const metadata: Metadata = {
  title: "Create an account",
  description: "Create an Egypt Journeys account to book tours, hotels and cars.",
  robots: { index: false, follow: false },
}

export default async function RegisterPage() {
  const session = await auth()
  if (session?.user) redirect("/account")

  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-muted" />}>
      <RegisterForm providers={enabledOAuthProviders} />
    </Suspense>
  )
}
