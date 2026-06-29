import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  Target,
  Calculator,
  Send,
  CalendarClock,
  Users,
  Zap,
} from "lucide-react"
import { getProfileId } from "@/lib/session"

const MODULES = [
  {
    icon: Target,
    title: "Client Strategy",
    desc: "A personalized game plan built around your skill and where you're at. No fluff, just the next move.",
  },
  {
    icon: Calculator,
    title: "Rate Calculator",
    desc: "Stop guessing what to charge. Get a starting price based on your craft, level, and the market.",
  },
  {
    icon: Send,
    title: "AI Outreach",
    desc: "Five cold messages that actually sound like you and make people reply. Written in seconds.",
  },
  {
    icon: CalendarClock,
    title: "Content Scheduler",
    desc: "Generate posts for LinkedIn, X, and TikTok, then drop them on a calendar and stay consistent.",
  },
  {
    icon: Users,
    title: "Lead CRM",
    desc: "Paste any profile and AI turns it into a tracked lead. Pipeline, follow-ups, and revenue in one place.",
  },
]

export default async function LandingPage() {
  const hasProfile = (await getProfileId()) !== null
  const primaryHref = hasProfile ? "/dashboard" : "/onboarding"

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--foreground) 1px, transparent 1px), linear-gradient(to bottom, var(--foreground) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
        aria-hidden="true"
      />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-5 py-6">
        <span className="font-display text-xl font-bold tracking-tight">
          un<span className="text-primary">bossed</span>
        </span>
        <Button
          render={<Link href={primaryHref} />}
          nativeButton={false}
          variant="ghost"
          size="sm"
        >
          {hasProfile ? "Dashboard" : "Log in"}
        </Button>
      </header>

      <section className="relative z-10 mx-auto max-w-6xl px-5 pb-20 pt-12 md:pt-20">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs font-medium text-muted-foreground">
          <Zap className="size-3.5 text-primary" />
          For freelancers who refuse to clock in
        </div>

        <h1 className="mt-6 max-w-4xl text-balance font-display text-5xl font-bold leading-[0.95] tracking-tight md:text-7xl lg:text-8xl">
          Keep your soul.{" "}
          <span className="text-primary">Build your empire.</span>
        </h1>

        <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
          Unbossed is the launchpad for Gen Z freelancers to land their first
          clients and grow their income. Strategy, pricing, AI outreach, content,
          and a CRM that runs itself.
        </p>

        <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            render={<Link href={primaryHref} />}
            nativeButton={false}
            size="lg"
            className="h-12 px-7 text-base font-semibold"
          >
            Start Free
            <ArrowRight className="size-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            No card. No boss. No limits.
          </span>
        </div>

        <dl className="mt-16 grid max-w-2xl grid-cols-3 gap-6 border-t border-border pt-8">
          {[
            { k: "5 min", v: "to your first outreach" },
            { k: "AI", v: "writes & tracks for you" },
            { k: "$0", v: "to get started" },
          ].map((s) => (
            <div key={s.v}>
              <dt className="font-display text-2xl font-bold text-primary md:text-3xl">
                {s.k}
              </dt>
              <dd className="mt-1 text-sm text-muted-foreground">{s.v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="relative z-10 mx-auto max-w-6xl px-5 pb-24">
        <h2 className="max-w-2xl text-balance font-display text-3xl font-bold tracking-tight md:text-4xl">
          Everything you need to go from{" "}
          <span className="text-accent">side hustle</span> to self-employed.
        </h2>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((m) => {
            const Icon = m.icon
            return (
              <div
                key={m.title}
                className="group rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/50"
              >
                <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="size-5" />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold">{m.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {m.desc}
                </p>
              </div>
            )
          })}

          <div className="flex flex-col justify-between rounded-2xl border border-primary/40 bg-primary/5 p-6">
            <p className="font-display text-xl font-bold leading-snug text-balance">
              Your empire starts with one reply.
            </p>
            <Button
              render={<Link href={primaryHref} />}
              nativeButton={false}
              className="mt-6 w-full font-semibold"
            >
              Start Free
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-8 sm:flex-row">
          <span className="font-display font-bold">
            un<span className="text-primary">bossed</span>
          </span>
          <p className="text-sm text-muted-foreground">
            Keep your soul. Build your empire.
          </p>
        </div>
      </footer>
    </main>
  )
}
