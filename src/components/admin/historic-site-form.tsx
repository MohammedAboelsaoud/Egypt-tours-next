"use client"

import Link from "next/link"
import { useActionState } from "react"
import { AlertCircle } from "lucide-react"

import { saveHistoricSite, type AdminState } from "@/actions/admin"
import {
  FormSection,
  ListField,
  SelectField,
  SwitchField,
  TextField,
  TextareaField,
} from "@/components/admin/form-fields"
import { GalleryUpload, ImageUpload } from "@/components/admin/image-upload"
import { Button } from "@/components/ui/button"

export type HistoricSiteFormValues = {
  id: string
  slug: string
  name: string
  regionId: string
  location: string
  period: string
  summary: string
  history: string
  facts: string[]
  tips: string[]
  imageUrl: string
  imageCredit: string
  galleryUrls: string[]
  keywords: string[]
  sortOrder: number
  published: boolean
}

const HISTORY_PLACEHOLDER = `## Who built it

The first paragraph of this chapter.

A second paragraph.

## What to see

The next chapter…`

export function HistoricSiteForm({
  site,
  regions,
}: {
  site?: HistoricSiteFormValues
  regions: { id: string; name: string }[]
}) {
  const action = saveHistoricSite.bind(null, site?.id ?? null)
  const [state, formAction, pending] = useActionState<AdminState, FormData>(action, null)

  return (
    <form action={formAction} className="space-y-6">
      {state && !state.ok && (
        <p className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3.5 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {state.message}
        </p>
      )}

      <FormSection title="Basics">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField name="name" label="Site name" required defaultValue={site?.name} placeholder="Karnak Temple" />
          <TextField
            name="slug"
            label="URL slug"
            defaultValue={site?.slug}
            placeholder="Generated from the name if blank"
            hint="Appears as /sites/your-slug"
          />
          <SelectField
            name="regionId"
            label="Region"
            required
            defaultValue={site?.regionId ?? regions[0]?.id ?? ""}
            options={regions.map((region) => ({ value: region.id, label: region.name }))}
          />
          <TextField name="period" label="Period" defaultValue={site?.period} placeholder="c. 2000 BC – 1st century AD" />
        </div>
        <TextField name="location" label="Location" defaultValue={site?.location} placeholder="East Bank, Luxor" />
        <TextareaField
          name="summary"
          label="Summary"
          required
          rows={3}
          defaultValue={site?.summary}
          hint="One or two sentences, shown on the catalog card."
        />
      </FormSection>

      <FormSection
        title="History"
        description='Start each chapter with a line beginning "## ". Leave an empty line between paragraphs.'
      >
        <TextareaField
          name="history"
          label="History"
          required
          rows={18}
          defaultValue={site?.history}
          placeholder={HISTORY_PLACEHOLDER}
        />
        <ListField
          name="facts"
          label="Key facts"
          rows={5}
          defaultValue={site?.facts}
          placeholder={"Built by: Ramses II\nHeight: About 20 m"}
          hint='One per line, as "Label: value".'
        />
        <ListField
          name="tips"
          label="Visiting tips"
          rows={4}
          defaultValue={site?.tips}
          placeholder="Arrive at opening time to beat the heat."
          hint="One tip per line."
        />
      </FormSection>

      <FormSection title="Photos">
        <ImageUpload name="imageUrl" label="Main photo" required defaultValue={site?.imageUrl} />
        <TextField
          name="imageCredit"
          label="Main photo credit"
          defaultValue={site?.imageCredit}
          placeholder="Photographer, licence"
          hint="Needed when the photo isn't yours (e.g. Wikimedia Commons)."
        />
        <GalleryUpload name="galleryUrls" label="Gallery" defaultValue={site?.galleryUrls} />
      </FormSection>

      <FormSection title="Chat assistant & visibility">
        <TextField
          name="keywords"
          label="Keywords"
          defaultValue={site?.keywords.join(", ")}
          placeholder="karnak, amun, hypostyle"
          hint="Comma-separated. When a traveller's question mentions one, the assistant links here."
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField name="sortOrder" label="Sort order" type="number" defaultValue={site?.sortOrder ?? 0} />
        </div>
        <SwitchField
          name="published"
          label="Published"
          description="Visible in the catalog."
          defaultChecked={site?.published ?? true}
        />
      </FormSection>

      <div className="flex items-center justify-end gap-3">
        <Button variant="outline" nativeButton={false} className="h-11 px-6" render={<Link href="/admin/sites" />}>
          Cancel
        </Button>
        <Button type="submit" disabled={pending} className="h-11 bg-lapis px-7 text-white hover:bg-lapis-deep">
          {pending ? "Saving…" : site ? "Save changes" : "Create site"}
        </Button>
      </div>
    </form>
  )
}
