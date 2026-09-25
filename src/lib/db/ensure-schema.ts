import "server-only"

import { prisma } from "@/lib/prisma"
import { SITE } from "@/lib/constants"
import { loadCatalogHotels, loadCatalogVehicles } from "@/lib/catalog/load"
import { HISTORIC_SITES } from "@/lib/sites/details"
import { STARTER_SITES } from "@/lib/sites/starter"

/**
 * Adds the database objects introduced with tour guides, cash payments and the
 * historic sites catalog, if they are missing. New features get new tables
 * rather than new columns on existing ones where they can: preview builds
 * prerender pages against the shared database before anything here runs. Runs once per server start (see src/instrumentation.ts), so
 * a deploy works even when `prisma db push` never ran against the database.
 *
 * The statements are Prisma's own migration SQL (`prisma migrate diff` from the
 * schema at 43c9636 to the current one), rewritten to be safe to re-run. They
 * only ever add: nothing is dropped or changed. Keep this in step with
 * prisma/schema.prisma when those models change.
 */

const ENUMS: [name: string, values: string[]][] = [
  ["GuideStatus", ["PENDING", "APPROVED", "REJECTED", "SUSPENDED"]],
  ["GuideRequestStatus", ["PENDING", "ACCEPTED", "DECLINED", "CANCELLED", "EXPIRED"]],
  ["PaymentMethod", ["CARD", "CASH"]],
]

const COLUMNS = [
  `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "languages" TEXT[]`,
  `ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'CARD'`,
  `ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "cancelledAt" TIMESTAMP(3)`,
  `ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "refundAmount" DECIMAL(10,2)`,
  `ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "refundId" TEXT`,
  `ALTER TABLE "User" ALTER COLUMN "languages" SET DEFAULT ARRAY[]::TEXT[]`,
]

const TABLES = [
  `CREATE TABLE IF NOT EXISTS "GuideProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "guideType" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "photoUrl" TEXT,
    "licenceNumber" TEXT,
    "yearsExperience" INTEGER NOT NULL DEFAULT 0,
    "languages" TEXT[],
    "specialties" TEXT[],
    "dayRate" DECIMAL(10,2),
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "whatsapp" TEXT NOT NULL,
    "status" "GuideStatus" NOT NULL DEFAULT 'PENDING',
    "adminNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "GuideProfile_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE TABLE IF NOT EXISTS "GuideBlockedDay" (
    "id" TEXT NOT NULL,
    "guideId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    CONSTRAINT "GuideBlockedDay_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE TABLE IF NOT EXISTS "GuideRequest" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "guideId" TEXT NOT NULL,
    "touristId" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "groupSize" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "status" "GuideRequestStatus" NOT NULL DEFAULT 'PENDING',
    "guideReply" TEXT,
    "respondedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "GuideRequest_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE TABLE IF NOT EXISTS "GuideReview" (
    "id" TEXT NOT NULL,
    "guideId" TEXT NOT NULL,
    "touristId" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GuideReview_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE TABLE IF NOT EXISTS "PricingSetting" (
    "id" TEXT NOT NULL DEFAULT 'site',
    "hotelMarkupPercent" DECIMAL(5,2) NOT NULL DEFAULT 10,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PricingSetting_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE TABLE IF NOT EXISTS "DataLoad" (
    "id" TEXT NOT NULL,
    "loadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DataLoad_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE TABLE IF NOT EXISTS "HistoricSite" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL DEFAULT '',
    "period" TEXT NOT NULL DEFAULT '',
    "summary" TEXT NOT NULL,
    "history" TEXT NOT NULL,
    "facts" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tips" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "imageUrl" TEXT NOT NULL,
    "imageCredit" TEXT NOT NULL DEFAULT '',
    "galleryUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "regionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "HistoricSite_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE TABLE IF NOT EXISTS "_GuideProfileToRegion" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_GuideProfileToRegion_AB_pkey" PRIMARY KEY ("A","B")
  )`,
]

