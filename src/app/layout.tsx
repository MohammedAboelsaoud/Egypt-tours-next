import type { Metadata, Viewport } from "next"
import { Gloock, Hanken_Grotesk } from "next/font/google"

import { Providers } from "@/components/providers"
import { Toaster } from "@/components/ui/sonner"
import { SITE } from "@/lib/constants"
import "./globals.css"

const body = Hanken_Grotesk({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
})

// Gloock ships a single weight; headings never ask for a synthetic bold.
const display = Gloock({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  keywords: [
    "Egypt tours",
    "Nile cruise",
    "Cairo pyramids tour",
    "Luxor and Aswan",
    "Red Sea diving",
    "Egypt travel agency",
  ],
  authors: [{ name: SITE.name }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE.url,
    siteName: SITE.name,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    images: [{ url: "/img/hero.jpg", width: 1200, height: 630, alt: SITE.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    images: ["/img/hero.jpg"],
  },
  icons: { icon: "/favicon.svg" },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: "#1d4e89",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      // Opts out of smooth scrolling during route transitions only.
      data-scroll-behavior="smooth"
      className={`${body.variable} ${display.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Providers>{children}</Providers>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
