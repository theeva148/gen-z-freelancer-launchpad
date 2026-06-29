"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { login } from "@/app/login/actions"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [pending, startTransition] = useTransition()

  function submit() {
    if (!email || !password) return
    startTransition(async () => {
      try {
        await login({ email, password })
      } catch (err) {
        if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) return
        toast.error(err instanceof Error ? err.message : "Could not log in")
      }
    })
  }

  return (
    <div className="w-full max-w-sm">
      <Link
        href="/"
        className="mb-8 block text-center font-display text-2xl font-bold tracking-tight"
      >
        un<span className="text-primary">bossed</span>
      </Link>

      <div className="rounded-2xl border border-border bg-card p-7">
        <h1 className="text-balance font-display text-2xl font-bold tracking-tight">
          Welcome back
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Log in to keep building your empire.
        </p>

        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            submit()
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="h-12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              className="h-12"
            />
          </div>
          <Button
            type="submit"
            disabled={pending || !email || !password}
            size="lg"
            className="w-full font-semibold"
          >
            {pending ? <Loader2 className="size-4 animate-spin" /> : "Log in"}
          </Button>
        </form>
      </div>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link href="/onboarding" className="font-semibold text-primary hover:underline">
          Create your account
        </Link>
      </p>
    </div>
  )
}
