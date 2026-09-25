import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

import { deleteCar, toggleCarAvailable } from "@/actions/admin"
import { DeleteAction, EditLink, ToggleAction } from "@/components/admin/row-actions"
import { AdminCard, AdminHeader, TableEmpty } from "@/components/admin/ui"
import { prisma } from "@/lib/prisma"
import { formatPrice } from "@/lib/utils"

export const metadata: Metadata = { title: "Cars" }

export default async function AdminCarsPage() {
  const cars = await prisma.car.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      region: { select: { name: true } },
      _count: { select: { bookings: true } },
    },
  })

  return (
    <>
      <AdminHeader
        title="Cars"
        description={`${cars.length} vehicle${cars.length === 1 ? "" : "s"} in the fleet.`}
        action={{ href: "/admin/cars/new", label: "New vehicle" }}
      />

      <AdminCard>
        {cars.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[48rem] text-sm">
              <thead className="border-b border-border bg-muted/40 text-left">
                <tr>
                  <th className="px-6 py-3 font-medium">Vehicle</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Seats</th>
                  <th className="px-4 py-3 font-medium">Region</th>
                  <th className="px-4 py-3 font-medium">Per day</th>
                  <th className="px-4 py-3 text-center font-medium">Available</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {cars.map((car) => (
                  <tr key={car.id} className="hover:bg-muted/30">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-muted">
                          <Image
                            src={car.imageUrl}
                            alt=""
                            fill
                            sizes="44px"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/admin/cars/${car.id}/edit`}
                            className="block max-w-[16rem] truncate font-medium hover:text-lapis"
                          >
                            {car.name}
                          </Link>
                          <span className="text-xs text-muted-foreground">
                            {car.brand} {car.model} · {car.year}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{car.type}</td>
                    <td className="px-4 py-3">{car.seats}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {car.region.name}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {formatPrice(car.pricePerDay, car.currency, { compact: true })}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <ToggleAction
                        id={car.id}
                        checked={car.available}
                        action={toggleCarAvailable}
                        label={`Availability of ${car.name}`}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <EditLink href={`/admin/cars/${car.id}/edit`} />
                        <DeleteAction
                          id={car.id}
                          name={car.name}
                          action={deleteCar}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <TableEmpty message="No vehicles yet." />
        )}
      </AdminCard>
    </>
  )
}
