import { redirect } from "next/navigation"
import { getProfile } from "@/lib/session"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"

export default async function DashboardPage() {
  const profile = await getProfile()
  if (!profile) redirect("/onboarding")
  return <DashboardShell profile={profile} />
}
