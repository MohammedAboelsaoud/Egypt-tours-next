import { expect, test } from "@playwright/test"

/**
 * Playwright skips its own TS loader under Bun, so these specs stay free of
 * TypeScript-only syntax and use JSDoc types instead.
 *
 * @param {import("@playwright/test").Page} page
 */
async function signInAsAdmin(page) {
  await page.goto("/admin/login")
  await page.fill("#email", "admin@egyptjourneys.com")
  await page.fill("#password", "Admin123!")
  await page.getByRole("button", { name: "Sign in" }).click()
  await page.waitForURL("**/admin")
}

test.describe("historic sites", () => {
  test("the catalog groups sites by region and opens a site's history", async ({ page }) => {
    await page.goto("/sites")
    await expect(page.getByRole("heading", { level: 1 })).toContainText("monuments")
    await expect(page.getByRole("heading", { name: "Luxor & Aswan" })).toBeVisible()

    await page.getByRole("link", { name: /Valley of the Kings/ }).first().click()
    await expect(page).toHaveURL(/\/sites\/valley-of-the-kings/)
    await expect(page.getByRole("heading", { name: "Tutankhamun" })).toBeVisible()
    await expect(page.getByText("Tombs found")).toBeVisible()
    await expect(page.getByRole("heading", { name: /Visiting tips/ })).toBeVisible()
  })

  test("destination pages list their historic sites", async ({ page }) => {
    await page.goto("/destinations/sinai-red-sea")
    await expect(page.getByRole("heading", { name: /Historic sites in/ })).toBeVisible()
    await expect(page.getByRole("link", { name: /Mount Sinai/ }).first()).toHaveAttribute("href", "/sites/mount-sinai")
  })

  test("the chat assistant links to a site it's asked about", async ({ page }) => {
    await page.goto("/")
    await page.getByRole("button", { name: "Ask Nefer" }).click()

    const chat = page.getByRole("dialog", { name: "Nefer" })
    await chat.getByLabel("Ask a question").fill("Tell me about Abu Simbel")
    await chat.getByRole("button", { name: "Send" }).click()

    await expect(chat.getByRole("link", { name: /Abu Simbel/ }).first()).toHaveAttribute("href", "/sites/abu-simbel")
  })

  test("admins create, edit and delete a site", async ({ page }) => {
    await signInAsAdmin(page)
    const name = `Temple of Test ${Date.now()}`

    await page.goto("/admin/sites/new")
    await page.fill("#name", name)
    await page.fill("#summary", "A test temple used by the end-to-end tests, never published for real.")
    await page.fill("#history", "## Built for testing\n\nThis history exists so the end-to-end tests can create and remove a site.")
    await page.fill("#facts", "Built by: The test suite")
    await page.fill("#imageUrl-url", "/img/luxor-aswan.jpg")
    await page.getByRole("button", { name: "Create site" }).click()
    await page.waitForURL("**/admin/sites", { timeout: 40_000 })

    const row = page.getByRole("row", { name: new RegExp(name) })
    await expect(row).toBeVisible()

    await row.getByRole("link", { name: name }).click()
    await page.fill("#period", "c. 2026 AD")
    await page.getByRole("button", { name: "Save changes" }).click()
    await page.waitForURL("**/admin/sites", { timeout: 40_000 })

    const slug = name.toLowerCase().replace(/\s+/g, "-")
    await page.goto(`/sites/${slug}`)
    await expect(page.getByRole("heading", { name: "Built for testing" })).toBeVisible()
    await expect(page.getByText("c. 2026 AD").first()).toBeVisible()

    await page.goto("/admin/sites")
    await page.getByRole("row", { name: new RegExp(name) }).getByRole("button", { name: /Delete/ }).click()
    await page.getByRole("button", { name: "Delete", exact: true }).click()
    await expect(page.getByText(name)).toHaveCount(0, { timeout: 30_000 })
  })
})
