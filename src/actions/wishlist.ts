"use server"

import { revalidatePath } from "next/cache"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export type ActionResult = { ok: boolean; message?: string; data?: unknown }

/** Adds or removes a tour from the signed-in user's wishlist. */
export async function toggleWishlist(tourId: string): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, message: "Please sign in to save tours." }
  }

  const existing = await prisma.wishlist.findUnique({
    where: { userId_tourId: { userId: session.user.id, tourId } },
  })

  if (existing) {
    await prisma.wishlist.delete({ where: { id: existing.id } })
    revalidatePath("/account/wishlist")
    return { ok: true, message: "Removed from your wishlist", data: { saved: false } }
  }

  await prisma.wishlist.create({ data: { userId: session.user.id, tourId } })
  revalidatePath("/account/wishlist")
  return { ok: true, message: "Saved to your wishlist", data: { saved: true } }
}

export async function isWishlisted(tourId: string): Promise<boolean> {
  const session = await auth()
  if (!session?.user?.id) return false

  const row = await prisma.wishlist.findUnique({
    where: { userId_tourId: { userId: session.user.id, tourId } },
  })
  return Boolean(row)
}
