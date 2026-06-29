"use server"

import { redirect } from "next/navigation"
import { query } from "@/lib/db"
import { normalizeEmail, verifyPassword } from "@/lib/auth"
import { setProfileCookie } from "@/lib/session"

export async function login(input: { email: string; password: string }) {
  const email = normalizeEmail(input.email)
  if (!email || !input.password) throw new Error("Email and password are required")

  const { rows } = await query(
    "SELECT id, password_hash FROM profiles WHERE lower(email) = $1 LIMIT 1",
    [email],
  )

  const account = rows[0]
  if (!account || !account.password_hash)
    throw new Error("Incorrect email or password")

  const ok = await verifyPassword(input.password, account.password_hash)
  if (!ok) throw new Error("Incorrect email or password")

  await setProfileCookie(account.id)
  redirect("/dashboard")
}
