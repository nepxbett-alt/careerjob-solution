-- Featured jobs performance (is_featured already on jobs table)
CREATE INDEX IF NOT EXISTS idx_jobs_featured
  ON public.jobs (is_featured, published_at DESC)
  WHERE status = 'published' AND approved_by_agency = true AND is_featured = true;
