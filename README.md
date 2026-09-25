# Egypt Journeys

A website that connects tourists with tour guides, hotels and transport across
Egypt. Visitors book by sending a WhatsApp message; there are no accounts,
payments or database.

**Pages:** Home · Destinations (Cairo & Giza, Luxor & Aswan, North Coast &
El-Alamein, Sinai) · Historic Sites (a catalog of 20 sites with their history)
· Hotels · Transport · Tour Guides · Contact · Admin. A chat assistant is
available on every page.

Built with Next.js, React and Tailwind CSS. The build is a static site, so it
can be hosted for free on Vercel or Netlify.

---

## Editing the website yourself: the admin page

Go to **`/admin/`** on your site (for example `https://your-site.vercel.app/admin/`).
From there you can edit everything without touching code:

| Section            | What you can change                                                          |
| ------------------ | ---------------------------------------------------------------------------- |
| **Settings**       | Business name, WhatsApp number, email, hours, social links                   |
| **Destinations**   | Text, highlights, main photo and photo gallery of the four regions           |
| **Historic sites** | The catalog: add or edit sites, their history chapters, facts, tips, photos  |
| **Hotels**         | Add, remove or edit hotels, prices, stars, ratings and photos                |
| **Transport**      | Vehicles, prices ("price on request" is a tick box) and photos               |
| **Tour guides**    | Guide profiles and photos                                                    |

**Photos:** press **Upload photo** and pick a file from your computer or phone.
Big photos are shrunk to web size automatically.

**Saving:** press **Save & publish**. The site rebuilds itself and shows the
change about a minute later.

### Signing in (one time)

The admin page saves your changes straight into this GitHub repository, so it
needs a GitHub access token instead of a password:

1. Open [github.com/settings/personal-access-tokens/new](https://github.com/settings/personal-access-tokens/new).
2. Name it "Website admin" and pick an expiration date.
3. **Repository access** → **Only select repositories** → `Egypt-tours-next`.
4. **Permissions** → **Repository permissions** → **Contents** → **Read and write**.
5. Click **Generate token**, copy it, and paste it into the admin page.

Treat the token like a password. If it ever leaks, delete it on the same GitHub
page; the website keeps working and you can create a new one.

> The admin needs the site to be hosted by a service that rebuilds when the
> repository changes. **Vercel is already connected to this repository**, so
> every save goes live automatically. (Netlify drag-and-drop does *not* rebuild
> automatically; connect Netlify to the GitHub repository instead if you prefer it.)

### Where the content lives

Everything the admin edits is plain JSON in `src/content/`. You can also edit
those files by hand on GitHub. The chat assistant reads the same files, so
its prices and history answers always match the site. Historic sites you add
get their own page, and the assistant links to them using the site's keywords.

---

## Publish it (free)

**Easiest:** the repository is already connected to Vercel, so merging to
`main` publishes the site. The steps below are for hosting it somewhere else.

1. Install **Node.js LTS** from [nodejs.org](https://nodejs.org).
2. Open a terminal in this folder and run:
   ```bash
   npm install
   ```
3. Build the site:
   ```bash
   npm run build
   ```
   This creates a folder called **`out`**.
4. Go to [app.netlify.com/drop](https://app.netlify.com/drop) and drag the
   **`out`** folder onto the page. You get a free link like
   `yourservice.netlify.app`. To upload an updated version later, open your
   site in Netlify, go to **Deploys**, and drag the new `out` folder there.

### Preview on your own computer

```bash
npm run dev
```

Then open http://localhost:3000. Changes you save appear straight away.

---

## For developers

```bash
npm run dev     # development server
npm run build   # static export to out/
npm run lint    # type-check
npm test        # unit tests (chatbot, WhatsApp links, data files)
```

- `output: "export"` in `next.config.ts` makes the build fully static. Anything
  that needs a server (API routes, server actions, cookies, image optimisation)
  won't work.
- Booking forms build a `wa.me` link (`src/lib/whatsapp.ts`); nothing is sent to a server.
- `/admin/` is a client-only editor (`src/components/admin/`). It reads and
  commits `src/content/*.json` through the GitHub REST API using the visitor's own
  token. Its forms are generated from `schema.ts`, and `validate()` there runs
  before every save and in the tests.
- The chatbot (`src/lib/chatbot.ts`) runs in the browser and is rule-based,
  using keyword scoring plus parsers for budgets, group sizes and trip lengths.
  It makes no API calls and works offline.
