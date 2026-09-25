"use client"

import Image from "next/image"
import Link from "next/link"
import { useCallback, useEffect, useId, useRef, useState } from "react"
import { ArrowUp, X } from "lucide-react"

import { ChatEnquiryForm } from "@/components/chat/chat-enquiry-form"
import { NeferAvatar } from "@/components/chat/nefer-avatar"
import { ButtonLink } from "@/components/ui/button-link"
import type { ChatAction, ChatListing as Listing } from "@/lib/chat/engine"
import { STARTER_SUGGESTIONS } from "@/lib/chat/engine"

/** A listing as the chat API returns it (without its search index). */
type ChatListing = Omit<Listing, "searchText">
import { cn, formatPrice } from "@/lib/utils"

type Message = {
  id: string
  role: "user" | "assistant"
  text: string
  listings?: ChatListing[]
  suggestions?: string[]
  action?: ChatAction
  /** For an enquiry prompt: set once the form has been sent. */
  done?: boolean
}

const STORAGE_KEY = "ej-chat-v1"

const WELCOME: Message = {
  id: "welcome",
  role: "assistant",
  text: "Ahlan! I'm Nefer, the Egypt Journeys assistant. Ask me about visas, seasons and tipping, or tell me where you'd like to go and I'll suggest tours, hotels and cars.",
  suggestions: STARTER_SUGGESTIONS,
}

function newId() {
  return Math.random().toString(36).slice(2, 10)
}

function loadHistory(): Message[] | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Message[]
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null
  } catch {
    return null
  }
}

function saveHistory(messages: Message[]) {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-40)))
  } catch {
    // Storage blocked (private mode): the chat still works for this page view.
  }
}

function ListingCard({ listing }: { listing: ChatListing }) {
  return (
    <Link
      href={listing.href}
      className="group flex items-center gap-3 rounded-lg border border-border bg-papyrus p-2 transition-colors hover:border-lapis/40 focus-visible:outline-2 focus-visible:outline-lapis"
    >
      <span className="relative size-14 shrink-0 overflow-hidden rounded-md bg-muted">
        <Image src={listing.imageUrl} alt="" fill sizes="56px" className="object-cover" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-basalt group-hover:text-lapis">
          {listing.title}
        </span>
        <span className="block truncate text-xs text-muted-foreground">
          {listing.regionName} · {listing.detail}
        </span>
        <span className="mt-0.5 block text-xs tabular-nums">
          {listing.price > 0 && (
            <>
              <span className="font-semibold text-lapis">
                {formatPrice(listing.price, listing.currency, { compact: true })}
              </span>{" "}
            </>
          )}
          <span className="text-muted-foreground">{listing.unit}</span>
        </span>
      </span>
    </Link>
  )
}

