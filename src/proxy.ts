import { NextResponse, type NextRequest } from "next/server"

/**
 * Fast redirect for signed-out visitors hitting protected areas.
 * Roles are re-checked properly in the layouts and server actions — this only
 * saves a round trip, so a cookie check is enough here.
 */
const PROTECTED = ["/account", "/book", "/admin"]

const SESSION_COOKIES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // The admin sign-in page must stay reachable while signed out.
  if (pathname === "/admin/login") return NextResponse.next()

  const needsAuth = PROTECTED.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )
  if (!needsAuth) return NextResponse.next()

  const hasSession = SESSION_COOKIES.some((name) =>
    Boolean(request.cookies.get(name)?.value)
  )
  if (hasSession) return NextResponse.next()

  const loginUrl = new URL(
    pathname.startsWith("/admin") ? "/admin/login" : "/login",
    request.url
  )
  if (!pathname.startsWith("/admin")) {
    loginUrl.searchParams.set("callbackUrl", pathname)
  }

  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ["/account/:path*", "/book/:path*", "/admin/:path*"],
}
