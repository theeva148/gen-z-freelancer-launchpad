"use client"

import { useState } from "react"
import { Sparkles, Loader2, MapPin, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ModuleHeader } from "@/components/dashboard/module-header"
import type { Profile } from "@/lib/types"

interface Strategy {
  headline: string
  positioning: string
  steps: { title: string; detail: string }[]
  where_to_find_clients: string[]
}

export function StrategyModule({ profile }: { profile: Profile }) {
  const [data, setData] = useState<Strategy | null>(null)
  const [loading, setLoading] = useState(false)

  async function generate() {
    setLoading(true)
    try {
      const res = await fetch("/api/strategy", { method: "POST" })
      if (!res.ok) throw new Error()
      setData(await res.json())
    } catch {
      toast.error("Couldn't build your strategy. Try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <ModuleHeader
        title="Client Strategy"
        subtitle={`A game plan built for a ${profile.experience} ${
          profile.skills[0] ?? "freelancer"
        }.`}
        action={
          <Button onClick={generate} disabled={loading} className="font-semibold">
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            {data ? "Regenerate" : "Build my strategy"}
          </Button>
        }
      />

      {loading && <LoadingState />}

      {!loading && !data && (
        <EmptyState />
      )}

      {!loading && data && (
        <div className="space-y-5">
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="pt-6">
              <h2 className="text-balance font-display text-xl font-bold">
                {data.headline}
              </h2>
              <p className="mt-2 text-pretty leading-relaxed text-muted-foreground">
                {data.positioning}
              </p>
            </CardContent>
          </Card>

          <div>
            <h3 className="mb-3 font-display text-lg font-bold">Your next moves</h3>
            <div className="space-y-3">
              {data.steps.map((step, i) => (
                <Card key={i}>
                  <CardContent className="flex gap-4 pt-6">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary font-display text-sm font-bold text-primary-foreground">
                      {i + 1}
                    </span>
                    <div>
                      <h4 className="font-semibold">{step.title}</h4>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        {step.detail}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-bold">
              <MapPin className="size-4 text-accent" />
              Where to find your first clients
            </h3>
            <Card>
              <CardContent className="pt-6">
                <ul className="space-y-2.5">
                  {data.where_to_find_clients.map((place, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span className="leading-relaxed">{place}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center py-14 text-center">
        <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Sparkles className="size-6" />
        </div>
        <h3 className="mt-4 font-display text-lg font-bold">
          Your personalized strategy awaits
        </h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          We&apos;ll build a step-by-step plan to land clients, tuned to your skill
          and experience.
        </p>
      </CardContent>
    </Card>
  )
}

function LoadingState() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-28 w-full rounded-xl" />
      <Skeleton className="h-20 w-full rounded-xl" />
      <Skeleton className="h-20 w-full rounded-xl" />
      <Skeleton className="h-20 w-full rounded-xl" />
    </div>
  )
}
