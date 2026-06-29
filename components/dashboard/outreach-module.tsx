"use client"

import { useState } from "react"
import { Sparkles, Loader2, Copy, Check } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ModuleHeader } from "@/components/dashboard/module-header"
import type { Profile } from "@/lib/types"

interface Message {
  channel: string
  target: string
  subject: string
  body: string
}

export function OutreachModule({ profile }: { profile: Profile }) {
  const [messages, setMessages] = useState<Message[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState<number | null>(null)

  async function generate() {
    setLoading(true)
    try {
      const res = await fetch("/api/outreach", { method: "POST" })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setMessages(data.messages)
    } catch {
      toast.error("Couldn't write your messages. Try again.")
    } finally {
      setLoading(false)
    }
  }

  async function copy(msg: Message, i: number) {
    const text = msg.subject ? `${msg.subject}\n\n${msg.body}` : msg.body
    await navigator.clipboard.writeText(text)
    setCopied(i)
    toast.success("Copied to clipboard")
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <div>
      <ModuleHeader
        title="Outreach Generator"
        subtitle="Five cold messages that sound like you and get replies."
        action={
          <Button onClick={generate} disabled={loading} className="font-semibold">
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            {messages ? "Regenerate" : "Write my 5 messages"}
          </Button>
        }
      />

      {loading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      )}

      {!loading && !messages && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center py-14 text-center">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sparkles className="size-6" />
            </div>
            <h3 className="mt-4 font-display text-lg font-bold">
              Your first 5 cold messages
            </h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Tailored to your skills as a {profile.skills[0] ?? "freelancer"}.
              Copy, tweak, and send.
            </p>
          </CardContent>
        </Card>
      )}

      {!loading && messages && (
        <div className="space-y-4">
          {messages.map((msg, i) => (
            <Card key={i}>
              <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{msg.channel}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {msg.target}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copy(msg, i)}
                  className="shrink-0"
                >
                  {copied === i ? (
                    <Check className="size-4 text-primary" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </Button>
              </CardHeader>
              <CardContent>
                {msg.subject && (
                  <p className="mb-2 font-semibold">{msg.subject}</p>
                )}
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                  {msg.body}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
