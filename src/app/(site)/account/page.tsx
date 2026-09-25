import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { ProfileForm } from "@/components/account/profile-form"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const metadata: Metadata = {
  title: "My profile",
  robots: { index: false, follow: false },
}

export default async function AccountPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login?callbackUrl=/account")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      phone: true,
      nationality: true,
      passportNo: true,
      languages: true,
    },
  })

  if (!user) redirect("/login")

  return (
    <div className="rounded-2xl border border-border bg-papyrus p-7 sm:p-9">
      <h2 className="font-heading text-2xl">Your details</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        We pre-fill these on every booking and guide request, so you only type them once.
      </p>

      <div className="mt-8">
        <ProfileForm user={{ ...user, languages: user.languages ?? [] }} />
      </div>
    </div>
  )
}
