-- Admin-led recruitment ops: statuses, workplace send, trial, reminders
-- Additive / idempotent — does not delete existing data

-- Candidate operational status (admin workflow)
ALTER TABLE public.candidate_profiles
  ADD COLUMN IF NOT EXISTS ops_status TEXT DEFAULT 'new_request';

ALTER TABLE public.candidate_profiles
  ADD COLUMN IF NOT EXISTS last_contacted_at TIMESTAMPTZ;

ALTER TABLE public.candidate_profiles
  ADD COLUMN IF NOT EXISTS next_action TEXT;

ALTER TABLE public.candidate_profiles
  ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Business request operational status
ALTER TABLE public.business_requests
  ADD COLUMN IF NOT EXISTS ops_status TEXT DEFAULT 'new_request';

ALTER TABLE public.business_requests
  ADD COLUMN IF NOT EXISTS last_contacted_at TIMESTAMPTZ;

ALTER TABLE public.business_requests
  ADD COLUMN IF NOT EXISTS next_action TEXT;

ALTER TABLE public.business_requests
  ADD COLUMN IF NOT EXISTS admin_notes TEXT;

ALTER TABLE public.business_requests
  ADD COLUMN IF NOT EXISTS accommodation BOOLEAN;

ALTER TABLE public.business_requests
  ADD COLUMN IF NOT EXISTS meals BOOLEAN;

ALTER TABLE public.business_requests
  ADD COLUMN IF NOT EXISTS working_hours TEXT;

ALTER TABLE public.business_requests
  ADD COLUMN IF NOT EXISTS urgency TEXT;

ALTER TABLE public.business_requests
  ADD COLUMN IF NOT EXISTS business_name TEXT;

-- Workplace assignment (send candidate to workplace)
CREATE TABLE IF NOT EXISTS public.workplace_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id),
  business_request_id UUID REFERENCES public.business_requests(id),
  job_id UUID REFERENCES public.jobs(id),
  workplace_name TEXT NOT NULL,
  position_title TEXT NOT NULL,
  salary_amount INT,
  sent_at DATE NOT NULL DEFAULT CURRENT_DATE,
  follow_up_date DATE,
  follow_up_done BOOLEAN DEFAULT false,
  workplace_result TEXT, -- placed | trial | not_selected | pending
  trial_start DATE,
  trial_days INT,
  trial_end DATE,
  trial_result TEXT, -- placed | not_selected
  status TEXT NOT NULL DEFAULT 'sent', -- sent | trial | placed | returned
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wa_candidate ON public.workplace_assignments(candidate_id);
CREATE INDEX IF NOT EXISTS idx_wa_follow_up ON public.workplace_assignments(follow_up_date) WHERE follow_up_done = false;
CREATE INDEX IF NOT EXISTS idx_wa_trial_end ON public.workplace_assignments(trial_end) WHERE status = 'trial';

-- Simple reminders for admin Today list
CREATE TABLE IF NOT EXISTS public.admin_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT,
  due_date DATE NOT NULL,
  reminder_type TEXT NOT NULL DEFAULT 'follow_up', -- contact | follow_up | trial_end | manual
  candidate_id UUID REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
  business_request_id UUID REFERENCES public.business_requests(id) ON DELETE CASCADE,
  workplace_assignment_id UUID REFERENCES public.workplace_assignments(id) ON DELETE CASCADE,
  is_done BOOLEAN DEFAULT false,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reminders_due ON public.admin_reminders(due_date) WHERE is_done = false;

-- Activity log (simple timeline)
CREATE TABLE IF NOT EXISTS public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL, -- candidate | business_request | workplace
  entity_id UUID NOT NULL,
  action TEXT NOT NULL,
  notes TEXT,
  actor_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_entity ON public.activity_log(entity_type, entity_id, created_at DESC);

-- RLS: staff only for ops tables
ALTER TABLE public.workplace_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff manage workplace_assignments" ON public.workplace_assignments;
CREATE POLICY "Staff manage workplace_assignments"
  ON public.workplace_assignments FOR ALL TO authenticated
  USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "Staff manage reminders" ON public.admin_reminders;
CREATE POLICY "Staff manage reminders"
  ON public.admin_reminders FOR ALL TO authenticated
  USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "Staff manage activity_log" ON public.activity_log;
CREATE POLICY "Staff manage activity_log"
  ON public.activity_log FOR ALL TO authenticated
  USING (public.is_staff()) WITH CHECK (public.is_staff());

-- Allow anonymous insert on business_requests for public hire form (if not already)
-- Staff read all; public insert limited fields via existing policies — staff must manage

-- Public can submit hire requests (anon)
DROP POLICY IF EXISTS "Public insert business_requests" ON public.business_requests;
CREATE POLICY "Public insert business_requests"
  ON public.business_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Public can submit job-seeker profiles without auth (walk-in style online)
DROP POLICY IF EXISTS "Public insert candidate requests" ON public.candidate_profiles;
CREATE POLICY "Public insert candidate requests"
  ON public.candidate_profiles FOR INSERT
  TO anon, authenticated
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());
