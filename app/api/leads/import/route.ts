import { generateText, Output } from "ai"
import { z } from "zod"
import { query } from "@/lib/db"
import { getProfile, requireProfileId } from "@/lib/session"
import { MODEL, describeProfile } from "@/lib/ai"
import type { Lead } from "@/lib/types"

export const maxDuration = 60

const schema = z.object({
  name: z.string().describe("The person's full name. Empty string if unknown."),
  role: z
    .string()
    .describe("Their job title or role, e.g. 'Marketing Director'. Empty string if unknown."),
  company: z
    .string()
    .describe("Their company or organization. Empty string if unknown."),
  platform: z
    .string()
    .describe(
      "Where this lead came from / where to reach them, e.g. LinkedIn, Instagram, Email, X. Empty string if unclear.",
    ),
  outreach_message: z
    .string()
    .describe(
      "A personalized, casual-but-professional cold outreach message from the freelancer to this lead, referencing what the freelancer does and a relevant hook about the lead. 2-4 short sentences.",
    ),
  suggested_followup: z
    .string()
    .describe("A one-line suggestion for how/when to follow up if they don't reply."),
})

export async function POST(req: Request) {
  const profile = await getProfile()
  if (!profile) return new Response("Unauthorized", { status: 401 })

  const body = await req.json().catch(() => null)
  const text = typeof body?.text === "string" ? body.text.trim() : ""
  if (!text) return new Response("No text provided", { status: 400 })

  let output
  try {
    const result = await generateText({
      model: MODEL,
      output: Output.object({ schema }),
      system:
        "You extract structured contact details from messy text (LinkedIn URLs/bios, email signatures, social profiles, pasted notes) and draft tailored cold outreach. Infer sensibly; never fabricate a name that isn't implied. Outreach must sound like a real Gen Z freelancer, not a template.",
      prompt: `Extract this lead and draft outreach.\n\nFREELANCER (the sender):\n${describeProfile(
        profile,
      )}\n\nPASTED LEAD INFO:\n"""\n${text.slice(0, 4000)}\n"""`,
    })
    output = result.output
  } catch {
    return new Response("Could not parse lead", { status: 502 })
  }

  const profileId = await requireProfileId()
  const { rows } = await query(
    `INSERT INTO leads
       (profile_id, name, role, company, platform, outreach_message, suggested_followup)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      profileId,
      output.name?.trim() || "Unnamed lead",
      output.role?.trim() || null,
      output.company?.trim() || null,
      output.platform?.trim() || null,
      output.outreach_message?.trim() || null,
      output.suggested_followup?.trim() || null,
    ],
  )

  const lead = rows[0]
  return Response.json({ ...lead, amount_paid: Number(lead.amount_paid) } as Lead)
}
