"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signIn } from "next-auth/react"
import { AlertCircle } from "lucide-react"

import { OAuthButtons } from "@/components/auth/oauth-buttons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { loginSchema, type LoginInput } from "@/lib/validations"

export function LoginForm({
  providers,
}: {
  providers: { google: boolean; facebook: boolean }
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/account"
  const [error, setError] = useState<string | null>(
    searchParams.get("error") ? "We couldn't sign you in. Please try again." : null
  )

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  const onSubmit = handleSubmit(async (values) => {
    setError(null)
    const result = await signIn("credentials", {
      ...values,
      redirect: false,
    })

    if (result?.error) {
      setError("That email and password combination didn't work.")
      return
    }

    router.push(callbackUrl)
    router.refresh()
  })

  return (
    <div>
      <h1 className="font-heading text-3xl">Welcome back</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Sign in to manage your bookings and wishlist.
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

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              className="mt-2 h-11"
              {...register("password")}
            />
            {errors.password && (
              <p className="mt-1.5 text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-11 w-full bg-gold text-white hover:bg-gold-light"
          >
            {isSubmitting ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <p className="mt-6 text-sm text-muted-foreground">
          New here?{" "}
          <Link
            href={`/register?callbackUrl=${encodeURIComponent(callbackUrl)}`}
            className="font-medium text-gold hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}
