import { query } from "@/lib/db"
import { requireProfileId } from "@/lib/session"
import type { ScheduledPost } from "@/lib/types"

export async function GET() {
  try {
    const profileId = await requireProfileId()
    const { rows } = await query(
      `SELECT * FROM scheduled_posts
       WHERE profile_id = $1
       ORDER BY scheduled_for ASC NULLS LAST, created_at DESC`,
      [profileId],
    )
    return Response.json({ posts: rows as ScheduledPost[] })
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

  const body = await req.json().catch(() => null)
  const platform = typeof body?.platform === "string" ? body.platform : ""
  const content = typeof body?.content === "string" ? body.content.trim() : ""
  const topic =
    typeof body?.topic === "string" && body.topic.trim()
      ? body.topic.trim().slice(0, 300)
      : null
  const scheduledFor = body?.scheduledFor
    ? new Date(body.scheduledFor).toISOString()
    : null

  if (!platform || !content) {
    return new Response("Invalid input", { status: 400 })
  }

  const { rows } = await query(
    `INSERT INTO scheduled_posts (profile_id, platform, topic, content, scheduled_for)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [profileId, platform, topic, content, scheduledFor],
  )
  return Response.json(rows[0] as ScheduledPost)
}
