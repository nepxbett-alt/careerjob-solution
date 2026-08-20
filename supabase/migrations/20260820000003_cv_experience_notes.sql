-- Store free-text work experience for built CVs
ALTER TABLE public.candidate_profiles
  ADD COLUMN IF NOT EXISTS experience_notes TEXT;

ALTER TABLE public.candidate_profiles
  ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT '{}';
