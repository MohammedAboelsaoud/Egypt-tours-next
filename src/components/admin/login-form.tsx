"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signIn } from "next-auth/react"
import { AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { loginSchema, type LoginInput } from "@/lib/validations"

export function AdminLoginForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

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

    const result = await signIn("credentials", { ...values, redirect: false })
    if (result?.error) {
      setError("Those credentials didn't work.")
      return
    }

    // The layout re-checks the role and bounces non-admins back to the site.
    router.push("/admin")
    router.refresh()
  })

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {error && (
        <p className="flex items-start gap-2 rounded-lg bg-destructive/15 p-3 text-sm text-red-300">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      )}

      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-xs tracking-[0.12em] text-white/60 uppercase"
        >
          Email
        </label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          className="h-11 border-white/15 bg-white/5 text-white placeholder:text-white/30"
          placeholder="admin@egyptjourneys.com"
          {...register("email")}
        />
        {errors.email && (
          <p className="mt-1.5 text-xs text-red-300">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-2 block text-xs tracking-[0.12em] text-white/60 uppercase"
        >
          Password
        </label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          className="h-11 border-white/15 bg-white/5 text-white placeholder:text-white/30"
          placeholder="••••••••"
          {...register("password")}
        />
        {errors.password && (
          <p className="mt-1.5 text-xs text-red-300">{errors.password.message}</p>
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
  )
}
