/**
 * Runs once when a server instance starts, before it handles requests.
 * Makes sure the database has the tables and columns this version needs, so
 * a deploy never serves code against an older schema.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs" || !process.env.DATABASE_URL) return

  try {
    const { ensureSchema } = await import("@/lib/db/ensure-schema")
    const result = await ensureSchema()
    if (result === "updated") console.info("[schema] added missing tables/columns")
  } catch (error) {
    // Never block start-up: pages that don't need the new objects keep working.
    console.error("[schema] could not check or update the database schema", error)
  }
}
