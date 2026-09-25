# Egypt Journeys

A website that connects tourists with tour guides, hotels and transport across
Egypt. Visitors book by sending a WhatsApp message; there are no accounts,
payments or database.

**Pages:** Home · Destinations (Cairo & Giza, Luxor & Aswan, North Coast &
El-Alamein, Sinai) · Hotels · Transport · Tour Guides · Contact. A chat
assistant is available on every page.

Built with Next.js, React and Tailwind CSS. The build is a static site, so it
can be hosted for free on Netlify.

---

## Before you publish: 3 things to change

Open `src/data/site.ts` and change:

1. **`whatsapp`**: your WhatsApp number. Write the country code and number as
   digits only. For example, `0100 123 4567` becomes `201001234567`.
   **The number there now is a placeholder.**
2. **`email`**, **`hours`** and **`location`**: your contact details.
3. **`url`**: the address of your site once it's live, for example
   `https://egyptjourneys.netlify.app`.

---

## Editing prices, hotels, cars and guides

Everything is in `src/data/`. You don't need to know how to code; change
the text between the quotes, or the numbers:

| File              | What's in it                                             |
| ----------------- | -------------------------------------------------------- |
| `site.ts`         | Business name, WhatsApp number, email, hours, socials    |
| `hotels.ts`       | Hotels: name, stars, guest rating, price per night (USD) |
| `transport.ts`    | Vehicles and price per day (`null` = "on request")       |
| `guides.ts`       | Tour guide profiles                                      |
| `destinations.ts` | Destination text, highlights and best time to visit      |

**Photos:** put image files in `public/img/` and write the path in the data
file, for example `image: "/img/hotels/mena-house.jpg"`. The hotels use
destination photos for now; replace them with real photos of each hotel
(use photos you have permission to use).

**Chat assistant:** it answers from `src/lib/chatbot.ts` and the data files,
so hotel and car prices in its answers always match the site. To teach it a new
answer, add a new entry to `KNOWLEDGE` with a list of keywords and a reply.

After any change, run the build again (step 3 below) and upload the new `out` folder.

---

## Publish it (free)

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
- The chatbot (`src/lib/chatbot.ts`) runs in the browser and is rule-based,
  using keyword scoring plus parsers for budgets, group sizes and trip lengths.
  It makes no API calls and works offline.
