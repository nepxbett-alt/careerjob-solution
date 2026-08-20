-- Walk-in candidates: allow profile without auth user
ALTER TABLE public.candidate_profiles
  ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE public.candidate_profiles
  ADD COLUMN IF NOT EXISTS registration_source TEXT DEFAULT 'online'
    CHECK (registration_source IN ('online', 'walk_in', 'referral', 'other'));

ALTER TABLE public.candidate_profiles
  ADD COLUMN IF NOT EXISTS registered_by UUID REFERENCES public.profiles(id);

-- Reject reason on applications
ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS reject_reason TEXT;

CREATE INDEX IF NOT EXISTS idx_candidates_source ON public.candidate_profiles(registration_source);
