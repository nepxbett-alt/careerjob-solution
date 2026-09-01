-- Fix candidate_profiles RLS so staff can create walk-in / Create CV records
-- and public can submit job-seeker requests without an account.

-- Staff INSERT requires WITH CHECK (USING alone is not enough for INSERT)
DROP POLICY IF EXISTS "Staff full access candidate profiles" ON public.candidate_profiles;
CREATE POLICY "Staff full access candidate profiles"
  ON public.candidate_profiles
  FOR ALL
  TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

-- Explicit staff insert (belt and suspenders)
DROP POLICY IF EXISTS "Staff insert candidate profiles" ON public.candidate_profiles;
CREATE POLICY "Staff insert candidate profiles"
  ON public.candidate_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_staff());

-- Explicit staff update
DROP POLICY IF EXISTS "Staff update candidate profiles" ON public.candidate_profiles;
CREATE POLICY "Staff update candidate profiles"
  ON public.candidate_profiles
  FOR UPDATE
  TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

-- Public / walk-in forms: allow insert when no user_id (admin or anon request)
DROP POLICY IF EXISTS "Public insert candidate requests" ON public.candidate_profiles;
CREATE POLICY "Public insert candidate requests"
  ON public.candidate_profiles
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

-- Keep own-profile create for logged-in candidates
DROP POLICY IF EXISTS "Candidates create own profile" ON public.candidate_profiles;
CREATE POLICY "Candidates create own profile"
  ON public.candidate_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());
