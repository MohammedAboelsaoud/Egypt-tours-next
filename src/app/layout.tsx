import type { Metadata, Viewport } from "next"
import { Inter, Playfair_Display } from "next/font/google"

import { ChatWidget } from "@/components/chat-widget"
import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { SITE } from "@/data/site"
import "./globals.css"

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" })
const playfair = Playfair_Display({ variable: "--font-playfair", subsets: ["latin"], display: "swap" })

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  icons: { icon: "/favicon.svg" },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    images: ["/img/hero.jpg"],
  },
}

export const viewport: Viewport = {
  themeColor: "#b8860b",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${inter.variable} ${playfair.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <a href="#main" className="sr-only z-50 rounded-md bg-ink px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
          Skip to content
        </a>
        <Header />
        <main id="main" className="flex-1">{children}</main>
        <Footer />
        <ChatWidget />
      </body>
    </html>
  )
}
