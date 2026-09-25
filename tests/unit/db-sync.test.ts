import { describe, expect, it } from "vitest"

import { directUrl } from "../../scripts/direct-url.mjs"

describe("directUrl", () => {
  it("swaps a Neon pooled host for its direct host, keeping credentials and options", () => {
    expect(
      directUrl("postgresql://user:pw@ep-ancient-heart-ay5rybxf-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require")
    ).toBe("postgresql://user:pw@ep-ancient-heart-ay5rybxf.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require")
  })

  it("leaves other databases alone", () => {
    const local = "postgresql://postgres:postgres@localhost:5432/egypt_journeys"
    expect(directUrl(local)).toBe(local)
    const direct = "postgresql://u:p@ep-x.c-5.us-east-2.aws.neon.tech/db"
    expect(directUrl(direct)).toBe(direct)
  })
})
