import type { Metadata } from "next"

import { BookingPageShell } from "@/components/booking/booking-page-shell"

export const metadata: Metadata = {
  title: "Book your hotel",
  robots: { index: false, follow: false },
}

export default async function BookHotelPage({
  params,
}: PageProps<"/book/hotel/[id]">) {
  const { id } = await params
  return <BookingPageShell kind="hotel" id={id} />
}
