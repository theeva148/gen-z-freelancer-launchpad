"use client"

import { useState } from "react"
import {
  Target,
  Calculator,
  Send,
  CalendarClock,
  Users,
  LogOut,
  Menu,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Profile } from "@/lib/types"
import { logout } from "@/app/dashboard/actions"
import { StrategyModule } from "@/components/dashboard/strategy-module"
import { RatesModule } from "@/components/dashboard/rates-module"
import { OutreachModule } from "@/components/dashboard/outreach-module"
import { SchedulerModule } from "@/components/dashboard/scheduler-module"
import { CrmModule } from "@/components/dashboard/crm/crm-module"

type ModuleKey = "strategy" | "rates" | "outreach" | "scheduler" | "crm"

const NAV: { key: ModuleKey; label: string; icon: typeof Target }[] = [
  { key: "strategy", label: "Client Strategy", icon: Target },
  { key: "rates", label: "Rate Calculator", icon: Calculator },
  { key: "outreach", label: "Outreach", icon: Send },
  { key: "scheduler", label: "Content", icon: CalendarClock },
  { key: "crm", label: "Lead CRM", icon: Users },
]

export function DashboardShell({ profile }: { profile: Profile }) {
  const [active, setActive] = useState<ModuleKey>("strategy")
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-sidebar transition-transform md:static md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <span className="font-display text-lg font-bold tracking-tight">
            un<span className="text-primary">bossed</span>
          </span>
          <button
            className="md:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-3">
          {NAV.map((item) => {
            const Icon = item.icon
            const isActive = active === item.key
            return (
              <button
                key={item.key}
                onClick={() => {
                  setActive(item.key)
                  setMobileOpen(false)
                }}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </button>
            )
          })}
        </nav>

        <div className="border-t border-border p-3">
          <div className="px-2 py-2">
            <p className="truncate text-sm font-semibold">{profile.name}</p>
            <p className="truncate text-xs capitalize text-muted-foreground">
              {profile.skills[0] ?? "freelancer"} · {profile.experience}
            </p>
          </div>
          <form action={logout}>
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="w-full justify-start text-muted-foreground"
            >
              <LogOut className="size-4" />
              Log out
            </Button>
          </form>
        </div>
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-background/70 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-border px-5 py-4 md:hidden">
          <button onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu className="size-5" />
          </button>
          <span className="font-display font-bold">
            un<span className="text-primary">bossed</span>
          </span>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-8 md:px-8">
          {active === "strategy" && <StrategyModule profile={profile} />}
          {active === "rates" && <RatesModule profile={profile} />}
          {active === "outreach" && <OutreachModule profile={profile} />}
          {active === "scheduler" && <SchedulerModule />}
          {active === "crm" && <CrmModule profile={profile} />}
        </main>
      </div>
    </div>
  )
}
