import { query } from "@/lib/db"
import { requireProfileId } from "@/lib/session"
import type { Lead } from "@/lib/types"

export async function GET() {
  try {
    const profileId = await requireProfileId()
    const { rows } = await query(
      `SELECT * FROM leads WHERE profile_id = $1 ORDER BY updated_at DESC`,
      [profileId],
    )
    const leads = rows.map((r) => ({ ...r, amount_paid: Number(r.amount_paid) })) as Lead[]
    return Response.json({ leads })
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
  const name = typeof body?.name === "string" ? body.name.trim() : ""
  if (!name) return new Response("Name required", { status: 400 })

  const { rows } = await query(
    `INSERT INTO leads (profile_id, name, role, company, platform)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [
      profileId,
      name,
      typeof body?.role === "string" && body.role.trim() ? body.role.trim() : null,
      typeof body?.company === "string" && body.company.trim() ? body.company.trim() : null,
      typeof body?.platform === "string" && body.platform.trim() ? body.platform.trim() : null,
    ],
  )
  const lead = rows[0]
  return Response.json({ ...lead, amount_paid: Number(lead.amount_paid) } as Lead)
}
