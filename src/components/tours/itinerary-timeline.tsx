import type { ItineraryDay } from "@/types"

export function ItineraryTimeline({ days }: { days: ItineraryDay[] }) {
  if (days.length === 0) return null

  return (
    <ol className="relative space-y-8 border-l border-dashed border-gold/35 pl-8">
      {days.map((day) => (
        <li key={day.day} className="relative">
          <span
            className="absolute top-1 -left-[2.4rem] flex size-8 items-center justify-center rounded-full bg-gold text-xs font-semibold text-white"
            aria-hidden
          >
            {day.day}
          </span>
          <h3 className="font-heading text-xl leading-snug">
            <span className="sr-only">Day {day.day}: </span>
            {day.title}
          </h3>
          {day.description && (
            <p className="mt-2.5 leading-relaxed text-muted-foreground">
              {day.description}
            </p>
          )}
        </li>
      ))}
    </ol>
  )
}
