import { generateText, Output } from "ai"
import { z } from "zod"
import { getProfile } from "@/lib/session"
import { MODEL, describeProfile } from "@/lib/ai"

export const maxDuration = 60

const schema = z.object({
  posts: z
    .array(
      z.object({
        platform: z.enum(["LinkedIn", "Twitter", "TikTok"]),
        content: z
          .string()
          .describe(
            "The post copy, formatted natively for the platform. For TikTok, write a short hook + script idea.",
          ),
      }),
    )
    .describe("One post per platform: LinkedIn, Twitter, and TikTok"),
})

export async function POST(req: Request) {
  const profile = await getProfile()
  if (!profile) return new Response("Unauthorized", { status: 401 })

  let topic = ""
  try {
    const body = await req.json()
    topic = typeof body?.topic === "string" ? body.topic.slice(0, 300) : ""
  } catch {
    // no body provided
  }

  const { output } = await generateText({
    model: MODEL,
    output: Output.object({ schema }),
    system:
      "You are a social content strategist for Gen Z freelancers building a personal brand. Write authentic, scroll-stopping posts that build authority and attract clients. Match each platform's native tone: LinkedIn (professional but human), Twitter/X (punchy, concise), TikTok (hook-first script idea). No hashtag spam.",
    prompt: `Create one social post for each platform (LinkedIn, Twitter, TikTok) for this freelancer.${
      topic ? ` Topic/angle to focus on: "${topic}".` : ""
    }\n\n${describeProfile(profile)}`,
  })

  return Response.json(output)
}
