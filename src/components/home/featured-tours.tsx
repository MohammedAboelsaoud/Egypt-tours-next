"use client"

import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

import { TourCard, type TourCardData } from "@/components/tours/tour-card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { SectionHeading } from "@/components/ui/section-heading"

export function FeaturedTours({ tours }: { tours: TourCardData[] }) {
  if (tours.length === 0) return null

  return (
    <section className="container-page section-y">
      <SectionHeading
        eyebrow="Most requested"
        title="Journeys travellers keep booking"
        description="A starting point, not a fixed menu — every one of these can be lengthened, shortened or combined."
        action={
          <Link
            href="/tours"
            className="group hidden items-center gap-2 text-sm font-medium text-lapis sm:flex"
          >
            All tours
            <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        }
        className="mb-12"
      />

      <Carousel opts={{ align: "start", loop: tours.length > 3 }}>
        <CarouselContent className="-ml-5">
          {tours.map((tour, index) => (
            <CarouselItem
              key={tour.slug}
              className="pl-5 sm:basis-1/2 lg:basis-1/3"
            >
              <TourCard tour={tour} priority={index === 0} />
            </CarouselItem>
          ))}
        </CarouselContent>

        <div className="mt-8 flex items-center justify-center gap-3 sm:justify-end">
          <CarouselPrevious className="static translate-y-0" />
          <CarouselNext className="static translate-y-0" />
        </div>
      </Carousel>
    </section>
  )
}
