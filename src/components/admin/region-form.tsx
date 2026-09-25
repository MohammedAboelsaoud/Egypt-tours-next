"use client"

import Link from "next/link"
import { useActionState } from "react"
import { AlertCircle } from "lucide-react"

import { saveRegion, type AdminState } from "@/actions/admin"
import {
  FormSection,
  ListField,
  SwitchField,
  TextField,
  TextareaField,
} from "@/components/admin/form-fields"
import { ImageUpload } from "@/components/admin/image-upload"
import { Button } from "@/components/ui/button"

export type RegionFormValues = {
  id: string
  slug: string
  name: string
  tagline: string
  summary: string
  cities: string[]
  imageUrl: string
  lat: number | null
  lng: number | null
  zoom: number
  sortOrder: number
  published: boolean
}

export function RegionForm({ region }: { region?: RegionFormValues }) {
  const action = saveRegion.bind(null, region?.id ?? null)
  const [state, formAction, pending] = useActionState<AdminState, FormData>(
    action,
    null
  )

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
          <TextField
            name="name"
            label="Region name"
            required
            defaultValue={region?.name}
            placeholder="Cairo & Giza"
          />
          <TextField
            name="slug"
            label="URL slug"
            defaultValue={region?.slug}
            placeholder="Generated from the name if blank"
            hint="Appears as /destinations/your-slug"
          />
        </div>

        <TextField
          name="tagline"
          label="Tagline"
          defaultValue={region?.tagline}
          placeholder="Pyramids, the Egyptian Museum, and a city that never sleeps"
        />

        <TextareaField
          name="summary"
          label="Summary"
          required
          rows={6}
          defaultValue={region?.summary}
        />

        <ListField
          name="cities"
          label="Cities"
          rows={4}
          defaultValue={region?.cities}
          placeholder={"Cairo\nGiza"}
        />
      </FormSection>

      <FormSection title="Image">
        <ImageUpload
          name="imageUrl"
          label="Region image"
          required
          defaultValue={region?.imageUrl}
        />
      </FormSection>

      <FormSection
        title="Map & ordering"
        description="The map centres here on the destination page."
      >
        <div className="grid gap-5 sm:grid-cols-4">
          <TextField
            name="lat"
            label="Latitude"
            type="number"
            step="any"
            defaultValue={region?.lat ?? ""}
            placeholder="30.0444"
          />
          <TextField
            name="lng"
            label="Longitude"
            type="number"
            step="any"
            defaultValue={region?.lng ?? ""}
            placeholder="31.2357"
          />
          <TextField
            name="zoom"
            label="Zoom"
            type="number"
            min={1}
            max={20}
            defaultValue={region?.zoom ?? 7}
          />
          <TextField
            name="sortOrder"
            label="Sort order"
            type="number"
            defaultValue={region?.sortOrder ?? 0}
          />
        </div>

        <SwitchField
          name="published"
          label="Published"
          description="Visible on the website."
          defaultChecked={region?.published ?? true}
        />
      </FormSection>

      <div className="flex items-center justify-end gap-3">
        <Button
          variant="outline"
          nativeButton={false}
          className="h-11 px-6"
          render={<Link href="/admin/regions" />}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={pending}
          className="h-11 bg-lapis px-7 text-white hover:bg-lapis-deep"
        >
          {pending ? "Saving…" : region ? "Save changes" : "Create region"}
        </Button>
      </div>
    </form>
  )
}
