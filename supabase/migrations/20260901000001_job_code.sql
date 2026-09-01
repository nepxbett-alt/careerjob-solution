-- Human-friendly job reference: CJS-2026-00001
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS job_code TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_jobs_job_code ON public.jobs(job_code) WHERE job_code IS NOT NULL;

-- Backfill existing jobs that lack a code
DO $$
DECLARE
  r RECORD;
  yr TEXT := to_char(now(), 'YYYY');
  seq INT := 0;
  code TEXT;
BEGIN
  FOR r IN SELECT id FROM public.jobs WHERE job_code IS NULL ORDER BY created_at ASC
  LOOP
    seq := seq + 1;
    code := 'CJS-' || yr || '-' || lpad(seq::text, 5, '0');
    UPDATE public.jobs SET job_code = code WHERE id = r.id;
  END LOOP;
END $$;
