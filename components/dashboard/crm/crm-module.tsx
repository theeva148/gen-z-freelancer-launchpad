"use client"

import useSWR, { mutate } from "swr"
import { Inbox } from "lucide-react"
import { ModuleHeader } from "@/components/dashboard/module-header"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { LEAD_STAGES, type Lead, type Profile } from "@/lib/types"
import { ImportLeadDialog } from "./import-lead-dialog"
import { RevenueTracker } from "./revenue-tracker"
import { LeadCard } from "./lead-card"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const STAGE_ACCENT: Record<string, string> = {
  Contacted: "text-muted-foreground",
  Replied: "text-chart-3",
  "Proposal Sent": "text-chart-4",
  Negotiating: "text-accent",
  Closed: "text-primary",
  Paid: "text-primary",
}

export function CrmModule({ profile }: { profile: Profile }) {
  const { data, isLoading } = useSWR<{ leads: Lead[] }>("/api/leads", fetcher)
  const leads = data?.leads ?? []

  async function updateLead(id: number, patch: Record<string, unknown>) {
    // optimistic
    mutate(
      "/api/leads",
      (curr: { leads: Lead[] } | undefined) => {
        if (!curr) return curr
        return {
          leads: curr.leads.map((l) =>
            l.id === id ? { ...l, ...patch, last_contacted_at: new Date().toISOString() } : l,
          ),
        }
      },
      false,
    )
    await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    })
    mutate("/api/leads")
  }

  async function deleteLead(id: number) {
    mutate(
      "/api/leads",
      (curr: { leads: Lead[] } | undefined) =>
        curr ? { leads: curr.leads.filter((l) => l.id !== id) } : curr,
      false,
    )
    await fetch(`/api/leads/${id}`, { method: "DELETE" })
    mutate("/api/leads")
  }

  return (
    <div className="space-y-8">
      <ModuleHeader
        title="Lead CRM"
        description="Your whole pipeline in one place. Import leads, let AI draft the outreach, and push every deal toward paid."
        action={<ImportLeadDialog onImported={() => mutate("/api/leads")} />}
      />

      <RevenueTracker leads={leads} />

      <div>
        <h3 className="mb-3 font-heading text-lg font-semibold">Pipeline</h3>
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>
        ) : leads.length === 0 ? (
          <Card className="flex flex-col items-center gap-3 p-12 text-center">
            <Inbox className="size-9 text-muted-foreground" />
            <div className="space-y-1">
              <p className="font-medium">No leads yet</p>
              <p className="mx-auto max-w-sm text-sm text-muted-foreground text-pretty">
                Hit "Import Lead" and paste a LinkedIn URL, bio, or email
                signature. {profile.name.split(" ")[0]}, this is where your
                empire starts.
              </p>
            </div>
            <ImportLeadDialog onImported={() => mutate("/api/leads")} />
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
            {LEAD_STAGES.map((stage) => {
              const inStage = leads.filter((l) => l.stage === stage)
              return (
                <div key={stage} className="flex flex-col gap-3">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <span
                      className={`text-xs font-semibold uppercase tracking-wide ${STAGE_ACCENT[stage]}`}
                    >
                      {stage}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {inStage.length}
                    </span>
                  </div>
                  <div className="flex flex-col gap-3">
                    {inStage.map((lead) => (
                      <LeadCard
                        key={lead.id}
                        lead={lead}
                        onUpdate={updateLead}
                        onDelete={deleteLead}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
