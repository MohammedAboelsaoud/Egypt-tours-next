"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState, useTransition } from "react"
import { useSession } from "next-auth/react"
import { Heart } from "lucide-react"
import { toast } from "sonner"

import { isWishlisted, toggleWishlist } from "@/actions/wishlist"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function WishlistButton({
  tourId,
  className,
  label = true,
}: {
  tourId: string
  className?: string
  label?: boolean
}) {
  const { status } = useSession()
  const router = useRouter()
  const [saved, setSaved] = useState(false)
  const [pending, startTransition] = useTransition()

  /**
   * Tour pages are ISR-cached and shared between visitors, so the saved state
   * cannot come from the server render — it is resolved per viewer instead.
   */
  useEffect(() => {
    if (status !== "authenticated") {
      setSaved(false)
      return
    }

    let active = true
    void isWishlisted(tourId).then((result) => {
      if (active) setSaved(result)
    })
    return () => {
      active = false
    }
  }, [status, tourId])

  const onClick = () => {
    if (status !== "authenticated") {
      toast.info("Sign in to save tours to your wishlist.")
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`)
      return
    }

    // Optimistic — reverted if the server disagrees.
    const next = !saved
    setSaved(next)

    startTransition(async () => {
      const result = await toggleWishlist(tourId)
      if (!result.ok) {
        setSaved(!next)
        toast.error(result.message ?? "Something went wrong")
        return
      }
      toast.success(result.message ?? "Wishlist updated")
    })
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      disabled={pending}
      aria-pressed={saved}
      className={cn("h-12 gap-2", className)}
    >
      <Heart className={cn("size-4", saved && "fill-lapis text-lapis")} />
      {label && (saved ? "Saved" : "Save for later")}
    </Button>
  )
}
