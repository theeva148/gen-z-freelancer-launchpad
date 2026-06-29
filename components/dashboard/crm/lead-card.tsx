"use client"

import { useState } from "react"
import {
  AlertCircle,
  Building2,
  Check,
  ChevronRight,
  Clock,
  Copy,
  Trash2,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { LEAD_STAGES, type Lead, type LeadStage } from "@/lib/types"

function daysSince(date: string) {
  return Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000)
}

function nextStage(stage: LeadStage): LeadStage | null {
  const i = LEAD_STAGES.indexOf(stage)
  return i >= 0 && i < LEAD_STAGES.length - 1 ? LEAD_STAGES[i + 1] : null
}

export function LeadCard({
  lead,
  onUpdate,
  onDelete,
}: {
  lead: Lead
  onUpdate: (id: number, patch: Record<string, unknown>) => void
  onDelete: (id: number) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const days = daysSince(lead.last_contacted_at)
  const needsFollowUp = days >= 5 && lead.stage !== "Closed" && lead.stage !== "Paid"
  const advance = nextStage(lead.stage)

  function copyOutreach() {
    if (!lead.outreach_message) return
    navigator.clipboard.writeText(lead.outreach_message)
    toast.success("Outreach copied")
  }

  return (
    <Card className="space-y-3 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-semibold leading-tight">{lead.name}</p>
          {(lead.role || lead.company) && (
            <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
              <Building2 className="size-3 shrink-0" />
              {[lead.role, lead.company].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => onDelete(lead.id)}
          className="text-muted-foreground transition-colors hover:text-destructive"
          aria-label="Delete lead"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {lead.platform && (
          <Badge variant="secondary" className="text-[10px]">
            {lead.platform}
          </Badge>
        )}
        {lead.amount_paid > 0 && (
          <Badge className="bg-primary/15 text-[10px] text-primary">
            ${lead.amount_paid.toLocaleString()}
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Clock className="size-3" />
        {days === 0 ? "contacted today" : `last contacted ${days}d ago`}
      </div>

      {needsFollowUp && (
        <div className="flex items-start gap-1.5 rounded-md bg-accent/10 px-2 py-1.5 text-xs text-accent">
          <AlertCircle className="mt-0.5 size-3 shrink-0" />
          <span>
            No reply in {days} days — time to follow up.
            {lead.suggested_followup ? ` ${lead.suggested_followup}` : ""}
          </span>
        </div>
      )}

      {expanded && lead.outreach_message && (
        <div className="space-y-2 rounded-md bg-secondary/60 p-3">
          <p className="whitespace-pre-wrap text-xs leading-relaxed text-foreground/90">
            {lead.outreach_message}
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={copyOutreach}
          >
            <Copy className="size-3" />
            Copy outreach
          </Button>
        </div>
      )}

      <div className="flex items-center gap-2">
        {lead.outreach_message && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 flex-1 text-xs"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? "Hide message" : "View message"}
          </Button>
        )}
        {advance && (
          <Button
            type="button"
            size="sm"
            className="h-7 flex-1 text-xs"
            onClick={() => {
              if (advance === "Paid") {
                const input = window.prompt("How much did you get paid? ($)", "500")
                if (input === null) return
                const amount = Number(input)
                if (Number.isNaN(amount)) {
                  toast.error("Enter a valid number")
                  return
                }
                onUpdate(lead.id, { stage: "Paid", amount_paid: amount, touch: true })
              } else {
                onUpdate(lead.id, { stage: advance, touch: true })
              }
            }}
          >
            {advance}
            <ChevronRight className="size-3" />
          </Button>
        )}
        {!advance && (
          <Badge className="h-7 flex-1 justify-center bg-primary/15 text-primary">
            <Check className="size-3" /> Won
          </Badge>
        )}
      </div>
    </Card>
  )
}
