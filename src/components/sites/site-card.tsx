import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Clock } from "lucide-react"

export type SiteCardData = {
  slug: string
  name: string
  period: string
  summary: string
  imageUrl: string
}

export function SiteCard({ site }: { site: SiteCardData }) {
  return (
    <Link
      href={`/sites/${site.slug}`}
      className="card-hover group flex flex-col overflow-hidden rounded-2xl border border-border bg-papyrus"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={site.imageUrl}
          alt=""
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col p-6">
        {site.period && (
          <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Clock className="size-3.5 text-ochre" />
            {site.period}
          </p>
        )}
        <h3 className="mt-2 font-heading text-xl leading-snug">{site.name}</h3>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{site.summary}</p>
        <span className="mt-auto flex items-center gap-1.5 pt-5 text-sm font-medium text-lapis">
          Read the history
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  )
}