export function ChatWidget({ whatsapp }: { whatsapp: string }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([WELCOME])
  const [input, setInput] = useState("")
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const panelId = useId()
  const titleId = useId()
  const launcherRef = useRef<HTMLButtonElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const logRef = useRef<HTMLDivElement>(null)
  const restored = useRef(false)

  // Restore after mount so server and client render the same first frame.
  useEffect(() => {
    const history = loadHistory()
    if (history) setMessages(history)
    restored.current = true
  }, [])

  useEffect(() => {
    if (restored.current) saveHistory(messages)
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" })
  }, [messages, pending])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  const close = useCallback(() => {
    setOpen(false)
    launcherRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, close])

  const send = useCallback(
    async (text: string) => {
      const message = text.trim()
      if (!message || pending) return
      setError(null)
      setInput("")
      setMessages((prev) => [...prev, { id: newId(), role: "user", text: message }])
      setPending(true)
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message }),
        })
        const data = (await response.json().catch(() => null)) as {
          reply?: Omit<Message, "id" | "role">
          error?: string
        } | null
        if (!response.ok || !data?.reply) {
          setError(data?.error ?? "Nefer couldn't answer just now. Try again, or message us on WhatsApp.")
          return
        }
        const reply = data.reply
        setMessages((prev) => [...prev, { id: newId(), role: "assistant", ...reply }])
      } catch {
        setError("You seem to be offline. Check your connection and try again.")
      } finally {
        setPending(false)
      }
    },
    [pending]
  )

  const markEnquirySent = (id: string, name: string) => {
    setMessages((prev) => [
      ...prev.map((m) => (m.id === id ? { ...m, done: true } : m)),
      {
        id: newId(),
        role: "assistant",
        text: `Thank you, ${name.split(" ")[0]}. Your enquiry is with our planners: you'll get a confirmation email now and a draft itinerary within one business day.`,
        suggestions: ["Do I need a visa?", "Best time to visit?"],
      },
    ])
  }

  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant")
  // Prefill the enquiry with what the traveller wrote, not a tapped suggestion.
  const chips = new Set(messages.flatMap((m) => m.suggestions ?? []))
  const lastUserText = [...messages].reverse().find((m) => m.role === "user" && !chips.has(m.text))?.text ?? ""
  const whatsappHref = `https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
    "Hello! I'd like to plan a trip to Egypt."
  )}`

  return (
    <>
      <button
        ref={launcherRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls={panelId}
        className={cn(
          "fixed right-5 bottom-5 z-40 flex h-12 items-center gap-2.5 rounded-full bg-basalt pr-5 pl-2.5 text-sm font-medium text-white shadow-lg ring-1 shadow-basalt/25 ring-white/20 transition-all duration-300 hover:bg-lapis-deep focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-lapis",
          open && "pointer-events-none translate-y-4 opacity-0"
        )}
      >
        <NeferAvatar className="size-8" />
        Ask Nefer
      </button>

      <section
        id={panelId}
        role="dialog"
        aria-modal="false"
        aria-labelledby={titleId}
        hidden={!open}
        className="fixed inset-x-3 top-20 bottom-3 z-50 flex flex-col overflow-hidden rounded-xl border border-border bg-limestone shadow-2xl shadow-basalt/20 sm:inset-x-auto sm:top-auto sm:right-5 sm:bottom-5 sm:h-[min(38rem,calc(100dvh-7rem))] sm:w-[24rem]"
      >
        <header className="flex items-center gap-3 bg-basalt px-4 py-3 text-white">
          <NeferAvatar className="size-11 ring-2 ring-sun/70" />
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="font-heading text-lg leading-tight">
              Nefer
            </h2>
            <p className="text-xs text-white/70">Egypt Journeys assistant · answers instantly</p>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close chat"
            className="rounded-md p-1.5 text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-sun"
          >
            <X className="size-5" />
          </button>
        </header>

        <div ref={logRef} role="log" aria-live="polite" className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
          {messages.map((m) => (
            <div key={m.id} className={cn("flex flex-col gap-2", m.role === "user" ? "items-end" : "items-start")}>
              <div className={cn("flex max-w-[92%] items-end gap-2", m.role === "user" && "justify-end")}>
                {m.role === "assistant" && <NeferAvatar className="mb-0.5 size-7" />}
                <p
                  className={cn(
                    "rounded-xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line",
                    m.role === "user"
                      ? "rounded-br-sm bg-lapis text-white"
                      : "rounded-bl-sm border border-border bg-papyrus text-basalt"
                  )}
                >
                  <span className="sr-only">{m.role === "user" ? "You: " : "Nefer: "}</span>
                  {m.text}
                </p>
              </div>

              {m.listings && m.listings.length > 0 && (
                <div className="w-full space-y-2">
                  {m.listings.map((listing) => (
                    <ListingCard key={`${listing.kind}-${listing.slug}`} listing={listing} />
                  ))}
                </div>
              )}

              {m.action === "handoff" && (
                <div className="flex w-full flex-wrap gap-2">
                  <ButtonLink href={whatsappHref} external size="lg" className="bg-[#1f7a4d] text-white hover:bg-[#186540]">
                    WhatsApp a planner
                  </ButtonLink>
                  <ButtonLink href="/contact" size="lg" variant="outline">
                    Contact page
                  </ButtonLink>
                </div>
              )}

              {m.action === "enquiry" && !m.done && m.id === lastAssistant?.id && (
                <div className="w-full">
                  <ChatEnquiryForm draft={lastUserText} onSent={(name) => markEnquirySent(m.id, name)} />
                </div>
              )}
            </div>
          ))}

          {pending && (
            <p className="flex items-center gap-1 text-muted-foreground" aria-label="Nefer is typing">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="size-1.5 animate-bounce rounded-full bg-current motion-reduce:animate-none"
                  style={{ animationDelay: `${i * 120}ms` }}
                />
              ))}
            </p>
          )}

          {error && (
            <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
        </div>

        {lastAssistant?.suggestions && !pending && (
          <div className="no-scrollbar flex gap-2 overflow-x-auto border-t border-border px-4 py-2.5">
            {lastAssistant.suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => send(s)}
                className="shrink-0 rounded-full border border-lapis/35 bg-accent px-3 py-1 text-xs font-medium text-lapis-deep transition-colors hover:border-lapis hover:bg-lapis hover:text-white focus-visible:outline-2 focus-visible:outline-lapis"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <form
          onSubmit={(event) => {
            event.preventDefault()
            void send(input)
          }}
          className="flex items-center gap-2 border-t border-border bg-papyrus px-3 py-3"
        >
          <label htmlFor={`${panelId}-input`} className="sr-only">
            Ask a question
          </label>
          <input
            ref={inputRef}
            id={`${panelId}-input`}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            maxLength={500}
            autoComplete="off"
            placeholder="Ask about tours, visas, hotels…"
            className="h-10 min-w-0 flex-1 rounded-md border border-input bg-white px-3 text-base outline-none placeholder:text-muted-foreground focus-visible:border-lapis focus-visible:ring-3 focus-visible:ring-lapis/25 md:text-sm"
          />
          <button
            type="submit"
            disabled={pending || !input.trim()}
            aria-label="Send"
            className="flex size-10 shrink-0 items-center justify-center rounded-md bg-lapis text-white transition-colors hover:bg-lapis-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lapis disabled:opacity-40"
          >
            <ArrowUp className="size-5" />
          </button>
        </form>
        <p className="sr-only">Press Escape to close the chat.</p>
      </section>
    </>
  )
}
