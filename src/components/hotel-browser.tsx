"use client"

import { useEffect, useMemo, useState } from "react"

import { HotelCard } from "@/components/hotel-card"
import type { AreaSlug, Destination } from "@/data/destinations"
import type { Hotel } from "@/data/hotels"
import { cn } from "@/lib/utils"

type Sort = "recommended" | "price-asc" | "price-desc" | "rating"

export function HotelBrowser({
  hotels,
  areas,
}: {
  hotels: Hotel[]
  areas: Pick<Destination, "slug" | "name">[]
}) {
  const [area, setArea] = useState<AreaSlug | "all">("all")
  const [sort, setSort] = useState<Sort>("recommended")

  // Links such as /hotels/#sinai open with that area selected.
  useEffect(() => {
    const fromHash = () => {
      const hash = window.location.hash.slice(1)
      if (areas.some((a) => a.slug === hash)) setArea(hash as AreaSlug)
    }
    fromHash()
    window.addEventListener("hashchange", fromHash)
    return () => window.removeEventListener("hashchange", fromHash)
  }, [areas])

  function choose(next: AreaSlug | "all") {
    setArea(next)
    history.replaceState(null, "", next === "all" ? window.location.pathname : `#${next}`)
  }

  const shown = useMemo(() => {
    const list = hotels.filter((h) => area === "all" || h.area === area)
    if (sort === "price-asc") return [...list].sort((a, b) => a.pricePerNight - b.pricePerNight)
    if (sort === "price-desc") return [...list].sort((a, b) => b.pricePerNight - a.pricePerNight)
    if (sort === "rating") return [...list].sort((a, b) => b.rating - a.rating)
    return list
  }, [hotels, area, sort])

  const tabs = [{ slug: "all" as const, name: "All areas" }, ...areas]

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div role="group" aria-label="Filter by area" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
          {tabs.map((t) => (
            <button
              key={t.slug}
              type="button"
              onClick={() => choose(t.slug)}
              aria-pressed={area === t.slug}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                area === t.slug ? "border-ink bg-ink text-white" : "border-border bg-ivory text-ink hover:border-gold"
              )}
            >
              {t.name}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          Sort
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="field w-auto py-2">
            <option value="recommended">Recommended</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="rating">Guest rating</option>
          </select>
        </label>
      </div>

      <p className="mt-6 text-sm text-muted-foreground" aria-live="polite">
        {shown.length} hotel{shown.length === 1 ? "" : "s"}
      </p>

      <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((hotel) => (
          <HotelCard key={hotel.id} hotel={hotel} />
        ))}
      </div>
    </div>
  )
}
