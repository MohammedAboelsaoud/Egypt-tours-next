"use client"

import Link from "next/link"
import { useActionState } from "react"
import { AlertCircle } from "lucide-react"

import { saveCar, type AdminState } from "@/actions/admin"
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
import { CAR_FEATURES, CAR_TYPES } from "@/lib/constants"

export type CarFormValues = {
  id: string
  slug: string
  name: string
  description: string
  brand: string
  model: string
  year: number
  type: string
  seats: number
  transmission: string
  fuelType: string
  pricePerDay: string
  currency: string
  features: string[]
  imageUrl: string
  galleryUrls: string[]
  available: boolean
  published: boolean
  regionId: string
}

export function CarForm({
  car,
  regions,
}: {
  car?: CarFormValues
  regions: { id: string; name: string }[]
}) {
  const action = saveCar.bind(null, car?.id ?? null)
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
            label="Listing name"
            required
            defaultValue={car?.name}
            placeholder="Ford Expedition — Family SUV"
          />
          <TextField
            name="slug"
            label="URL slug"
            defaultValue={car?.slug}
            placeholder="Generated from the name if blank"
          />
          <SelectField
            name="regionId"
            label="Based in"
            required
            defaultValue={car?.regionId ?? regions[0]?.id ?? ""}
            options={regions.map((region) => ({
              value: region.id,
              label: region.name,
            }))}
          />
          <SelectField
            name="type"
            label="Vehicle type"
            required
            defaultValue={car?.type ?? CAR_TYPES[0]}
            options={CAR_TYPES.map((type) => ({ value: type, label: type }))}
          />
        </div>

        <TextareaField
          name="description"
          label="Description"
          required
          rows={5}
          defaultValue={car?.description}
        />
      </FormSection>

      <FormSection title="Specification">
        <div className="grid gap-5 sm:grid-cols-3">
          <TextField
            name="brand"
            label="Brand"
            required
            defaultValue={car?.brand}
            placeholder="Toyota"
          />
          <TextField
            name="model"
            label="Model"
            required
            defaultValue={car?.model}
            placeholder="Hiace"
          />
          <TextField
            name="year"
            label="Year"
            type="number"
            min={1990}
            max={2100}
            required
            defaultValue={car?.year ?? new Date().getFullYear()}
          />
          <TextField
            name="seats"
            label="Seats"
            type="number"
            min={1}
            required
            defaultValue={car?.seats ?? 4}
          />
          <SelectField
            name="transmission"
            label="Transmission"
            defaultValue={car?.transmission ?? "Automatic"}
            options={[
              { value: "Automatic", label: "Automatic" },
              { value: "Manual", label: "Manual" },
            ]}
          />
          <SelectField
            name="fuelType"
            label="Fuel"
            defaultValue={car?.fuelType ?? "Petrol"}
            options={[
              { value: "Petrol", label: "Petrol" },
              { value: "Diesel", label: "Diesel" },
              { value: "Hybrid", label: "Hybrid" },
              { value: "Electric", label: "Electric" },
            ]}
          />
        </div>
      </FormSection>

      <FormSection title="Pricing & features">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            name="pricePerDay"
            label="Price per day"
            type="number"
            min={0}
            step="0.01"
            required
            defaultValue={car?.pricePerDay ?? "0"}
          />
          <TextField
            name="currency"
            label="Currency"
            defaultValue={car?.currency ?? "USD"}
            maxLength={3}
          />
        </div>

        <ListField
          name="features"
          label="Features"
          rows={6}
          defaultValue={car?.features}
          hint={`One per line. Common: ${CAR_FEATURES.slice(0, 4).join(", ")}…`}
        />
      </FormSection>

      <FormSection title="Images">
        <ImageUpload
          name="imageUrl"
          label="Main image"
          required
          defaultValue={car?.imageUrl}
        />
        <GalleryUpload
          name="galleryUrls"
          label="Gallery"
          defaultValue={car?.galleryUrls}
        />
      </FormSection>

      <FormSection title="Visibility">
        <div className="grid gap-4 sm:grid-cols-2">
          <SwitchField
            name="published"
            label="Published"
            description="Visible on the website."
            defaultChecked={car?.published ?? true}
          />
          <SwitchField
            name="available"
            label="Available to book"
            description="Turn off while the vehicle is out of service."
            defaultChecked={car?.available ?? true}
          />
        </div>
      </FormSection>

      <div className="flex items-center justify-end gap-3">
        <Button
          variant="outline"
          nativeButton={false}
          className="h-11 px-6"
          render={<Link href="/admin/cars" />}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={pending}
          className="h-11 bg-gold px-7 text-white hover:bg-gold-light"
        >
          {pending ? "Saving…" : car ? "Save changes" : "Create vehicle"}
        </Button>
      </div>
    </form>
  )
}
