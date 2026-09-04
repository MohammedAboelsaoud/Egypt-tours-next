import "server-only"
import { randomUUID } from "node:crypto"
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { v2 as cloudinary } from "cloudinary"

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME ?? ""
const API_KEY = process.env.CLOUDINARY_API_KEY ?? ""
const API_SECRET = process.env.CLOUDINARY_API_SECRET ?? ""

export const cloudinaryConfigured = Boolean(CLOUD_NAME && API_KEY && API_SECRET)

if (cloudinaryConfigured) {
  cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: API_KEY,
    api_secret: API_SECRET,
    secure: true,
  })
}

const MAX_BYTES = 8 * 1024 * 1024
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif"]

export type UploadResult = { url: string; provider: "cloudinary" | "local" }

/**
 * Uploads to Cloudinary when configured; otherwise writes into `public/uploads`
 * so the admin dashboard's image picker still works on a local install.
 */
export async function uploadImage(
  file: File,
  folder = "egypt-journeys"
): Promise<UploadResult> {
  if (!ALLOWED.includes(file.type)) {
    throw new Error("Unsupported file type — use JPEG, PNG, WebP or AVIF.")
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Image is larger than 8MB.")
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  if (cloudinaryConfigured) {
    const result = await new Promise<{ secure_url: string }>(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            { folder, resource_type: "image" },
            (error, uploaded) => {
              if (error || !uploaded) {
                reject(error ?? new Error("Cloudinary upload failed"))
                return
              }
              resolve(uploaded as { secure_url: string })
            }
          )
          .end(buffer)
      }
    )
    return { url: result.secure_url, provider: "cloudinary" }
  }

  const ext = file.type.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg"
  const filename = `${randomUUID()}.${ext}`
  const dir = path.join(process.cwd(), "public", "uploads")
  await mkdir(dir, { recursive: true })
  await writeFile(path.join(dir, filename), buffer)

  return { url: `/uploads/${filename}`, provider: "local" }
}
