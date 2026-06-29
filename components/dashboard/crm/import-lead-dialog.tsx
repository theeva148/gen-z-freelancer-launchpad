"use client"

import { useState } from "react"
import { Loader2, Sparkles, UserPlus } from "lucide-react"
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
import { toast } from "sonner"

export function ImportLeadDialog({ onImported }: { onImported: () => void }) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(false)

  async function submit() {
    if (!text.trim()) {
      toast.error("Paste something first.")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/leads/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => null)
        throw new Error(json?.error || "Could not parse that. Try adding more detail.")
      }
      setText("")
      setOpen(false)
      onImported()
      toast.success("Lead imported and outreach drafted")
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
            profile. AI extracts the name, role, company, and platform, then
            drafts a personalized outreach message based on your skills.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="lead-text" className="sr-only">
            Lead information
          </Label>
          <Textarea
            id="lead-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={7}
            placeholder={`e.g.\nSarah Chen\nHead of Marketing @ Brightwave\nlinkedin.com/in/sarahchen\nsarah@brightwave.io`}
          />
        </div>

        <DialogFooter>
          <Button type="button" onClick={submit} disabled={loading}>
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            {loading ? "Reading…" : "Extract & draft outreach"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
