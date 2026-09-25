import type { UseFormRegisterReturn } from "react-hook-form"

import { LANGUAGES } from "@/lib/constants"
import { cn } from "@/lib/utils"

/**
 * Languages as a row of checkbox chips. Works in plain forms (read with
 * `formData.getAll(name)`) and with react-hook-form (pass `registration`).
 */
export function LanguagePicker({
  name = "languages",
  defaultValue = [],
  registration,
  invalid,
  describedBy,
  idPrefix = "lang",
}: {
  name?: string
  defaultValue?: string[]
  registration?: UseFormRegisterReturn
  invalid?: boolean
  describedBy?: string
  idPrefix?: string
}) {
  return (
    <div
      role="group"
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
      className="mt-2 flex flex-wrap gap-2"
    >
      {LANGUAGES.map((language) => {
        const id = `${idPrefix}-${language.toLowerCase()}`
        return (
          <label key={language} htmlFor={id} className="cursor-pointer">
            <input
              id={id}
              type="checkbox"
              value={language}
              className="peer sr-only"
              {...(registration ?? { name, defaultChecked: defaultValue.includes(language) })}
            />
            <span
              className={cn(
                "inline-flex h-8 items-center rounded-full border border-input bg-background px-3 text-sm transition-colors",
                "peer-checked:border-lapis peer-checked:bg-accent peer-checked:text-lapis-deep",
                "peer-focus-visible:ring-3 peer-focus-visible:ring-lapis/30",
                invalid && "border-destructive"
              )}
            >
              {language}
            </span>
          </label>
        )
      })}
    </div>
  )
}
