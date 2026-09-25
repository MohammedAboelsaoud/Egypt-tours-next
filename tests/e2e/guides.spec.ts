import { expect, test } from "@playwright/test"
import { PrismaClient } from "@prisma/client"

/**
 * The guide marketplace end to end: a guide applies, an admin approves, two
 * travellers request overlapping days, the guide accepts one and the other is
 * declined automatically. Plus blocked days, reviews and access rules.
 *
 * JSDoc only — Playwright skips its TypeScript loader under Bun (see README).
 */

const prisma = new PrismaClient()
const stamp = Date.now().toString(36)

/** A date `days` from today as YYYY-MM-DD. Far ahead, so runs don't collide. */
function isoIn(days) {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

/**
 * @param {import("@playwright/test").Page} page
 * @param {string} email
 * @param {string} password
 */
async function signIn(page, email, password) {
  await page.goto("/login")
  await page.fill("#email", email)
  await page.fill("#password", password)
  await page.getByRole("button", { name: "Sign in" }).click()
  await page.waitForURL(/\/(account|guide)/)
}

/**
 * Registers a traveller with the full profile.
 * @param {import("@playwright/test").Page} page
 * @param {string} name
 * @param {string} email
 */
async function registerTraveller(page, name, email) {
  await page.goto("/register")
  await page.fill("#name", name)
  await page.fill("#email", email)
  await page.fill("#password", "Traveller123!")
  await page.fill("#confirmPassword", "Traveller123!")
  await page.fill("#phone", "+44 7700 900123")
  await page.selectOption("#nationality", "United Kingdom")
  await page.locator("label[for='lang-english']").click()
  await page.getByRole("button", { name: "Create account" }).click()
  await page.waitForURL(/\/account/)
}

test.afterAll(async () => {
  // Remove the accounts this run created; their guide profiles and requests cascade.
  await prisma.user.deleteMany({
    where: { email: { in: [`guide-${stamp}@example.com`, `alice-${stamp}@example.com`, `bob-${stamp}@example.com`] } },
  })
  await prisma.$disconnect()
})

test.describe("tour guides", () => {
  test("guide applies, admin approves, travellers request and the guide accepts one", async ({ browser }) => {
    test.setTimeout(240_000)
    const guideName = `E2E Guide ${stamp}`
    const guideEmail = `guide-${stamp}@example.com`
    const slug = `e2e-guide-${stamp}`
    const offset = 200 + Math.floor(Math.random() * 100)
    const start = isoIn(offset)
    const end = isoIn(offset + 1)

    // 1. The guide applies and lands on a dashboard that says it's pending.
    const guideCtx = await browser.newContext()
    const guide = await guideCtx.newPage()
    await guide.goto("/guides/register")
    await guide.fill("#name", guideName)
    await guide.fill("#email", guideEmail)
    await guide.fill("#password", "Guide123!")
    await guide.fill("#confirmPassword", "Guide123!")
    await guide.fill("#displayName", guideName)
    await guide.selectOption("#guideType", "Egyptologist")
    await guide.fill("#bio", "Licensed Egyptologist guiding at Giza and Saqqara for ten years, with a love of hieroglyphs.")
    await guide.fill("#specialties", "Pyramids of Giza\nSaqqara")
    await guide.getByRole("group", { name: "Where you guide" }).getByText("Cairo & Giza").click()
    await guide.locator("label[for='guide-lang-english']").click()
    await guide.fill("#whatsapp", "+20 100 555 9999")
    await guide.getByRole("button", { name: "Apply to guide" }).click()
    await guide.waitForURL(/\/guide$/)
    await expect(guide.getByText("Waiting for approval")).toBeVisible()

    // Not public yet.
    const anon = await browser.newPage()
    await anon.goto("/guides")
    await expect(anon.getByRole("link", { name: guideName })).toHaveCount(0)

    // 2. An admin approves the application.
    const adminCtx = await browser.newContext()
    const admin = await adminCtx.newPage()
    await admin.goto("/admin/login")
    await admin.fill("#email", "admin@egyptjourneys.com")
    await admin.fill("#password", "Admin123!")
    await admin.getByRole("button", { name: /sign in/i }).click()
    await admin.waitForURL(/\/admin$/)
    await admin.goto("/admin/guides?status=PENDING")
    const card = admin.locator("li", { has: admin.getByRole("heading", { name: guideName }) })
    await card.getByRole("button", { name: "Approve" }).click()
    await expect(admin.getByText(`${guideName} approved.`)).toBeVisible()

    await anon.goto("/guides")
    await expect(anon.getByRole("link", { name: guideName })).toBeVisible()

    // 3. Two travellers request overlapping days.
    const aCtx = await browser.newContext()
    const a = await aCtx.newPage()
    await registerTraveller(a, "Alice Traveller", `alice-${stamp}@example.com`)
    await a.goto(`/guides/${slug}?from=${start}&to=${end}`)
    await expect(a.getByText(/is free for all 2 days/)).toBeVisible()
    await a.fill("#req-message", "Giza at sunrise and Saqqara after lunch, please.")
    await a.getByRole("button", { name: /Send request to/ }).click()
    await expect(a.getByRole("heading", { name: "Request sent" })).toBeVisible()

    const bCtx = await browser.newContext()
    const b = await bCtx.newPage()
    await registerTraveller(b, "Bob Traveller", `bob-${stamp}@example.com`)
    await b.goto(`/guides/${slug}?from=${end}&to=${end}`)
    await b.fill("#req-message", "One day at the Egyptian Museum.")
    await b.getByRole("button", { name: /Send request to/ }).click()
    await expect(b.getByRole("heading", { name: "Request sent" })).toBeVisible()

    // Contact details stay hidden before acceptance.
    await a.goto("/account/guides")
    await expect(a.getByText("Waiting for the guide")).toBeVisible()
    await expect(a.getByText("+20 100 555 9999")).toHaveCount(0)

    // 4. The guide sees the clash and accepts Alice; Bob is declined for them.
    await guide.goto("/guide/requests")
    await expect(guide.getByText(/Another request overlaps these dates/).first()).toBeVisible()
    const alice = guide.locator("article", { hasText: "Alice Traveller" })
    await alice.getByRole("button", { name: "Accept trip" }).click()
    await expect(guide.getByText(/1 other request for those days was declined/)).toBeVisible()

    await a.goto("/account/guides")
    await expect(a.getByText("Confirmed")).toBeVisible()
    await expect(a.getByText("+20 100 555 9999")).toBeVisible()

    await b.goto("/account/guides")
    await expect(b.getByText("Declined")).toBeVisible()
    await expect(b.getByRole("link", { name: "See guides free on these dates" })).toBeVisible()

    // 5. Those days are now unavailable, and the server refuses a new request.
    await b.goto(`/guides/${slug}?from=${end}&to=${end}`)
    await expect(b.getByText(/Not available on/)).toBeVisible()

    await anon.goto(`/guides?from=${start}&to=${end}`)
    await expect(anon.getByRole("link", { name: guideName })).toHaveCount(0)

    await Promise.all([guideCtx, adminCtx, aCtx, bCtx].map((c) => c.close()))
    await anon.close()
  })

  test("a guide's blocked days can't be requested", async ({ browser }) => {
    const day = isoIn(330)

    const guideCtx = await browser.newContext()
    const guide = await guideCtx.newPage()
    await guide.goto("/guides/login")
    await guide.fill("#email", "guide.salem@example.com")
    await guide.fill("#password", "Guide123!")
    await guide.getByRole("button", { name: "Sign in" }).click()
    await guide.waitForURL(/\/guide$/)
    await guide.goto("/guide/calendar")
    await guide.fill("#block-from", day)
    await guide.fill("#block-to", day)
    await guide.getByRole("button", { name: "Block these days" }).click()
    await expect(guide.getByText("Day blocked.")).toBeVisible()

    const traveller = await browser.newPage()
    await signIn(traveller, "traveller@example.com", "Traveller123!")
    await traveller.goto(`/guides/salem-abu-mousa?from=${day}&to=${day}`)
    await expect(traveller.getByText(/Not available on/)).toBeVisible()

    // Reopen it so the demo data stays clean.
    await guide.getByRole("button", { name: "Reopen them" }).click()
    await expect(guide.getByText("Day reopened.")).toBeVisible()
    await traveller.reload()
    await expect(traveller.getByText(/is free for all 1 day/)).toBeVisible()

    await guideCtx.close()
    await traveller.close()
  })

  test("a traveller rates a guide after a completed trip", async ({ page }) => {
    // Start from the seeded, unreviewed trip GR-DEMO03 every run.
    await prisma.guideReview.deleteMany({ where: { request: { reference: "GR-DEMO03" } } })

    await signIn(page, "traveller@example.com", "Traveller123!")
    await page.goto("/account/guides")
    const trip = page.locator("article", { hasText: "GR-DEMO03" })
    await trip.getByRole("button", { name: "5 stars" }).click()
    await trip.getByLabel("Your review").fill(`Wonderful day on the Nile. ${stamp}`)
    await trip.getByRole("button", { name: "Post review" }).click()
    await expect(page.getByText(/Your review is live/)).toBeVisible()

    await page.goto("/guides/hamdy-nour")
    await expect(page.getByText(`Wonderful day on the Nile. ${stamp}`)).toBeVisible()
  })

  test("access rules: dashboards and hidden profiles", async ({ page }) => {
    // Signed out → guide sign-in.
    await page.goto("/guide")
    await expect(page).toHaveURL(/\/guides\/login/)

    // A traveller can't open the guide dashboard.
    await signIn(page, "traveller@example.com", "Traveller123!")
    await page.goto("/guide/requests")
    await expect(page).toHaveURL(/\/guides\/login/)

    // A pending application isn't public.
    await page.goto("/guides/youssef-adel")
    await expect(page.getByRole("heading", { name: "Youssef Adel" })).toHaveCount(0)
  })
})
