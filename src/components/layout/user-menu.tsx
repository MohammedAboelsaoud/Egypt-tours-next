"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import {
  CalendarCheck,
  Heart,
  LayoutDashboard,
  LogOut,
  User as UserIcon,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ButtonLink } from "@/components/ui/button-link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signOutTo } from "@/lib/sign-out"
import { cn, initials } from "@/lib/utils"

export function UserMenu({ solid = true }: { solid?: boolean }) {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <div className="size-9 animate-pulse rounded-full bg-muted" />
  }

  if (!session?.user) {
    return (
      <ButtonLink href="/login" variant="ghost"
        size="lg"
        className={cn(
          "h-10 px-3",
          solid ? "text-basalt/80 hover:text-lapis" : "text-white/90 hover:bg-white/10 hover:text-white"
        )}>
        Sign in
      </ButtonLink>
    )
  }

  const user = session.user

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className={cn(
              "flex items-center gap-2 rounded-full p-0.5 transition-colors",
              solid ? "hover:bg-muted" : "hover:bg-white/10"
            )}
            aria-label="Account menu"
          />
        }
      >
        <Avatar className="size-9">
          <AvatarImage src={user.image ?? undefined} alt={user.name ?? "Account"} />
          <AvatarFallback className="bg-lapis/15 text-xs font-semibold text-lapis">
            {initials(user.name)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        {/* Base UI throws if a menu label isn't inside a group. */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col gap-0.5">
            <span className="font-medium">{user.name ?? "Traveller"}</span>
            <span className="truncate text-xs font-normal text-muted-foreground">
              {user.email}
            </span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />

        {user.role === "ADMIN" && (
          <>
            <DropdownMenuItem render={<Link href="/admin" />}>
              <LayoutDashboard className="size-4" />
              Admin dashboard
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuItem render={<Link href="/account" />}>
          <UserIcon className="size-4" />
          My profile
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/account/bookings" />}>
          <CalendarCheck className="size-4" />
          My bookings
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/account/wishlist" />}>
          <Heart className="size-4" />
          Wishlist
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => signOutTo()}
        >
          <LogOut className="size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
