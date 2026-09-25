import Image from "next/image"

import { Breadcrumb, type Crumb } from "@/components/layout/breadcrumb"
import { cn } from "@/lib/utils"

/**
 * Compact hero used by every page except the homepage. Sits under the fixed
 * header, so it carries the top padding for the whole page.
 */
export function PageHero({
  eyebrow,
  title,
  description,
  image,
  crumbs = [],
  children,
  size = "default",
}: {
  eyebrow?: string
  title: string
  description?: string
  image?: string
  crumbs?: Crumb[]
  children?: React.ReactNode
  size?: "default" | "tall"
}) {
  const hasImage = Boolean(image)

  return (
    <section
      className={cn(
        "relative isolate overflow-hidden",
        hasImage ? "bg-basalt" : "border-b border-border bg-papyrus"
      )}
    >
      {hasImage && (
        <>
          <Image
            src={image!}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-basalt via-basalt/55 to-basalt/70" />
        </>
      )}

      <div
        className={cn(
          "container-page relative",
          size === "tall"
            ? "pt-32 pb-16 sm:pt-40 sm:pb-24"
            : "pt-28 pb-12 sm:pt-36 sm:pb-16"
        )}
      >
        {crumbs.length > 0 && (
          <Breadcrumb items={crumbs} light={hasImage} className="mb-6" />
        )}

        {eyebrow && (
          <p
            className={cn(
              "text-[0.7rem] font-semibold tracking-[0.18em] uppercase",
              hasImage ? "text-sun" : "text-ochre"
            )}
          >
            {eyebrow}
          </p>
        )}

        <h1
          className={cn(
            "mt-3 max-w-3xl font-heading text-4xl leading-[1.1] text-balance sm:text-5xl lg:text-[3.4rem]",
            hasImage ? "text-white" : "text-basalt"
          )}
        >
          {title}
        </h1>

        {description && (
          <p
            className={cn(
              "mt-5 max-w-2xl text-base leading-relaxed sm:text-lg",
              hasImage ? "text-white/80" : "text-muted-foreground"
            )}
          >
            {description}
          </p>
        )}

        {children}
      </div>
    </section>
  )
}
