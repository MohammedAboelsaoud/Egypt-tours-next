"use client"

import { createContext, useContext, useId, useRef, useState } from "react"
import { ArrowDown, ArrowUp, ChevronDown, ImagePlus, Loader2, Plus, Trash2, X } from "lucide-react"

import { uploadFile, type RepoConfig } from "./github"
import { slugify, UPLOAD_DIR, type Field, type Option } from "./schema"
import { cn } from "@/lib/utils"

type Obj = Record<string, unknown>

export const AdminContext = createContext<{
  cfg: RepoConfig
  areas: Option[]
  /** Photos uploaded this session aren't on the live site until it rebuilds; show them from memory. */
  previews: Map<string, string>
}>(null!)

// ─── Photo upload ────────────────────────────────────────────────────────

const MAX_SIDE = 1800

/** Shrinks big phone photos to web size (JPEG) before uploading. */
async function prepareImage(file: File): Promise<{ bytes: Uint8Array; ext: string }> {
  const keepAsIs = file.type === "image/gif" || file.type === "image/svg+xml"
  if (!keepAsIs) {
    try {
      const bitmap = await createImageBitmap(file)
      const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
      const canvas = document.createElement("canvas")
      canvas.width = Math.round(bitmap.width * scale)
      canvas.height = Math.round(bitmap.height * scale)
      canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85))
      if (blob) return { bytes: new Uint8Array(await blob.arrayBuffer()), ext: "jpg" }
    } catch {
      // Fall through and upload the original file.
    }
  }
  return { bytes: new Uint8Array(await file.arrayBuffer()), ext: file.name.split(".").pop()?.toLowerCase() || "jpg" }
}

function ImageField({ value, onChange, id }: { value: string; onChange: (v: string) => void; id: string }) {
  const { cfg, previews } = useContext(AdminContext)
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  async function upload(file: File) {
    setError("")
    if (!file.type.startsWith("image/")) return setError("Please choose an image file.")
    if (file.size > 25 * 1024 * 1024) return setError("That file is over 25 MB — please choose a smaller photo.")
    setBusy(true)
    try {
      const { bytes, ext } = await prepareImage(file)
      if (bytes.length > 20 * 1024 * 1024) throw new Error("The photo is still too large after resizing.")
      const base = slugify(file.name.replace(/\.[^.]+$/, "")) || "photo"
      const name = `${new Date().toISOString().slice(0, 10)}-${base}-${Math.random().toString(36).slice(2, 6)}.${ext}`
      await uploadFile(cfg, `${UPLOAD_DIR}/${name}`, bytes, `Admin: upload photo ${name}`)
      const src = `/${UPLOAD_DIR.replace(/^public\//, "")}/${name}`
      previews.set(src, URL.createObjectURL(new Blob([bytes as BlobPart])))
      onChange(src)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.")
    } finally {
      setBusy(false)
    }
  }

  const preview = value ? (previews.get(value) ?? value) : ""

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
      <div className="relative flex aspect-[4/3] w-full shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted sm:w-40">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="h-full w-full object-cover" />
        ) : (
          <ImagePlus className="size-8 text-muted-foreground" />
        )}
        {busy && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70">
            <Loader2 className="size-6 animate-spin text-gold" />
          </div>
        )}
      </div>
      <div className="flex-1 space-y-2">
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
          const file = e.target.files?.[0]
          e.target.value = ""
          if (file) upload(file)
        }} />
        <button type="button" disabled={busy} onClick={() => inputRef.current?.click()}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-ink px-4 text-sm font-semibold text-white hover:bg-ink/85 disabled:opacity-50">
          <ImagePlus className="size-4" /> {busy ? "Uploading…" : value ? "Replace photo" : "Upload photo"}
        </button>
        <input id={id} value={value} onChange={(e) => onChange(e.target.value)} placeholder="/img/… or https://…" className="field text-xs" />
        <p className="text-xs text-muted-foreground">Upload from your computer or phone, or paste an image address.</p>
        {error && <p className="text-xs font-medium text-red-700">{error}</p>}
      </div>
    </div>
  )
}

// ─── Individual fields ───────────────────────────────────────────────────

