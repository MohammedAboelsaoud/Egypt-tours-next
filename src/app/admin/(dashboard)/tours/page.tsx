import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

import {
  deleteTour,
  toggleTourFeatured,
  toggleTourPublished,
} from "@/actions/admin"
import { DeleteAction, EditLink, ToggleAction } from "@/components/admin/row-actions"
import { AdminCard, AdminHeader, TableEmpty } from "@/components/admin/ui"
import { prisma } from "@/lib/prisma"
import { formatPrice } from "@/lib/utils"

export const metadata: Metadata = { title: "Tours" }

export default async function AdminToursPage() {
  const tours = await prisma.tour.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    include: {
      region: { select: { name: true } },
      _count: { select: { bookings: true, reviews: true } },
    },
  })

  return (
    <>
      <AdminHeader
        title="Tours"
        description={`${tours.length} itinerar${tours.length === 1 ? "y" : "ies"} in the catalogue.`}
        action={{ href: "/admin/tours/new", label: "New tour" }}
      />

      <AdminCard>
        {tours.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[52rem] text-sm">
              <thead className="border-b border-border bg-muted/40 text-left">
                <tr>
                  <th className="px-6 py-3 font-medium">Tour</th>
                  <th className="px-4 py-3 font-medium">Region</th>
                  <th className="px-4 py-3 font-medium">Days</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Bookings</th>
                  <th className="px-4 py-3 text-center font-medium">Live</th>
                  <th className="px-4 py-3 text-center font-medium">Featured</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {tours.map((tour) => (
                  <tr key={tour.id} className="hover:bg-muted/30">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-muted">
                          <Image
                            src={tour.imageUrl}
                            alt=""
                            fill
                            sizes="44px"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/admin/tours/${tour.id}/edit`}
                            className="block max-w-[18rem] truncate font-medium hover:text-gold"
                          >
                            {tour.title}
                          </Link>
                          <span className="text-xs text-muted-foreground">
                            /{tour.slug}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {tour.region.name}
                    </td>
                    <td className="px-4 py-3">{tour.durationDays}</td>
                    <td className="px-4 py-3 font-medium">
                      {formatPrice(tour.priceFrom, tour.currency, { compact: true })}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {tour._count.bookings}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <ToggleAction
                        id={tour.id}
                        checked={tour.published}
                        action={toggleTourPublished}
                        label={`Publish ${tour.title}`}
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <ToggleAction
                        id={tour.id}
                        checked={tour.featured}
                        action={toggleTourFeatured}
                        label={`Feature ${tour.title}`}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <EditLink href={`/admin/tours/${tour.id}/edit`} />
                        <DeleteAction
                          id={tour.id}
                          name={tour.title}
                          action={deleteTour}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <TableEmpty message="No tours yet — create the first one." />
        )}
      </AdminCard>
    </>
  )
}
