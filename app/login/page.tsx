import { redirect } from "next/navigation"
import { getProfileId } from "@/lib/session"
import { LoginForm } from "@/components/auth/login-form"

export default async function LoginPage() {
  if (await getProfileId()) redirect("/dashboard")
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-10 text-foreground">
      <LoginForm />
    </main>
  )
}