const INDEXES = [
  `CREATE UNIQUE INDEX IF NOT EXISTS "GuideProfile_userId_key" ON "GuideProfile"("userId")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "GuideProfile_slug_key" ON "GuideProfile"("slug")`,
  `CREATE INDEX IF NOT EXISTS "GuideProfile_status_idx" ON "GuideProfile"("status")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "GuideBlockedDay_guideId_date_key" ON "GuideBlockedDay"("guideId", "date")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "GuideRequest_reference_key" ON "GuideRequest"("reference")`,
  `CREATE INDEX IF NOT EXISTS "GuideRequest_guideId_status_startDate_idx" ON "GuideRequest"("guideId", "status", "startDate")`,
  `CREATE INDEX IF NOT EXISTS "GuideRequest_touristId_idx" ON "GuideRequest"("touristId")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "GuideReview_requestId_key" ON "GuideReview"("requestId")`,
  `CREATE INDEX IF NOT EXISTS "GuideReview_guideId_idx" ON "GuideReview"("guideId")`,
  `CREATE INDEX IF NOT EXISTS "_GuideProfileToRegion_B_index" ON "_GuideProfileToRegion"("B")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "HistoricSite_slug_key" ON "HistoricSite"("slug")`,
  `CREATE INDEX IF NOT EXISTS "HistoricSite_regionId_idx" ON "HistoricSite"("regionId")`,
]

const FOREIGN_KEYS: [table: string, name: string, column: string, target: string][] = [
  ["GuideProfile", "GuideProfile_userId_fkey", "userId", "User"],
  ["GuideBlockedDay", "GuideBlockedDay_guideId_fkey", "guideId", "GuideProfile"],
  ["GuideRequest", "GuideRequest_guideId_fkey", "guideId", "GuideProfile"],
  ["GuideRequest", "GuideRequest_touristId_fkey", "touristId", "User"],
  ["GuideReview", "GuideReview_guideId_fkey", "guideId", "GuideProfile"],
  ["GuideReview", "GuideReview_touristId_fkey", "touristId", "User"],
  ["GuideReview", "GuideReview_requestId_fkey", "requestId", "GuideRequest"],
  ["_GuideProfileToRegion", "_GuideProfileToRegion_A_fkey", "A", "GuideProfile"],
  ["_GuideProfileToRegion", "_GuideProfileToRegion_B_fkey", "B", "Region"],
  ["HistoricSite", "HistoricSite_regionId_fkey", "regionId", "Region"],
]

function statements(): string[] {
  const enums = ENUMS.map(
    ([name, values]) => `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = '${name}') THEN
        CREATE TYPE "${name}" AS ENUM (${values.map((v) => `'${v}'`).join(", ")});
      END IF;
    END $$`
  )
  const foreignKeys = FOREIGN_KEYS.map(
    ([table, name, column, target]) => `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '${name}') THEN
        ALTER TABLE "${table}" ADD CONSTRAINT "${name}" FOREIGN KEY ("${column}")
          REFERENCES "${target}"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      END IF;
    END $$`
  )
  return [
    ...enums,
    // Adding an enum value can't share a transaction with its use, so it runs alone.
    `ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'GUIDE'`,
    ...COLUMNS,
    ...TABLES,
    ...INDEXES,
    ...foreignKeys,
  ]
}

/** True when the newest objects already exist, so nothing needs doing. */
async function upToDate(): Promise<boolean> {
  const rows = await prisma.$queryRaw<{ ok: boolean }[]>`
    SELECT
      EXISTS (SELECT 1 FROM information_schema.columns
              WHERE table_schema = current_schema() AND table_name = 'Booking' AND column_name = 'paymentMethod')
      AND EXISTS (SELECT 1 FROM information_schema.columns
              WHERE table_schema = current_schema() AND table_name = 'Booking' AND column_name = 'refundId')
      AND EXISTS (SELECT 1 FROM information_schema.columns
              WHERE table_schema = current_schema() AND table_name = 'User' AND column_name = 'languages'
                AND column_default IS NOT NULL)
      AND EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_GuideProfileToRegion_B_fkey')
      AND EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid
              WHERE t.typname = 'Role' AND e.enumlabel = 'GUIDE')
      AND EXISTS (SELECT 1 FROM information_schema.tables
              WHERE table_schema = current_schema() AND table_name = 'DataLoad')
      AND EXISTS (SELECT 1 FROM information_schema.tables
              WHERE table_schema = current_schema() AND table_name = 'PricingSetting')
      AND EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'HistoricSite_regionId_fkey')
      AS ok`
  return Boolean(rows[0]?.ok)
}

