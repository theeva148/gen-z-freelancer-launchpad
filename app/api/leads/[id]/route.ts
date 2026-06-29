import { query } from "@/lib/db"
import { requireProfileId } from "@/lib/session"
import { LEAD_STAGES, type Lead } from "@/lib/types"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  let profileId: number
  try {
    profileId = await requireProfileId()
  } catch {
    return new Response("Unauthorized", { status: 401 })
  }

  const { id } = await params
  const leadId = Number.parseInt(id, 10)
  if (!Number.isFinite(leadId)) return new Response("Bad id", { status: 400 })

  const body = await req.json().catch(() => null)

  const sets: string[] = []
  const values: unknown[] = []
  let i = 1

  if (typeof body?.stage === "string" && (LEAD_STAGES as readonly string[]).includes(body.stage)) {
    sets.push(`stage = $${i++}`)
    values.push(body.stage)
  }
  if (body?.amount_paid !== undefined && !Number.isNaN(Number(body.amount_paid))) {
    sets.push(`amount_paid = $${i++}`)
    values.push(Number(body.amount_paid))
  }
  if (body?.touch === true) {
    sets.push(`last_contacted_at = now()`)
  }

  if (sets.length === 0) return new Response("Nothing to update", { status: 400 })

  sets.push(`updated_at = now()`)
  values.push(leadId, profileId)

  const { rows } = await query(
    `UPDATE leads SET ${sets.join(", ")}
     WHERE id = $${i++} AND profile_id = $${i}
     RETURNING *`,
    values,
  )
  if (rows.length === 0) return new Response("Not found", { status: 404 })
  const lead = rows[0]
  return Response.json({ ...lead, amount_paid: Number(lead.amount_paid) } as Lead)
}

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
  const leadId = Number.parseInt(id, 10)
  await query(`DELETE FROM leads WHERE id = $1 AND profile_id = $2`, [leadId, profileId])
  return new Response(null, { status: 204 })
}
