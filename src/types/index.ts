import type {
  Booking,
  Car,
  Hotel,
  Region,
  Review,
  Tour,
  User,
} from "@prisma/client"

export type ItineraryDay = {
  day: number
  title: string
  description: string
}

export type RoomType = {
  name: string
  price: number
  capacity: number
}

export type TourWithRegion = Tour & { region: Region }
export type HotelWithRegion = Hotel & { region: Region }
export type CarWithRegion = Car & { region: Region }

export type RegionWithCounts = Region & {
  _count: { tours: number; hotels: number; cars: number }
}

export type ReviewWithUser = Review & {
  user: Pick<User, "id" | "name" | "image">
}

export type BookingWithItems = Booking & {
  tour: Tour | null
  hotel: Hotel | null
  car: Car | null
}

export type BookingWithAll = BookingWithItems & {
  user: Pick<User, "id" | "name" | "email" | "phone">
}

/** Shape shared by the three listing cards. */
export type ListingFilters = {
  region?: string
  minPrice?: string
  maxPrice?: string
  duration?: string
  stars?: string
  type?: string
  seats?: string
  sort?: string
  q?: string
}

export type PageProps<P = Record<string, string>> = {
  params: Promise<P>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}
