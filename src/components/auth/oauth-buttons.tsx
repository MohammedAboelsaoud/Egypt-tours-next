"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"

import { Button } from "@/components/ui/button"

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.06 12.25c0-.85-.08-1.67-.22-2.45H12v4.63h6.2a5.3 5.3 0 0 1-2.3 3.48v2.9h3.72c2.18-2 3.44-4.96 3.44-8.56Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.11 0 5.72-1.03 7.62-2.79l-3.72-2.89c-1.03.69-2.35 1.1-3.9 1.1-3 0-5.55-2.02-6.46-4.75H1.69v2.98A11.99 11.99 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.54 14.67a7.2 7.2 0 0 1 0-4.6V7.09H1.69a12 12 0 0 0 0 10.56l3.85-2.98Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.69 0 3.21.58 4.4 1.72l3.3-3.3C17.71 1.2 15.1 0 12 0 7.44 0 3.5 2.62 1.69 6.44l3.85 2.98C6.45 6.77 9 4.75 12 4.75Z"
      />
    </svg>
  )
}

function FacebookMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 fill-[#1877F2]" aria-hidden="true">
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.52 1.5-3.91 3.77-3.91 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.89h2.78l-.45 2.91h-2.33V22c4.78-.76 8.44-4.92 8.44-9.94Z" />
    </svg>
  )
}

export function OAuthButtons({
  providers,
  callbackUrl = "/",
}: {
  providers: { google: boolean; facebook: boolean }
  callbackUrl?: string
}) {
  const [loading, setLoading] = useState<string | null>(null)

  if (!providers.google && !providers.facebook) return null

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        {providers.google && (
          <Button
            type="button"
            variant="outline"
            className="h-11 gap-2"
            disabled={loading !== null}
            onClick={() => {
              setLoading("google")
              void signIn("google", { callbackUrl })
            }}
          >
            <GoogleMark />
            {loading === "google" ? "Redirecting…" : "Google"}
          </Button>
        )}

        {providers.facebook && (
          <Button
            type="button"
            variant="outline"
            className="h-11 gap-2"
            disabled={loading !== null}
            onClick={() => {
              setLoading("facebook")
              void signIn("facebook", { callbackUrl })
            }}
          >
            <FacebookMark />
            {loading === "facebook" ? "Redirecting…" : "Facebook"}
          </Button>
        )}
      </div>

      <div className="my-6 flex items-center gap-4">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs tracking-[0.14em] text-muted-foreground uppercase">
          or
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>
    </>
  )
}
