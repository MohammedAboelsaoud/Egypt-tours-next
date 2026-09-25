"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"

import type { Photo } from "@/data/types"
import { cn } from "@/lib/utils"

/** Photo grid; tapping a photo opens it full-screen with arrows to browse. */
export function Gallery({ photos, className }: { photos: Photo[]; className?: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [index, setIndex] = useState<number | null>(null)

  useEffect(() => {
    if (index === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setIndex((i) => (i === null ? i : (i + 1) % photos.length))
      if (e.key === "ArrowLeft") setIndex((i) => (i === null ? i : (i - 1 + photos.length) % photos.length))
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [index, photos.length])

  if (photos.length === 0) return null

  function open(i: number) {
    setIndex(i)
    dialogRef.current?.showModal()
  }

  const current = index === null ? null : photos[index]

  return (
    <>
      <ul className={cn("grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3", className)}>
        {photos.map((photo, i) => (
          <li key={`${photo.src}-${i}`} className={cn(i === 0 && photos.length > 2 && "col-span-2 row-span-2")}>
            <button
              type="button"
              onClick={() => open(i)}
              className="group relative block aspect-[4/3] h-full w-full overflow-hidden rounded-xl bg-muted"
              aria-label={`View photo${photo.caption ? `: ${photo.caption}` : ` ${i + 1}`}`}
            >
              <Image src={photo.src} alt={photo.caption ?? ""} fill sizes="(min-width: 1024px) 33vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105" />
              {photo.caption && (
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent p-3 text-left text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 max-sm:hidden">
                  {photo.caption}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        onClose={() => setIndex(null)}
        onClick={(e) => e.target === dialogRef.current && dialogRef.current?.close()}
        aria-label="Photo viewer"
        className="m-auto h-full max-h-none w-full max-w-none bg-transparent p-0 backdrop:bg-ink/90"
      >
        {current && (
          <div className="flex h-full flex-col items-center justify-center gap-3 p-4" onClick={(e) => e.target === e.currentTarget && dialogRef.current?.close()}>
            <div className="relative h-[75vh] w-full max-w-5xl">
              <Image src={current.src} alt={current.caption ?? ""} fill sizes="100vw" className="object-contain" />
            </div>
            <p className="max-w-3xl text-center text-sm text-white/90">
              {current.caption}
              {current.credit && <span className="block text-xs text-white/50">Photo: {current.credit}</span>}
            </p>
            <p className="text-xs text-white/50">{(index ?? 0) + 1} / {photos.length}</p>
          </div>
        )}
        <button type="button" onClick={() => dialogRef.current?.close()} aria-label="Close" className="fixed top-4 right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20">
          <X className="size-6" />
        </button>
        {photos.length > 1 && (
          <>
            <button type="button" aria-label="Previous photo" onClick={() => setIndex((i) => ((i ?? 0) - 1 + photos.length) % photos.length)}
              className="fixed top-1/2 left-3 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20">
              <ChevronLeft className="size-7" />
            </button>
            <button type="button" aria-label="Next photo" onClick={() => setIndex((i) => ((i ?? 0) + 1) % photos.length)}
              className="fixed top-1/2 right-3 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20">
              <ChevronRight className="size-7" />
            </button>
          </>
        )}
      </dialog>
    </>
  )
}
