import { ChatWidget } from "@/components/chat/chat-widget"
import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import { WhatsAppButton } from "@/components/layout/whatsapp-button"
import { getSettings } from "@/lib/settings"

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const settings = await getSettings()

  return (
    <>
      <Header phone={settings.contactPhone} />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} />
      <WhatsAppButton number={settings.whatsappNumber} />
      <ChatWidget whatsapp={settings.whatsappNumber} />
    </>
  )
}
