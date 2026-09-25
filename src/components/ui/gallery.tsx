"use client"

import Image from "next/image"
import { useState } from "react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Photo gallery with a large lead image, thumbnail rail and a lightbox.
 * Used on tour, hotel and car detail pages.
 */
export function Gallery({
  images,
  alt,
  className,
}: {
  images: string[]
  alt: string
  className?: string
}) {
  const photos = images.filter(Boolean)
  const [active, setActive] = useState(0)
  const [lightbox, setLightbox] = useState(false)

  if (photos.length === 0) return null

  const go = (delta: number) =>
    setActive((current) => (current + delta + photos.length) % photos.length)

  return (
    <div className={cn("space-y-3", className)}>
      <button
        type="button"
        onClick={() => setLightbox(true)}
        className="group relative block aspect-[16/10] w-full overflow-hidden rounded-2xl border border-border bg-muted"
        aria-label="Open photo viewer"
      >
        <Image
          src={photos[active]}
          alt={`${alt} — photo ${active + 1}`}
          fill
          priority
          sizes="(min-width: 1024px) 66vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />
        <span className="absolute right-4 bottom-4 rounded-full bg-basalt/70 px-3 py-1 text-xs text-white backdrop-blur-sm">
          {active + 1} / {photos.length}
        </span>
      </button>

      {photos.length > 1 && (
        <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
          {photos.map((photo, index) => (
            <button
              key={`${photo}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Show photo ${index + 1}`}
              aria-current={index === active}
              className={cn(
                "relative aspect-[4/3] w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-all sm:w-28",
                index === active
                  ? "border-lapis opacity-100"
                  : "border-transparent opacity-65 hover:opacity-100"
              )}
            >
              <Image
                src={photo}
                alt=""
                fill
                sizes="120px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {lightbox && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-basalt/95 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={() => setLightbox(false)}
        >
          <button
            type="button"
            onClick={() => setLightbox(false)}
            className="absolute top-5 right-5 rounded-full bg-white/10 p-2.5 text-white transition-colors hover:bg-white/20"
            aria-label="Close viewer"
          >
            <X className="size-5" />
          </button>

          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  go(-1)
                }}
                className="absolute left-4 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
                aria-label="Previous photo"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  go(1)
                }}
                className="absolute right-4 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
                aria-label="Next photo"
              >
                <ChevronRight className="size-5" />
              </button>
            </>
          )}

          <div
            className="relative h-[80vh] w-full max-w-5xl"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={photos[active]}
              alt={`${alt} — photo ${active + 1}`}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>
        </div>
      )}
    </div>
  )
}
