import { generateText, Output } from "ai"
import { z } from "zod"
import { getProfile } from "@/lib/session"
import { MODEL, describeProfile } from "@/lib/ai"

export const maxDuration = 60

const schema = z.object({
  currency: z.string().default("USD"),
  hourly_low: z.number().describe("Recommended low end hourly rate in USD"),
  hourly_high: z.number().describe("Recommended high end hourly rate in USD"),
  project_low: z.number().describe("Typical low end for a starter project in USD"),
  project_high: z.number().describe("Typical high end for a starter project in USD"),
  rationale: z.string().describe("2-3 sentences explaining the pricing logic"),
  tips: z.array(z.string()).describe("3-4 short tips for pricing and raising rates"),
})

export async function POST() {
  const profile = await getProfile()
  if (!profile) return new Response("Unauthorized", { status: 401 })

  const { output } = await generateText({
    model: MODEL,
    output: Output.object({ schema }),
    system:
      "You are a pricing strategist for freelancers. Give realistic, current market-based numbers in USD for someone at the stated experience level. Be encouraging but grounded.",
    prompt: `Recommend starting rates for this freelancer based on their skill, experience, and current market norms:\n\n${describeProfile(
      profile,
    )}`,
  })

  return Response.json(output)
}