/** Brings the database up to the current schema. Returns what it did. */
export async function ensureSchema(): Promise<"up-to-date" | "updated"> {
  let result: "up-to-date" | "updated" = "up-to-date"
  if (!(await upToDate())) {
    for (const sql of statements()) {
      await prisma.$executeRawUnsafe(sql)
    }
    result = "updated"
  }
  // Accounts created before languages existed hold NULL; the app expects a list.
  await prisma.$executeRawUnsafe(`UPDATE "User" SET "languages" = ARRAY[]::TEXT[] WHERE "languages" IS NULL`)
  await replacePlaceholderContacts()
  await runOnce(STARTER_CATALOG_LOAD, async (tx) => {
    const count = await loadStarterSites(tx)
    return `loaded ${count} historic sites into the catalog`
  })
  await runOnce(SITE_DETAILS_LOAD, async (tx) => {
    const count = await addSiteDetails(tx)
    return `added more history to ${count} historic sites`
  })
  await runOnce(CATALOG_HOTELS_LOAD, async (tx) => {
    const { loaded, retired } = await loadCatalogHotels(tx)
    return `loaded ${loaded} hotels, hid ${retired} demo hotels`
  })
  await runOnce(CATALOG_VEHICLES_LOAD, async (tx) => {
    const { loaded, retired } = await loadCatalogVehicles(tx)
    return `loaded ${loaded} vehicles, hid ${retired} demo vehicles`
  })
  return result
}

/**
 * Earlier seeds stored placeholder contact details. Swap them for the owner's
 * (lib/constants.ts), but only where the placeholder is still there, so
 * anything saved in Admin → Settings is left alone.
 */
async function replacePlaceholderContacts() {
  await prisma.$executeRaw`UPDATE "SiteSetting" SET "whatsappNumber" = ${SITE.whatsapp}
    WHERE "id" = 'site' AND "whatsappNumber" = '201001234567'`
  await prisma.$executeRaw`UPDATE "SiteSetting" SET "contactEmail" = ${SITE.email}
    WHERE "id" = 'site' AND "contactEmail" = 'hello@egyptjourneys.com'`
  await prisma.$executeRaw`UPDATE "SiteSetting" SET "contactPhone" = ${SITE.phone}
    WHERE "id" = 'site' AND "contactPhone" = '+20 100 123 4567'`
}

/** One-time data loads, recorded by these ids in the DataLoad table. */
export const STARTER_CATALOG_LOAD = "historic-sites-starter"
export const SITE_DETAILS_LOAD = "historic-sites-details-2026-09"
export const CATALOG_HOTELS_LOAD = "hotels-2026-09"
export const CATALOG_VEHICLES_LOAD = "vehicles-2026-09"

type Tx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0]

/**
 * Runs a data load the first time only. Claiming it and running it happen in
 * one transaction: two server instances starting together can't both run it,
 * a failure leaves it unclaimed for the next start, and data the admin later
 * changes or deletes isn't put back.
 */
async function runOnce(id: string, load: (tx: Tx) => Promise<string>) {
  const done = await prisma.$transaction(
    async (tx) => {
      const claimed = await tx.$executeRaw`INSERT INTO "DataLoad" ("id") VALUES (${id})
        ON CONFLICT ("id") DO NOTHING`
      return claimed === 0 ? null : load(tx)
    },
    { timeout: 60_000 }
  )
  if (done !== null) console.info(`[schema] ${id}: ${done}`)
}

async function loadStarterSites(tx: Tx): Promise<number> {
  const regions = await tx.region.findMany({ select: { id: true, slug: true } })
  const regionIds = new Map(regions.map((r) => [r.slug, r.id]))
  const { count } = await tx.historicSite.createMany({
    data: HISTORIC_SITES.flatMap(({ regionSlug, ...site }) => {
      const regionId = regionIds.get(regionSlug)
      return regionId ? [{ ...site, regionId }] : []
    }),
    skipDuplicates: true,
  })
  return count
}

/**
 * Gives sites loaded from the first starter text their extra chapters, facts
 * and tips. A site is only updated while its history is still the starter
 * text, so anything written in Admin → Historic sites is kept.
 */
async function addSiteDetails(tx: Tx): Promise<number> {
  let count = 0
  for (const [i, site] of HISTORIC_SITES.entries()) {
    const { count: updated } = await tx.historicSite.updateMany({
      where: { slug: site.slug, history: STARTER_SITES[i].history },
      data: { history: site.history, facts: site.facts, tips: site.tips },
    })
    count += updated
  }
  return count
}
