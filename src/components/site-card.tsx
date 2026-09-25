import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Clock } from "lucide-react"

import type { HistoricSite } from "@/data/sites"

export function SiteCard({ site }: { site: HistoricSite }) {
  return (
    <Link href={`/sites/${site.slug}/`} className="card card-hover group flex flex-col">
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image src={site.image} alt="" fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105" />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Clock className="size-3.5 text-gold" />
          {site.period}
        </p>
        <h3 className="mt-2 text-xl leading-snug">{site.name}</h3>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{site.summary}</p>
        <span className="mt-auto flex items-center gap-1.5 pt-4 text-sm font-semibold text-gold">
          Read the history <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  )
}
