"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signIn } from "next-auth/react"
import { AlertCircle } from "lucide-react"

import { OAuthButtons } from "@/components/auth/oauth-buttons"
import { LanguagePicker } from "@/components/forms/language-picker"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NATIONALITIES } from "@/lib/constants"
import { registerSchema, type RegisterInput } from "@/lib/validations"

export function RegisterForm({
  providers,
}: {
  providers: { google: boolean; facebook: boolean }
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/account"
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      nationality: "",
      languages: [],
      passportNo: "",
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    setError(null)

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    })

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as
        | { error?: string }
        | null
      setError(data?.error ?? "We couldn't create your account.")
      return
    }

    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    })

    if (result?.error) {
      router.push("/login")
      return
    }

    router.push(callbackUrl)
    router.refresh()
  })

  return (
    <div>
      <h1 className="font-heading text-3xl">Create your account</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Fill this in once. We use it for every booking and guide request, so
        you never type it again.
      </p>

      <div className="mt-8">
        <OAuthButtons providers={providers} callbackUrl={callbackUrl} />

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          {error && (
            <p className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              {error}
            </p>
          )}

          <div>
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              autoComplete="name"
              placeholder="Sarah Whitfield"
              className="mt-2 h-11"
              {...register("name")}
            />
            {errors.name && (
              <p className="mt-1.5 text-xs text-destructive">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="mt-2 h-11"
              {...register("email")}
            />
            {errors.email && (
              <p className="mt-1.5 text-xs text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                className="mt-2 h-11"
                {...register("password")}
              />
              {errors.password && (
                <p className="mt-1.5 text-xs text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="Repeat password"
                className="mt-2 h-11"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="mt-1.5 text-xs text-destructive">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="phone">Phone / WhatsApp</Label>
              <Input
                id="phone"
                type="tel"
                autoComplete="tel"
                placeholder="+44 7700 900123"
                className="mt-2 h-11"
                aria-invalid={Boolean(errors.phone)}
                {...register("phone")}
              />
              {errors.phone && (
                <p className="mt-1.5 text-xs text-destructive">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="nationality">Nationality</Label>
              <select
                id="nationality"
                aria-invalid={Boolean(errors.nationality)}
                className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-lapis focus-visible:ring-3 focus-visible:ring-lapis/20"
                {...register("nationality")}
              >
                <option value="">Select…</option>
                {NATIONALITIES.map((nationality) => (
                  <option key={nationality} value={nationality}>
                    {nationality}
                  </option>
                ))}
              </select>
              {errors.nationality && (
                <p className="mt-1.5 text-xs text-destructive">
                  {errors.nationality.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <p id="languages-label" className="text-sm font-medium">
              Languages you speak
            </p>
            <LanguagePicker
              registration={register("languages")}
              invalid={Boolean(errors.languages)}
              describedBy="languages-label"
            />
            {errors.languages && (
              <p className="mt-1.5 text-xs text-destructive">
                {errors.languages.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="passportNo">
              Passport number{" "}
              <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="passportNo"
              autoComplete="off"
              className="mt-2 h-11"
              aria-describedby="passport-help"
              {...register("passportNo")}
            />
            <p id="passport-help" className="mt-1.5 text-xs text-muted-foreground">
              You don&apos;t have to add it. It only makes booking site tickets,
              Nile cruises and domestic flights faster.
            </p>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-11 w-full bg-lapis text-white hover:bg-lapis-deep"
          >
            {isSubmitting ? "Creating account…" : "Create account"}
          </Button>
        </form>

        <p className="mt-6 text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
            className="font-medium text-lapis hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
