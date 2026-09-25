"use client"

import Image from "next/image"
import { useRef, useState } from "react"
import { ImageUp, Loader2, X } from "lucide-react"
import { toast } from "sonner"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

async function upload(file: File): Promise<string> {
  const body = new FormData()
  body.append("file", file)

  const response = await fetch("/api/upload/image", { method: "POST", body })
  const data = (await response.json()) as { url?: string; error?: string }

  if (!response.ok || !data.url) {
    throw new Error(data.error ?? "Upload failed")
  }
  return data.url
}

/** Single image field: upload a file or paste a URL. */
export function ImageUpload({
  name,
  label,
  defaultValue = "",
  required = false,
  allowUrl = true,
}: {
  name: string
  label: string
  defaultValue?: string
  required?: boolean
  /** Show the paste-a-URL field. Off for guides, who may only upload. */
  allowUrl?: boolean
}) {
  const [value, setValue] = useState(defaultValue)
  const [busy, setBusy] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const onFile = async (file: File) => {
    setBusy(true)
    try {
      setValue(await upload(file))
      toast.success("Image uploaded")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <Label htmlFor={`${name}-url`}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>

      <input type="hidden" name={name} value={value} />

      <div className="mt-2 flex flex-col gap-3 sm:flex-row">
        <div
          className="relative flex aspect-[4/3] w-full shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-input bg-muted/40 transition-colors hover:border-lapis sm:w-44"
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault()
            const file = event.dataTransfer.files?.[0]
            if (file) void onFile(file)
          }}
        >
          {value ? (
            <>
              <Image
                src={value}
                alt=""
                fill
                sizes="200px"
                className="object-cover"
              />
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  setValue("")
                }}
                className="absolute top-2 right-2 rounded-full bg-basalt/70 p-1.5 text-white transition-colors hover:bg-destructive"
                aria-label="Remove image"
              >
                <X className="size-3.5" />
              </button>
            </>
          ) : (
            <span className="flex flex-col items-center gap-2 p-4 text-center text-xs text-muted-foreground">
              {busy ? (
                <Loader2 className="size-5 animate-spin text-lapis" />
              ) : (
                <ImageUp className="size-5 text-lapis" />
              )}
              {busy ? "Uploading…" : "Click or drop an image"}
            </span>
          )}
        </div>

        <div className="flex-1">
          {allowUrl ? (
            <>
              <Input
                id={`${name}-url`}
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder="/img/example.jpg or https://…"
                className="h-11"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Upload a file, or paste a URL or a path from{" "}
                <code className="rounded bg-muted px-1">/public</code>. JPEG,
                PNG, WebP or AVIF, up to 8MB.
              </p>
            </>
          ) : (
            <p id={`${name}-url`} className="text-sm text-muted-foreground">
              Click the box or drop a photo onto it. JPEG, PNG, WebP or AVIF, up
              to 8MB. A clear, friendly face photo gets the most requests.
            </p>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) void onFile(file)
            }}
          />
        </div>
      </div>
    </div>
  )
}

/** Gallery field: many images, stored as one URL per line. */
export function GalleryUpload({
  name,
  label,
  defaultValue = [],
}: {
  name: string
  label: string
  defaultValue?: string[]
}) {
  const [urls, setUrls] = useState<string[]>(defaultValue)
  const [busy, setBusy] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const onFiles = async (files: FileList) => {
    setBusy(true)
    try {
      const uploaded = await Promise.all(Array.from(files).map(upload))
      setUrls((current) => [...current, ...uploaded])
      toast.success(`${uploaded.length} image(s) added`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <Label>{label}</Label>
      <input type="hidden" name={name} value={urls.join("\n")} />

      <div className="mt-2 grid grid-cols-3 gap-3 sm:grid-cols-5">
        {urls.map((url, index) => (
          <div
            key={`${url}-${index}`}
            className="group relative aspect-square overflow-hidden rounded-lg border border-border"
          >
            <Image src={url} alt="" fill sizes="120px" className="object-cover" />
            <button
              type="button"
              onClick={() => setUrls(urls.filter((_, i) => i !== index))}
              className="absolute top-1.5 right-1.5 rounded-full bg-basalt/70 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Remove"
            >
              <X className="size-3" />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex aspect-square items-center justify-center rounded-lg border border-dashed border-input text-muted-foreground transition-colors hover:border-lapis hover:text-lapis"
        >
          {busy ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <ImageUp className="size-5" />
          )}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={(event) => {
          if (event.target.files?.length) void onFiles(event.target.files)
        }}
      />
    </div>
  )
}
