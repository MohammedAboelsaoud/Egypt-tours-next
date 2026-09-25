"use client"

import { useState } from "react"
import { GripVertical, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import type { ItineraryDay, RoomType } from "@/types"

export function TextField({
  name,
  label,
  defaultValue = "",
  placeholder,
  type = "text",
  required = false,
  hint,
  className,
  ...rest
}: {
  name: string
  label: string
  defaultValue?: string | number
  placeholder?: string
  type?: string
  required?: boolean
  hint?: string
  className?: string
} & Omit<React.ComponentProps<typeof Input>, "name" | "defaultValue">) {
  return (
    <div className={className}>
      <Label htmlFor={name}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="mt-2 h-11"
        {...rest}
      />
      {hint && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

export function TextareaField({
  name,
  label,
  defaultValue = "",
  placeholder,
  rows = 5,
  required = false,
  hint,
  className,
}: {
  name: string
  label: string
  defaultValue?: string
  placeholder?: string
  rows?: number
  required?: boolean
  hint?: string
  className?: string
}) {
  return (
    <div className={className}>
      <Label htmlFor={name}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <Textarea
        id={name}
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="mt-2"
      />
      {hint && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

export function SelectField({
  name,
  label,
  options,
  defaultValue = "",
  required = false,
  hint,
  className,
}: {
  name: string
  label: string
  options: { value: string; label: string }[]
  defaultValue?: string
  required?: boolean
  hint?: string
  className?: string
}) {
  return (
    <div className={className}>
      <Label htmlFor={name}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <select
        id={name}
        name={name}
        defaultValue={defaultValue}
        className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-lapis focus-visible:ring-3 focus-visible:ring-lapis/20"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hint && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

export function SwitchField({
  name,
  label,
  description,
  defaultChecked = false,
}: {
  name: string
  label: string
  description?: string
  defaultChecked?: boolean
}) {
  const [checked, setChecked] = useState(defaultChecked)

  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-border bg-background p-4">
      <span>
        <span className="block text-sm font-medium">{label}</span>
        {description && (
          <span className="mt-1 block text-xs text-muted-foreground">
            {description}
          </span>
        )}
      </span>
      <input type="hidden" name={name} value={checked ? "true" : "false"} />
      <Switch checked={checked} onCheckedChange={setChecked} />
    </label>
  )
}

/** Newline-separated list, e.g. highlights, amenities, cities. */
export function ListField({
  name,
  label,
  defaultValue = [],
  placeholder,
  hint,
  rows = 5,
  className,
}: {
  name: string
  label: string
  defaultValue?: string[]
  placeholder?: string
  hint?: string
  rows?: number
  className?: string
}) {
  return (
    <div className={className}>
      <Label htmlFor={name}>{label}</Label>
      <Textarea
        id={name}
        name={name}
        rows={rows}
        defaultValue={defaultValue.join("\n")}
        placeholder={placeholder}
        className="mt-2 font-mono text-[0.8rem]"
      />
      <p className="mt-1.5 text-xs text-muted-foreground">
        {hint ?? "One item per line."}
      </p>
    </div>
  )
}

/** Day-by-day itinerary builder — serialises to JSON in a hidden input. */
export function ItineraryBuilder({
  name,
  defaultValue = [],
}: {
  name: string
  defaultValue?: ItineraryDay[]
}) {
  const [days, setDays] = useState<ItineraryDay[]>(
    defaultValue.length > 0
      ? defaultValue
      : [{ day: 1, title: "", description: "" }]
  )

  const update = (index: number, patch: Partial<ItineraryDay>) => {
    setDays((current) =>
      current.map((day, i) => (i === index ? { ...day, ...patch } : day))
    )
  }

  const renumber = (list: ItineraryDay[]) =>
    list.map((day, index) => ({ ...day, day: index + 1 }))

  return (
    <div>
      <Label>Itinerary</Label>
      <input
        type="hidden"
        name={name}
        value={JSON.stringify(days.filter((day) => day.title.trim()))}
      />

      <div className="mt-2 space-y-3">
        {days.map((day, index) => (
          <div
            key={index}
            className="rounded-xl border border-border bg-background p-4"
          >
            <div className="flex items-center gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-lapis text-xs font-semibold text-white">
                {day.day}
              </span>
              <Input
                value={day.title}
                onChange={(event) => update(index, { title: event.target.value })}
                placeholder="Day title — e.g. Giza plateau & the Grand Egyptian Museum"
                className="h-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Remove day ${day.day}`}
                onClick={() =>
                  setDays((current) =>
                    renumber(current.filter((_, i) => i !== index))
                  )
                }
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>

            <Textarea
              value={day.description}
              onChange={(event) =>
                update(index, { description: event.target.value })
              }
              rows={3}
              placeholder="What happens on this day…"
              className="mt-3"
            />
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        className="mt-3 h-10 gap-2"
        onClick={() =>
          setDays((current) => [
            ...current,
            { day: current.length + 1, title: "", description: "" },
          ])
        }
      >
        <Plus className="size-4" />
        Add a day
      </Button>
    </div>
  )
}

/** Room types builder for hotels — serialises to JSON. */
export function RoomTypesBuilder({
  name,
  defaultValue = [],
}: {
  name: string
  defaultValue?: RoomType[]
}) {
  const [rooms, setRooms] = useState<RoomType[]>(defaultValue)

  const update = (index: number, patch: Partial<RoomType>) => {
    setRooms((current) =>
      current.map((room, i) => (i === index ? { ...room, ...patch } : room))
    )
  }

  return (
    <div>
      <Label>Room types</Label>
      <input
        type="hidden"
        name={name}
        value={JSON.stringify(rooms.filter((room) => room.name.trim()))}
      />

      <div className="mt-2 space-y-3">
        {rooms.map((room, index) => (
          <div
            key={index}
            className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-background p-4"
          >
            <GripVertical className="mb-2.5 size-4 shrink-0 text-muted-foreground" />

            <div className="min-w-[12rem] flex-1">
              <span className="mb-1.5 block text-xs text-muted-foreground">
                Name
              </span>
              <Input
                value={room.name}
                onChange={(event) => update(index, { name: event.target.value })}
                placeholder="Deluxe Nile View"
                className="h-10"
              />
            </div>

            <div className="w-28">
              <span className="mb-1.5 block text-xs text-muted-foreground">
                Price / night
              </span>
              <Input
                type="number"
                min={0}
                value={room.price}
                onChange={(event) =>
                  update(index, { price: Number(event.target.value) })
                }
                className="h-10"
              />
            </div>

            <div className="w-24">
              <span className="mb-1.5 block text-xs text-muted-foreground">
                Sleeps
              </span>
              <Input
                type="number"
                min={1}
                value={room.capacity}
                onChange={(event) =>
                  update(index, { capacity: Number(event.target.value) })
                }
                className="h-10"
              />
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Remove ${room.name || "room"}`}
              onClick={() => setRooms(rooms.filter((_, i) => i !== index))}
              className="mb-0.5 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        className="mt-3 h-10 gap-2"
        onClick={() =>
          setRooms([...rooms, { name: "", price: 0, capacity: 2 }])
        }
      >
        <Plus className="size-4" />
        Add a room type
      </Button>
    </div>
  )
}

export function FormSection({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border border-border bg-papyrus p-6 sm:p-7">
      <h2 className="font-heading text-xl">{title}</h2>
      {description && (
        <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
      )}
      <div className="mt-6 space-y-5">{children}</div>
    </section>
  )
}
