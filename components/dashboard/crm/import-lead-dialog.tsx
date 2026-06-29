"use client"

import { useState } from "react"
import { Loader2, Sparkles, UserPlus, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

const STAGES = [
  "Contacted",
  "Replied",
  "Proposal Sent",
  "Negotiating",
  "Closed",
  "Paid",
]

export function ImportLeadDialog({ onImported }: { onImported: () => void }) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [stage, setStage] = useState("Contacted")
  const [loading, setLoading] = useState(false)

  async function submit(draftMessage: boolean) {
    if (!text.trim()) {
      toast.error("Paste something first.")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/leads/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, email, phone, stage, draftMessage }),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => null)
        throw new Error(json?.error || "Could not parse that. Try adding more detail.")
      }
      setText("")
      setEmail("")
      setPhone("")
      setStage("Contacted")
      setOpen(false)
      onImported()
      toast.success(
        draftMessage ? "Lead imported and outreach drafted" : "Lead saved to pipeline"
      )
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not parse that. Try adding more detail.",
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button>
            <UserPlus className="size-4" />
            Import Lead
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-heading">Import a lead</DialogTitle>
          <DialogDescription className="text-pretty">
            Paste anything — a LinkedIn URL, an email signature, a bio, a social
            profile. AI extracts the name, role, company, and platform.
            Optionally draft an outreach message based on your skills.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Paste area */}
          <div className="space-y-2">
            <Label htmlFor="lead-text">Lead info</Label>
            <Textarea
              id="lead-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={5}
              placeholder={`e.g.\nSarah Chen\nHead of Marketing @ Brightwave\nlinkedin.com/in/sarahchen`}
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="lead-email">Email (optional)</Label>
            <Input
              id="lead-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="sarah@brightwave.io"
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="lead-phone">Phone (optional)</Label>
            <Input
              id="lead-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 555 000 0000"
            />
          </div>

          {/* Stage */}
          <div className="space-y-2">
            <Label>Current stage</Label>
            <Select value={stage} onValueChange={setStage}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STAGES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:justify-end">
          {/* Save only — no message drafted */}
          <Button
            type="button"
            variant="outline"
            onClick={() => submit(false)}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            Save Lead
          </Button>

          {/* Save + draft outreach message */}
          <Button
            type="button"
            onClick={() => submit(true)}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            Save + Draft Message
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
