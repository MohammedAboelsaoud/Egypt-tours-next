"use client"

import { signOut } from "next-auth/react"

/**
 * Signs out and goes to `path` on this site. Auth.js's own redirect builds a
 * full address from AUTH_URL/NEXTAUTH_URL, so a stale value there sends people
 * to another domain. This clears the session without redirecting, then does a
 * full reload of a same-site path (so nothing signed-in stays in memory).
 */
export async function signOutTo(path = "/") {
  await signOut({ redirect: false })
  window.location.assign(path)
}
