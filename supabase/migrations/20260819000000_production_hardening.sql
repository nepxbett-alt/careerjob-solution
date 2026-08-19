-- ============================================================
-- PRODUCTION HARDENING
-- Notifications RLS, application history trigger, helpers
-- ============================================================

-- 1. Fix notifications INSERT: only staff (not any authenticated user)
DROP POLICY IF EXISTS "Staff can create notifications" ON public.notifications;

CREATE POLICY "Staff can create notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (public.is_staff());

-- 2. Tighten audit log inserts (staff only; use SECURITY DEFINER for system writes)
DROP POLICY IF EXISTS "System insert audit logs" ON public.audit_logs;

CREATE POLICY "Staff insert audit logs"
  ON public.audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (public.is_staff());

-- 3. Always record application status history on status change
CREATE OR REPLACE FUNCTION public.log_application_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.application_status_history (
      application_id,
      from_status,
      to_status,
      changed_by,
      notes
    ) VALUES (
      NEW.id,
      OLD.status,
      NEW.status,
      auth.uid(),
      NULL
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_application_status_history ON public.applications;
CREATE TRIGGER trg_application_status_history
  AFTER UPDATE OF status ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.log_application_status_change();

-- 4. Ensure UNIQUE(job_id, candidate_id) exists (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'applications_job_id_candidate_id_key'
  ) THEN
    ALTER TABLE public.applications
      ADD CONSTRAINT applications_job_id_candidate_id_key UNIQUE (job_id, candidate_id);
  END IF;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

-- 5. Optional: SECURITY DEFINER helper for system notifications (callable by staff triggers later)
CREATE OR REPLACE FUNCTION public.create_notification_safe(
  p_user_id UUID,
  p_title TEXT,
  p_body TEXT DEFAULT NULL,
  p_type TEXT DEFAULT 'info',
  p_entity_type TEXT DEFAULT NULL,
  p_entity_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  nid UUID;
BEGIN
  -- Only staff or the same user context via trusted callers should invoke this
  IF NOT public.is_staff() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;
  INSERT INTO public.notifications (user_id, title, body, type, entity_type, entity_id)
  VALUES (p_user_id, p_title, p_body, p_type, p_entity_type, p_entity_id)
  RETURNING id INTO nid;
  RETURN nid;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_notification_safe TO authenticated;
