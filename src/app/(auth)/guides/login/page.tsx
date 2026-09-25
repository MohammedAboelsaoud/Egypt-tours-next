import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { GuideLoginForm } from "@/components/guides/guide-login-form"
import { auth } from "@/lib/auth"

export const metadata: Metadata = {
  title: "Guide sign in",
  description: "Sign in to your Egypt Journeys guide account.",
  robots: { index: false, follow: false },
}

export default async function GuideLoginPage() {
  const session = await auth()
  if (session?.user?.role === "GUIDE") redirect("/guide")

  return <GuideLoginForm />
}
