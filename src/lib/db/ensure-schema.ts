import "server-only"

import { prisma } from "@/lib/prisma"

/**
 * Adds the database objects introduced with tour guides and cash payments, if
 * they are missing. Runs once per server start (see src/instrumentation.ts), so
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
              WHERE table_schema = current_schema() AND table_name = 'User' AND column_name = 'languages')
      AND EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_GuideProfileToRegion_B_fkey')
      AND EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid
              WHERE t.typname = 'Role' AND e.enumlabel = 'GUIDE')
      AS ok`
  return Boolean(rows[0]?.ok)
}

/** Brings the database up to the current schema. Returns what it did. */
export async function ensureSchema(): Promise<"up-to-date" | "updated"> {
  if (await upToDate()) return "up-to-date"
  for (const sql of statements()) {
    await prisma.$executeRawUnsafe(sql)
  }
  return "updated"
}
