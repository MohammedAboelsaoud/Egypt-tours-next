"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useTransition } from "react"
import { Search, SlidersHorizontal, X } from "lucide-react"

import { cn } from "@/lib/utils"

export type FilterField = {
  name: string
  label: string
  options: { value: string; label: string }[]
}

/**
 * URL-driven filters shared by the tours, hotels and car listings. Everything
 * lives in the query string so listings stay server-rendered and shareable.
 */
export function FilterBar({
  fields,
  sortOptions,
  basePath,
  searchPlaceholder = "Search…",
  resultCount,
}: {
  fields: FilterField[]
  sortOptions: { value: string; label: string }[]
  basePath: string
  searchPlaceholder?: string
  resultCount: number
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [pending, startTransition] = useTransition()

  const setParam = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(name, value)
    } else {
      params.delete(name)
    }
    startTransition(() => {
      router.push(`${basePath}?${params.toString()}`, { scroll: false })
    })
  }

  const activeFilters = fields
    .map((field) => ({ field, value: searchParams.get(field.name) ?? "" }))
    .filter((entry) => entry.value)

  const query = searchParams.get("q") ?? ""
  const hasFilters = activeFilters.length > 0 || Boolean(query)

  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-ivory p-5 transition-opacity sm:p-6",
        pending && "opacity-60"
      )}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
        <div className="flex-1">
          <label
            htmlFor="filter-search"
            className="mb-2 block text-xs font-medium tracking-[0.1em] text-muted-foreground uppercase"
          >
            Search
          </label>
          <div className="relative">
            <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="filter-search"
              type="search"
              defaultValue={query}
              placeholder={searchPlaceholder}
              onChange={(event) => {
                const value = event.target.value
                // Debounce keystrokes into a single navigation.
                window.clearTimeout(
                  (window as unknown as { __filterTimer?: number }).__filterTimer
                )
                ;(window as unknown as { __filterTimer?: number }).__filterTimer =
                  window.setTimeout(() => setParam("q", value), 350)
              }}
              className="h-11 w-full rounded-lg border border-input bg-background pr-3 pl-10 text-sm outline-none focus-visible:border-gold focus-visible:ring-3 focus-visible:ring-gold/20"
            />
          </div>
        </div>

        {fields.map((field) => (
          <div key={field.name} className="min-w-[9.5rem] flex-1 lg:max-w-[12rem]">
            <label
              htmlFor={`filter-${field.name}`}
              className="mb-2 block text-xs font-medium tracking-[0.1em] text-muted-foreground uppercase"
            >
              {field.label}
            </label>
            <select
              id={`filter-${field.name}`}
              value={searchParams.get(field.name) ?? ""}
              onChange={(event) => setParam(field.name, event.target.value)}
              className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-gold focus-visible:ring-3 focus-visible:ring-gold/20"
            >
              <option value="">Any</option>
              {field.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ))}

        <div className="min-w-[9.5rem] flex-1 lg:max-w-[12rem]">
          <label
            htmlFor="filter-sort"
            className="mb-2 block text-xs font-medium tracking-[0.1em] text-muted-foreground uppercase"
          >
            Sort by
          </label>
          <select
            id="filter-sort"
            value={searchParams.get("sort") ?? sortOptions[0]?.value ?? ""}
            onChange={(event) => setParam("sort", event.target.value)}
            className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-gold focus-visible:ring-3 focus-visible:ring-gold/20"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border pt-4">
        <span className="flex items-center gap-2 text-sm text-muted-foreground">
          <SlidersHorizontal className="size-4 text-gold" />
          {resultCount} {resultCount === 1 ? "result" : "results"}
        </span>

        {activeFilters.map(({ field, value }) => (
          <button
            key={field.name}
            type="button"
            onClick={() => setParam(field.name, "")}
            className="flex items-center gap-1.5 rounded-full bg-gold/10 px-3 py-1.5 text-xs font-medium text-gold transition-colors hover:bg-gold/20"
          >
            {field.options.find((option) => option.value === value)?.label ?? value}
            <X className="size-3" />
          </button>
        ))}

        {hasFilters && (
          <button
            type="button"
            onClick={() =>
              startTransition(() => router.push(basePath, { scroll: false }))
            }
            className="ml-auto text-xs font-medium text-muted-foreground underline-offset-4 hover:text-gold hover:underline"
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  )
}
