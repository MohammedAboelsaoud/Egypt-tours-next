import { z } from "zod"

export const registerSchema = z
  .object({
    name: z.string().min(2, "Please enter your full name").max(80),
    email: z.email("Enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(72, "Password is too long"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
})

export const profileSchema = z.object({
  name: z.string().min(2, "Please enter your full name").max(80),
  phone: z.string().max(30).optional().or(z.literal("")),
  nationality: z.string().max(60).optional().or(z.literal("")),
  passportNo: z.string().max(40).optional().or(z.literal("")),
})

export const inquirySchema = z.object({
  name: z.string().min(2, "Please enter your name").max(80),
  email: z.email("Enter a valid email address"),
  phone: z.string().max(30).optional().or(z.literal("")),
  destination: z.string().max(80).optional().or(z.literal("")),
  travelDates: z.string().max(80).optional().or(z.literal("")),
  partySize: z.string().max(30).optional().or(z.literal("")),
  message: z.string().min(10, "Tell us a little more (10+ characters)").max(2000),
  planTitle: z.string().max(160).optional().or(z.literal("")),
})

export const bookingDatesSchema = z
  .object({
    checkIn: z.string().min(1, "Choose a start date"),
    checkOut: z.string().min(1, "Choose an end date"),
    guests: z.coerce.number().int().min(1, "At least one guest").max(50),
  })
  .refine((d) => new Date(d.checkOut) > new Date(d.checkIn), {
    message: "The end date must be after the start date",
    path: ["checkOut"],
  })

export const bookingGuestSchema = z.object({
  contactName: z.string().min(2, "Please enter your full name").max(80),
  contactEmail: z.email("Enter a valid email address"),
  contactPhone: z.string().min(6, "Enter a contact phone number").max(30),
  nationality: z.string().min(2, "Select your nationality").max(60),
  passportNo: z.string().max(40).optional().or(z.literal("")),
  specialRequests: z.string().max(1000).optional().or(z.literal("")),
})

export const createBookingSchema = z.object({
  bookingType: z.enum(["TOUR", "HOTEL", "CAR"]),
  itemId: z.string().min(1),
  checkIn: z.string().min(1),
  checkOut: z.string().min(1),
  guests: z.coerce.number().int().min(1).max(50),
  contactName: z.string().min(2).max(80),
  contactEmail: z.email(),
  contactPhone: z.string().min(6).max(30),
  nationality: z.string().max(60).optional().or(z.literal("")),
  passportNo: z.string().max(40).optional().or(z.literal("")),
  specialRequests: z.string().max(1000).optional().or(z.literal("")),
})

export const reviewSchema = z.object({
  tourId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().min(10, "Please write at least 10 characters").max(1500),
})

const itineraryDaySchema = z.object({
  day: z.coerce.number().int().min(1),
  title: z.string().min(1, "Give the day a title").max(120),
  description: z.string().max(1200).default(""),
})

export const tourSchema = z.object({
  title: z.string().min(3, "Title is required").max(140),
  slug: z.string().min(3).max(90).optional().or(z.literal("")),
  regionId: z.string().min(1, "Choose a region"),
  summary: z.string().min(10, "Write a short summary").max(400),
  description: z.string().min(20, "Write a description").max(6000),
  durationDays: z.coerce.number().int().min(1).max(60),
  priceFrom: z.coerce.number().min(0).max(100000),
  currency: z.string().min(3).max(3).default("USD"),
  maxGroupSize: z.coerce.number().int().min(1).max(200),
  highlights: z.array(z.string()).default([]),
  includes: z.array(z.string()).default([]),
  excludes: z.array(z.string()).default([]),
  itinerary: z.array(itineraryDaySchema).default([]),
  imageUrl: z.string().min(1, "An image is required"),
  galleryUrls: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
  sortOrder: z.coerce.number().int().default(0),
  lat: z.coerce.number().min(-90).max(90).optional().nullable(),
  lng: z.coerce.number().min(-180).max(180).optional().nullable(),
})

export const hotelSchema = z.object({
  name: z.string().min(3, "Name is required").max(140),
  slug: z.string().min(3).max(90).optional().or(z.literal("")),
  regionId: z.string().min(1, "Choose a region"),
  description: z.string().min(20, "Write a description").max(6000),
  starRating: z.coerce.number().int().min(1).max(5),
  pricePerNight: z.coerce.number().min(0).max(100000),
  currency: z.string().min(3).max(3).default("USD"),
  maxGuests: z.coerce.number().int().min(1).max(20),
  amenities: z.array(z.string()).default([]),
  roomTypes: z
    .array(
      z.object({
        name: z.string().min(1).max(80),
        price: z.coerce.number().min(0),
        capacity: z.coerce.number().int().min(1).max(20),
      })
    )
    .default([]),
  address: z.string().max(200).optional().or(z.literal("")),
  imageUrl: z.string().min(1, "An image is required"),
  galleryUrls: z.array(z.string()).default([]),
  published: z.boolean().default(true),
  lat: z.coerce.number().min(-90).max(90).optional().nullable(),
  lng: z.coerce.number().min(-180).max(180).optional().nullable(),
})

export const carSchema = z.object({
  name: z.string().min(3, "Name is required").max(140),
  slug: z.string().min(3).max(90).optional().or(z.literal("")),
  regionId: z.string().min(1, "Choose a region"),
  description: z.string().min(10, "Write a description").max(4000),
  brand: z.string().min(1, "Brand is required").max(60),
  model: z.string().min(1, "Model is required").max(60),
  year: z.coerce.number().int().min(1990).max(2100),
  type: z.string().min(1, "Choose a type").max(40),
  seats: z.coerce.number().int().min(1).max(60),
  transmission: z.string().min(1).max(30),
  fuelType: z.string().min(1).max(30),
  pricePerDay: z.coerce.number().min(0).max(100000),
  currency: z.string().min(3).max(3).default("USD"),
  features: z.array(z.string()).default([]),
  imageUrl: z.string().min(1, "An image is required"),
  galleryUrls: z.array(z.string()).default([]),
  available: z.boolean().default(true),
  published: z.boolean().default(true),
})

export const regionSchema = z.object({
  name: z.string().min(2, "Name is required").max(90),
  slug: z.string().min(2).max(90).optional().or(z.literal("")),
  tagline: z.string().max(160).default(""),
  summary: z.string().min(20, "Write a summary").max(2000),
  cities: z.array(z.string()).default([]),
  imageUrl: z.string().min(1, "An image is required"),
  lat: z.coerce.number().min(-90).max(90).optional().nullable(),
  lng: z.coerce.number().min(-180).max(180).optional().nullable(),
  zoom: z.coerce.number().int().min(1).max(20).default(7),
  sortOrder: z.coerce.number().int().default(0),
  published: z.boolean().default(true),
})

export const settingsSchema = z.object({
  siteName: z.string().min(2).max(80),
  tagline: z.string().max(160),
  contactEmail: z.email(),
  contactPhone: z.string().max(40),
  whatsappNumber: z.string().max(30),
  address: z.string().max(200),
  facebookUrl: z.string().max(200).optional().or(z.literal("")),
  instagramUrl: z.string().max(200).optional().or(z.literal("")),
})

export const bookingStatusSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"]).optional(),
  paymentStatus: z.enum(["PENDING", "PAID", "REFUNDED"]).optional(),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ProfileInput = z.infer<typeof profileSchema>
export type InquiryInput = z.infer<typeof inquirySchema>
export type BookingGuestInput = z.infer<typeof bookingGuestSchema>
export type CreateBookingInput = z.infer<typeof createBookingSchema>
export type TourInput = z.infer<typeof tourSchema>
export type HotelInput = z.infer<typeof hotelSchema>
export type CarInput = z.infer<typeof carSchema>
export type RegionInput = z.infer<typeof regionSchema>
export type SettingsInput = z.infer<typeof settingsSchema>
export type ReviewInput = z.infer<typeof reviewSchema>

export const chatRequestSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "Type a question first")
    .max(500, "Keep questions under 500 characters"),
})
