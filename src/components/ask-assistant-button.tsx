"use client"

import { MessageCircle } from "lucide-react"

import { OPEN_CHAT_EVENT } from "@/lib/chatbot"
import { cn } from "@/lib/utils"

export function AskAssistantButton({ className, children = "Ask our assistant" }: { className?: string; children?: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_CHAT_EVENT))}
      className={cn("inline-flex items-center gap-2", className)}
    >
      <MessageCircle className="size-4" />
      {children}
    </button>
  )
}
