import Link from "next/link"

import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { PageHero } from "@/components/page-hero"

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <PageHero eyebrow="404" title="This page is lost in the desert" description="The page you're looking for doesn't exist or has moved." image="/img/saint-catherine.jpg">
          <Link href="/" className="mt-8 inline-flex h-12 items-center rounded-lg bg-gold px-6 font-semibold text-white hover:bg-gold-light">
            Back to the homepage
          </Link>
        </PageHero>
      </main>
      <Footer />
    </>
  )
}
