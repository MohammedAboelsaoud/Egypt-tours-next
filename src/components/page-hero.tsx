import Image from "next/image"

import { cn } from "@/lib/utils"

/** Banner at the top of every page except the homepage. */
export function PageHero({
  eyebrow,
  title,
  description,
  image,
  children,
}: {
  eyebrow?: string
  title: string
  description?: string
  image?: string
  children?: React.ReactNode
}) {
  return (
    <section className={cn("relative isolate overflow-hidden", image ? "bg-ink" : "border-b border-border bg-ivory")}>
      {image && (
        <>
          <Image src={image} alt="" fill priority sizes="100vw" className="-z-10 object-cover opacity-60" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/50 to-ink/70" />
        </>
      )}
      <div className="container-page pt-28 pb-12 sm:pt-36 sm:pb-16">
        {eyebrow && <p className={cn("eyebrow", image && "text-gold-light")}>{eyebrow}</p>}
        <h1 className={cn("mt-3 max-w-3xl text-4xl leading-[1.1] text-balance sm:text-5xl", image ? "text-white" : "text-ink")}>
          {title}
        </h1>
        {description && (
          <p className={cn("mt-5 max-w-2xl text-base leading-relaxed sm:text-lg", image ? "text-white/80" : "text-muted-foreground")}>
            {description}
          </p>
        )}
        {children}
      </div>
    </section>
  )
}
