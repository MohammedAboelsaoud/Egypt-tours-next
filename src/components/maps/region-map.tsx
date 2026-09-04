"use client"

import { useMemo } from "react"
import { GoogleMap, MarkerF, useJsApiLoader } from "@react-google-maps/api"
import { ExternalLink, MapPin } from "lucide-react"

import { EGYPT_CENTER } from "@/lib/constants"
import { cn } from "@/lib/utils"

export type MapMarker = {
  id: string
  lat: number
  lng: number
  title: string
  href?: string
  kind?: "tour" | "hotel" | "region"
}

const MAP_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#f5efe4" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#6b6259" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#fffef9" }] },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#a9d3d4" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#d9e3c8" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "administrative",
    elementType: "geometry.stroke",
    stylers: [{ color: "#d8c9a8" }],
  },
]

export function RegionMap({
  center,
  zoom = 7,
  markers = [],
  className,
  title,
}: {
  center?: { lat: number; lng: number } | null
  zoom?: number
  markers?: MapMarker[]
  className?: string
  title: string
}) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ""
  const resolvedCenter = center ?? EGYPT_CENTER

  const { isLoaded, loadError } = useJsApiLoader({
    id: "egypt-journeys-maps",
    googleMapsApiKey: apiKey,
    // Skip loading entirely when no key is configured.
    preventGoogleFontsLoading: true,
  })

  const options = useMemo<google.maps.MapOptions>(
    () => ({
      styles: MAP_STYLE,
      disableDefaultUI: true,
      zoomControl: true,
      scrollwheel: false,
      gestureHandling: "cooperative",
    }),
    []
  )

  if (!apiKey || loadError) {
    return (
      <MapFallback
        center={resolvedCenter}
        markers={markers}
        title={title}
        className={className}
        reason={loadError ? "error" : "no-key"}
      />
    )
  }

  if (!isLoaded) {
    return (
      <div
        className={cn(
          "flex h-full min-h-[380px] w-full animate-pulse items-center justify-center rounded-2xl bg-muted",
          className
        )}
      >
        <span className="text-sm text-muted-foreground">Loading map…</span>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "h-full min-h-[380px] w-full overflow-hidden rounded-2xl border border-border",
        className
      )}
    >
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100%", minHeight: 380 }}
        center={resolvedCenter}
        zoom={zoom}
        options={options}
      >
        {markers.map((marker) => (
          <MarkerF
            key={marker.id}
            position={{ lat: marker.lat, lng: marker.lng }}
            title={marker.title}
            onClick={() => {
              if (marker.href) window.location.href = marker.href
            }}
          />
        ))}
      </GoogleMap>
    </div>
  )
}

/** Shown when no Maps API key is configured, or the SDK fails to load. */
function MapFallback({
  center,
  markers,
  title,
  className,
  reason,
}: {
  center: { lat: number; lng: number }
  markers: MapMarker[]
  title: string
  className?: string
  reason: "no-key" | "error"
}) {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${center.lat},${center.lng}`

  return (
    <div
      className={cn(
        "relative flex h-full min-h-[380px] w-full flex-col justify-between overflow-hidden rounded-2xl border border-border bg-[linear-gradient(135deg,#f5efe4_0%,#efe6d5_100%)] p-7",
        className
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            "linear-gradient(#b8860b 1px, transparent 1px), linear-gradient(90deg, #b8860b 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
        aria-hidden
      />

      <div className="relative">
        <div className="flex size-11 items-center justify-center rounded-full bg-gold/15 text-gold">
          <MapPin className="size-5" />
        </div>
        <h3 className="mt-4 font-heading text-xl">{title}</h3>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {center.lat.toFixed(4)}°N, {center.lng.toFixed(4)}°E
          {reason === "no-key" && (
            <span className="mt-1 block text-xs">
              Add <code className="rounded bg-muted px-1">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code>{" "}
              to show the interactive map.
            </span>
          )}
        </p>
      </div>

      {markers.length > 0 && (
        <ul className="relative mt-6 max-h-40 space-y-1.5 overflow-y-auto">
          {markers.slice(0, 6).map((marker) => (
            <li
              key={marker.id}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <span className="size-1.5 rounded-full bg-gold" />
              {marker.title}
            </li>
          ))}
        </ul>
      )}

      <a
        href={mapsUrl}
        target="_blank"
        rel="noreferrer"
        className="relative mt-6 inline-flex w-fit items-center gap-2 rounded-lg border border-gold/40 bg-ivory px-4 py-2.5 text-sm font-medium text-gold transition-colors hover:bg-gold hover:text-white"
      >
        Open in Google Maps
        <ExternalLink className="size-3.5" />
      </a>
    </div>
  )
}
