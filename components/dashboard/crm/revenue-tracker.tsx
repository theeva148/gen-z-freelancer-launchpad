"use client"

import { useMemo } from "react"
import { DollarSign, TrendingUp, Users } from "lucide-react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Card } from "@/components/ui/card"
import type { Lead } from "@/lib/types"

function currency(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  })
}

export function RevenueTracker({ leads }: { leads: Lead[] }) {
  const paid = useMemo(
    () => leads.filter((l) => l.amount_paid > 0),
    [leads],
  )

  const total = paid.reduce((sum, l) => sum + l.amount_paid, 0)
  const avg = paid.length ? total / paid.length : 0

  // Cumulative revenue over time, ordered by the date each lead was paid (updated_at).
  const series = useMemo(() => {
    const sorted = [...paid].sort(
      (a, b) => new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime(),
    )
    let running = 0
    return sorted.map((l) => {
      running += l.amount_paid
      return {
        date: new Date(l.updated_at).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        }),
        total: running,
        client: l.name,
        amount: l.amount_paid,
      }
    })
  }, [paid])

  // Rate growth: latest deal vs first deal.
  const growth =
    paid.length >= 2
      ? ((series[series.length - 1].amount - series[0].amount) / series[0].amount) * 100
      : 0

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="space-y-1 p-5">
          <div className="flex items-center gap-2 text-muted-foreground">
            <DollarSign className="size-4" />
            <span className="text-xs font-medium uppercase tracking-wide">
              Total earned
            </span>
          </div>
          <p className="font-display text-3xl font-bold text-primary">
            {currency(total)}
          </p>
        </Card>
        <Card className="space-y-1 p-5">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="size-4" />
            <span className="text-xs font-medium uppercase tracking-wide">
              Avg / client
            </span>
          </div>
          <p className="font-display text-3xl font-bold">{currency(avg)}</p>
          <p className="text-xs text-muted-foreground">
            {paid.length} paying {paid.length === 1 ? "client" : "clients"}
          </p>
        </Card>
        <Card className="space-y-1 p-5">
          <div className="flex items-center gap-2 text-muted-foreground">
            <TrendingUp className="size-4" />
            <span className="text-xs font-medium uppercase tracking-wide">
              Rate growth
            </span>
          </div>
          <p
            className={`font-display text-3xl font-bold ${
              growth >= 0 ? "text-primary" : "text-destructive"
            }`}
          >
            {growth >= 0 ? "+" : ""}
            {growth.toFixed(0)}%
          </p>
          <p className="text-xs text-muted-foreground">first deal vs latest</p>
        </Card>
      </div>

      <Card className="p-5">
        <h4 className="mb-4 font-heading text-sm font-semibold">
          Revenue over time
        </h4>
        {series.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground text-pretty">
            Mark a lead as "Paid" and set the amount to start tracking your income.
          </p>
        ) : (
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={series}
                margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-primary)"
                      stopOpacity={0.5}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-primary)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${v}`}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    color: "var(--color-popover-foreground)",
                    fontSize: 12,
                  }}
                  formatter={(value) => [currency(Number(value)), "Total"]}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  fill="url(#rev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
    </div>
  )
}
