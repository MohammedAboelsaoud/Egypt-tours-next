import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

import { deleteHistoricSite, toggleHistoricSitePublished } from "@/actions/admin"
import { DeleteAction, EditLink, ToggleAction } from "@/components/admin/row-actions"
import { AdminCard, AdminHeader, TableEmpty } from "@/components/admin/ui"
import { prisma } from "@/lib/prisma"

export const metadata: Metadata = { title: "Historic sites" }

export default async function AdminSitesPage() {
  const sites = await prisma.historicSite.findMany({
    orderBy: [{ region: { sortOrder: "asc" } }, { sortOrder: "asc" }],
    include: { region: { select: { name: true } } },
  })

  return (
    <>
      <AdminHeader
        title="Historic sites"
        description={`${sites.length} site${sites.length === 1 ? "" : "s"} in the catalog at /sites.`}
        action={{ href: "/admin/sites/new", label: "New site" }}
      />

      <AdminCard>
        {sites.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[44rem] text-sm">
              <thead className="border-b border-border bg-muted/40 text-left">
                <tr>
                  <th className="px-6 py-3 font-medium">Site</th>
                  <th className="px-4 py-3 font-medium">Region</th>
                  <th className="px-4 py-3 font-medium">Period</th>
                  <th className="px-4 py-3 text-center font-medium">Live</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sites.map((site) => (
                  <tr key={site.id} className="hover:bg-muted/30">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-muted">
                          <Image src={site.imageUrl} alt="" fill sizes="44px" className="object-cover" />
                        </div>
                        <div className="min-w-0">
                          <Link href={`/admin/sites/${site.id}/edit`} className="block max-w-[18rem] truncate font-medium hover:text-lapis">
                            {site.name}
                          </Link>
                          <span className="text-xs text-muted-foreground">/sites/{site.slug}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{site.region.name}</td>
                    <td className="max-w-[14rem] truncate px-4 py-3 text-muted-foreground">{site.period}</td>
                    <td className="px-4 py-3 text-center">
                      <ToggleAction
                        id={site.id}
                        checked={site.published}
                        action={toggleHistoricSitePublished}
                        label={`Publish ${site.name}`}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <EditLink href={`/admin/sites/${site.id}/edit`} />
                        <DeleteAction id={site.id} name={site.name} action={deleteHistoricSite} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <TableEmpty message="No historic sites yet — add the first one to start the catalog." />
        )}
      </AdminCard>
    </>
  )
}
