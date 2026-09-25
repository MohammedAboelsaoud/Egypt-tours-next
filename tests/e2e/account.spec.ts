import { expect, test } from "@playwright/test"
import { PrismaClient } from "@prisma/client"

/**
 * The traveller's account: profile, booking details, finishing an unpaid
 * booking and cancelling with the refund the booking terms allow.
 * Plain JS with JSDoc types, like the other specs (see booking.spec.ts).
 */

const prisma = new PrismaClient()
const stamp = Date.now()
const EMAIL = `account-${stamp}@example.com`
const PASSWORD = "Traveller123!"

/** @param {number} days */
function daysFromNow(days) {
  const date = new Date()
  date.setUTCHours(0, 0, 0, 0)
  date.setUTCDate(date.getUTCDate() + days)
  return date
}

/**
 * Creates a tour booking straight in the database.
 * @param {string} userId
 * @param {{ startIn: number, status?: "PENDING" | "CONFIRMED", paymentStatus?: "PENDING" | "PAID", paymentMethod?: "CARD" | "CASH", paymentId?: string }} options
 */
async function createBooking(userId, options) {
  const tour = await prisma.tour.findFirstOrThrow({ where: { slug: "pyramids-and-old-cairo-3-days" } })
  const reference = `EGT-T${String(stamp).slice(-5)}${Math.floor(Math.random() * 1000)}`
  return prisma.booking.create({
    data: {
      reference,
      userId,
      bookingType: "TOUR",
      tourId: tour.id,
      checkIn: daysFromNow(options.startIn),
      checkOut: daysFromNow(options.startIn + 2),
      guests: 2,
      totalPrice: 520,
      status: options.status ?? "PENDING",
      paymentStatus: options.paymentStatus ?? "PENDING",
      paymentMethod: options.paymentMethod ?? "CARD",
      paymentId: options.paymentId ?? null,
      contactName: "Account Tester",
      contactEmail: EMAIL,
    },
  })
}

/**
 * Waits until React has hydrated, so clicks reach their handlers.
 * @param {import("@playwright/test").Page} page
 */
async function hydrated(page) {
  await page.waitForLoadState("networkidle")
}

/** @param {import("@playwright/test").Page} page */
async function signIn(page) {
  await page.goto("/login")
  await hydrated(page)
  await page.fill("#email", EMAIL)
  await page.fill("#password", PASSWORD)
  await page.getByRole("button", { name: "Sign in" }).click()
  await page.waitForURL("**/account**")
}

/** @type {string} */
let userId

test.beforeAll(async ({ browser }) => {
  const page = await browser.newPage()
  await page.goto("/register")
  await hydrated(page)
  await page.fill("#name", "Account Tester")
  await page.fill("#email", EMAIL)
  await page.fill("#password", PASSWORD)
  await page.fill("#confirmPassword", PASSWORD)
  await page.fill("#phone", "+44 7700 900123")
  await page.selectOption("#nationality", "United Kingdom")
  await page.locator("label[for='lang-english']").click()
  await page.getByRole("button", { name: "Create account" }).click()
  await page.waitForURL(/\/account/)
  await page.close()
  userId = (await prisma.user.findUniqueOrThrow({ where: { email: EMAIL } })).id
})

test.afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: EMAIL } })
  await prisma.$disconnect()
})

test.describe.configure({ mode: "serial" })

