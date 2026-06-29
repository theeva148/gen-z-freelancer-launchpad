import { query } from "@/lib/db"
import { requireProfileId } from "@/lib/session"

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  let profileId: number
  try {
    profileId = await requireProfileId()
  } catch {
    return new Response("Unauthorized", { status: 401 })
  }

  const { id } = await params
  const postId = Number.parseInt(id, 10)
  if (!Number.isFinite(postId)) return new Response("Bad request", { status: 400 })

  await query(`DELETE FROM scheduled_posts WHERE id = $1 AND profile_id = $2`, [
    postId,
    profileId,
  ])
  return new Response(null, { status: 204 })
}
