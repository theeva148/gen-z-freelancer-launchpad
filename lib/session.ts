import { cookies } from "next/headers"
import { query } from "@/lib/db"
import type { Profile } from "@/lib/types"

const COOKIE = "unbossed_pid"

export async function setProfileCookie(profileId: number) {
  const store = await cookies()
  store.set(COOKIE, String(profileId), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  })
}

export async function getProfileId(): Promise<number | null> {
  const store = await cookies()
  const raw = store.get(COOKIE)?.value
  if (!raw) return null
  const id = Number.parseInt(raw, 10)
  return Number.isFinite(id) ? id : null
}

export async function getProfile(): Promise<Profile | null> {
  const id = await getProfileId()
  if (!id) return null
  const { rows } = await query("SELECT * FROM profiles WHERE id = $1", [id])
  if (rows.length === 0) return null
  const p = rows[0]
  return { ...p, income_goal: Number(p.income_goal) } as Profile
}

export async function requireProfileId(): Promise<number> {
  const id = await getProfileId()
  if (!id) throw new Error("No active profile")
  return id
}
