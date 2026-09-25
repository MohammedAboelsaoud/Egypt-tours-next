# Egypt Journeys

A full-stack tourism platform for discovering and booking tours, hotels and car
rentals across Egypt — with Stripe checkout and a complete admin dashboard.

**Tagline:** Egypt, Planned Around You

```
Next.js 16 (App Router) · TypeScript · Bun · PostgreSQL + Prisma
NextAuth v5 · Tailwind v4 + shadcn/ui · Stripe · Resend · Cloudinary
Vitest + Playwright
```

---

## Quick start

```bash
bun install
cp .env.example .env          # then fill in DATABASE_URL and AUTH_SECRET
bun run db:push               # create the schema
bun run db:seed               # 4 regions, 8 tours, 8 hotels, 6 cars, admin user
bun run dev                   # http://localhost:3000
```

Sign in at `/admin/login` with the seeded credentials:

| Role     | Email                       | Password        |
| -------- | --------------------------- | --------------- |
| Admin    | `admin@egyptjourneys.com`   | `Admin123!`     |
| Customer | `traveller@example.com`     | `Traveller123!` |

Change these before going anywhere near production — they are set by
`SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`.

### Generating `AUTH_SECRET`

```bash
openssl rand -base64 32
```

---

## Everything runs without third-party keys

The app boots and the whole booking flow works with nothing but a database.
Each integration degrades to a safe local fallback until you add its keys:

| Integration      | Without keys                                                        |
| ---------------- | ------------------------------------------------------------------- |
| **Stripe**       | Booking flow offers a "simulate payment" button (dev only)           |
| **Resend**       | Emails are logged to the server console instead of sent              |
| **Cloudinary**   | Admin uploads are written to `public/uploads/`                       |
| **Google Maps**  | Maps render a styled panel with coordinates and a Google Maps link   |
| **Google OAuth** | The Google button is hidden; email + password still works            |
| **Facebook**     | The Facebook button is hidden                                        |

The admin **Settings** page shows which integrations are connected.

---

## Scripts

| Command             | What it does                                  |
| ------------------- | --------------------------------------------- |
| `bun run dev`       | Dev server (Turbopack)                        |
| `bun run build`     | `prisma generate` + production build          |
| `bun run start`     | Serve the production build                    |
| `bun run lint`      | `tsc --noEmit` type check                     |
| `bun run test`      | Vitest unit + integration tests               |
| `bun run test:e2e`  | Playwright end-to-end tests                   |
| `bun run db:push`   | Push the Prisma schema to the database        |
| `bun run db:seed`   | Seed content (safe to re-run — upserts)       |
| `bun run db:studio` | Prisma Studio                                 |

---

## Project structure

```
src/
├── app/
│   ├── (site)/          public site — home, destinations, tours, hotels,
│   │                    car rentals, booking flow, account, about, faq
│   ├── (auth)/          sign in / register
│   ├── admin/           login + (dashboard) with CRUD for everything
│   └── api/             auth, bookings, payments, uploads, public JSON API
├── actions/             server actions (admin CRUD, wishlist, reviews, profile)
├── components/          ui/ (shadcn) + layout, home, tours, hotels, cars,
│                        booking, maps, admin, filters
├── lib/                 prisma, auth, stripe, payments, resend, cloudinary, pricing,
│                        queries, settings, validations, utils, constants
├── types/               shared types + NextAuth module augmentation
└── proxy.ts             route protection (Next 16 renamed middleware → proxy)
prisma/                  schema.prisma + seed.ts
tests/                   unit/ · integration/ · e2e/
```

---

## How the booking flow works

1. **Dates & guests** — price recalculates live via `lib/pricing.ts`
2. **Your details** — pre-filled from the traveller's profile
3. **Review** — full summary behind a terms checkbox
4. **Payment** — `POST /api/bookings` creates a `PENDING` booking, then
   `/api/payments/stripe/checkout` opens an embedded Stripe Checkout Session.
   When the card is accepted, `/api/payments/stripe/confirm` re-reads the
   session from Stripe before confirming. The `checkout.session.completed`
   webhook confirms it as well, in case the traveller closes the tab first.
5. **Confirmation** — booking becomes `CONFIRMED` / `PAID`, reference shown,
   confirmation email sent to the traveller and an alert to the admin

Prices are **always recalculated server-side** in `/api/bookings` before a
Stripe payment is created — the client's number is never trusted. Capacity limits
(tour group size, hotel guests, car seats) are enforced there too.

Pricing rules:

| Type  | Charged            |
| ----- | ------------------ |
| Tour  | per person         |
| Hotel | per night          |
| Car   | per day, w/ driver |

---

## Chat assistant ("Ask Nefer")

A floating assistant on every public page answers travellers' questions. It is
**free to run**: no AI provider, no API key, no per-message cost. It answers from
the site's own content:

- **Practical questions** (visas, safety, seasons, tipping, dress, payment,
  cancellation…) from the same FAQ data as `/faq` (`src/lib/faq.ts`)
- **Tours, hotels and cars** by place, budget ("under $500"), trip length
  ("3 days"), group size and car type, shown as cards linking to their pages
- **Trip enquiries**: asking to plan a trip opens a short form in the chat that
  posts to `/api/inquiries`, so it lands in **Admin → Inquiries** and sends the
  usual emails
- **Human hand-off**: WhatsApp, phone, email and the contact page

