# CareerJob Solution — Handover

**Date:** 2026-08-23  
**Repo:** https://github.com/nepxbett-alt/careerjob-solution  
**Production:** https://careerjobsolution.com.np  
**Supabase ref:** `snaldzftgtfcjbgktbtb`

---

## Overall status

**NOT FULLY HANDOVER-READY until Edge Function is redeployed and verified.**

| Area | Status | Notes |
|------|--------|--------|
| Build | PASS when TS clean | Last known fix: JobsPage `area`/`q` params |
| Typecheck | PASS if `npm run build` succeeds on Vercel | |
| Lint | PARTIAL | oxlint available; not enforced in CI |
| Database | PASS | Real data migrated (candidates/jobs/orgs) |
| RLS | PASS (by design) | `is_staff()` exists in migrations |
| Storage | PASS (by design) | Private candidate buckets |
| Auth | PASS (magic link) | Role from `profiles`; no password flow |
| Public site / jobs | PASS | 217 jobs, categories, homepage |
| Public apply | **FAIL until redeploy** | Live function returns generic 500; repo code is newer |
| Admin create job | PASS (code) | Requires staff session |
| Walk-in | PASS (code) | Admin Walk-in page |
| CV | PARTIAL | Candidate CV builder exists; not fully E2E verified here |
| Business flow | PARTIAL | Hiring requests; limited employer applicant UI |
| Mobile | PASS (UI) | Sticky apply, responsive cards |
| Security (client secrets) | PASS | No service role in frontend source |
| Deployment | PASS | Vercel on `main` |

Legend: **PASS** = verified or strongly evidenced · **PARTIAL** = works in part / not fully E2E tested · **FAIL** = known broken

---

## Architecture summary

### Actors

1. **Visitor** — browse/search jobs, apply without login  
2. **Candidate (account)** — profile, CV, saved jobs, tracked applications  
3. **Business** — hiring requests, org profile  
4. **Staff/Admin** — full recruitment ops (candidates, jobs, applications, interviews, placements, walk-ins)

### Critical path: public apply

```
PublicApplyForm
  → publicApplicationService.submitPublicApplication
  → POST /functions/v1/public-job-application
  → service-role insert candidate_profiles (user_id null, source public_application)
  → insert applications (application_reference, application_source)
  → optional application_status_history + staff notifications
  → returns { success, application_reference }
```

**Manual action required:** Redeploy Edge Function from current repo:

```bash
supabase functions deploy public-job-application --no-verify-jwt
```

Evidence of drift: live error text `"Full name and job are required."` does not match current source (separate validation messages). Live POST with valid body returns `"Something went wrong. Please try again later."` while direct REST inserts with service role succeed.

### Jobs

- Public list: `status = published` AND `approved_by_agency = true`
- Admin can create jobs (draft or publish) via `createAdminJob`
- Business path: hiring request → staff accepts → job draft → publish
- Categories: `job_categories` + `jobs.category_id` (backfilled from titles 2026-08)

### Data baseline (approx., post-migration)

- ~250 candidates  
- ~217 published jobs  
- Historical placements/applications retained  
- Properties/tenants/transactions intentionally not used for recruitment product  

---

## Security model

### Auth

- Magic link OTP (`signInWithOtp`)
- `profiles.role` is source of truth for UI routing
- Frontend `ProtectedRoute` is UX only; **RLS is mandatory**

### RLS highlights

- Public SELECT published jobs  
- Staff `FOR ALL` on jobs / candidates / applications via `is_staff()`  
- Candidates own profile / applications  
- No broad anonymous INSERT on candidate/application tables (apply goes through Edge Function)

### Storage

| Bucket | Public | Purpose |
|--------|--------|---------|
| candidate-documents | No | CVs / docs |
| candidate-photos | No | Photos |
| business-documents | No | Business files |
| job-assets | Yes | Optional job images |
| organization-assets | Yes | Org images |

---

## Environment

See `.env.example`.

**Never** commit service-role keys or put them in `VITE_*`.

---

## What was fixed in recent production passes

- Public apply architecture (Edge Function + migration columns)
- Pokhara job discovery (no false “empty Pokhara” filter)
- Salary display sanitization; bad salary data cleared
- Featured set cleaned; title/location formatting
- Generic “Verified Employer” labels cleared
- Category counts on homepage; category URL filter
- Admin direct job creation
- WhatsApp message builder (EN/NE, per-job)
- UI consistency / empty states / apply success + reference

---

## Remaining issues (real)

### P0

1. **Redeploy `public-job-application`** and confirm E2E apply returns a reference  
2. Confirm Edge secrets: `SUPABASE_SERVICE_ROLE_KEY` present  

### P1

3. Full E2E of candidate account apply vs public apply  
4. Business viewing applicants for *their* jobs only (verify RLS + UI)  
5. CV upload path + storage policy path convention (`{user_id}/...`)  

### P2

6. Enforce oxlint in CI  
7. Admin job **edit** form (create exists; edit is limited)  
8. Clean remaining messy job titles in admin  
9. Email templates beyond Supabase Auth magic link (transactional apply emails not implemented)

### P3

10. Deeper i18n coverage on secondary pages  
11. Analytics events for WhatsApp (optional hook already present)

---

## Required manual actions (owner)

1. Supabase → Edge Functions → deploy `public-job-application` from latest `main` with `--no-verify-jwt`  
2. Verify function secrets  
3. Smoke-test apply on a real published job  
4. Confirm Vercel env has correct `VITE_SUPABASE_*`  
5. Rotate any keys that were shared in chat logs historically  
6. Keep 4–6 high-quality **featured** jobs  

---

## How a new developer starts

1. Read this file + `README.md`  
2. Clone repo, set `.env.local` from `.env.example`  
3. `npm install && npm run dev`  
4. Explore `src/App.tsx` routes, `src/services/*`, `supabase/migrations/*`  
5. Admin: magic-link user whose `profiles.role` is `admin`/`owner`/`staff`  
6. Do **not** reset the database or re-run destructive migrations  

---

## Testing performed in this audit window

| Test | Result |
|------|--------|
| Production homepage HTTP 200 | PASS |
| Production jobs HTTP 200 | PASS |
| REST insert candidate with service role | PASS |
| Live Edge Function apply | **FAIL** (500 / stale deploy) |
| Secret scan of `src/` for service role | PASS (none) |
| Full candidate/business/admin browser E2E | **NOT VERIFIED** (no staff credentials in this session) |
| RLS matrix exhaustive | **NOT VERIFIED** (policies present in SQL; live policy probe limited) |

---

## Final recommendation

Another developer **can maintain the frontend and admin product** from the repo and docs.

**Do not call the public apply path production-ready until the Edge Function is redeployed and one successful anonymous application is observed end-to-end.**

After that single P0 is closed, the platform is suitable for day-to-day agency use (job listing, admin create/publish, walk-in intake, application review).
