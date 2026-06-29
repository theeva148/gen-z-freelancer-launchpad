import { generateText, Output } from "ai"
import { z } from "zod"
import { getProfile } from "@/lib/session"
import { MODEL, describeProfile } from "@/lib/ai"

export const maxDuration = 60

const schema = z.object({
  messages: z
    .array(
      z.object({
        channel: z
          .string()
          .describe("Where to send it, e.g. LinkedIn DM, Email, Instagram DM"),
        target: z.string().describe("The kind of person/business this targets"),
        subject: z.string().describe("Short subject or opening hook"),
        body: z.string().describe("The full cold message, casual but professional"),
      }),
    )
    .length(5)
    .describe("Exactly 5 distinct cold outreach messages"),
})

export async function POST() {
  const profile = await getProfile()
  if (!profile) return new Response("Unauthorized", { status: 401 })

  try {
    const { output } = await generateText({
      model: MODEL,
      output: Output.object({ schema }),
      system:
        "You write cold outreach for Gen Z freelancers. Messages are short, human, specific, and never cringey or salesy. They sound like a real person reaching out, lead with value, and have a clear soft ask. Vary the angle across the 5 messages.",
      prompt: `Write 5 tailored cold outreach messages this freelancer can send to land their first/next clients. Tailor to their skill set.\n\n${describeProfile(
        profile,
      )}`,
    })

    return Response.json(output)
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    )
  }
}
