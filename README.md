# CareerJob Solution

Nepal-focused recruitment platform operated by CareerJob agency (Pokhara).

**Not** a freelancer marketplace. Candidates apply → CareerJob reviews → shortlist → interview → placement.  
Businesses request staff → CareerJob recruits.

## Stack

- Frontend: Vite + React 19 + TypeScript + Tailwind 4
- Backend: Supabase (Auth magic-link, PostgreSQL, RLS, Storage)
- Hosting: Vercel

## Quick start

```bash
npm install
cp .env.example .env.local
# set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY
npm run dev
```

## Environment (browser only)

```
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

Never put service-role or secret keys in `VITE_` variables.

## Database

Migrations live in `supabase/migrations/`:

1. `20260818000000_initial_schema.sql` — tables, triggers, seed categories + agency settings  
2. `20260818000001_rls_policies.sql` — RLS  
3. Storage — run the production storage SQL (buckets + policies)

## Roles

| Role | Access |
|------|--------|
| candidate | Own profile, applications, saved jobs |
| business | Own org, hiring requests |
| owner / admin | Full operations |
| recruiter / staff | Candidates, jobs, applications, interviews |
| accountant | Transactions |
| viewer | Read-only |

Roles are enforced with RLS. Never trust client-only role checks.

## Contact (configured)

- WhatsApp / Phone: 9802858215 (also 9802858216, 9802858217)
- Email: Solutioncareerjob32@gmail.com
- Address: Srijana Chowk, Pokhara, Nepal

## Core flows

**Candidate:** Search → View job → Register → Profile + CV → Apply → Track status  

**Business:** Register → Hiring request → CareerJob accepts → Job published → Candidates apply  

**Agency:** Review applications → Shortlist → Interview → Select → Place  

## Scripts

- `npm run dev` — local
- `npm run build` — production build
- `npm run preview` — preview build

## Security

- RLS on all application tables
- Private CV bucket with path `{user_id}/...`
- No service-role key in frontend
- Status changes audited via triggers
