"use server"

import { redirect } from "next/navigation"
import { query } from "@/lib/db"
import { inferExperience } from "@/lib/ai"
import { hashPassword, isValidEmail, normalizeEmail } from "@/lib/auth"
import { setProfileCookie } from "@/lib/session"
import type { ColdOutreach, Portfolio, PriorClients } from "@/lib/types"

export interface OnboardingInput {
  name: string
  email: string
  password: string
  skills: string[]
  portfolio: Portfolio
  portfolio_examples?: string
  prior_clients: PriorClients
  income_goal: number
  cold_outreach: ColdOutreach
}

export async function completeOnboarding(input: OnboardingInput) {
  const name = input.name.trim().slice(0, 120)
  if (!name) throw new Error("Name is required")

  const email = normalizeEmail(input.email)
  if (!isValidEmail(email)) throw new Error("Please enter a valid email address")
  if (input.password.length < 8)
    throw new Error("Password must be at least 8 characters")

  // Reject duplicate accounts up front for a friendly error.
  const existing = await query("SELECT 1 FROM profiles WHERE lower(email) = $1", [email])
  if (existing.rows.length > 0)
    throw new Error("An account with this email already exists. Try logging in.")

  const passwordHash = await hashPassword(input.password)
  const examples = input.portfolio_examples?.trim().slice(0, 4000) || null

  // Experience level is judged from the work examples (with prior clients as a
  // secondary signal) rather than self-reported.
  const experience = await inferExperience({
    skills: input.skills,
    prior_clients: input.prior_clients,
    portfolio_examples: examples,
  })

  let newId: number
  try {
    const { rows } = await query(
      `INSERT INTO profiles
         (name, email, password_hash, skills, experience, portfolio, portfolio_examples, prior_clients, income_goal, cold_outreach)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id`,
      [
        name,
        email,
        passwordHash,
        input.skills,
        experience,
        input.portfolio,
        examples,
        input.prior_clients,
        Math.max(0, Math.round(input.income_goal) || 0),
        input.cold_outreach,
      ],
    )
    newId = rows[0].id
  } catch (err) {
    // Unique-violation safety net in case of a race.
    if (err instanceof Error && "code" in err && (err as { code?: string }).code === "23505")
      throw new Error("An account with this email already exists. Try logging in.")
    throw err
  }

  await setProfileCookie(newId)
  redirect("/dashboard")
}
