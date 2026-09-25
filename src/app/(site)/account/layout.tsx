import { redirect } from "next/navigation"

import { AccountNav } from "@/components/account/account-nav"
import { auth } from "@/lib/auth"

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user) redirect("/login?callbackUrl=/account")

  return (
    <div className="border-b border-border bg-limestone">
      <div className="container-page pt-28 pb-20 sm:pt-32">
        <header className="mb-10">
          <p className="eyebrow">My account</p>
          <h1 className="mt-3 font-heading text-3xl sm:text-4xl">
            {session.user.name ?? "Welcome back"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {session.user.email}
          </p>
        </header>

        <div className="grid gap-10 lg:grid-cols-[240px_1fr] lg:gap-14">
          <AccountNav isAdmin={session.user.role === "ADMIN"} />
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </div>
  )
}
