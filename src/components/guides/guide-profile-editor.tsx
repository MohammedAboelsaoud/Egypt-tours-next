"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"

import { updateGuideProfile } from "@/actions/guides"
import {
  GuideProfileFields,
  issuesToErrors,
  readGuideProfile,
  type GuideProfileDefaults,
  type RegionOption,
} from "@/components/guides/guide-profile-fields"
import { Button } from "@/components/ui/button"
import { guideProfileSchema } from "@/lib/validations"

export function GuideProfileEditor({
  regions,
  defaults,
}: {
  regions: RegionOption[]
  defaults: GuideProfileDefaults
}) {
  const router = useRouter()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [pending, startTransition] = useTransition()

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        const values = readGuideProfile(new FormData(event.currentTarget))
        const parsed = guideProfileSchema.safeParse(values)
        if (!parsed.success) {
          setErrors(issuesToErrors(parsed.error.issues))
          toast.error("Some details need a second look.")
          return
        }
        setErrors({})
        startTransition(async () => {
          const result = await updateGuideProfile(values)
          if (result.ok) {
            toast.success(result.message)
            router.refresh()
          } else {
            toast.error(result.message)
          }
        })
      }}
      className="space-y-8"
    >
      <GuideProfileFields regions={regions} defaults={defaults} errors={errors} withPhoto />
      <Button type="submit" size="lg" className="h-11 px-8" disabled={pending}>
        {pending ? "Saving…" : "Save profile"}
      </Button>
    </form>
  )
}