How it fits together: `src/lib/chat/engine.ts` (pure matching logic, unit
tested), `src/lib/chat/knowledge.ts` (catalogue snapshot, cached 10 minutes),
`POST /api/chat` (validated, rate-limited per IP) and
`src/components/chat/chat-widget.tsx`. New tours, hotels and cars added in the
admin show up in answers automatically. To teach it a new practical topic, add
the question to `src/lib/faq.ts` and its trigger words to `FAQ_TOPICS` in the
engine.

---

## Admin dashboard (`/admin`)

Restricted to `ADMIN` users; enforced in `proxy.ts` and again in the layout.

- **Overview** — bookings, revenue, open inquiries, pending reviews, recent activity
- **Bookings** — searchable and filterable, with a detail page and status updates
- **Tours / Hotels / Cars / Regions** — full CRUD, image upload, publish toggles,
  an itinerary builder and a room-type builder
- **Inquiries** — contact form submissions, mark handled, CSV export
- **Reviews** — approve or reject; reviews stay hidden until approved
- **Settings** — site name, contact details, WhatsApp, and a
  read-only view of which integrations are connected

All site content is editable from here — no code changes needed.

---

## Testing

```bash
bun run test       # 57 unit + integration tests
bun run test:e2e   # 48 end-to-end tests (desktop Chrome + Pixel 7)
```

The E2E suite covers the public site, the full booking flow through to a
confirmed payment, wishlist, auth gates, admin CRUD including creating,
editing and deleting a tour, and the chat assistant.

> **Note on Bun:** Playwright skips its own TypeScript loader when it detects
> Bun (`if ("Bun" in globalThis) return` in its ESM loader), so the files in
> `tests/e2e/` deliberately avoid TypeScript-only syntax and use JSDoc types
> instead. They are excluded from `tsconfig.json` for the same reason. Under
> Node.js this restriction does not apply.

---

## Deploying to Vercel

1. Push the repository to GitHub and import it into Vercel.
2. Provision PostgreSQL (Neon, Supabase or Vercel Postgres) and set
   `DATABASE_URL`.
3. Add every variable from `.env.example` to the Vercel project.
   `NEXTAUTH_URL` and `NEXT_PUBLIC_SITE_URL` must be your production URL.
4. The build command is `bun run build` (it runs `prisma generate` first).
5. After the first deploy, push the schema and seed:
   ```bash
   DATABASE_URL="<production url>" bunx prisma db push
   DATABASE_URL="<production url>" bun run db:seed
   ```
6. Test with Stripe **test** keys first (card `4242 4242 4242 4242`, any future
   date and CVC), then swap in the live keys.
7. In the Stripe dashboard, add a webhook endpoint for
   `https://your-domain.com/api/payments/stripe/webhook` with the events
   `checkout.session.completed` and `checkout.session.async_payment_succeeded`.
   Put its signing secret in `STRIPE_WEBHOOK_SECRET`. Locally, run
   `stripe listen --forward-to localhost:3000/api/payments/stripe/webhook`
   to get a secret for development.

Add the OAuth redirect URLs in each provider's console:
`https://your-domain.com/api/auth/callback/google` (and `/facebook`).

---

## Performance & SEO

- Server Components throughout; ISR (`revalidate = 3600`) on region, tour, hotel
  and car pages — 72 pages are prerendered at build time
- `next/image` with remote patterns for Cloudinary and Unsplash
- `next/font` for Gloock and Hanken Grotesk (no layout shift)
- Skeleton loading states, and dynamic imports for the map and Stripe checkout
- Per-page metadata and canonical URLs, Open Graph images
- JSON-LD: `TravelAgency`, `TouristDestination`, `Product`, `Hotel`,
  `FAQPage`, `BreadcrumbList`, `AggregateRating`
- Generated `sitemap.xml` and `robots.txt`

Per-viewer state (such as the wishlist button) is resolved on the client so it
is never baked into a cached page.

---

## Brand: "Faience & Limestone"

Named after the materials of ancient Egypt. Tokens live in `src/app/globals.css`
and are exposed as Tailwind utilities (`bg-lapis`, `text-ochre`, `bg-basalt`…).

| Token        | Hex       | Use                                                  |
| ------------ | --------- | ---------------------------------------------------- |
| `lapis`      | `#1D4E89` | Egyptian blue. Primary actions, links, prices, icons |
| `lapis-deep` | `#163D6C` | Hover and pressed state of lapis fills               |
| `sun`        | `#E2B04A` | Sun disc. Accents on dark grounds, rating stars      |
| `ochre`      | `#8D5C0F` | Eyebrow labels and warm accents on light grounds     |
| `faience`    | `#0F7A70` | Success states, secondary accent                     |
| `basalt`     | `#161A22` | Text, dark sections, footer                          |
| `limestone`  | `#F4F3EF` | Page background                                      |
| `papyrus`    | `#FBFAF7` | Cards, header, popovers                              |
| `carnelian`  | `#B23A26` | Errors and destructive actions                       |

Headings use **Gloock**, body copy **Hanken Grotesk**. Small uppercase
letter-spaced eyebrow labels (`.eyebrow`, ochre) sit above section headings,
followed by the `.horizon-rule`: a short lapis bar ending in a sun disc. Corners
are tight (`--radius: 0.375rem`) and badges can take the `cartouche` variant.
Every text colour meets WCAG AA on the grounds listed above.

The full design system (tokens, type scale, component guidelines and previews)
is published as a Design System artifact.
