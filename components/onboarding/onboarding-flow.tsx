"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import type {
  ColdOutreach,
  Experience,
  Portfolio,
  PriorClients,
} from "@/lib/types"
import { SkillCombobox } from "@/components/onboarding/skill-combobox"
import { completeOnboarding } from "@/app/onboarding/actions"

interface FormState {
  name: string
  skills: string[]
  experience: Experience | null
  portfolio: Portfolio | null
  portfolio_examples: string
  prior_clients: PriorClients | null
  income_goal: string
  cold_outreach: ColdOutreach | null
}

const TOTAL = 6

export function OnboardingFlow() {
  const [step, setStep] = useState(1)
  const [pending, startTransition] = useTransition()
  const [form, setForm] = useState<FormState>({
    name: "",
    skills: [],
    experience: null,
    portfolio: null,
    portfolio_examples: "",
    prior_clients: null,
    income_goal: "",
    cold_outreach: null,
  })

  function addCustomSkill(skill: string) {
    setForm((f) => ({
      ...f,
      skills: f.skills.includes(skill) ? f.skills : [...f.skills, skill],
    }))
  }

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function toggleSkill(skill: string) {
    setForm((f) => ({
      ...f,
      skills: f.skills.includes(skill)
        ? f.skills.filter((s) => s !== skill)
        : [...f.skills, skill],
    }))
  }

  const canContinue = (() => {
    switch (step) {
      case 1:
        return form.name.trim().length > 0
      case 2:
        return form.skills.length > 0
      case 3:
        return form.experience !== null
      case 4:
        return form.portfolio !== null
      case 5:
        return form.prior_clients !== null
      case 6:
        return form.cold_outreach !== null && Number(form.income_goal) > 0
      default:
        return false
    }
  })()

  function next() {
    if (!canContinue) return
    if (step < TOTAL) {
      setStep((s) => s + 1)
      return
    }
    submit()
  }

  function submit() {
    startTransition(async () => {
      try {
        await completeOnboarding({
          name: form.name,
          skills: form.skills,
          experience: form.experience!,
          portfolio: form.portfolio!,
          portfolio_examples: form.portfolio_examples,
          prior_clients: form.prior_clients!,
          income_goal: Number(form.income_goal),
          cold_outreach: form.cold_outreach!,
        })
      } catch (err) {
        // redirect() throws internally; only surface real errors
        if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) return
        toast.error("Something went wrong. Try again.")
      }
    })
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col px-5 py-8">
      <header className="flex items-center justify-between">
        <Link href="/" className="font-display font-bold tracking-tight">
          un<span className="text-primary">bossed</span>
        </Link>
        <span className="text-sm text-muted-foreground">
          Step {step} of {TOTAL}
        </span>
      </header>

      <Progress value={(step / TOTAL) * 100} className="mt-5 h-1.5" />

      <div className="flex flex-1 flex-col justify-center py-10">
        {step === 1 && (
          <Step title="What's your name?" subtitle="We'll keep it personal.">
            <Input
              autoFocus
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Your name"
              className="h-14 text-lg"
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !e.nativeEvent.isComposing &&
                  e.keyCode !== 229
                )
                  next()
              }}
            />
          </Step>
        )}

        {step === 2 && (
          <Step
            title="What do you do?"
            subtitle="Search the full list of freelance work, or type your own. Pick everything that fits."
          >
            <SkillCombobox
              selected={form.skills}
              onToggle={toggleSkill}
              onAddCustom={addCustomSkill}
            />
          </Step>
        )}

        {step === 3 && (
          <Step title="How experienced are you?" subtitle="Be honest, no judgment.">
            <ChoiceList
              value={form.experience}
              onChange={(v) => set("experience", v as Experience)}
              options={[
                { value: "beginner", label: "Beginner", hint: "Just getting started" },
                {
                  value: "intermediate",
                  label: "Intermediate",
                  hint: "I've got some reps in",
                },
                {
                  value: "advanced",
                  label: "Advanced",
                  hint: "I know my craft cold",
                },
              ]}
            />
          </Step>
        )}

        {step === 4 && (
          <Step
            title="Got a portfolio or past work?"
            subtitle="Proof helps, but it's not required to start."
          >
            <div className="space-y-6">
              <ChoiceList
                value={form.portfolio}
                onChange={(v) => set("portfolio", v as Portfolio)}
                options={[
                  { value: "yes_link", label: "Yes, with a link", hint: "It's live somewhere" },
                  {
                    value: "yes_no_link",
                    label: "Yes, but no link yet",
                    hint: "Work exists, not hosted",
                  },
                  { value: "not_yet", label: "Not yet", hint: "Starting fresh" },
                ]}
              />
              {form.portfolio && form.portfolio !== "not_yet" && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <label className="mb-2 block text-sm font-medium text-muted-foreground">
                    {form.portfolio === "yes_link"
                      ? "Drop your links + a few standout examples"
                      : "Describe a few standout work examples"}
                  </label>
                  <Textarea
                    value={form.portfolio_examples}
                    onChange={(e) => set("portfolio_examples", e.target.value)}
                    placeholder={
                      "e.g.\nhttps://yoursite.com/work\n- Rebranded a coffee shop's whole identity\n- Built a Shopify store that hit $20k/mo\n- Wrote a newsletter that grew to 5k subs"
                    }
                    className="min-h-36 resize-none text-base leading-relaxed"
                  />
                  <p className="mt-2 text-xs text-muted-foreground">
                    The more specific you are, the sharper your AI strategy, rates, and outreach will be.
                  </p>
                </div>
              )}
            </div>
          </Step>
        )}

        {step === 5 && (
          <Step
            title="Have you had paying clients?"
            subtitle="This shapes your strategy and rates."
          >
            <ChoiceList
              value={form.prior_clients}
              onChange={(v) => set("prior_clients", v as PriorClients)}
              options={[
                { value: "never", label: "Never", hint: "First one loading" },
                { value: "1-3", label: "1–3 clients", hint: "Getting the hang of it" },
                {
                  value: "more_than_3",
                  label: "More than 3",
                  hint: "I'm in business",
                },
              ]}
            />
          </Step>
        )}

        {step === 6 && (
          <Step
            title="Last one. Let's talk money."
            subtitle="Your goal and how you feel about cold outreach."
          >
            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-muted-foreground">
                  Monthly income goal
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-muted-foreground">
                    $
                  </span>
                  <Input
                    inputMode="numeric"
                    value={form.income_goal}
                    onChange={(e) =>
                      set("income_goal", e.target.value.replace(/[^0-9]/g, ""))
                    }
                    placeholder="3000"
                    className="h-14 pl-9 text-lg"
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-muted-foreground">
                  Comfortable with cold outreach?
                </label>
                <ChoiceList
                  value={form.cold_outreach}
                  onChange={(v) => set("cold_outreach", v as ColdOutreach)}
                  options={[
                    { value: "yes", label: "Yes", hint: "Let's send it" },
                    { value: "kinda", label: "Kinda", hint: "With a little help" },
                    { value: "no", label: "No", hint: "Terrifying, honestly" },
                  ]}
                />
              </div>
            </div>
          </Step>
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <Button
          variant="ghost"
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          disabled={step === 1 || pending}
          className={cn(step === 1 && "invisible")}
        >
          <ArrowLeft className="size-4" />
          Back
        </Button>
        <Button
          onClick={next}
          disabled={!canContinue || pending}
          size="lg"
          className="min-w-36 font-semibold"
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : step === TOTAL ? (
            <>
              Build my empire
              <Check className="size-4" />
            </>
          ) : (
            <>
              Continue
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

function Step({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <h1 className="text-balance font-display text-3xl font-bold tracking-tight md:text-4xl">
        {title}
      </h1>
      <p className="mt-2 text-pretty text-muted-foreground">{subtitle}</p>
      <div className="mt-8">{children}</div>
    </div>
  )
}

function ChoiceList({
  value,
  onChange,
  options,
}: {
  value: string | null
  onChange: (value: string) => void
  options: { value: string; label: string; hint: string }[]
}) {
  return (
    <div className="space-y-3">
      {options.map((opt) => {
        const active = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex w-full items-center justify-between rounded-xl border px-5 py-4 text-left transition-colors",
              active
                ? "border-primary bg-primary/10"
                : "border-border bg-card hover:border-primary/50",
            )}
          >
            <div>
              <div className="font-semibold">{opt.label}</div>
              <div className="text-sm text-muted-foreground">{opt.hint}</div>
            </div>
            <span
              className={cn(
                "flex size-5 items-center justify-center rounded-full border",
                active ? "border-primary bg-primary text-primary-foreground" : "border-border",
              )}
            >
              {active && <Check className="size-3" />}
            </span>
          </button>
        )
      })}
    </div>
  )
}
