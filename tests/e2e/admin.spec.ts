import { expect, test } from "@playwright/test"

const ADMIN = {
  email: "admin@egyptjourneys.com",
  password: "Admin123!",
}

/**
 * Playwright skips its own TS loader under Bun, so these specs stay free of
 * TypeScript-only syntax and use JSDoc types instead.
 *
 * @param {import("@playwright/test").Page} page
 */
async function signInAsAdmin(page) {
  await page.goto("/admin/login")
  await page.fill("#email", ADMIN.email)
  await page.fill("#password", ADMIN.password)
  await page.getByRole("button", { name: "Sign in" }).click()
  await page.waitForURL("**/admin")
}

test.describe("admin dashboard", () => {
  test("blocks anonymous visitors", async ({ page }) => {
    await page.goto("/admin")
    await expect(page).toHaveURL(/\/admin\/login/)
  })

  test("blocks signed-in customers", async ({ page }) => {
    await page.goto("/login")
    await page.fill("#email", "traveller@example.com")
    await page.fill("#password", "Traveller123!")
    await page.getByRole("button", { name: "Sign in" }).click()
    await page.waitForURL("**/account**")

    await page.goto("/admin")
    await expect(page).toHaveURL("/")
  })

  test("shows live stats on the overview", async ({ page }) => {
    await signInAsAdmin(page)

    await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible()
    await expect(page.getByText("Total bookings")).toBeVisible()
    await expect(page.getByText("Revenue (paid)")).toBeVisible()
    await expect(page.getByText("Published tours")).toBeVisible()
  })

  test("creates, edits and deletes a tour", async ({ page }) => {
    await signInAsAdmin(page)

    const stamp = Date.now()
    const title = `E2E Test Tour ${stamp}`

    await page.goto("/admin/tours/new")
    await page.fill("#title", title)
    await page.fill("#summary", "A tour created by the end-to-end test suite.")
    await page.fill(
      "#description",
      "This tour exists only so the automated tests can prove that admin CRUD works from end to end."
    )
    await page.fill("#priceFrom", "199")
    await page.fill("#durationDays", "2")
    await page.fill("#imageUrl-url", "/img/cairo-giza.jpg")
    await page.fill("#highlights", "First highlight\nSecond highlight")

    await page.getByRole("button", { name: "Create tour" }).click()
    await page.waitForURL("**/admin/tours", { timeout: 40_000 })
    await expect(page.getByText(title)).toBeVisible()

    // Edit it
    await page.getByRole("link", { name: title }).click()
    await expect(page).toHaveURL(/\/admin\/tours\/.+\/edit/)
    await page.fill("#priceFrom", "249")
    await page.getByRole("button", { name: "Save changes" }).click()
    await page.waitForURL("**/admin/tours", { timeout: 40_000 })
    await expect(page.getByRole("row", { name: new RegExp(title) })).toContainText(
      "$249"
    )

    // Delete it
    const row = page.getByRole("row", { name: new RegExp(title) })
    await row.getByRole("button", { name: /Delete/ }).click()
    await page.getByRole("button", { name: "Delete", exact: true }).click()
    await expect(page.getByText(title)).toHaveCount(0, { timeout: 30_000 })
  })

  test("filters bookings and opens a booking detail", async ({ page }) => {
    await signInAsAdmin(page)
    await page.goto("/admin/bookings")

    await expect(page.getByRole("heading", { name: "Bookings" })).toBeVisible()

    await page.selectOption("#booking-status", "CONFIRMED")
    await expect(page).toHaveURL(/status=CONFIRMED/)
    await page.waitForTimeout(1200)

    await page.getByRole("link", { name: /^EJ-/ }).first().click()
    await expect(page).toHaveURL(/\/admin\/bookings\/.+/)
    await expect(page.getByText("What was booked")).toBeVisible()
    await expect(page.getByText("Update status")).toBeVisible()
  })

  test("approves and unapproves a review", async ({ page }) => {
    await signInAsAdmin(page)
    await page.goto("/admin/reviews?filter=approved")

    const first = page.getByRole("button", { name: "Unapprove" }).first()
    if (await first.count()) {
      await first.click()
      await expect(page.getByText(/Review hidden/i)).toBeVisible()

      await page.goto("/admin/reviews?filter=pending")
      await page.getByRole("button", { name: "Approve" }).first().click()
      await expect(page.getByText(/Review published/i)).toBeVisible()
    }
  })

  test("exports inquiries as CSV", async ({ page }) => {
    await signInAsAdmin(page)

    const response = await page.request.get("/api/admin/inquiries/export")
    expect(response.ok()).toBeTruthy()
    expect(response.headers()["content-type"]).toContain("text/csv")
    expect(await response.text()).toContain("Received")
  })

  test("saves site settings", async ({ page }) => {
    await signInAsAdmin(page)
    await page.goto("/admin/settings")

    await page.fill("#contactPhone", "+20 100 123 4567")
    await page.getByRole("button", { name: "Save settings" }).click()
    await expect(page.getByText("Settings saved.")).toBeVisible({
      timeout: 30_000,
    })
  })
})
