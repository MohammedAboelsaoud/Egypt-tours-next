"use client"

import Link from "next/link"
import { useActionState } from "react"
import { AlertCircle } from "lucide-react"

import { saveHotel, type AdminState } from "@/actions/admin"
import {
  FormSection,
  ListField,
  RoomTypesBuilder,
  SelectField,
  SwitchField,
  TextField,
  TextareaField,
} from "@/components/admin/form-fields"
import { GalleryUpload, ImageUpload } from "@/components/admin/image-upload"
import { Button } from "@/components/ui/button"
import { HOTEL_AMENITIES } from "@/lib/constants"
import type { RoomType } from "@/types"

export type HotelFormValues = {
  id: string
  slug: string
  name: string
  description: string
  starRating: number
  pricePerNight: string
  currency: string
  maxGuests: number
  amenities: string[]
  roomTypes: RoomType[]
  address: string | null
  imageUrl: string
  galleryUrls: string[]
  published: boolean
  lat: number | null
  lng: number | null
  regionId: string
}

export function HotelForm({
  hotel,
  regions,
}: {
  hotel?: HotelFormValues
  regions: { id: string; name: string }[]
}) {
  const action = saveHotel.bind(null, hotel?.id ?? null)
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
            label="Hotel name"
            required
            defaultValue={hotel?.name}
            placeholder="Nile View Boutique, Zamalek"
          />
          <TextField
            name="slug"
            label="URL slug"
            defaultValue={hotel?.slug}
            placeholder="Generated from the name if blank"
          />
          <SelectField
            name="regionId"
            label="Region"
            required
            defaultValue={hotel?.regionId ?? regions[0]?.id ?? ""}
            options={regions.map((region) => ({
              value: region.id,
              label: region.name,
            }))}
          />
          <SelectField
            name="starRating"
            label="Star rating"
            required
            defaultValue={String(hotel?.starRating ?? 4)}
            options={[5, 4, 3, 2, 1].map((stars) => ({
              value: String(stars),
              label: `${stars} star${stars > 1 ? "s" : ""}`,
            }))}
          />
        </div>

        <TextareaField
          name="description"
          label="Description"
          required
          rows={8}
          defaultValue={hotel?.description}
        />

        <TextField
          name="address"
          label="Address"
          defaultValue={hotel?.address ?? ""}
          placeholder="Zamalek Island, Cairo"
        />
      </FormSection>

      <FormSection title="Pricing & capacity">
        <div className="grid gap-5 sm:grid-cols-3">
          <TextField
            name="pricePerNight"
            label="Price per night"
            type="number"
            min={0}
            step="0.01"
            required
            defaultValue={hotel?.pricePerNight ?? "0"}
          />
          <TextField
            name="currency"
            label="Currency"
            defaultValue={hotel?.currency ?? "USD"}
            maxLength={3}
          />
          <TextField
            name="maxGuests"
            label="Max guests"
            type="number"
            min={1}
            required
            defaultValue={hotel?.maxGuests ?? 2}
          />
        </div>

        <RoomTypesBuilder name="roomTypes" defaultValue={hotel?.roomTypes} />
      </FormSection>

      <FormSection title="Amenities">
        <ListField
          name="amenities"
          label="Amenities"
          rows={7}
          defaultValue={hotel?.amenities}
          hint={`One per line. Common: ${HOTEL_AMENITIES.slice(0, 6).join(", ")}…`}
        />
      </FormSection>

      <FormSection title="Images">
        <ImageUpload
          name="imageUrl"
          label="Main image"
          required
          defaultValue={hotel?.imageUrl}
        />
        <GalleryUpload
          name="galleryUrls"
          label="Gallery"
          defaultValue={hotel?.galleryUrls}
        />
      </FormSection>

      <FormSection title="Map & visibility">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            name="lat"
            label="Latitude"
            type="number"
            step="any"
            defaultValue={hotel?.lat ?? ""}
          />
          <TextField
            name="lng"
            label="Longitude"
            type="number"
            step="any"
            defaultValue={hotel?.lng ?? ""}
          />
        </div>

        <SwitchField
          name="published"
          label="Published"
          description="Visible on the website."
          defaultChecked={hotel?.published ?? true}
        />
      </FormSection>

      <div className="flex items-center justify-end gap-3">
        <Button
          variant="outline"
          nativeButton={false}
          className="h-11 px-6"
          render={<Link href="/admin/hotels" />}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={pending}
          className="h-11 bg-gold px-7 text-white hover:bg-gold-light"
        >
          {pending ? "Saving…" : hotel ? "Save changes" : "Create hotel"}
        </Button>
      </div>
    </form>
  )
}
