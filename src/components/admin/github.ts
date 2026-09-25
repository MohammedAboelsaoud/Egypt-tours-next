/**
 * The admin page talks to GitHub directly from the browser: it reads the
 * content files, and every save is a commit. The hosting service (Vercel)
 * sees the commit and rebuilds the site.
 */

export type RepoConfig = { owner: string; repo: string; branch: string; token: string }

export class GitHubError extends Error {
  constructor(message: string, readonly status: number) {
    super(message)
  }
}

async function api<T>(cfg: RepoConfig, path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`https://api.github.com/repos/${cfg.owner}/${cfg.repo}${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${cfg.token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
    },
    cache: "no-store",
  })
  if (!res.ok) {
    let detail = ""
    try {
      detail = ((await res.json()) as { message?: string }).message ?? ""
    } catch {}
    throw new GitHubError(explain(res.status, detail), res.status)
  }
  return res.json() as Promise<T>
}

function explain(status: number, detail: string): string {
  if (status === 401) return "GitHub rejected the access token. Check it was copied fully and hasn't expired."
  if (status === 403) return `GitHub refused access: ${detail || "the token needs Contents: Read and write permission on this repository."}`
  if (status === 404) return "Not found on GitHub. Check the repository name and branch, and that the token has access to this repository."
  if (status === 409) return "Someone else saved a newer version. Reload the page and try again."
  if (status === 422) return `GitHub couldn't save: ${detail}`
  return `GitHub error ${status}${detail ? `: ${detail}` : ""}`
}

// Base64 that survives Arabic, accents and emoji (plain btoa only handles Latin-1).
export function toBase64(bytes: Uint8Array): string {
  let binary = ""
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  }
  return btoa(binary)
}

function textToBase64(text: string): string {
  return toBase64(new TextEncoder().encode(text))
}

function base64ToText(b64: string): string {
  const binary = atob(b64.replace(/\s/g, ""))
  return new TextDecoder().decode(Uint8Array.from(binary, (c) => c.charCodeAt(0)))
}

/** Checks the token can write to the repository. */
export async function checkAccess(cfg: RepoConfig): Promise<void> {
  const repo = await api<{ permissions?: { push?: boolean } }>(cfg, "")
  if (repo.permissions && !repo.permissions.push) {
    throw new GitHubError("This token can read the repository but not save to it. Give it Contents: Read and write.", 403)
  }
  await api(cfg, `/branches/${encodeURIComponent(cfg.branch)}`)
}

export type LoadedFile<T> = { data: T; sha: string }

export async function readJson<T>(cfg: RepoConfig, path: string): Promise<LoadedFile<T>> {
  const file = await api<{ content: string; sha: string }>(cfg, `/contents/${path}?ref=${encodeURIComponent(cfg.branch)}`)
  return { data: JSON.parse(base64ToText(file.content)) as T, sha: file.sha }
}

/** Commits a file; returns its new sha. */
async function putFile(cfg: RepoConfig, path: string, base64: string, message: string, sha?: string): Promise<string> {
  const res = await api<{ content: { sha: string } }>(cfg, `/contents/${path}`, {
    method: "PUT",
    body: JSON.stringify({ message, content: base64, branch: cfg.branch, ...(sha ? { sha } : {}) }),
  })
  return res.content.sha
}

export function writeJson(cfg: RepoConfig, path: string, data: unknown, message: string, sha: string): Promise<string> {
  return putFile(cfg, path, textToBase64(JSON.stringify(data, null, 2) + "\n"), message, sha)
}

export async function uploadFile(cfg: RepoConfig, path: string, bytes: Uint8Array, message: string): Promise<void> {
  await putFile(cfg, path, toBase64(bytes), message)
}
