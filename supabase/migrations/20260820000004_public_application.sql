-- Public anonymous application support
-- Safe additive migration — does not destroy data

-- Extend registration_source to include public_application
ALTER TABLE public.candidate_profiles
  DROP CONSTRAINT IF EXISTS candidate_profiles_registration_source_check;

ALTER TABLE public.candidate_profiles
  ADD CONSTRAINT candidate_profiles_registration_source_check
  CHECK (registration_source IN ('online', 'walk_in', 'referral', 'other', 'public_application', 'manual', 'account'));

-- Human-friendly application reference for public applicants
ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS application_reference TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_applications_reference
  ON public.applications (application_reference)
  WHERE application_reference IS NOT NULL;

-- Optional source on applications for clarity
ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS application_source TEXT DEFAULT 'account'
  CHECK (application_source IN ('account', 'public_application', 'walk_in', 'manual', 'admin'));

COMMENT ON COLUMN public.applications.application_reference IS 'Public-facing reference e.g. CJ-2026-XXXXX returned to anonymous applicants';
COMMENT ON COLUMN public.applications.application_source IS 'How the application was created';
