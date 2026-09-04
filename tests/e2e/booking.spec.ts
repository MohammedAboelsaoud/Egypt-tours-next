import { expect, test } from "@playwright/test"

const CUSTOMER = {
  email: "traveller@example.com",
  password: "Traveller123!",
}

/**
 * Playwright skips its own TS loader under Bun, so these specs stay free of
 * TypeScript-only syntax and use JSDoc types instead.
 *
 * @param {import("@playwright/test").Page} page
 */
async function signIn(page) {
  await page.goto("/login")
  await page.fill("#email", CUSTOMER.email)
  await page.fill("#password", CUSTOMER.password)
  await page.getByRole("button", { name: "Sign in" }).click()
  await page.waitForURL("**/account**")
}

test.describe("booking flow", () => {
  test("requires sign-in before booking", async ({ page }) => {
    await page.goto("/tours/pyramids-and-old-cairo-3-days")
    await page.getByRole("link", { name: "Book now" }).click()

    await expect(page).toHaveURL(/\/login\?callbackUrl=/)
    await expect(page.getByRole("heading", { name: /Welcome back/i })).toBeVisible()
  })

  test("completes a tour booking end to end", async ({ page }) => {
    await signIn(page)

    await page.goto("/tours/pyramids-and-old-cairo-3-days")
    await page.getByRole("link", { name: "Book now" }).click()
    await expect(page).toHaveURL(/\/book\/tour\//)

    // Step 1 — dates and guests
    await expect(page.getByText("When are you travelling?")).toBeVisible()
    await page.selectOption("#guests", "2")
    await expect(page.getByText("$260 × 2 travellers")).toBeVisible()
    // The summary shows the line total and the grand total; check the latter.
    await expect(page.locator("aside").getByText("$520").last()).toBeVisible()
    await page.getByRole("button", { name: "Continue" }).click()

    // Step 2 — traveller details
    await expect(page.getByText("Who is travelling?")).toBeVisible()
    await page.fill("#contactPhone", "+1 555 0100")
    await page.selectOption("#nationality", "United States")
    await page.fill("#specialRequests", "Vegetarian meals, please.")
    await page.getByRole("button", { name: "Review booking" }).click()

    // Step 3 — review, terms gate
    await expect(page.getByText("Check everything over")).toBeVisible()
    await page.getByRole("button", { name: /Continue to payment/ }).click()
    await expect(
      page.getByText(/accept the terms and conditions/i)
    ).toBeVisible()

    await page.locator("label").filter({ hasText: "I accept the booking terms" }).click()
    await page.getByRole("button", { name: /Continue to payment/ }).click()

    // Step 4 — payment
    await expect(page.getByRole("heading", { name: "Payment" })).toBeVisible({
      timeout: 30_000,
    })
    await expect(page.getByText(/EJ-[A-Z0-9]{6}/)).toBeVisible()

    await page.getByRole("button", { name: /Simulate payment/ }).click()

    // Step 5 — confirmation
    await expect(
      page.getByRole("heading", { name: /Your booking is confirmed/i })
    ).toBeVisible({ timeout: 40_000 })
    const reference = await page.getByText(/^EJ-[A-Z0-9]{6}$/).first().textContent()
    expect(reference).toMatch(/^EJ-[A-Z0-9]{6}$/)

    // The booking shows up in the account area
    await page.getByRole("link", { name: "View my bookings" }).click()
    await expect(page).toHaveURL(/\/account\/bookings/)
    await expect(page.getByText(String(reference).trim())).toBeVisible()
    await expect(page.getByText("Paid").first()).toBeVisible()
  })

  test("prices a hotel stay per night", async ({ page }) => {
    await signIn(page)

    await page.goto("/hotels/nile-view-boutique-cairo")
    await page.getByRole("link", { name: "Book now" }).click()
    await expect(page).toHaveURL(/\/book\/hotel\//)

    // Default span is three nights at $180.
    await expect(page.getByText("$180 × 3 nights")).toBeVisible()
    await expect(page.locator("aside").getByText("$540").last()).toBeVisible()
  })

  test("saves a tour to the wishlist", async ({ page }) => {
    await signIn(page)

    await page.goto("/tours/luxor-highlights-2-days")
    const save = page.getByRole("button", { name: /Save for later|Saved/ })
    await save.click()
    await expect(page.getByRole("button", { name: "Saved" })).toBeVisible()
    // The button flips optimistically — wait for the server action to land
    // before navigating away.
    await expect(page.getByText("Saved to your wishlist")).toBeVisible()

    await page.goto("/account/wishlist")
    await expect(page.getByText("Luxor Highlights — 2 Days").first()).toBeVisible()

    // Clean up so the test can run again.
    await page.goto("/tours/luxor-highlights-2-days")
    await page.getByRole("button", { name: "Saved" }).click()
    await expect(page.getByRole("button", { name: "Save for later" })).toBeVisible()
    await expect(page.getByText("Removed from your wishlist")).toBeVisible()
  })
})
