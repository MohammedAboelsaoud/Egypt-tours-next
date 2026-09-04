import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Star } from "lucide-react"

import { deleteHotel, toggleHotelPublished } from "@/actions/admin"
import { DeleteAction, EditLink, ToggleAction } from "@/components/admin/row-actions"
import { AdminCard, AdminHeader, TableEmpty } from "@/components/admin/ui"
import { prisma } from "@/lib/prisma"
import { formatPrice } from "@/lib/utils"

export const metadata: Metadata = { title: "Hotels" }

export default async function AdminHotelsPage() {
  const hotels = await prisma.hotel.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      region: { select: { name: true } },
      _count: { select: { bookings: true } },
    },
  })

  return (
    <>
      <AdminHeader
        title="Hotels"
        description={`${hotels.length} propert${hotels.length === 1 ? "y" : "ies"} listed.`}
        action={{ href: "/admin/hotels/new", label: "New hotel" }}
      />

      <AdminCard>
        {hotels.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[48rem] text-sm">
              <thead className="border-b border-border bg-muted/40 text-left">
                <tr>
                  <th className="px-6 py-3 font-medium">Hotel</th>
                  <th className="px-4 py-3 font-medium">Region</th>
                  <th className="px-4 py-3 font-medium">Stars</th>
                  <th className="px-4 py-3 font-medium">Per night</th>
                  <th className="px-4 py-3 font-medium">Bookings</th>
                  <th className="px-4 py-3 text-center font-medium">Live</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {hotels.map((hotel) => (
                  <tr key={hotel.id} className="hover:bg-muted/30">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-muted">
                          <Image
                            src={hotel.imageUrl}
                            alt=""
                            fill
                            sizes="44px"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/admin/hotels/${hotel.id}/edit`}
                            className="block max-w-[16rem] truncate font-medium hover:text-gold"
                          >
                            {hotel.name}
                          </Link>
                          <span className="text-xs text-muted-foreground">
                            /{hotel.slug}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {hotel.region.name}
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-0.5">
                        {Array.from({ length: hotel.starRating }).map((_, i) => (
                          <Star key={i} className="size-3 fill-gold text-gold" />
                        ))}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {formatPrice(hotel.pricePerNight, hotel.currency, {
                        compact: true,
                      })}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {hotel._count.bookings}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <ToggleAction
                        id={hotel.id}
                        checked={hotel.published}
                        action={toggleHotelPublished}
                        label={`Publish ${hotel.name}`}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <EditLink href={`/admin/hotels/${hotel.id}/edit`} />
                        <DeleteAction
                          id={hotel.id}
                          name={hotel.name}
                          action={deleteHotel}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <TableEmpty message="No hotels yet." />
        )}
      </AdminCard>
    </>
  )
}
