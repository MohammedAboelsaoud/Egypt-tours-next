import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { AdminSidebar } from "@/components/admin/sidebar"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Egypt Journeys Admin" },
  robots: { index: false, follow: false },
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) redirect("/admin/login")
  if (session.user.role !== "ADMIN") redirect("/")

  const [pendingInquiries, pendingReviews] = await Promise.all([
    prisma.inquiry.count({ where: { handled: false } }),
    prisma.review.count({ where: { approved: false } }),
  ])

  return (
    <div className="min-h-screen bg-sand">
      <AdminSidebar
        pendingInquiries={pendingInquiries}
        pendingReviews={pendingReviews}
      />
      <div className="lg:pl-64">
        <main className="mx-auto w-full max-w-6xl px-5 py-8 pt-18 sm:px-8 lg:pt-10">
          {children}
        </main>
      </div>
    </div>
  )
}
