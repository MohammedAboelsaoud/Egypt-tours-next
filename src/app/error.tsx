"use client"

import Link from "next/link"
import { useEffect } from "react"
import { RefreshCw } from "lucide-react"

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string }
}) {
  useEffect(() => {
    console.error("[app-error]", error)
    // Browser-side crashes never reach the server log on their own; send them there.
    fetch("/api/client-errors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        path: window.location.pathname,
        name: error.name,
        message: error.message,
        digest: error.digest,
        stack: error.stack,
      }),
    }).catch(() => {})

    // After a new deploy, a page that was already open can ask for files that
    // no longer exist. A single full reload fetches the current ones.
    if (isStaleDeployError(error)) {
      const key = `reloaded:${window.location.pathname}`
      try {
        if (!sessionStorage.getItem(key)) {
          sessionStorage.setItem(key, "1")
          window.location.reload()
        }
      } catch {
        // Storage blocked: leave it to the Try again button.
      }
    }
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
        <p className="mt-3 font-mono text-xs break-words text-muted-foreground">
          Reference: {error.digest ?? `${error.name}: ${error.message}`.slice(0, 160)}
        </p>

        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            // A full reload also recovers from files left over by an older deploy.
            onClick={() => window.location.reload()}
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

function isStaleDeployError(error: Error) {
  return (
    error.name === "ChunkLoadError" ||
    /Loading (CSS )?chunk|dynamically imported module|Failed to fetch/i.test(error.message)
  )
}
