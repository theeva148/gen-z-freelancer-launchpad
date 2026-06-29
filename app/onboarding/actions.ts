"use server"

import { redirect } from "next/navigation"
import { query } from "@/lib/db"
import { inferExperience } from "@/lib/ai"
import { setProfileCookie } from "@/lib/session"
import type { ColdOutreach, Portfolio, PriorClients } from "@/lib/types"

export interface OnboardingInput {
  name: string
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

  const examples = input.portfolio_examples?.trim().slice(0, 4000) || null

  // Experience level is judged from the work examples (with prior clients as a
  // secondary signal) rather than self-reported.
  const experience = await inferExperience({
    skills: input.skills,
    prior_clients: input.prior_clients,
    portfolio_examples: examples,
  })

  const { rows } = await query(
    `INSERT INTO profiles
       (name, skills, experience, portfolio, portfolio_examples, prior_clients, income_goal, cold_outreach)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id`,
    [
      name,
      input.skills,
      experience,
      input.portfolio,
      examples,
      input.prior_clients,
      Math.max(0, Math.round(input.income_goal) || 0),
      input.cold_outreach,
    ],
  )

  await setProfileCookie(rows[0].id)
  redirect("/dashboard")
}
