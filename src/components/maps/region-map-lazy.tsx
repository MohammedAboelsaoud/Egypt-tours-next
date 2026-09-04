"use client"

import dynamic from "next/dynamic"

import { cn } from "@/lib/utils"

/**
 * The Google Maps SDK is heavy and always below the fold, so the map is loaded
 * on demand rather than in the initial bundle.
 */
const RegionMapInner = dynamic(
  () => import("@/components/maps/region-map").then((mod) => mod.RegionMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-full min-h-[380px] w-full animate-pulse rounded-2xl bg-muted" />
    ),
  }
)

export function RegionMap(
  props: React.ComponentProps<typeof RegionMapInner> & { className?: string }
) {
  return (
    <div className={cn("h-full min-h-[380px]", props.className)}>
      <RegionMapInner {...props} />
    </div>
  )
}
