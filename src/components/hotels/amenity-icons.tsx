import {
  Bath,
  BedDouble,
  Car,
  Check,
  Dumbbell,
  Plane,
  Sparkles,
  Utensils,
  Waves,
  Wifi,
  Wind,
} from "lucide-react"

/** Maps free-text amenity labels onto icons, with a tick as the fallback. */
const ICONS: { match: RegExp; icon: typeof Wifi }[] = [
  { match: /wi-?fi|internet/i, icon: Wifi },
  { match: /pool|swim/i, icon: Waves },
  { match: /spa|massage/i, icon: Bath },
  { match: /gym|fitness/i, icon: Dumbbell },
  { match: /restaurant|breakfast|dining/i, icon: Utensils },
  { match: /bar|lounge/i, icon: Sparkles },
  { match: /airport|transfer|shuttle/i, icon: Plane },
  { match: /parking|garage/i, icon: Car },
  { match: /air ?condition|a\/c/i, icon: Wind },
  { match: /room|family|suite|bed/i, icon: BedDouble },
  { match: /beach|nile|sea|dive/i, icon: Waves },
]

export function AmenityGrid({ amenities }: { amenities: string[] }) {
  if (amenities.length === 0) return null

  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {amenities.map((amenity) => {
        const Icon = ICONS.find((entry) => entry.match.test(amenity))?.icon ?? Check
        return (
          <li
            key={amenity}
            className="flex items-center gap-3 rounded-xl border border-border bg-ivory px-4 py-3 text-sm"
          >
            <Icon className="size-4 shrink-0 text-gold" />
            {amenity}
          </li>
        )
      })}
    </ul>
  )
}
