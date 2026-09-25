"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { AlertCircle } from "lucide-react"

import {
  GuideProfileFields,
  issuesToErrors,
  readGuideProfile,
  type RegionOption,
} from "@/components/guides/guide-profile-fields"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { guideSignupSchema } from "@/lib/validations"

export function GuideSignupForm({ regions }: { regions: RegionOption[] }) {
  const router = useRouter()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    const form = new FormData(event.currentTarget)
    const values = {
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
      confirmPassword: String(form.get("confirmPassword") ?? ""),
      profile: readGuideProfile(form),
    }

    const parsed = guideSignupSchema.safeParse(values)
    if (!parsed.success) {
      setErrors(issuesToErrors(parsed.error.issues, "profile."))
      setError("Some details need a second look. They're marked below.")
      return
    }
    setErrors({})
    setPending(true)

    try {
      const response = await fetch("/api/guides/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null
        setError(data?.error ?? "We couldn't create your guide account.")
        return
      }
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      })
      router.push(result?.error ? "/guides/login" : "/guide")
      router.refresh()
    } finally {
      setPending(false)
    }
  }

  const hint = (field: string) =>
    errors[field] ? <p className="mt-1.5 text-xs text-destructive">{errors[field]}</p> : null

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-10">
      {error && (
        <p role="alert" className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      )}

      <fieldset className="space-y-5">
        <legend className="font-heading text-xl">1. Your account</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="name">Full name</Label>
            <Input id="name" name="name" autoComplete="name" className="mt-2 h-11" aria-invalid={Boolean(errors.name)} />
            {hint("name")}
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" className="mt-2 h-11" aria-invalid={Boolean(errors.email)} />
            {hint("email")}
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" autoComplete="new-password" placeholder="At least 8 characters" className="mt-2 h-11" aria-invalid={Boolean(errors.password)} />
            {hint("password")}
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" className="mt-2 h-11" aria-invalid={Boolean(errors.confirmPassword)} />
            {hint("confirmPassword")}
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="font-heading text-xl">2. Your guide profile</legend>
        <p className="text-sm text-muted-foreground">
          This is what travellers see. You can add your photo and change anything later.
        </p>
        <GuideProfileFields regions={regions} errors={errors} />
      </fieldset>

      <div className="rounded-lg border border-border bg-muted/60 p-4 text-sm text-muted-foreground">
        Our team checks every new guide before their profile goes live, usually within two business days. We&apos;ll email you when you&apos;re approved.
      </div>

      <Button type="submit" disabled={pending} className="h-11 w-full sm:w-auto sm:px-10">
        {pending ? "Sending your application…" : "Apply to guide"}
      </Button>
    </form>
  )
}
