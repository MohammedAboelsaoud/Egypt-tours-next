"use client"

import Link from "next/link"
import { useEffect } from "react"
import { RefreshCw } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[app-error]", error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center bg-limestone px-5 py-20">
      <div className="max-w-lg text-center">
        <p className="eyebrow">Something went wrong</p>
        <h1 className="mt-4 font-heading text-3xl text-balance sm:text-4xl">
          We hit a problem loading this page
        </h1>
        <p className="mt-5 leading-relaxed text-muted-foreground">
          It&apos;s us, not you. Try again — and if it keeps happening, get in
          touch and we&apos;ll sort it out.
        </p>
        {error.digest && (
          <p className="mt-3 font-mono text-xs text-muted-foreground">
            Reference: {error.digest}
          </p>
        )}

        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-lapis px-7 py-3 text-sm font-medium text-white transition-colors hover:bg-lapis-deep"
          >
            <RefreshCw className="size-4" />
            Try again
          </button>
          <Link
            href="/contact"
            className="rounded-lg border border-border px-7 py-3 text-sm font-medium transition-colors hover:border-lapis hover:text-lapis"
          >
            Contact us
          </Link>
        </div>
      </div>
    </div>
  )
}
