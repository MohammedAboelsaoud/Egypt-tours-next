import { Check, X } from "lucide-react"

export function IncludesList({
  includes,
  excludes,
}: {
  includes: string[]
  excludes: string[]
}) {
  if (includes.length === 0 && excludes.length === 0) return null

  return (
    <div className="grid gap-8 sm:grid-cols-2">
      {includes.length > 0 && (
        <div>
          <h3 className="font-heading text-xl">What&apos;s included</h3>
          <ul className="mt-5 space-y-3">
            {includes.map((item) => (
              <li key={item} className="flex gap-3 text-sm leading-relaxed">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-teal/10 text-teal">
                  <Check className="size-3" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {excludes.length > 0 && (
        <div>
          <h3 className="font-heading text-xl">Not included</h3>
          <ul className="mt-5 space-y-3">
            {excludes.map((item) => (
              <li
                key={item}
                className="flex gap-3 text-sm leading-relaxed text-muted-foreground"
              >
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-muted">
                  <X className="size-3" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
