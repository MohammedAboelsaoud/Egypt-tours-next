"use server"

import { revalidatePath } from "next/cache"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { profileSchema } from "@/lib/validations"

export type ProfileState = { ok: boolean; message: string } | null

export async function updateProfile(
  _prev: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, message: "Please sign in again." }
  }

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    nationality: formData.get("nationality"),
    languages: formData.getAll("languages").map(String),
    passportNo: formData.get("passportNo"),
  })

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Please check your details.",
    }
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone || null,
      nationality: parsed.data.nationality || null,
      languages: parsed.data.languages,
      passportNo: parsed.data.passportNo || null,
    },
  })

  revalidatePath("/account")
  return { ok: true, message: "Profile updated." }
}
