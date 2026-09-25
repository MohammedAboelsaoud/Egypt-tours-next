import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { GuideSignupForm } from "@/components/guides/guide-signup-form"
import { PageHero } from "@/components/layout/page-hero"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const metadata: Metadata = {
  title: "Apply to guide",
  description: "Create your guide profile on Egypt Journeys and receive trip requests from travellers.",
  alternates: { canonical: "/guides/register" },
}

export default async function GuideRegisterPage() {
  const session = await auth()
  if (session?.user?.role === "GUIDE") redirect("/guide")

  const regions = await prisma.region.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true },
  })

  return (
    <>
      <PageHero
        eyebrow="For guides"
        title="Apply to guide with us"
        description="One form: your account and the profile travellers will see. Our team reviews it, then requests start coming in."
        crumbs={[{ label: "Guides", href: "/guides" }, { label: "Apply" }]}
      />
      <div className="container-page section-y">
        <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-papyrus p-7 sm:p-10">
          {session?.user ? (
            <p className="text-sm text-muted-foreground">
              You&apos;re signed in with a traveller account. Sign out first, then apply
              with the email you&apos;ll use for guiding.
            </p>
          ) : (
            <GuideSignupForm regions={regions} />
          )}
        </div>
      </div>
    </>
  )
}
