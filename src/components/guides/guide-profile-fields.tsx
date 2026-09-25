"use client"

import { ImageUpload } from "@/components/admin/image-upload"
import { LanguagePicker } from "@/components/forms/language-picker"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { GUIDE_TYPES } from "@/lib/constants"
import { cn } from "@/lib/utils"

export type RegionOption = { id: string; name: string }

export type GuideProfileDefaults = {
  displayName?: string
  guideType?: string
  bio?: string
  photoUrl?: string | null
  licenceNumber?: string | null
  yearsExperience?: number
  languages?: string[]
  specialties?: string[]
  regionIds?: string[]
  dayRate?: number | null
  whatsapp?: string
}

/** FormData from these fields → the shape `guideProfileSchema` validates. */
export function readGuideProfile(form: FormData) {
  const rate = String(form.get("dayRate") ?? "").trim()
  return {
    displayName: String(form.get("displayName") ?? ""),
    guideType: String(form.get("guideType") ?? ""),
    bio: String(form.get("bio") ?? ""),
    photoUrl: String(form.get("photoUrl") ?? ""),
    licenceNumber: String(form.get("licenceNumber") ?? ""),
    yearsExperience: String(form.get("yearsExperience") ?? "0") || "0",
    languages: form.getAll("languages").map(String),
    specialties: String(form.get("specialties") ?? "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
    regionIds: form.getAll("regionIds").map(String),
    dayRate: rate === "" ? null : rate,
    whatsapp: String(form.get("whatsapp") ?? ""),
  }
}

const selectClass =
  "mt-2 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-lapis focus-visible:ring-3 focus-visible:ring-lapis/20"

/**
 * The fields of a guide's public profile. `errors` is keyed by field name.
 * The photo can only be uploaded once signed in, so sign-up leaves it out.
 */
export function GuideProfileFields({
  regions,
  defaults = {},
  errors = {},
  withPhoto = false,
}: {
  regions: RegionOption[]
  defaults?: GuideProfileDefaults
  errors?: Record<string, string>
  withPhoto?: boolean
}) {
  const hint = (field: string) =>
    errors[field] ? (
      <p id={`${field}-error`} className="mt-1.5 text-xs text-destructive">
        {errors[field]}
      </p>
    ) : null
  const invalid = (field: string) =>
    errors[field] ? { "aria-invalid": true, "aria-describedby": `${field}-error` } : {}

  return (
    <div className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="displayName">Name shown to travellers</Label>
          <Input id="displayName" name="displayName" defaultValue={defaults.displayName} placeholder="Amira Hassan" className="mt-2 h-11" {...invalid("displayName")} />
          {hint("displayName")}
        </div>
        <div>
          <Label htmlFor="guideType">Kind of guide</Label>
          <select id="guideType" name="guideType" defaultValue={defaults.guideType ?? ""} className={selectClass} {...invalid("guideType")}>
            <option value="">Select…</option>
            {GUIDE_TYPES.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          {hint("guideType")}
        </div>
      </div>

      {withPhoto && (
        <ImageUpload name="photoUrl" label="Your photo" defaultValue={defaults.photoUrl ?? ""} allowUrl={false} />
      )}
      {withPhoto && hint("photoUrl")}

      <div>
        <Label htmlFor="bio">About you</Label>
        <Textarea
          id="bio"
          name="bio"
          rows={5}
          defaultValue={defaults.bio}
          placeholder="Where you're from, how you trained, and what a day with you is like."
          className="mt-2"
          {...invalid("bio")}
        />
        {hint("bio")}
      </div>

      <div>
        <Label htmlFor="specialties">Specialties, one per line</Label>
        <Textarea
          id="specialties"
          name="specialties"
          rows={4}
          defaultValue={defaults.specialties?.join("\n")}
          placeholder={"Pyramids of Giza & Saqqara\nReading hieroglyphs on site"}
          className="mt-2"
          {...invalid("specialties")}
        />
        {hint("specialties")}
      </div>

      <div>
        <p id="regions-label" className="text-sm font-medium">Where you guide</p>
        <div role="group" aria-labelledby="regions-label" className="mt-2 flex flex-wrap gap-2">
          {regions.map((region) => (
            <label key={region.id} className="cursor-pointer">
              <input
                type="checkbox"
                name="regionIds"
                value={region.id}
                defaultChecked={defaults.regionIds?.includes(region.id)}
                className="peer sr-only"
              />
              <span
                className={cn(
                  "inline-flex h-8 items-center rounded-full border border-input bg-background px-3 text-sm transition-colors",
                  "peer-checked:border-lapis peer-checked:bg-accent peer-checked:text-lapis-deep peer-focus-visible:ring-3 peer-focus-visible:ring-lapis/30",
                  errors.regionIds && "border-destructive"
                )}
              >
                {region.name}
              </span>
            </label>
          ))}
        </div>
        {hint("regionIds")}
      </div>

      <div>
        <p id="guide-languages-label" className="text-sm font-medium">Languages you guide in</p>
        <LanguagePicker defaultValue={defaults.languages} invalid={Boolean(errors.languages)} describedBy="guide-languages-label" idPrefix="guide-lang" />
        {hint("languages")}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="whatsapp">WhatsApp number</Label>
          <Input id="whatsapp" name="whatsapp" type="tel" defaultValue={defaults.whatsapp} placeholder="+20 100 555 1234" className="mt-2 h-11" {...invalid("whatsapp")} />
          <p className="mt-1.5 text-xs text-muted-foreground">Shared with a traveller only after you accept their trip.</p>
          {hint("whatsapp")}
        </div>
        <div>
          <Label htmlFor="yearsExperience">Years guiding</Label>
          <Input id="yearsExperience" name="yearsExperience" type="number" min={0} max={60} defaultValue={defaults.yearsExperience ?? 0} className="mt-2 h-11" {...invalid("yearsExperience")} />
          {hint("yearsExperience")}
        </div>
        <div>
          <Label htmlFor="licenceNumber">
            Ministry of Tourism licence no. <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Input id="licenceNumber" name="licenceNumber" defaultValue={defaults.licenceNumber ?? ""} className="mt-2 h-11" />
          <p className="mt-1.5 text-xs text-muted-foreground">Only our team sees it. It speeds up approval.</p>
        </div>
        <div>
          <Label htmlFor="dayRate">
            Day rate in USD <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Input id="dayRate" name="dayRate" type="number" min={0} max={5000} defaultValue={defaults.dayRate ?? ""} placeholder="e.g. 60" className="mt-2 h-11" {...invalid("dayRate")} />
          <p className="mt-1.5 text-xs text-muted-foreground">Shown as &ldquo;from $X a day&rdquo;. Leave empty to agree the fee per trip.</p>
          {hint("dayRate")}
        </div>
      </div>
    </div>
  )
}

/** Zod issues → { field: message }, keeping the first message per field. */
export function issuesToErrors(issues: { path: PropertyKey[]; message: string }[], stripPrefix = "") {
  const out: Record<string, string> = {}
  for (const issue of issues) {
    let key = issue.path.map(String).join(".")
    if (stripPrefix && key.startsWith(stripPrefix)) key = key.slice(stripPrefix.length)
    if (!(key in out)) out[key] = issue.message
  }
  return out
}
