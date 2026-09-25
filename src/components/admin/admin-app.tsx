"use client"

import { useContext, useEffect, useState } from "react"
import { ArrowLeft, Check, ExternalLink, KeyRound, Loader2, LogOut, Plus, RotateCcw, Save, Trash2 } from "lucide-react"

import { checkAccess, readJson, writeJson, type RepoConfig } from "./github"
import { AdminContext, FieldsEditor } from "./fields"
import { COLLECTIONS, DEFAULT_REPO, validate, type Collection, type Option } from "./schema"
import { cn } from "@/lib/utils"

type Obj = Record<string, unknown>
type FileState = { data: unknown; sha: string; saved: string }

const STORAGE_KEY = "admin-github"

function loadStored(): RepoConfig | null {
  for (const store of ["sessionStorage", "localStorage"] as const) {
    try {
      const raw = window[store].getItem(STORAGE_KEY)
      if (raw) return JSON.parse(raw) as RepoConfig
    } catch {}
  }
  return null
}

function forget() {
  for (const store of ["sessionStorage", "localStorage"] as const) {
    try {
      window[store].removeItem(STORAGE_KEY)
    } catch {}
  }
}

export function AdminApp() {
  const [cfg, setCfg] = useState<RepoConfig | null>(null)
  const [files, setFiles] = useState<Record<string, FileState>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [previews] = useState(() => new Map<string, string>())

  async function connect(next: RepoConfig, remember?: boolean) {
    setLoading(true)
    setError("")
    try {
      await checkAccess(next)
      const loaded = await Promise.all(COLLECTIONS.map((c) => readJson<unknown>(next, c.file)))
      setFiles(Object.fromEntries(COLLECTIONS.map((c, i) => [c.id, { ...loaded[i], saved: JSON.stringify(loaded[i].data) }])))
      if (remember !== undefined) {
        forget()
        try {
          window[remember ? "localStorage" : "sessionStorage"].setItem(STORAGE_KEY, JSON.stringify(next))
        } catch {}
      }
      setCfg(next)
    } catch (e) {
      const message = e instanceof Error ? e.message : "Couldn't connect."
      setError(
        message.startsWith("Not found")
          ? `${message} (The content files live in src/content/ — if they're missing on "${next.branch}", merge the pull request that added them first.)`
          : message
      )
      setCfg(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const stored = loadStored()
    if (stored) connect(stored)
    else setLoading(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!cfg) return <Login onSubmit={connect} loading={loading} error={error} />

  return (
    <AdminContext.Provider value={{ cfg, areas: areaOptions(files.destinations?.data), previews }}>
      <Editor cfg={cfg} files={files} setFiles={setFiles} onLogout={() => {
        forget()
        setCfg(null)
        setFiles({})
      }} />
    </AdminContext.Provider>
  )
}

function areaOptions(destinations: unknown): Option[] {
  return Array.isArray(destinations) ? destinations.map((d: Obj) => ({ value: String(d.slug), label: String(d.name) })) : []
}

// ─── Sign in ─────────────────────────────────────────────────────────────

function Login({ onSubmit, loading, error }: { onSubmit: (cfg: RepoConfig, remember: boolean) => void; loading: boolean; error: string }) {
  const [token, setToken] = useState("")
  const [remember, setRemember] = useState(false)
  const [repo, setRepo] = useState(DEFAULT_REPO)

  return (
    <div className="flex min-h-screen items-center justify-center bg-sand p-4">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit({ ...repo, token: token.trim() }, remember)
        }}
        className="card w-full max-w-lg space-y-5 p-6 sm:p-8"
      >
        <div>
          <p className="eyebrow">Admin</p>
          <h1 className="mt-2 text-3xl">Edit your website</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Changes are saved to your GitHub repository, and the site updates itself about a minute later.
          </p>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold">GitHub access token</span>
          <input type="password" required autoComplete="off" value={token} onChange={(e) => setToken(e.target.value)} placeholder="github_pat_…" className="field font-mono" />
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="size-4 accent-gold" />
          Keep me signed in on this device
        </label>

        {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}

        <button type="submit" disabled={loading} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-gold font-semibold text-white hover:bg-gold-light disabled:opacity-60">
          {loading ? <Loader2 className="size-5 animate-spin" /> : <KeyRound className="size-5" />}
          {loading ? "Connecting…" : "Sign in"}
        </button>

        <details className="rounded-lg bg-muted p-4 text-sm">
          <summary className="cursor-pointer font-semibold">How do I get a token? (one time, 2 minutes)</summary>
          <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-muted-foreground">
            <li>
              Open{" "}
              <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noreferrer" className="font-medium text-gold underline">
                GitHub → New fine-grained token
              </a>{" "}
              (sign in as the owner of the repository).
            </li>
            <li>Name it “Website admin” and choose an expiration date.</li>
            <li>Under <strong>Repository access</strong>, choose <strong>Only select repositories</strong> → <strong>{repo.repo}</strong>.</li>
            <li>Under <strong>Permissions → Repository permissions</strong>, set <strong>Contents</strong> to <strong>Read and write</strong>.</li>
            <li>Click <strong>Generate token</strong>, copy it and paste it above. Keep it private, like a password.</li>
          </ol>
        </details>

        <details className="text-sm">
          <summary className="cursor-pointer text-muted-foreground">Repository settings</summary>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {(["owner", "repo", "branch"] as const).map((key) => (
              <label key={key} className="block">
                <span className="mb-1 block text-xs text-muted-foreground">{key === "repo" ? "Repository" : key[0].toUpperCase() + key.slice(1)}</span>
                <input value={repo[key]} onChange={(e) => setRepo({ ...repo, [key]: e.target.value.trim() })} className="field" />
              </label>
            ))}
          </div>
        </details>
      </form>
    </div>
  )
}

// ─── Editor ──────────────────────────────────────────────────────────────

function Editor({ cfg, files, setFiles, onLogout }: {
  cfg: RepoConfig
  files: Record<string, FileState>
  setFiles: React.Dispatch<React.SetStateAction<Record<string, FileState>>>
  onLogout: () => void
}) {
  const [active, setActive] = useState(COLLECTIONS[0].id)
  const [selected, setSelected] = useState<number | null>(null)
  const [newItems, setNewItems] = useState<Set<number>>(new Set())
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState<{ kind: "ok" | "error"; text: string; list?: string[] } | null>(null)

  const collection = COLLECTIONS.find((c) => c.id === active)!
  const file = files[active]
  const dirty = (id: string) => files[id] && JSON.stringify(files[id].data) !== files[id].saved
  const anyDirty = COLLECTIONS.some((c) => dirty(c.id))

  useEffect(() => {
    if (!anyDirty) return
    const warn = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
  }, [anyDirty])

  function update(data: unknown) {
    setFiles((f) => ({ ...f, [active]: { ...f[active], data } }))
    setNotice(null)
  }

  function open(id: string) {
    setActive(id)
    setSelected(null)
    setNewItems(new Set())
    setNotice(null)
  }

  async function save() {
    const errors = validate(collection, file.data)
    if (errors.length) {
      setNotice({ kind: "error", text: "Please fix these before saving:", list: errors })
      return
    }
    setSaving(true)
    setNotice(null)
    try {
      const sha = await writeJson(cfg, collection.file, file.data, `Admin: update ${collection.label.toLowerCase()}`, file.sha)
      setFiles((f) => ({ ...f, [active]: { ...f[active], sha, saved: JSON.stringify(f[active].data) } }))
      setNewItems(new Set())
      setNotice({ kind: "ok", text: "Saved! Your website will show the changes in about a minute." })
    } catch (e) {
      setNotice({ kind: "error", text: e instanceof Error ? e.message : "Saving failed." })
    } finally {
      setSaving(false)
    }
  }

  function discard() {
    if (!confirm(`Discard your unsaved changes to ${collection.label}?`)) return
    update(JSON.parse(file.saved))
    setSelected(null)
    setNewItems(new Set())
  }

  return (
    <div className="flex min-h-screen flex-col bg-sand lg:flex-row">
      <aside className="border-b border-border bg-ink text-white lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0 lg:border-b-0">
        <div className="flex items-center justify-between px-5 py-4 lg:block">
          <div>
            <p className="font-heading text-xl">Website admin</p>
            <p className="text-xs text-white/50">{cfg.owner}/{cfg.repo} · {cfg.branch}</p>
          </div>
          <button type="button" onClick={onLogout} className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-white/70 hover:bg-white/10 lg:hidden">
            <LogOut className="size-4" /> Sign out
          </button>
        </div>
        <nav aria-label="Content" className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:px-3">
          {COLLECTIONS.map((c) => (
            <button key={c.id} type="button" onClick={() => open(c.id)} aria-current={c.id === active ? "page" : undefined}
              className={cn("flex shrink-0 items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm", c.id === active ? "bg-white/15 font-semibold" : "text-white/75 hover:bg-white/10")}>
              {c.label}
              {dirty(c.id) && <span className="size-2 rounded-full bg-gold-light" aria-label="unsaved changes" />}
            </button>
          ))}
        </nav>
        <div className="hidden space-y-1 px-3 pt-4 lg:block">
          <a href="/" target="_blank" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/10">
            <ExternalLink className="size-4" /> View website
          </a>
          <button type="button" onClick={onLogout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/10">
            <LogOut className="size-4" /> Sign out
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-border bg-ivory/95 px-5 py-3 backdrop-blur sm:px-8">
          <div>
            <h1 className="text-2xl">{collection.label}</h1>
            <p className="text-xs text-muted-foreground">{collection.description}</p>
          </div>
          <div className="flex items-center gap-2">
            {dirty(active) && (
              <button type="button" onClick={discard} className="inline-flex h-10 items-center gap-1.5 rounded-lg px-3 text-sm text-muted-foreground hover:bg-muted">
                <RotateCcw className="size-4" /> Discard
              </button>
            )}
            <button type="button" onClick={save} disabled={saving || !dirty(active)}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-gold px-5 text-sm font-semibold text-white hover:bg-gold-light disabled:opacity-50">
              {saving ? <Loader2 className="size-4 animate-spin" /> : dirty(active) ? <Save className="size-4" /> : <Check className="size-4" />}
              {saving ? "Saving…" : dirty(active) ? "Save & publish" : "Saved"}
            </button>
          </div>
        </header>

        <div className="mx-auto max-w-4xl px-5 py-6 sm:px-8">
          {notice && (
            <div role={notice.kind === "error" ? "alert" : "status"} className={cn("mb-6 rounded-lg p-4 text-sm", notice.kind === "ok" ? "bg-teal/10 text-teal" : "bg-red-50 text-red-800")}>
              <p className="font-medium">{notice.text}</p>
              {notice.list && (
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {notice.list.map((e) => <li key={e}>{e}</li>)}
                </ul>
              )}
            </div>
          )}

          {collection.kind === "object" ? (
            <div className="card p-5 sm:p-7">
              <FieldsEditor fields={collection.fields} value={file.data as Obj} onChange={update} />
            </div>
          ) : (
            <ListEditor
              collection={collection}
              items={file.data as Obj[]}
              onChange={update}
              selected={selected}
              setSelected={setSelected}
              newItems={newItems}
              setNewItems={setNewItems}
            />
          )}
        </div>
      </main>
    </div>
  )
}

function ListEditor({ collection, items, onChange, selected, setSelected, newItems, setNewItems }: {
  collection: Extract<Collection, { kind: "list" }>
  items: Obj[]
  onChange: (items: Obj[]) => void
  selected: number | null
  setSelected: (i: number | null) => void
  newItems: Set<number>
  setNewItems: (s: Set<number>) => void
}) {
  const { previews } = useContext(AdminContext)

  if (selected !== null && items[selected]) {
    const item = items[selected]
    return (
      <div>
        <div className="mb-4 flex items-center justify-between gap-3">
          <button type="button" onClick={() => setSelected(null)} className="inline-flex items-center gap-1.5 text-sm font-medium text-gold hover:underline">
            <ArrowLeft className="size-4" /> All {collection.label.toLowerCase()}
          </button>
          {!collection.fixed && (
            <button type="button" onClick={() => {
              if (!confirm(`Delete “${String(item[collection.titleKey] || collection.itemLabel)}”? (Nothing changes on the website until you save.)`)) return
              onChange(items.filter((_, i) => i !== selected))
              setSelected(null)
            }} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-red-700 hover:bg-red-50">
              <Trash2 className="size-4" /> Delete
            </button>
          )}
        </div>
        <div className="card p-5 sm:p-7">
          <FieldsEditor
            key={selected}
            fields={collection.fields}
            value={item}
            onChange={(next) => onChange(items.map((x, i) => (i === selected ? next : x)))}
            autoIdFrom={newItems.has(selected) ? { source: collection.titleKey, target: collection.idKey } : undefined}
          />
        </div>
        <p className="mt-4 text-xs text-muted-foreground">Remember to press “Save &amp; publish” at the top when you're done.</p>
      </div>
    )
  }

  return (
    <div>
      {!collection.fixed && collection.newItem && (
        <button type="button" onClick={() => {
          onChange([...items, collection.newItem!()])
          setNewItems(new Set([...newItems, items.length]))
          setSelected(items.length)
        }} className="mb-5 inline-flex h-10 items-center gap-2 rounded-lg bg-ink px-4 text-sm font-semibold text-white hover:bg-ink/85">
          <Plus className="size-4" /> Add {collection.itemLabel}
        </button>
      )}
      <ul className="grid gap-3 sm:grid-cols-2">
        {items.map((item, i) => {
          const img = collection.imageKey ? String(item[collection.imageKey] ?? "") : ""
          return (
            <li key={i}>
              <button type="button" onClick={() => setSelected(i)} className="card flex w-full items-center gap-4 p-3 text-left hover:border-gold">
                <span className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {img && <img src={previews.get(img) ?? img} alt="" className="h-full w-full object-cover" />}
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-semibold">{String(item[collection.titleKey] || `New ${collection.itemLabel}`)}</span>
                  <span className="block truncate text-xs text-muted-foreground">{collection.subtitle?.(item)}</span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
