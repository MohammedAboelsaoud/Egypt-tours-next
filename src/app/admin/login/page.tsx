import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ShieldCheck } from "lucide-react"

import { AdminLoginForm } from "@/components/admin/login-form"
import { auth } from "@/lib/auth"

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
}

export default async function AdminLoginPage() {
  const session = await auth()
  if (session?.user?.role === "ADMIN") redirect("/admin")

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-5 py-12">
      <div className="w-full max-w-md">
        <div className="text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-gold/15 text-gold-light">
            <ShieldCheck className="size-5" />
          </div>
          <h1 className="mt-6 font-heading text-3xl text-white">
            Egypt <span className="text-gold-light">Journeys</span>
          </h1>
          <p className="mt-2 text-xs tracking-[0.22em] text-white/50 uppercase">
            Admin dashboard
          </p>
        </div>

        <div className="mt-9 rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur-sm">
          <AdminLoginForm />
        </div>

        <p className="mt-6 text-center text-sm text-white/50">
          <Link href="/" className="hover:text-gold-light">
            ← Back to the website
          </Link>
        </p>
      </div>
    </div>
  )
}
