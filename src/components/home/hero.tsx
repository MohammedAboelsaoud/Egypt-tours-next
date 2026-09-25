"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "motion/react"
import { ArrowRight, Compass } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ButtonLink } from "@/components/ui/button-link"

const STATS = [
  { value: "18 yrs", label: "Planning trips in Egypt" },
  { value: "4,200+", label: "Travellers hosted" },
  { value: "4.9/5", label: "Average review score" },
]

export function Hero() {
  return (
    <section className="relative isolate flex min-h-[92vh] items-center overflow-hidden">
      <Image
        src="/img/hero.jpg"
        alt="Sunrise over the pyramids of Giza"
        fill
        priority
        sizes="100vw"
        className="-z-10 object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-basalt/70 via-basalt/45 to-basalt/85" />

      <div className="container-page w-full pt-28 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-3xl"
        >
          <p className="flex items-center gap-2.5 text-[0.7rem] font-semibold tracking-[0.22em] text-sun uppercase">
            <Compass className="size-4" />
            Private, tailor-made travel
          </p>

          <h1 className="mt-6 font-heading text-[2.75rem] leading-[1.05] text-white text-balance sm:text-6xl lg:text-7xl">
            Egypt, Planned
            <span className="block text-sun">Around You</span>
          </h1>

          <p className="mt-7 max-w-xl text-lg leading-relaxed text-white/85">
            Pyramids at sunrise, the Nile from the deck of your own boat, and the
            Red Sea in the afternoon — arranged end to end by Egyptologists who
            live here.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/contact" className="h-13 bg-lapis px-8 text-base text-white hover:bg-lapis-deep">
              Start Planning
              <ArrowRight className="size-4" />
            </ButtonLink>
            <ButtonLink href="/destinations" variant="outline"
              className="h-13 border-white/40 bg-white/10 px-8 text-base text-white backdrop-blur-sm hover:bg-white/20 hover:text-white">
              Browse Destinations
            </ButtonLink>
          </div>
        </motion.div>

        <motion.dl
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: "easeOut" }}
          className="mt-16 grid max-w-2xl grid-cols-3 gap-6 border-t border-white/20 pt-8"
        >
          {STATS.map((stat) => (
            <div key={stat.label}>
              <dt className="sr-only">{stat.label}</dt>
              <dd>
                <span className="block font-heading text-2xl text-sun sm:text-3xl">
                  {stat.value}
                </span>
                <span className="mt-1 block text-xs text-white/70 sm:text-sm">
                  {stat.label}
                </span>
              </dd>
            </div>
          ))}
        </motion.dl>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-limestone to-transparent" />
    </section>
  )
}
