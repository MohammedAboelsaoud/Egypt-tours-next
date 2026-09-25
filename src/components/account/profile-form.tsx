"use client"

import { useActionState } from "react"
import { CheckCircle2 } from "lucide-react"

import { updateProfile, type ProfileState } from "@/actions/account"
import { LanguagePicker } from "@/components/forms/language-picker"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NATIONALITIES } from "@/lib/constants"
import { cn } from "@/lib/utils"

export function ProfileForm({
  user,
}: {
  user: {
    name: string | null
    email: string | null
    phone: string | null
    nationality: string | null
    passportNo: string | null
    languages: string[]
  }
}) {
  const [state, formAction, pending] = useActionState<ProfileState, FormData>(
    updateProfile,
    null
  )

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            name="name"
            defaultValue={user.name ?? ""}
            required
            className="mt-2 h-11"
          />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            value={user.email ?? ""}
            disabled
            className="mt-2 h-11"
          />
          <p className="mt-1.5 text-xs text-muted-foreground">
            Contact us if you need to change your sign-in email.
          </p>
        </div>

        <div>
          <Label htmlFor="phone">Phone / WhatsApp</Label>
          <Input
            id="phone"
            name="phone"
            defaultValue={user.phone ?? ""}
            placeholder="+1 555 0100"
            className="mt-2 h-11"
          />
        </div>

        <div>
          <Label htmlFor="nationality">Nationality</Label>
          <select
            id="nationality"
            name="nationality"
            defaultValue={user.nationality ?? ""}
            className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-lapis focus-visible:ring-3 focus-visible:ring-lapis/20"
          >
            <option value="">Select…</option>
            {NATIONALITIES.map((nationality) => (
              <option key={nationality} value={nationality}>
                {nationality}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <p id="languages-label" className="text-sm font-medium">
            Languages you speak
          </p>
          <LanguagePicker
            defaultValue={user.languages}
            describedBy="languages-label"
          />
          <p className="mt-1.5 text-xs text-muted-foreground">
            Guides see these, so you can pick one who speaks your language.
          </p>
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="passportNo">
            Passport number{" "}
            <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="passportNo"
            name="passportNo"
            defaultValue={user.passportNo ?? ""}
            className="mt-2 h-11"
          />
          <p className="mt-1.5 text-xs text-muted-foreground">
            You don&apos;t have to add it. It only makes booking site tickets,
            Nile cruises and domestic flights faster.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 pt-2">
        <Button
          type="submit"
          disabled={pending}
          className="h-11 bg-lapis px-7 text-white hover:bg-lapis-deep"
        >
          {pending ? "Saving…" : "Save changes"}
        </Button>

        {state && (
          <p
            className={cn(
              "flex items-center gap-2 text-sm",
              state.ok ? "text-faience" : "text-destructive"
            )}
          >
            {state.ok && <CheckCircle2 className="size-4" />}
            {state.message}
          </p>
        )}
      </div>
    </form>
  )
}
