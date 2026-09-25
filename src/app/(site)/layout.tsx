import { ChatWidget } from "@/components/chat-widget"
import { Footer } from "@/components/footer"
import { Header } from "@/components/header"

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#main" className="sr-only z-50 rounded-md bg-ink px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
        Skip to content
      </a>
      <Header />
      <main id="main" className="flex-1">{children}</main>
      <Footer />
      <ChatWidget />
    </>
  )
}
