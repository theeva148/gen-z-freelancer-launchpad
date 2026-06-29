import { anthropic } from "@ai-sdk/anthropic"
import type { Profile } from "@/lib/types"

// Anthropic direct provider, using ANTHROPIC_API_KEY from the environment.
export const MODEL = anthropic("claude-sonnet-4-6")

const EXPERIENCE_LABEL: Record<string, string> = {
  beginner: "a beginner just starting out",
  intermediate: "an intermediate freelancer with some experience",
  advanced: "an advanced, experienced freelancer",
}

const PRIOR_LABEL: Record<string, string> = {
  never: "has never had a paying client",
  "1-3": "has had 1-3 paying clients",
  more_than_3: "has had more than 3 paying clients",
}

const OUTREACH_LABEL: Record<string, string> = {
  yes: "is comfortable with cold outreach",
  no: "is not comfortable with cold outreach",
  kinda: "is somewhat comfortable with cold outreach",
}

export function describeProfile(p: Profile): string {
  const lines = [
    `Name: ${p.name}`,
    `Skills: ${p.skills.join(", ") || "general freelancing"}`,
    `Experience: ${EXPERIENCE_LABEL[p.experience] ?? p.experience}`,
    `Track record: ${PRIOR_LABEL[p.prior_clients] ?? p.prior_clients}`,
    `Monthly income goal: $${p.income_goal}`,
    `Cold outreach: ${OUTREACH_LABEL[p.cold_outreach] ?? p.cold_outreach}`,
  ]
  if (p.portfolio_examples?.trim()) {
    lines.push(`Portfolio / work examples:\n${p.portfolio_examples.trim()}`)
  }
  return lines.join("\n")
}