function StringsField({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [draft, setDraft] = useState("")
  const add = () => {
    const text = draft.trim()
    if (!text) return
    onChange([...value, text])
    setDraft("")
  }
  return (
    <div>
      <ul className="space-y-2">
        {value.map((item, i) => (
          <li key={i} className="flex gap-2">
            <input value={item} onChange={(e) => onChange(value.map((x, j) => (j === i ? e.target.value : x)))} className="field" aria-label={`Item ${i + 1}`} />
            <MoveButtons index={i} length={value.length} onMove={(to) => onChange(move(value, i, to))} />
            <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label="Remove" className="rounded-md p-2 text-muted-foreground hover:bg-red-50 hover:text-red-700">
              <X className="size-4" />
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-2 flex gap-2">
        <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={placeholder ?? "Add an item…"} className="field"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              add()
            }
          }} />
        <button type="button" onClick={add} className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-border px-3 text-sm font-medium hover:bg-muted">
          <Plus className="size-4" /> Add
        </button>
      </div>
    </div>
  )
}

function move<T>(list: T[], from: number, to: number): T[] {
  const next = [...list]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

function MoveButtons({ index, length, onMove }: { index: number; length: number; onMove: (to: number) => void }) {
  return (
    <span className="flex shrink-0">
      <button type="button" disabled={index === 0} onClick={() => onMove(index - 1)} aria-label="Move up" className="rounded-md p-2 text-muted-foreground hover:bg-muted disabled:opacity-30">
        <ArrowUp className="size-4" />
      </button>
      <button type="button" disabled={index === length - 1} onClick={() => onMove(index + 1)} aria-label="Move down" className="rounded-md p-2 text-muted-foreground hover:bg-muted disabled:opacity-30">
        <ArrowDown className="size-4" />
      </button>
    </span>
  )
}

function ListField({ field, value, onChange }: { field: Extract<Field, { type: "list" }>; value: Obj[]; onChange: (v: Obj[]) => void }) {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <div className="space-y-2">
      {value.map((item, i) => (
        <div key={i} className="rounded-lg border border-border bg-white">
          <div className="flex items-center gap-1 pr-1">
            <button type="button" onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i}
              className="flex flex-1 items-center gap-2 px-3 py-2.5 text-left text-sm font-medium">
              <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform", open === i && "rotate-180")} />
              <span className="truncate">{String(item[field.titleKey] || "") || <span className="text-muted-foreground">New {field.itemLabel}</span>}</span>
            </button>
            <MoveButtons index={i} length={value.length} onMove={(to) => {
              onChange(move(value, i, to))
              setOpen(to)
            }} />
            <button type="button" aria-label={`Remove ${field.itemLabel}`}
              onClick={() => confirm(`Remove this ${field.itemLabel}?`) && onChange(value.filter((_, j) => j !== i))}
              className="rounded-md p-2 text-muted-foreground hover:bg-red-50 hover:text-red-700">
              <Trash2 className="size-4" />
            </button>
          </div>
          {open === i && (
            <div className="border-t border-border p-4">
              <FieldsEditor fields={field.fields} value={item} onChange={(next) => onChange(value.map((x, j) => (j === i ? next : x)))} />
            </div>
          )}
        </div>
      ))}
      <button type="button" onClick={() => {
        onChange([...value, field.newItem()])
        setOpen(value.length)
      }} className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-gold/60 px-3 py-2 text-sm font-medium text-gold hover:bg-gold/5">
        <Plus className="size-4" /> Add {field.itemLabel}
      </button>
    </div>
  )
}

function FieldInput({ field, value, onChange, id }: { field: Field; value: unknown; onChange: (v: unknown) => void; id: string }) {
  const { areas } = useContext(AdminContext)

  switch (field.type) {
    case "text":
      return <input id={id} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} className="field" />
    case "textarea":
      return <textarea id={id} rows={5} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} className="field leading-relaxed" />
    case "number":
      return (
        <input id={id} type="number" min={field.min} max={field.max} step={field.step ?? "any"} value={value === undefined || value === null ? "" : String(value)}
          onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))} className="field max-w-48" />
      )
    case "optionalNumber":
      return (
        <div className="flex flex-wrap items-center gap-3">
          <input id={id} type="number" min={0} step="any" disabled={value === null} value={value === null || value === undefined ? "" : String(value)}
            onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))} className="field max-w-48 disabled:opacity-40" />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={value === null} onChange={(e) => onChange(e.target.checked ? null : 0)} className="size-4 accent-gold" />
            {field.emptyLabel}
          </label>
        </div>
      )
    case "select": {
      const options = field.options === "areas" ? areas : field.options
      return (
        <select id={id} value={String(value ?? "")} onChange={(e) => onChange(field.numeric ? Number(e.target.value) : e.target.value)} className="field max-w-sm">
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      )
    }
    case "multiselect": {
      const options = field.options === "areas" ? areas : field.options
      const selected = Array.isArray(value) ? (value as string[]) : []
      return (
        <div className="flex flex-wrap gap-2">
          {options.map((o) => (
            <label key={o.value} className={cn("cursor-pointer rounded-full border px-3 py-1.5 text-sm", selected.includes(o.value) ? "border-ink bg-ink text-white" : "border-border bg-white")}>
              <input type="checkbox" className="sr-only" checked={selected.includes(o.value)}
                onChange={() => onChange(selected.includes(o.value) ? selected.filter((x) => x !== o.value) : [...selected, o.value])} />
              {o.label}
            </label>
          ))}
        </div>
      )
    }
    case "strings":
      return <StringsField value={Array.isArray(value) ? (value as string[]) : []} onChange={onChange} placeholder={field.placeholder} />
    case "image":
      return <ImageField id={id} value={String(value ?? "")} onChange={onChange} />
    case "list":
      return <ListField field={field} value={Array.isArray(value) ? (value as Obj[]) : []} onChange={onChange} />
  }
}

export function FieldsEditor({ fields, value, onChange, autoIdFrom }: {
  fields: Field[]
  value: Obj
  onChange: (v: Obj) => void
  /** For new items: keep the ID/slug in step with this field until edited by hand. */
  autoIdFrom?: { source: string; target: string }
}) {
  const baseId = useId()
  const [idTouched, setIdTouched] = useState(false)

  return (
    <div className="space-y-5">
      {fields.map((field) => {
        const id = `${baseId}-${field.key}`
        const grouped = field.type === "list" || field.type === "strings" || field.type === "multiselect"
        const Label = grouped ? "p" : "label"
        return (
          <div key={field.key}>
            <Label {...(grouped ? {} : { htmlFor: id })} className="mb-1.5 block text-sm font-semibold">
              {field.label}
              {field.required && <span className="text-gold"> *</span>}
            </Label>
            {field.help && <p className="-mt-1 mb-2 text-xs text-muted-foreground">{field.help}</p>}
            <FieldInput
              field={field}
              id={id}
              value={value[field.key]}
              onChange={(v) => {
                const next = { ...value, [field.key]: v }
                if (autoIdFrom && field.key === autoIdFrom.target) setIdTouched(true)
                if (autoIdFrom && field.key === autoIdFrom.source && !idTouched) next[autoIdFrom.target] = slugify(String(v))
                onChange(next)
              }}
            />
          </div>
        )
      })}
    </div>
  )
}
