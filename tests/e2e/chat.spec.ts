import { expect, test } from "@playwright/test"

test.describe("chat assistant", () => {
  test("answers a practical question from the FAQ", async ({ page }) => {
    await page.goto("/")
    await page.getByRole("button", { name: "Ask Nefer" }).click()

    const chat = page.getByRole("dialog", { name: "Nefer" })
    await chat.getByLabel("Ask a question").fill("Do I need a visa?")
    await chat.getByRole("button", { name: "Send" }).click()

    await expect(chat.getByText(/visa on arrival/i)).toBeVisible()
  })

  test("suggests tours that link to their pages", async ({ page }) => {
    await page.goto("/")
    await page.getByRole("button", { name: "Ask Nefer" }).click()

    const chat = page.getByRole("dialog", { name: "Nefer" })
    await chat.getByLabel("Ask a question").fill("tours in Luxor under $600")
    await chat.getByRole("button", { name: "Send" }).click()

    const cruise = chat.getByRole("link", { name: /Nile Cruise/ })
    await expect(cruise).toBeVisible()
    await cruise.click()
    await expect(page).toHaveURL(/\/tours\/nile-cruise-luxor-to-aswan-4-days/)
  })

  test("captures a trip enquiry", async ({ page }) => {
    await page.goto("/")
    await page.getByRole("button", { name: "Ask Nefer" }).click()

    const chat = page.getByRole("dialog", { name: "Nefer" })
    await chat
      .getByLabel("Ask a question")
      .fill("Help me plan a 10 day honeymoon with a Nile cruise")
    await chat.getByRole("button", { name: "Send" }).click()

    const form = chat.getByRole("form", { name: "Trip enquiry" })
    await form.getByLabel("Name").fill("Chat Tester")
    await form.getByLabel("Email").fill("chat.tester@example.com")
    await form.getByRole("button", { name: "Send to a planner" }).click()

    await expect(chat.getByText(/Thank you, Chat/)).toBeVisible()
  })

  test("closes with Escape and returns focus to the launcher", async ({ page }) => {
    await page.goto("/")
    const launcher = page.getByRole("button", { name: "Ask Nefer" })
    await launcher.click()
    await expect(page.getByRole("dialog", { name: "Nefer" })).toBeVisible()

    await page.keyboard.press("Escape")
    await expect(page.getByRole("dialog", { name: "Nefer" })).toBeHidden()
    await expect(launcher).toBeFocused()
  })
})
