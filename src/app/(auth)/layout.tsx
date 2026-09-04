import Image from "next/image"
import Link from "next/link"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <Link href="/" className="inline-flex flex-col leading-none">
            <span className="font-heading text-2xl">
              Egypt <span className="text-gold">Journeys</span>
            </span>
            <span className="mt-1 text-[0.6rem] tracking-[0.22em] text-muted-foreground uppercase">
              Planned around you
            </span>
          </Link>

          <div className="mt-10">{children}</div>
        </div>
      </div>

      <div className="relative hidden lg:block">
        <Image
          src="/img/luxor-aswan.jpg"
          alt="Temple columns at Karnak, Luxor"
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/35 to-ink/25" />
        <blockquote className="absolute inset-x-0 bottom-0 p-12 text-white">
          <p className="font-heading text-2xl leading-snug text-balance">
            “Four days of temples with the boat doing the travelling for you. Kom
            Ombo at sunset was the highlight of two weeks in Egypt.”
          </p>
          <footer className="mt-5 text-sm text-white/70">
            Emma Lindqvist · Nile Cruise, Luxor to Aswan
          </footer>
        </blockquote>
      </div>
    </div>
  )
}
