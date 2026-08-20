-- ============================================================
-- SIMPLE RECRUITMENT PIPELINE (V1)
-- Hire tracking + 30-day commission on placements
-- Safe additive migration — does not destroy data
-- ============================================================

-- Candidate availability for pipeline
ALTER TABLE public.candidate_profiles
  ADD COLUMN IF NOT EXISTS seeker_status TEXT DEFAULT 'active'
    CHECK (seeker_status IN ('active', 'passive', 'employed', 'inactive'));

ALTER TABLE public.candidate_profiles
  ADD COLUMN IF NOT EXISTS desired_position TEXT;

ALTER TABLE public.candidate_profiles
  ADD COLUMN IF NOT EXISTS expected_salary INT;

ALTER TABLE public.candidate_profiles
  ADD COLUMN IF NOT EXISTS availability TEXT;

-- Placement / hire enrichment
ALTER TABLE public.placements
  ADD COLUMN IF NOT EXISTS position_title TEXT;

ALTER TABLE public.placements
  ADD COLUMN IF NOT EXISTS salary_amount INT;

ALTER TABLE public.placements
  ADD COLUMN IF NOT EXISTS commission_rate NUMERIC(5,2) DEFAULT 30.00;

ALTER TABLE public.placements
  ADD COLUMN IF NOT EXISTS commission_amount INT;

ALTER TABLE public.placements
  ADD COLUMN IF NOT EXISTS day30_date DATE;

ALTER TABLE public.placements
  ADD COLUMN IF NOT EXISTS day30_status TEXT DEFAULT 'pending'
    CHECK (day30_status IN ('pending', 'approaching', 'completed', 'disputed', 'waived'));

ALTER TABLE public.placements
  ADD COLUMN IF NOT EXISTS commission_status TEXT DEFAULT 'pending'
    CHECK (commission_status IN ('pending', 'invoiced', 'paid', 'waived'));

-- Expand placement status for simple pipeline
-- (existing check may block new values — drop and recreate if needed)
DO $$
BEGIN
  ALTER TABLE public.placements DROP CONSTRAINT IF EXISTS placements_status_check;
  ALTER TABLE public.placements
    ADD CONSTRAINT placements_status_check
    CHECK (status IN (
      'document_check', 'joining_confirmed', 'placed', 'hired',
      'day30_completed', 'cancelled', 'left'
    ));
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- Auto-set day30_date from joining_date
CREATE OR REPLACE FUNCTION public.set_placement_day30()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.joining_date IS NOT NULL THEN
    NEW.day30_date := NEW.joining_date + 30;
  END IF;
  IF NEW.salary_amount IS NOT NULL AND NEW.commission_rate IS NOT NULL THEN
    NEW.commission_amount := ROUND(NEW.salary_amount * NEW.commission_rate / 100.0);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_placement_day30 ON public.placements;
CREATE TRIGGER trg_placement_day30
  BEFORE INSERT OR UPDATE OF joining_date, salary_amount, commission_rate
  ON public.placements
  FOR EACH ROW
  EXECUTE FUNCTION public.set_placement_day30();

CREATE INDEX IF NOT EXISTS idx_placements_day30 ON public.placements(day30_date)
  WHERE day30_status = 'pending';

CREATE INDEX IF NOT EXISTS idx_placements_commission ON public.placements(commission_status);

CREATE INDEX IF NOT EXISTS idx_candidate_seeker ON public.candidate_profiles(seeker_status);
