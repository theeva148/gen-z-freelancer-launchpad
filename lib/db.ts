import { Pool, type ClientBase } from "pg"
import { Signer } from "@aws-sdk/rds-signer"
import { awsCredentialsProvider } from "@vercel/functions/oidc"
import { attachDatabasePool } from "@vercel/functions"

const signer = new Signer({
  credentials: awsCredentialsProvider({
    roleArn: process.env.AWS_ROLE_ARN,
    clientConfig: { region: process.env.AWS_REGION },
  }),
  region: process.env.AWS_REGION,
  hostname: process.env.PGHOST,
  username: process.env.PGUSER || "postgres",
  port: 5432,
})

const pool = new Pool({
  host: process.env.PGHOST,
  database: process.env.PGDATABASE || "postgres",
  port: 5432,
  user: process.env.PGUSER || "postgres",
  password: () => signer.getAuthToken(),
  ssl: { rejectUnauthorized: false },
  max: 20,
})
attachDatabasePool(pool)

export async function query(text: string, params?: unknown[]) {
  await ensureSchema()
  return pool.query(text, params)
}

export async function withConnection<T>(fn: (client: ClientBase) => Promise<T>): Promise<T> {
  await ensureSchema()
  const client = await pool.connect()
  try {
    return await fn(client)
  } finally {
    client.release()
  }
}

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS profiles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  skills TEXT[] NOT NULL DEFAULT '{}',
  experience VARCHAR(20) NOT NULL CHECK (experience IN ('beginner', 'intermediate', 'advanced')),
  portfolio VARCHAR(20) NOT NULL CHECK (portfolio IN ('yes_link', 'yes_no_link', 'not_yet')),
  prior_clients VARCHAR(20) NOT NULL CHECK (prior_clients IN ('never', '1-3', 'more_than_3')),
  income_goal INT NOT NULL DEFAULT 0,
  cold_outreach VARCHAR(10) NOT NULL CHECK (cold_outreach IN ('yes', 'no', 'kinda')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  profile_id INT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR(160) NOT NULL,
  company VARCHAR(160),
  role VARCHAR(160),
  platform VARCHAR(60),
  stage VARCHAR(20) NOT NULL DEFAULT 'Contacted'
    CHECK (stage IN ('Contacted', 'Replied', 'Proposal Sent', 'Negotiating', 'Closed', 'Paid')),
  outreach_message TEXT,
  suggested_followup TEXT,
  amount_paid NUMERIC(10, 2) NOT NULL DEFAULT 0,
  last_contacted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_leads_profile_id ON leads(profile_id);
CREATE INDEX IF NOT EXISTS idx_leads_stage ON leads(profile_id, stage);
CREATE TABLE IF NOT EXISTS scheduled_posts (
  id SERIAL PRIMARY KEY,
  profile_id INT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  platform VARCHAR(20) NOT NULL CHECK (platform IN ('LinkedIn', 'Twitter', 'TikTok')),
  content TEXT NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'posted')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_posts_profile_id ON scheduled_posts(profile_id);
CREATE INDEX IF NOT EXISTS idx_posts_scheduled_for ON scheduled_posts(profile_id, scheduled_for);
`

let schemaReady: Promise<void> | null = null
function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = pool.query(SCHEMA_SQL).then(() => undefined).catch((err) => {
      schemaReady = null
      throw err
    })
  }
  return schemaReady
}
