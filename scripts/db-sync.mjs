/**
 * Brings the production database schema in line with prisma/schema.prisma
 * during Vercel's production build, so new tables and columns exist before
 * the new code goes live. Runs `prisma db push` without --accept-data-loss:
 * additive changes apply, and anything that would drop data stops the build
 * (Vercel then keeps serving the previous deployment).
 *
 * Skipped outside production deploys: preview builds may share the
 * production database, and an unmerged branch must not change it.
 */
import { spawnSync } from "node:child_process"
import { createRequire } from "node:module"

import { directUrl } from "./direct-url.mjs"

if (process.env.VERCEL_ENV !== "production") {
  console.log("[db-sync] skipped (not a Vercel production build)")
  process.exit(0)
}

if (!process.env.DATABASE_URL) {
  console.error("[db-sync] DATABASE_URL is not set for Production in Vercel. Add it under Settings → Environment Variables.")
  process.exit(1)
}

const prismaCli = createRequire(import.meta.url).resolve("prisma/build/index.js")
console.log("[db-sync] pushing prisma/schema.prisma to the production database…")
const result = spawnSync(process.execPath, [prismaCli, "db", "push", "--skip-generate"], {
  stdio: "inherit",
  env: { ...process.env, DATABASE_URL: directUrl(process.env.DATABASE_URL) },
})
if (result.status !== 0) {
  console.error(
    "[db-sync] The schema could not be applied. If Prisma warned about data loss, a field was removed from " +
      "prisma/schema.prisma while the database still holds data in it: put the field back (unused), or migrate " +
      "that data deliberately. The previous deployment stays live."
  )
}
process.exit(result.status ?? 1)
