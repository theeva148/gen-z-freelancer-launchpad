import { generateText, Output } from "ai"
import { z } from "zod"
import { getProfile } from "@/lib/session"
import { MODEL, describeProfile } from "@/lib/ai"

export const maxDuration = 60

const schema = z.object({
  content: z
    .string()
    .describe("The post copy, formatted natively for the requested platform."),
  suggestedTopic: z
    .string()
    .describe("A short label (3-6 words) describing the angle of this post."),
})

export async function POST(req: Request) {
  const profile = await getProfile()
  if (!profile) return new Response("Unauthorized", { status: 401 })

  const body = await req.json().catch(() => null)
  const platform =
    typeof body?.platform === "string" ? body.platform : "LinkedIn"
  const topic =
    typeof body?.topic === "string" ? body.topic.slice(0, 300) : ""

  const { output } = await generateText({
    model: MODEL,
    output: Output.object({ schema }),
    system:
      "You are a social content strategist for Gen Z freelancers building a personal brand. Write an authentic, scroll-stopping post that builds authority and attracts clients. Match the platform's native tone: LinkedIn (professional but human), Instagram (warm, story-driven with line breaks), TikTok (hook-first script idea), X/Twitter (punchy, concise), Threads (casual, conversational). No hashtag spam.",
    prompt: `Write one ${platform} post for this freelancer.${
      topic ? ` Topic/angle to focus on: "${topic}".` : ""
    }\n\n${describeProfile(profile)}`,
  })

  return Response.json(output)
}