test.describe("traveller account", () => {
  test("the account menu opens and goes to the profile", async ({ page, isMobile }) => {
    test.skip(isMobile, "Phones use the mobile menu; the avatar menu is desktop-only.")
    const errors = /** @type {string[]} */ ([])
    page.on("pageerror", (error) => errors.push(error.message))
    await signIn(page)
    await page.goto("/")
    await hydrated(page)

    await page.getByRole("button", { name: "Account menu" }).click()
    const menu = page.getByRole("menu")
    await expect(menu.getByText("Account Tester")).toBeVisible()
    await expect(menu.getByRole("menuitem", { name: "My bookings" })).toBeVisible()
    await expect(menu.getByRole("menuitem", { name: "Sign out" })).toBeVisible()

    await menu.getByRole("menuitem", { name: "My profile" }).click()
    await page.waitForURL(/\/account$/)
    await expect(page.getByRole("button", { name: /Save/ })).toBeVisible()
    await expect(page.getByText("We hit a problem loading this page")).toHaveCount(0)
    expect(errors).toEqual([])
  })

  test("the admin's account menu opens too", async ({ page, isMobile }) => {
    test.skip(isMobile, "Phones use the mobile menu; the avatar menu is desktop-only.")
    await page.goto("/login")
    await hydrated(page)
    await page.fill("#email", "admin@egyptjourneys.com")
    await page.fill("#password", "Admin123!")
    await page.getByRole("button", { name: "Sign in" }).click()
    await page.waitForURL(/\/(account|admin)/)
    await page.goto("/tours")
    await hydrated(page)

    await page.getByRole("button", { name: "Account menu" }).click()
    await page.getByRole("menu").getByRole("menuitem", { name: "Admin dashboard" }).click()
    await page.waitForURL(/\/admin/)
    await expect(page.getByText("We hit a problem loading this page")).toHaveCount(0)
  })

  test("profile loads for an account created before languages existed", async ({ page }) => {
    await prisma.$executeRaw`UPDATE "User" SET "languages" = NULL WHERE "id" = ${userId}`
    await signIn(page)
    await page.goto("/account")
    await hydrated(page)
    await expect(page.getByRole("button", { name: /Save/ })).toBeVisible()
    await expect(page.locator("label[for='lang-english']")).toBeVisible()
    await expect(page.getByText(/Something went wrong/i)).toHaveCount(0)
  })

  test("opens a booking from the list and cancels a cash booking", async ({ page }) => {
    const booking = await createBooking(userId, { startIn: 30, status: "CONFIRMED", paymentMethod: "CASH" })
    await signIn(page)
    await page.goto("/account/bookings")
    await page.locator(`a[href='/account/bookings/${booking.id}']`).first().click()
    await expect(page).toHaveURL(new RegExp(`/account/bookings/${booking.id}$`))
    await expect(page.getByText(booking.reference)).toBeVisible()
    await expect(page.getByText("Confirmed · Cash on the day")).toBeVisible()
    await expect(page.getByText("Nothing has been charged, so there's nothing to refund.").first()).toBeVisible()

    await hydrated(page)
    await page.getByRole("button", { name: "Cancel booking" }).click()
    await page.getByRole("button", { name: "Yes, cancel booking" }).click()
    await expect(page.getByText("Cancelled", { exact: true }).first()).toBeVisible()
    await expect(page.getByRole("button", { name: "Cancel booking" })).toHaveCount(0)

    const saved = await prisma.booking.findUniqueOrThrow({ where: { id: booking.id } })
    expect(saved.status).toBe("CANCELLED")
    expect(saved.cancelledAt).not.toBeNull()
  })

  test("finishes an unpaid booking by choosing cash", async ({ page }) => {
    const booking = await createBooking(userId, { startIn: 25 })
    await signIn(page)
    await page.goto(`/account/bookings/${booking.id}`)
    await expect(page.getByText("Payment not finished")).toBeVisible()
    await expect(page.getByRole("heading", { name: "Finish your booking" })).toBeVisible()

    await hydrated(page)
    await page.getByText("Pay in cash on the day", { exact: true }).click()
    await page.getByRole("button", { name: "Confirm booking, pay in cash" }).click()
    await expect(page.getByText("Confirmed · Cash on the day")).toBeVisible()

    const saved = await prisma.booking.findUniqueOrThrow({ where: { id: booking.id } })
    expect(saved.status).toBe("CONFIRMED")
    expect(saved.paymentMethod).toBe("CASH")
  })

  test("refunds a card payment in full when cancelled 14+ days ahead", async ({ page }) => {
    const booking = await createBooking(userId, {
      startIn: 20,
      status: "CONFIRMED",
      paymentStatus: "PAID",
      paymentId: `MOCK-${stamp}`,
    })
    await signIn(page)
    await page.goto(`/account/bookings/${booking.id}`)
    await expect(page.getByText("You'll get $520 back to your card (100%).").first()).toBeVisible()

    await hydrated(page)
    await page.getByRole("button", { name: "Cancel booking" }).click()
    await page.getByRole("button", { name: "Yes, cancel booking" }).click()
    await expect(page.getByText("Cancelled · Refunded").first()).toBeVisible()
    await expect(page.getByText("Refunded $520 of $520")).toBeVisible()

    const saved = await prisma.booking.findUniqueOrThrow({ where: { id: booking.id } })
    expect(saved.paymentStatus).toBe("REFUNDED")
    expect(Number(saved.refundAmount)).toBe(520)
  })

  test("half refund inside 14 days, and no cancelling another traveller's booking", async ({ page, request }) => {
    const late = await createBooking(userId, { startIn: 10, status: "CONFIRMED", paymentStatus: "PAID", paymentId: `MOCK-L${stamp}` })
    const other = await prisma.user.findUniqueOrThrow({ where: { email: "traveller@example.com" } })
    const theirs = await createBooking(other.id, { startIn: 30, status: "CONFIRMED", paymentMethod: "CASH" })
    try {
      await signIn(page)
      await page.goto(`/account/bookings/${late.id}`)
      await expect(page.getByText("You'll get $260 back to your card (50%).").first()).toBeVisible()

      // The account layout streams first, so the status stays 200; the content is the 404 page.
      await page.goto(`/account/bookings/${theirs.id}`)
      await expect(page.getByRole("heading", { name: "This path leads nowhere" })).toBeVisible()
      await expect(page.getByText(theirs.reference)).toHaveCount(0)

      const cancel = await page.request.post(`/api/bookings/${theirs.id}/cancel`)
      expect(cancel.ok()).toBe(false)
      const unauthenticated = await request.post(`/api/bookings/${theirs.id}/cancel`)
      expect(unauthenticated.ok()).toBe(false)
      expect((await prisma.booking.findUniqueOrThrow({ where: { id: theirs.id } })).status).toBe("CONFIRMED")
    } finally {
      await prisma.booking.delete({ where: { id: theirs.id } })
    }
  })
})
