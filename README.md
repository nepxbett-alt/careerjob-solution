# CareerJob Solution

Nepal-focused **recruitment / placement agency** platform operated from Pokhara (Srijana Chowk).

This is **not** a pure job board. Flow:

- **Visitors** browse jobs and apply **without an account**
- **CareerJob staff** review applications, match candidates, coordinate interviews
- **Businesses** submit hiring requests; staff publish roles and manage placements

## Stack

| Layer | Technology |
|--------|------------|
| Frontend | Vite 8, React 19, TypeScript, Tailwind CSS 4, React Router 7 |
| Backend | Supabase (Auth, PostgreSQL, RLS, Storage, Edge Functions) |
| Hosting | Vercel (`careerjobsolution.com.np`) |
| i18n | EN \| नेपाली (client `LanguageProvider`) |

## Architecture (high level)

```
Visitor ──browse/apply──► Public UI ──► Edge Function (service role)
                                      └──► candidate_profiles + applications
Business ──hiring request──► Authenticated UI ──► RLS ──► business_requests
Staff/Admin ──manage all──► Admin UI ──► RLS (is_staff) ──► full tables
```

**Authorization is enforced in Postgres RLS**, not only in the React UI.

## Local setup

```bash
git clone https://github.com/nepxbett-alt/careerjob-solution.git
cd careerjob-solution
npm install
cp .env.example .env.local
# Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY
npm run dev
```

### Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local dev server |
| `npm run build` | `tsc -b && vite build` |
| `npm run typecheck` | TypeScript only |
| `npm run lint` | oxlint |
| `npm run preview` | Preview production build |

## Environment variables

### Browser (Vercel / `.env.local`)

| Name | Required | Notes |
|------|----------|--------|
| `VITE_SUPABASE_URL` | Yes | Project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Yes | Anon / publishable key only |

### Edge Function secrets (Supabase Dashboard)

| Name | Required | Notes |
|------|----------|--------|
| `SUPABASE_URL` | Yes | Usually auto-injected |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | **Never** expose to the browser |

## Roles

| Role | Access |
|------|--------|
| Anonymous | Public jobs, public apply (Edge Function) |
| `candidate` | Own profile, applications, saved jobs, CV |
| `business` | Own org, hiring requests |
| `staff` / `recruiter` / `admin` / `owner` | Admin panel (candidates, jobs, applications, walk-ins, …) |
| `accountant` | Accounting views |
| `viewer` | Read-oriented staff |

## Important features

- **Public apply** — `supabase/functions/public-job-application` (must be deployed with service role)
- **Admin create job** — Admin → Jobs → Create job
- **Walk-in candidates** — Admin → Walk-in
- **Featured jobs** — Admin → Jobs → Feature
- **WhatsApp** — centralized `src/lib/whatsapp.ts` + `CONTACT.whatsapp`

## Database migrations

SQL lives in `supabase/migrations/`. Apply via Supabase CLI or SQL editor **in order**. Do not reset production data.

## Deploy

1. Push to `main` → Vercel builds (`npm run build`)
2. Edge Functions (when code changes):

```bash
supabase login
supabase link --project-ref snaldzftgtfcjbgktbtb
supabase functions deploy public-job-application --no-verify-jwt
```

Confirm function secrets include the service role key.

## Security rules of thumb

- No `VITE_*` service-role keys
- No anonymous INSERT into `candidate_profiles` / `applications` from the client
- Public job API must not expose private employer phones/emails
- Storage: candidate docs/photos are private buckets

## License / ownership

Private product for CareerJob Solution (Pokhara).
