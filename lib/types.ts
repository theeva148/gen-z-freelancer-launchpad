export const SKILL_CATEGORIES: { category: string; skills: string[] }[] = [
  {
    category: "Design",
    skills: [
      "Web Design",
      "UI/UX Design",
      "Graphic Design",
      "Logo & Brand Identity",
      "Illustration",
      "Product Design",
      "Motion Graphics",
      "3D Design & Modeling",
      "Print Design",
      "Packaging Design",
      "Presentation Design",
      "NFT & Digital Art",
    ],
  },
  {
    category: "Development & Tech",
    skills: [
      "Frontend Development",
      "Backend Development",
      "Full-Stack Development",
      "Mobile App Development",
      "WordPress Development",
      "Shopify Development",
      "Game Development",
      "QA & Testing",
      "DevOps & Cloud",
      "Web3 & Blockchain",
      "No-Code Development",
      "AI & Machine Learning",
      "Data Science & Analytics",
      "Cybersecurity",
    ],
  },
  {
    category: "Writing & Translation",
    skills: [
      "Copywriting",
      "Content Writing",
      "Blog & Article Writing",
      "Technical Writing",
      "Ghostwriting",
      "Scriptwriting",
      "Grant Writing",
      "Editing & Proofreading",
      "Resume & Cover Letters",
      "Translation & Localization",
      "UX Writing",
    ],
  },
  {
    category: "Marketing & Sales",
    skills: [
      "Social Media Management",
      "SEO",
      "Email Marketing",
      "Paid Ads & PPC",
      "Content Strategy",
      "Influencer Marketing",
      "Growth Marketing",
      "Affiliate Marketing",
      "Marketing Strategy",
      "Public Relations",
      "Lead Generation",
    ],
  },
  {
    category: "Video & Audio",
    skills: [
      "Video Editing",
      "Videography",
      "Animation",
      "Motion Design",
      "Podcast Production",
      "Audio Editing",
      "Music Production",
      "Sound Design",
      "Voiceover & Narration",
      "DJ & Live Performance",
    ],
  },
  {
    category: "Photography",
    skills: [
      "Portrait Photography",
      "Product Photography",
      "Event Photography",
      "Real Estate Photography",
      "Photo Retouching",
      "Stock Photography",
    ],
  },
  {
    category: "Business & Admin",
    skills: [
      "Virtual Assistance",
      "Project Management",
      "Bookkeeping & Accounting",
      "Data Entry",
      "Customer Support",
      "Business Consulting",
      "Sales & Cold Calling",
      "Recruiting & HR",
      "Financial Modeling",
    ],
  },
  {
    category: "Creative & Other",
    skills: [
      "Music & Songwriting",
      "Fine Art",
      "Fashion Design",
      "Interior Design",
      "Tutoring & Coaching",
      "Voice Acting",
      "Hand Lettering & Calligraphy",
      "Tattoo Design",
      "Architecture & CAD",
      "Event Planning",
      "Other",
    ],
  },
]

export const SKILLS = SKILL_CATEGORIES.flatMap((c) => c.skills)

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
  portfolio_examples: string | null
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
