# MuleQuest

Gamified MuleSoft learning platform — zero to MCIA-certified. 13 chapters, cert-gate trials (MCD L1 / L2 / MCIA), AI adaptive engine powered by Claude, boss fights, dungeons, and an unlockable inventory of production-grade reusable assets.

## Stack

React (Vite) + Tailwind + Framer Motion + Lucide + Recharts · Vercel Serverless Functions · Supabase (Postgres + Auth) · Claude API (`claude-sonnet-4-20250514`)

## Setup

1. **Supabase**: create a project, run `supabase/schema.sql` in the SQL editor. Enable Email and Google providers under Authentication → Providers.
2. **Env**: copy `.env.example` → `.env`, fill in values. `SUPABASE_SERVICE_ROLE_KEY` and `ANTHROPIC_API_KEY` are serverless-only — never prefix with `VITE_`.
3. **Local dev**:
   ```bash
   npm install
   npm run dev          # frontend on :5173
   vercel dev           # optional: serverless functions on :3000 (proxied via vite)
   ```
4. **Deploy**: push to GitHub, import in Vercel, set all four env vars in Project Settings → Environment Variables.

## Architecture notes

- Knowledge base (all 13 chapters, boss fights, cert trial banks, inventory items, dungeons) ships as static JSON under `src/data/` — versioned in git, zero-latency reads.
- All user state (XP, streak, progress, performance, diagnoses, inventory unlocks, trial attempts) persists in Supabase with RLS.
- The Claude API is only ever called from `api/ai/diagnose.js` (Vercel function). The frontend sends performance context; the function returns a diagnosis, weak tags, difficulty flag, and injectable micro quests.
- Cert gates: Ch 1–5 → MCD L1 trial → Ch 6–9 → MCD L2 trial → Ch 10–12 → MCIA trial → Ch 13 (Prestige).

## XP rules

Lab 50 · Quiz 30 · Side quest 100–200 · Boss fight 500 · Cert trial 1000 · streak multiplier ramps to 2× at a 14-day streak.
