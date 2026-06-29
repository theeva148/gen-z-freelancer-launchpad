import { redirect } from "next/navigation"
import { getProfileId } from "@/lib/session"
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow"

export default async function OnboardingPage() {
  if (await getProfileId()) redirect("/dashboard")
  return (
    <main className="min-h-screen bg-background text-foreground">
      <OnboardingFlow />
    </main>
  )
}
