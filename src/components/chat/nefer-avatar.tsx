import { useId } from "react"

import { cn } from "@/lib/utils"

/**
 * Nefer's portrait: an original drawing in the spirit of Queen Nefertiti's
 * bust — the flat-topped blue crown with its gold diadem, and a broad collar
 * in faience, gold and lapis. Inline so it stays crisp at every size.
 */
export function NeferAvatar({ className }: { className?: string }) {
  const clip = useId()
  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden="true"
      focusable="false"
      className={cn("size-8 shrink-0 rounded-full", className)}
    >
      <defs>
        <clipPath id={clip}>
          <circle cx="50" cy="50" r="50" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clip})`}>
        <rect width="100" height="100" fill="#efe4cc" />
        <circle cx="80" cy="22" r="11" fill="#e2b04a" />
        <path d="M40 58 C44 66 45 74 44 82 L64 84 C61 76 60 70 61 64 Z" fill="#96593a" />
        <path
          d="M36 44 L61 41 C63 46 65 49 67 52 C69 54 72 56 72 58 C72 59.5 69 60 68 60.5 C69.5 61.5 69.5 62.5 68 63.2 C69 64.2 68.6 65.6 67 66.6 C66.8 69.6 64.5 72 60.5 72.2 C55 72.5 49 70 44 66 C40 62 37 55 36 44 Z"
          fill="#b1744a"
        />
        <path d="M56.5 49.6 C58.5 47.6 62.4 47.6 63.6 49.6 C61.4 50.8 58.6 50.9 56.5 49.6 Z" fill="#161a22" />
        <path d="M56 49.8 L51.5 50.6" stroke="#161a22" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M56.4 46 C59.2 44.6 62.4 45 64.4 46.6" stroke="#161a22" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        <path d="M67.6 63 C68.8 62.9 69.4 63.5 68 64" stroke="#7a2e22" strokeWidth="1.3" fill="none" strokeLinecap="round" />
        <path
          d="M35 56 L14 18 C13 15 15 12.5 18 12 L50 6 C53 5.6 55 7.5 54.6 10.4 L61 42 Z"
          fill="#1d4e89"
          stroke="#e2b04a"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path d="M36.2 49.2 L59.4 35.6 L60.4 40.2 L37.6 53.4 Z" fill="#e2b04a" />
        <path d="M16 100 C20 88 34 80 54 82 C72 84 84 90 88 100 Z" fill="#0f7a70" />
        <path d="M23 100 C27 92 38 87 54 88.4 C68 89.6 77 94 80 100 Z" fill="#e2b04a" />
        <path d="M30 100 C34 95 42 92.6 54 93.6 C64 94.4 70 96.6 72 100 Z" fill="#1d4e89" />
      </g>
    </svg>
  )
}
