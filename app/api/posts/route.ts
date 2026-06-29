import { query } from "@/lib/db"
import { requireProfileId } from "@/lib/session"
import type { ScheduledPost } from "@/lib/types"

export async function GET() {
  try {
    const profileId = await requireProfileId()
    const { rows } = await query(
      `SELECT * FROM scheduled_posts WHERE profile_id = $1 ORDER BY scheduled_for ASC`,
      [profileId],
    )
    return Response.json(rows as ScheduledPost[])
  } catch {
    return new Response("Unauthorized", { status: 401 })
  }
}

export async function POST(req: Request) {
  let profileId: number
  try {
    profileId = await requireProfileId()
  } catch {
    return new Response("Unauthorized", { status: 401 })
  }

  const body = await req.json()
  const { platform, content, scheduled_for } = body ?? {}

  if (
    !["LinkedIn", "Twitter", "TikTok"].includes(platform) ||
    typeof content !== "string" ||
    !content.trim() ||
    !scheduled_for
  ) {
    return new Response("Invalid input", { status: 400 })
  }

  const { rows } = await query(
    `INSERT INTO scheduled_posts (profile_id, platform, content, scheduled_for)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [profileId, platform, content.trim(), new Date(scheduled_for).toISOString()],
  )
  return Response.json(rows[0] as ScheduledPost)
}
