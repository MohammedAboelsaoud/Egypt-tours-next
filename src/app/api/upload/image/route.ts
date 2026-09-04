import { NextResponse } from "next/server"

import { isAdmin } from "@/lib/auth"
import { uploadImage } from "@/lib/cloudinary"

export const runtime = "nodejs"

/** POST /api/upload/image — admin image upload (Cloudinary, or local in dev). */
export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const formData = await request.formData().catch(() => null)
  const file = formData?.get("file")

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 })
  }

  try {
    const result = await uploadImage(file)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Upload failed. Try again.",
      },
      { status: 400 }
    )
  }
}
