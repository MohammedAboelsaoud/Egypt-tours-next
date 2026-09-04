import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

import { deleteRegion } from "@/actions/admin"
import { DeleteAction, EditLink } from "@/components/admin/row-actions"
import { AdminHeader, TableEmpty } from "@/components/admin/ui"
import { prisma } from "@/lib/prisma"

export const metadata: Metadata = { title: "Regions" }

export default async function AdminRegionsPage() {
  const regions = await prisma.region.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { tours: true, hotels: true, cars: true } } },
  })

  return (
    <>
      <AdminHeader
        title="Regions"
        description="Regions group everything else and drive the destination pages."
        action={{ href: "/admin/regions/new", label: "New region" }}
      />

      {regions.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2">
          {regions.map((region) => (
            <article
              key={region.id}
              className="overflow-hidden rounded-2xl border border-border bg-ivory"
            >
              <div className="relative aspect-[16/7]">
                <Image
                  src={region.imageUrl}
                  alt=""
                  fill
                  sizes="(min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/75 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5">
                  <div>
                    <h2 className="font-heading text-xl text-white">
                      {region.name}
                    </h2>
                    <p className="mt-0.5 text-xs text-white/70">/{region.slug}</p>
                  </div>
                  {!region.published && (
                    <span className="rounded-full bg-ink/80 px-2.5 py-1 text-[0.65rem] font-medium text-white">
                      Hidden
                    </span>
                  )}
                </div>
              </div>

              <div className="p-5">
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {region.tagline || region.summary}
                </p>

                <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-4">
                  <dl className="flex gap-5 text-xs text-muted-foreground">
                    <div>
                      <dt className="inline">Tours </dt>
                      <dd className="inline font-medium text-ink">
                        {region._count.tours}
                      </dd>
                    </div>
                    <div>
                      <dt className="inline">Hotels </dt>
                      <dd className="inline font-medium text-ink">
                        {region._count.hotels}
                      </dd>
                    </div>
                    <div>
                      <dt className="inline">Cars </dt>
                      <dd className="inline font-medium text-ink">
                        {region._count.cars}
                      </dd>
                    </div>
                  </dl>

                  <div className="flex items-center gap-1">
                    <EditLink href={`/admin/regions/${region.id}/edit`} />
                    <DeleteAction
                      id={region.id}
                      name={region.name}
                      action={deleteRegion}
                    />
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-ivory">
          <TableEmpty message="No regions yet — add the first one to start building the catalogue." />
        </div>
      )}
    </>
  )
}
