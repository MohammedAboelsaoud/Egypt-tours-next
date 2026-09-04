import "server-only"

const CLIENT_ID = process.env.PAYPAL_CLIENT_ID ?? ""
const CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET ?? ""
const MODE = process.env.PAYPAL_MODE === "live" ? "live" : "sandbox"

const API_BASE =
  MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com"

/**
 * Without API credentials the routes fall back to a mock capture so the whole
 * booking flow stays testable in development. Never true in production.
 */
export const paypalConfigured = Boolean(CLIENT_ID && CLIENT_SECRET)

export function paypalMockAllowed() {
  return !paypalConfigured && process.env.NODE_ENV !== "production"
}

async function accessToken(): Promise<string> {
  const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64")
  const res = await fetch(`${API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  })

  if (!res.ok) {
    throw new Error(`PayPal auth failed (${res.status}): ${await res.text()}`)
  }

  const data = (await res.json()) as { access_token: string }
  return data.access_token
}

export type PayPalOrder = {
  id: string
  status: string
  links?: { href: string; rel: string; method: string }[]
}

export async function createPayPalOrder(input: {
  amount: number
  currency: string
  reference: string
  description: string
}): Promise<PayPalOrder> {
  const token = await accessToken()

  const res = await fetch(`${API_BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: input.reference,
          description: input.description.slice(0, 127),
          amount: {
            currency_code: input.currency,
            value: input.amount.toFixed(2),
          },
        },
      ],
      application_context: {
        brand_name: "Egypt Journeys",
        shipping_preference: "NO_SHIPPING",
        user_action: "PAY_NOW",
      },
    }),
  })

  if (!res.ok) {
    throw new Error(`PayPal order failed (${res.status}): ${await res.text()}`)
  }

  return (await res.json()) as PayPalOrder
}

export type PayPalCapture = {
  id: string
  status: string
  purchase_units?: {
    payments?: { captures?: { id: string; status: string }[] }
  }[]
}

export async function capturePayPalOrder(
  orderId: string
): Promise<PayPalCapture> {
  const token = await accessToken()

  const res = await fetch(
    `${API_BASE}/v2/checkout/orders/${orderId}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    }
  )

  if (!res.ok) {
    throw new Error(`PayPal capture failed (${res.status}): ${await res.text()}`)
  }

  return (await res.json()) as PayPalCapture
}

export async function refundPayPalCapture(captureId: string) {
  const token = await accessToken()
  const res = await fetch(
    `${API_BASE}/v2/payments/captures/${captureId}/refund`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    }
  )
  if (!res.ok) {
    throw new Error(`PayPal refund failed (${res.status}): ${await res.text()}`)
  }
  return res.json()
}
