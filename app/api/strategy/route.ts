import { generateText, Output } from "ai"
import { z } from "zod"
import { getProfile } from "@/lib/session"
import { MODEL, describeProfile } from "@/lib/ai"

export const maxDuration = 60

const schema = z.object({
  headline: z.string().describe("A punchy one-line strategy summary"),
  positioning: z.string().describe("2-3 sentences on how they should position themselves"),
  steps: z
    .array(
      z.object({
        title: z.string(),
        detail: z.string(),
      }),
    )
    .describe("4-6 concrete, ordered action steps"),
  where_to_find_clients: z
    .array(z.string())
    .describe("3-5 specific places/platforms to find first clients"),
})

export async function POST() {
  const profile = await getProfile()
  if (!profile) return new Response("Unauthorized", { status: 401 })

  try {
    const { output } = await generateText({
      model: MODEL,
      output: Output.object({ schema }),
      system:
        "You are a sharp, no-BS freelance coach for Gen Z freelancers. You are direct, encouraging, and tactical. Avoid corporate jargon. Give specific, doable advice.",
      prompt: `Build a personalized client-acquisition strategy for this freelancer:\n\n${describeProfile(
        profile,
      )}\n\nTailor it tightly to their skill set and experience level.`,
    })

    return Response.json(output)
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    )
  }
}
