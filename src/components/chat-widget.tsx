"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { ArrowRight, MessageCircle, Send, X } from "lucide-react"

import { WhatsAppIcon } from "@/components/icons"
import { SITE } from "@/data/site"
import { getBotReply, OPEN_CHAT_EVENT, WELCOME, type BotReply } from "@/lib/chatbot"
import { cn } from "@/lib/utils"
import { whatsappLink } from "@/lib/whatsapp"

type Message = { id: number; from: "bot"; reply: BotReply } | { id: number; from: "user"; text: string }

let nextId = 1

export function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([{ id: 0, from: "bot", reply: WELCOME }])
  const [input, setInput] = useState("")
  const [typing, setTyping] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const launcherRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const openChat = () => setOpen(true)
    window.addEventListener(OPEN_CHAT_EVENT, openChat)
    return () => window.removeEventListener(OPEN_CHAT_EVENT, openChat)
  }, [])

  useEffect(() => {
    if (!open) return
    inputRef.current?.focus()
    // Listen on window: suggestion chips disappear once clicked, which drops
    // focus out of the panel.
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" })
  }, [messages, typing])

  function close() {
    setOpen(false)
    launcherRef.current?.focus()
  }

  function ask(question: string) {
    const text = question.trim()
    if (!text || typing) return
    setMessages((m) => [...m, { id: nextId++, from: "user", text }])
    setInput("")
    setTyping(true)
    inputRef.current?.focus()
    // A short pause so the answer doesn't appear before the question registers.
    window.setTimeout(() => {
      setMessages((m) => [...m, { id: nextId++, from: "bot", reply: getBotReply(text) }])
      setTyping(false)
    }, 450)
  }

  const last = messages[messages.length - 1]
  const suggestions = !typing && last.from === "bot" ? (last.reply.suggestions ?? []) : []

  return (
    <>
      <div className="fixed right-4 bottom-4 z-50 flex flex-col items-end gap-3 sm:right-6 sm:bottom-6">
        {!open && (
          <a
            href={whatsappLink("Hello! I'd like to plan a trip to Egypt.")}
            target="_blank"
            rel="noreferrer"
            aria-label="Chat with us on WhatsApp"
            className="flex size-12 items-center justify-center rounded-full bg-whatsapp text-white shadow-lg shadow-black/20 transition-transform hover:scale-105"
          >
            <WhatsAppIcon className="size-6" />
          </a>
        )}
        <button
          ref={launcherRef}
          type="button"
          onClick={() => (open ? close() : setOpen(true))}
          aria-expanded={open}
          aria-controls="chat-panel"
          aria-label={open ? "Close travel assistant" : "Open travel assistant"}
          className={cn(
            "flex size-14 items-center justify-center rounded-full bg-gold text-white shadow-lg shadow-black/25 transition-transform hover:scale-105 hover:bg-gold-light",
            open && "max-sm:hidden"
          )}
        >
          {open ? <X className="size-6" /> : <MessageCircle className="size-6" />}
        </button>
      </div>

      {open && (
        <section
          id="chat-panel"
          role="dialog"
          aria-label="Travel assistant"
          className="fixed inset-0 z-50 flex flex-col bg-ivory sm:inset-auto sm:right-6 sm:bottom-24 sm:h-[min(620px,calc(100vh-8rem))] sm:w-[380px] sm:rounded-2xl sm:border sm:border-border sm:shadow-2xl"
        >
          <header className="flex items-center justify-between gap-3 bg-ink px-4 py-3 text-white sm:rounded-t-2xl">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-full bg-gold font-heading text-lg">
                {SITE.name[0]}
              </span>
              <div className="leading-tight">
                <p className="text-sm font-semibold">Travel assistant</p>
                <p className="text-xs text-white/60">History, tips & recommendations</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <a
                href={whatsappLink("Hello! I have a question about my trip to Egypt.")}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-white/85 hover:bg-white/10"
              >
                <WhatsAppIcon className="size-4 text-whatsapp" />
                Talk to a person
              </a>
              <button type="button" onClick={close} aria-label="Close" className="rounded-md p-1.5 hover:bg-white/10">
                <X className="size-5" />
              </button>
            </div>
          </header>

          <div ref={listRef} aria-live="polite" className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((m) =>
              m.from === "user" ? (
                <p key={m.id} className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-gold px-3.5 py-2 text-sm text-white">
                  {m.text}
                </p>
              ) : (
                <div key={m.id} className="max-w-[92%] rounded-2xl rounded-bl-sm bg-muted px-3.5 py-2.5 text-sm leading-relaxed">
                  <p className="whitespace-pre-line">{m.reply.text}</p>
                  {m.reply.links && m.reply.links.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                      {m.reply.links.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          // On phones the panel covers the page, so close it to show where the link went.
                          onClick={() => window.innerWidth < 640 && setOpen(false)}
                          className="inline-flex items-center gap-1 text-sm font-semibold text-gold hover:underline"
                        >
                          {link.label}
                          <ArrowRight className="size-3.5" />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            )}
            {typing && (
              <p className="w-fit rounded-2xl rounded-bl-sm bg-muted px-4 py-3" aria-label="Assistant is typing">
                <span className="flex gap-1">
                  {[0, 150, 300].map((delay) => (
                    <span key={delay} className="size-1.5 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: `${delay}ms` }} />
                  ))}
                </span>
              </p>
            )}
          </div>

          {suggestions.length > 0 && (
            <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => ask(s)}
                  className="shrink-0 rounded-full border border-gold/40 bg-white px-3 py-1.5 text-xs font-medium text-ink hover:border-gold hover:bg-gold/5"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault()
              ask(input)
            }}
            className="flex items-center gap-2 border-t border-border p-3"
          >
            <label htmlFor="chat-input" className="sr-only">Ask a question</label>
            <input
              id="chat-input"
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about Egypt…"
              autoComplete="off"
              maxLength={300}
              className="field flex-1 rounded-full"
            />
            <button
              type="submit"
              disabled={!input.trim() || typing}
              aria-label="Send"
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gold text-white hover:bg-gold-light disabled:opacity-40"
            >
              <Send className="size-4" />
            </button>
          </form>
        </section>
      )}
    </>
  )
}
