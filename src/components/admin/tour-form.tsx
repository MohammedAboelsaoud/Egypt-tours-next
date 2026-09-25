"use client"

import Link from "next/link"
import { useActionState } from "react"
import { AlertCircle } from "lucide-react"

import { saveTour, type AdminState } from "@/actions/admin"
import {
  FormSection,
  ItineraryBuilder,
  ListField,
  SelectField,
  SwitchField,
  TextField,
  TextareaField,
} from "@/components/admin/form-fields"
import { GalleryUpload, ImageUpload } from "@/components/admin/image-upload"
import { Button } from "@/components/ui/button"
import type { ItineraryDay } from "@/types"

export type TourFormValues = {
  id: string
  slug: string
  title: string
  summary: string
  description: string
  durationDays: number
  priceFrom: string
  currency: string
  maxGroupSize: number
  highlights: string[]
  includes: string[]
  excludes: string[]
  itinerary: ItineraryDay[]
  imageUrl: string
  galleryUrls: string[]
  featured: boolean
  published: boolean
  sortOrder: number
  lat: number | null
  lng: number | null
  regionId: string
}

export function TourForm({
  tour,
  regions,
}: {
  tour?: TourFormValues
  regions: { id: string; name: string }[]
}) {
  const action = saveTour.bind(null, tour?.id ?? null)
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

      <FormSection
        title="Basics"
        description="What the tour is called and where it belongs."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            name="title"
            label="Title"
            required
            defaultValue={tour?.title}
            placeholder="Pyramids & Old Cairo — 3 Days"
          />
          <TextField
            name="slug"
            label="URL slug"
            defaultValue={tour?.slug}
            placeholder="Leave blank to generate from the title"
            hint="Appears as /tours/your-slug"
          />
          <SelectField
            name="regionId"
            label="Region"
            required
            defaultValue={tour?.regionId ?? regions[0]?.id ?? ""}
            options={regions.map((region) => ({
              value: region.id,
              label: region.name,
            }))}
          />
          <TextField
            name="durationDays"
            label="Duration (days)"
            type="number"
            min={1}
            required
            defaultValue={tour?.durationDays ?? 3}
          />
        </div>

        <TextareaField
          name="summary"
          label="Short summary"
          required
          rows={3}
          defaultValue={tour?.summary}
          placeholder="One or two sentences — shown on cards and in search results."
        />

        <TextareaField
          name="description"
          label="Full description"
          required
          rows={10}
          defaultValue={tour?.description}
          hint="Leave a blank line between paragraphs."
        />
      </FormSection>

      <FormSection title="Pricing & capacity">
        <div className="grid gap-5 sm:grid-cols-3">
          <TextField
            name="priceFrom"
            label="Price from (per person)"
            type="number"
            min={0}
            step="0.01"
            required
            defaultValue={tour?.priceFrom ?? "0"}
          />
          <TextField
            name="currency"
            label="Currency"
            defaultValue={tour?.currency ?? "USD"}
            maxLength={3}
          />
          <TextField
            name="maxGroupSize"
            label="Max group size"
            type="number"
            min={1}
            required
            defaultValue={tour?.maxGroupSize ?? 12}
          />
        </div>
      </FormSection>

      <FormSection
        title="What's in it"
        description="Bullet lists shown on the tour page."
      >
        <ListField
          name="highlights"
          label="Highlights"
          defaultValue={tour?.highlights}
          placeholder={"Great Pyramid and the Sphinx\nGrand Egyptian Museum"}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <ListField
            name="includes"
            label="Included"
            defaultValue={tour?.includes}
            placeholder={"Private guide\nAir-conditioned car"}
          />
          <ListField
            name="excludes"
            label="Not included"
            defaultValue={tour?.excludes}
            placeholder={"International flights\nEgypt entry visa"}
          />
        </div>
      </FormSection>

      <FormSection
        title="Itinerary"
        description="One entry per day — shown as a timeline."
      >
        <ItineraryBuilder name="itinerary" defaultValue={tour?.itinerary} />
      </FormSection>

      <FormSection title="Images">
        <ImageUpload
          name="imageUrl"
          label="Main image"
          required
          defaultValue={tour?.imageUrl}
        />
        <GalleryUpload
          name="galleryUrls"
          label="Gallery"
          defaultValue={tour?.galleryUrls}
        />
      </FormSection>

      <FormSection
        title="Map & visibility"
        description="Coordinates place the start-point marker on the tour page."
      >
        <div className="grid gap-5 sm:grid-cols-3">
          <TextField
            name="lat"
            label="Latitude"
            type="number"
            step="any"
            defaultValue={tour?.lat ?? ""}
            placeholder="29.9773"
          />
          <TextField
            name="lng"
            label="Longitude"
            type="number"
            step="any"
            defaultValue={tour?.lng ?? ""}
            placeholder="31.1325"
          />
          <TextField
            name="sortOrder"
            label="Sort order"
            type="number"
            defaultValue={tour?.sortOrder ?? 0}
            hint="Lower numbers first."
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <SwitchField
            name="published"
            label="Published"
            description="Visible on the website."
            defaultChecked={tour?.published ?? true}
          />
          <SwitchField
            name="featured"
            label="Featured"
            description="Shown in the homepage carousel."
            defaultChecked={tour?.featured ?? false}
          />
        </div>
      </FormSection>

      <div className="flex items-center justify-end gap-3">
        <Button
          variant="outline"
          nativeButton={false}
          className="h-11 px-6"
          render={<Link href="/admin/tours" />}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={pending}
          className="h-11 bg-lapis px-7 text-white hover:bg-lapis-deep"
        >
          {pending ? "Saving…" : tour ? "Save changes" : "Create tour"}
        </Button>
      </div>
    </form>
  )
}
