import type { Metadata } from "next"

import { BookingPageShell } from "@/components/booking/booking-page-shell"

export const metadata: Metadata = {
  title: "Book your car",
  robots: { index: false, follow: false },
}

export default async function BookCarPage({
  params,
}: PageProps<"/book/car/[id]">) {
  const { id } = await params
  return <BookingPageShell kind="car" id={id} />
}
