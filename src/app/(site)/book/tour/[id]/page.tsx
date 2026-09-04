import type { Metadata } from "next"

import { BookingPageShell } from "@/components/booking/booking-page-shell"

export const metadata: Metadata = {
  title: "Book your tour",
  robots: { index: false, follow: false },
}

export default async function BookTourPage({
  params,
}: PageProps<"/book/tour/[id]">) {
  const { id } = await params
  return <BookingPageShell kind="tour" id={id} />
}
