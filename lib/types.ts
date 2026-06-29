export const SKILLS = [
  "web design",
  "development",
  "music",
  "art/illustration",
  "writing",
  "photography",
  "video editing",
  "social media",
  "other",
] as const

export type Experience = "beginner" | "intermediate" | "advanced"
export type Portfolio = "yes_link" | "yes_no_link" | "not_yet"
export type PriorClients = "never" | "1-3" | "more_than_3"
export type ColdOutreach = "yes" | "no" | "kinda"

export interface Profile {
  id: number
  name: string
  skills: string[]
  experience: Experience
  portfolio: Portfolio
  prior_clients: PriorClients
  income_goal: number
  cold_outreach: ColdOutreach
  created_at: string
}

export const LEAD_STAGES = [
  "Contacted",
  "Replied",
  "Proposal Sent",
  "Negotiating",
  "Closed",
  "Paid",
] as const

export type LeadStage = (typeof LEAD_STAGES)[number]

export interface Lead {
  id: number
  profile_id: number
  name: string
  company: string | null
  role: string | null
  platform: string | null
  stage: LeadStage
  outreach_message: string | null
  suggested_followup: string | null
  amount_paid: number
  last_contacted_at: string
  created_at: string
  updated_at: string
}

export interface ScheduledPost {
  id: number
  profile_id: number
  platform: string
  topic: string | null
  content: string
  scheduled_for: string | null
  status: "scheduled" | "posted"
  created_at: string
}
