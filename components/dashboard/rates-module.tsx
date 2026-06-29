"use client"

import { useState } from "react"
import { Sparkles, Loader2, Lightbulb } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ModuleHeader } from "@/components/dashboard/module-header"
import type { Profile } from "@/lib/types"

interface Rates {
  currency: string
  hourly_low: number
  hourly_high: number
  project_low: number
  project_high: number
  rationale: string
  tips: string[]
}

const fmt = (n: number) =>
  `$${Math.round(n).toLocaleString("en-US")}`

export function RatesModule({ profile }: { profile: Profile }) {
  const [data, setData] = useState<Rates | null>(null)
  const [loading, setLoading] = useState(false)

  async function generate() {
    setLoading(true)
    try {
      const res = await fetch("/api/rates", { method: "POST" })
      if (!res.ok) throw new Error()
      setData(await res.json())
    } catch {
      toast.error("Couldn't calculate your rates. Try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <ModuleHeader
        title="Rate Calculator"
        subtitle="Stop undercharging. Here's where to start."
        action={
          <Button onClick={generate} disabled={loading} className="font-semibold">
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            {data ? "Recalculate" : "Calculate my rates"}
          </Button>
        }
      />

      {loading && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-36 rounded-xl" />
          <Skeleton className="h-36 rounded-xl" />
        </div>
      )}

      {!loading && !data && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center py-14 text-center">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sparkles className="size-6" />
            </div>
            <h3 className="mt-4 font-display text-lg font-bold">
              Know your worth in numbers
            </h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Get market-based starting rates for a {profile.experience}{" "}
              {profile.skills[0] ?? "freelancer"}.
            </p>
          </CardContent>
        </Card>
      )}

      {!loading && data && (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="pt-6">
                <p className="text-sm font-medium text-muted-foreground">
                  Hourly rate
                </p>
                <p className="mt-1 font-display text-3xl font-bold text-primary">
                  {fmt(data.hourly_low)}–{fmt(data.hourly_high)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">per hour</p>
              </CardContent>
            </Card>
            <Card className="border-accent/30 bg-accent/5">
              <CardContent className="pt-6">
                <p className="text-sm font-medium text-muted-foreground">
                  Starter project
                </p>
                <p className="mt-1 font-display text-3xl font-bold text-accent">
                  {fmt(data.project_low)}–{fmt(data.project_high)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">per project</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="pt-6">
              <p className="leading-relaxed text-muted-foreground">
                {data.rationale}
              </p>
            </CardContent>
          </Card>

          <div>
            <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-bold">
              <Lightbulb className="size-4 text-accent" />
              Pricing tips
            </h3>
            <div className="space-y-2.5">
              {data.tips.map((tip, i) => (
                <Card key={i}>
                  <CardContent className="py-4 text-sm leading-relaxed">
                    {tip}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
