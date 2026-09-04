import Image from "next/image"
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-ink px-5 py-20">
      <Image
        src="/img/sinai-red-sea.jpg"
        alt=""
        fill
        sizes="100vw"
        className="-z-10 object-cover opacity-30"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/80 to-ink/60" />

      <div className="max-w-lg text-center">
        <p className="text-[0.7rem] font-semibold tracking-[0.22em] text-gold-light uppercase">
          Error 404
        </p>
        <h1 className="mt-5 font-heading text-4xl text-white text-balance sm:text-5xl">
          This path leads nowhere
        </h1>
        <p className="mt-5 leading-relaxed text-white/70">
          The page you were looking for has moved or never existed. The pyramids,
          however, are exactly where you left them.
        </p>

        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="rounded-lg bg-gold px-7 py-3 text-sm font-medium text-white transition-colors hover:bg-gold-light"
          >
            Back to the homepage
          </Link>
          <Link
            href="/tours"
            className="rounded-lg border border-white/30 bg-white/10 px-7 py-3 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            Browse tours
          </Link>
        </div>
      </div>
    </div>
  )
}
