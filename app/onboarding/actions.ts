"use server"

import { redirect } from "next/navigation"
import { query } from "@/lib/db"
import { setProfileCookie } from "@/lib/session"
import type { ColdOutreach, Experience, Portfolio, PriorClients } from "@/lib/types"

export interface OnboardingInput {
  name: string
  skills: string[]
  experience: Experience
  portfolio: Portfolio
  prior_clients: PriorClients
  income_goal: number
  cold_outreach: ColdOutreach
}

export async function completeOnboarding(input: OnboardingInput) {
  const name = input.name.trim().slice(0, 120)
  if (!name) throw new Error("Name is required")

  const { rows } = await query(
    `INSERT INTO profiles
       (name, skills, experience, portfolio, prior_clients, income_goal, cold_outreach)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id`,
    [
      name,
      input.skills,
      input.experience,
      input.portfolio,
      input.prior_clients,
      Math.max(0, Math.round(input.income_goal) || 0),
      input.cold_outreach,
    ],
  )

  await setProfileCookie(rows[0].id)
  redirect("/dashboard")
}
