import { generateText, Output } from "ai"
import { z } from "zod"
import { anthropic } from "@ai-sdk/anthropic"
import type { Experience, PriorClients, Profile } from "@/lib/types"

// Anthropic direct provider, using ANTHROPIC_API_KEY from the environment.
export const MODEL = anthropic("claude-sonnet-4-6")

// Heuristic fallback when there are no work examples or the AI call fails.
function fallbackExperience(prior_clients: PriorClients): Experience {
  if (prior_clients === "more_than_3") return "advanced"
  if (prior_clients === "1-3") return "intermediate"
  return "beginner"
}

// Judge the freelancer's experience level from their actual work examples,
// using prior client history as a secondary signal.
export async function inferExperience(input: {
  skills: string[]
  prior_clients: PriorClients
  portfolio_examples?: string | null
}): Promise<Experience> {
  const examples = input.portfolio_examples?.trim()
  if (!examples) return fallbackExperience(input.prior_clients)

  try {
    const { output } = await generateText({
      model: MODEL,
      output: Output.object({
        schema: z.object({
          level: z.enum(["beginner", "intermediate", "advanced"]),
        }),
      }),
      system:
        "You assess a freelancer's skill/experience level from the work examples they share. Judge primarily by the sophistication, scope, and results in their work examples, not by how it's worded. Use prior paying-client history only as a secondary signal. beginner = little/simple work or just starting; intermediate = solid real projects and some traction; advanced = high-quality, high-impact work and a strong track record.",
      prompt: `Skills: ${input.skills.join(", ") || "general freelancing"}
Prior paying clients: ${input.prior_clients}

Work examples:
${examples}

Classify their experience level.`,
    })
    return output.level
  } catch {
    return fallbackExperience(input.prior_clients)
  }
}

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
