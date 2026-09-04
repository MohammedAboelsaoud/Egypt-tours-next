import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { Suspense } from "react"

import { LoginForm } from "@/components/auth/login-form"
import { auth, enabledOAuthProviders } from "@/lib/auth"

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Egypt Journeys account.",
  robots: { index: false, follow: false },
}

export default async function LoginPage() {
  const session = await auth()
  if (session?.user) redirect("/account")

  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-muted" />}>
      <LoginForm providers={enabledOAuthProviders} />
    </Suspense>
  )
}
