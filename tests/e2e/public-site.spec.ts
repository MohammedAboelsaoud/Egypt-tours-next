import { expect, test } from "@playwright/test"
import { PrismaClient } from "@prisma/client"

test.describe("public site", () => {
  test("homepage shows the hero, destinations and featured tours", async ({
    page,
  }) => {
    await page.goto("/")

    await expect(
      page.getByRole("heading", { level: 1, name: /Egypt, Planned/i })
    ).toBeVisible()
    await expect(page.getByRole("link", { name: "Start Planning" }).first()).toBeVisible()

    await expect(page.getByRole("heading", { name: "Cairo & Giza" })).toBeVisible()
    await expect(
      page.getByRole("heading", { name: /Journeys travellers keep booking/i })
    ).toBeVisible()
  })

  test("navigates from the homepage into a destination and a tour", async ({
    page,
  }) => {
    await page.goto("/")

    await page.getByRole("link", { name: /Cairo & Giza/ }).first().click()
    await expect(page).toHaveURL(/\/destinations\/cairo-giza/)
    await expect(
      page.getByRole("heading", { level: 1, name: "Cairo & Giza" })
    ).toBeVisible()

    // Cards use a stretched link plus a hover transform, so Playwright's
    // stability check needs a nudge here.
    await page
      .getByRole("link", { name: /Pyramids & Old Cairo/ })
      .first()
      .click({ force: true })
    await expect(page).toHaveURL(/\/tours\/pyramids-and-old-cairo-3-days/)
    await expect(page.getByText("Your itinerary")).toBeVisible()
    await expect(page.getByRole("link", { name: "Book now" })).toBeVisible()
  })

  test("filters the tour listing by region and price", async ({ page }) => {
    await page.goto("/tours")

    const total = await page.locator("article").count()
    expect(total).toBeGreaterThan(0)

    await page.selectOption("#filter-region", "sinai-red-sea")
    await expect(page).toHaveURL(/region=sinai-red-sea/)
    await page.waitForTimeout(1200)

    const filtered = await page.locator("article").count()
    expect(filtered).toBeGreaterThan(0)
    expect(filtered).toBeLessThanOrEqual(total)

    // Every remaining card is labelled with the region we filtered to.
    const cards = page.locator("article")
    for (let index = 0; index < filtered; index++) {
      await expect(cards.nth(index)).toContainText("Sinai & the Red Sea")
    }
  })

  test("hotel and car listings render with filters", async ({ page }) => {
    await page.goto("/hotels")
    await expect(page.locator("article").first()).toBeVisible()
    await expect(page.locator("#filter-stars")).toBeVisible()

    await page.goto("/car-rentals")
    await expect(page.locator("article").first()).toBeVisible()
    await expect(page.locator("#filter-seats")).toBeVisible()
  })

  test("the FAQ accordion opens an answer", async ({ page }) => {
    await page.goto("/faq")

    const question = page.getByRole("button", { name: /Do I need a visa\?/ })
    await question.click()
    await expect(
      page.getByText(/30-day tourist visa on arrival/i)
    ).toBeVisible()
  })

  test("submits the contact form and stores the enquiry", async ({ page }) => {
    await page.goto("/contact")

    const stamp = Date.now()
    await page.fill("#name", "Playwright Tester")
    await page.fill("#email", `e2e-${stamp}@example.com`)
    await page.fill(
      "#message",
      "This is an automated end-to-end test enquiry about a trip to Luxor."
    )
    await page.getByRole("button", { name: /Send enquiry/ }).click()

    await expect(page.getByText(/Thank you — it's sent/i)).toBeVisible({
      timeout: 30_000,
    })
  })

  test("contact form takes start and end dates from date pickers", async ({ page }) => {
    const email = `dates-${Date.now()}@example.com`
    await page.goto("/contact")
    await page.fill("#name", "Date Picker")
    await page.fill("#email", email)
    await page.fill("#startDate", "2027-03-12")
    await page.fill("#endDate", "2027-03-10")
    await page.fill("#message", "Checking that the end date can't be before the start date.")
    await page.getByRole("button", { name: /Send enquiry/ }).click()
    await expect(page.getByText(/end date must be on or after/i)).toBeVisible()

    await page.fill("#endDate", "2027-03-20")
    await page.getByRole("button", { name: /Send enquiry/ }).click()
    await expect(page.getByText(/Thank you — it's sent/i)).toBeVisible({ timeout: 30_000 })

    const prisma = new PrismaClient()
    try {
      const inquiry = await prisma.inquiry.findFirst({ where: { email } })
      expect(inquiry?.travelDates).toBe("12 Mar 2027 – 20 Mar 2027 (9 days)")
      await prisma.inquiry.deleteMany({ where: { email } })
    } finally {
      await prisma.$disconnect()
    }
  })

  test("serves a sitemap and robots.txt", async ({ request }) => {
    const sitemap = await request.get("/sitemap.xml")
    expect(sitemap.ok()).toBeTruthy()
    expect(await sitemap.text()).toContain("/tours/")

    const robots = await request.get("/robots.txt")
    expect(robots.ok()).toBeTruthy()
    expect(await robots.text()).toContain("Sitemap:")
  })

  test("unknown routes render the 404 page", async ({ page }) => {
    const response = await page.goto("/this-page-does-not-exist")
    expect(response?.status()).toBe(404)
    await expect(page.getByText(/This path leads nowhere/i)).toBeVisible()
  })
})
