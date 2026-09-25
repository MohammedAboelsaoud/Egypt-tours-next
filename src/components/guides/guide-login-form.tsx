"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { getSession, signIn } from "next-auth/react"
import { AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { loginSchema, type LoginInput } from "@/lib/validations"

export function GuideLoginForm() {
  const router = useRouter()
  const [error, setError] = useState<React.ReactNode>(null)

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
      setError("That email and password combination didn't work.")
      return
    }

    const session = await getSession()
    if (session?.user?.role !== "GUIDE") {
      setError(
        <>
          This is a traveller account, not a guide account.{" "}
          <Link href="/account" className="font-medium underline">Go to your account</Link>{" "}
          or <Link href="/guides/register" className="font-medium underline">apply as a guide</Link>{" "}
          with a different email.
        </>
      )
      return
    }

    router.push("/guide")
    router.refresh()
  })

  return (
    <div>
      <p className="eyebrow">For guides</p>
      <h1 className="mt-3 font-heading text-3xl">Guide sign in</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Answer trip requests, manage your calendar and update your profile.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4" noValidate>
        {error && (
          <p role="alert" className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{error}</span>
          </p>
        )}

        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" className="mt-2 h-11" {...register("email")} />
          {errors.email && <p className="mt-1.5 text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" autoComplete="current-password" className="mt-2 h-11" {...register("password")} />
          {errors.password && <p className="mt-1.5 text-xs text-destructive">{errors.password.message}</p>}
        </div>

        <Button type="submit" disabled={isSubmitting} className="h-11 w-full">
          {isSubmitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="mt-6 text-sm text-muted-foreground">
        New here?{" "}
        <Link href="/guides/register" className="font-medium text-lapis hover:underline">
          Apply to guide with us
        </Link>
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        Travelling with us?{" "}
        <Link href="/login" className="font-medium text-lapis hover:underline">
          Traveller sign in
        </Link>
      </p>
    </div>
  )
}
