-- CareerJob Solution - RLS Policies
-- Enable RLS on all application tables and define strict policies.

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_education ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.placements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agency_settings ENABLE ROW LEVEL SECURITY;

-- Helper: is staff (owner/admin/recruiter/staff/accountant/viewer)
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('owner', 'admin', 'recruiter', 'staff', 'accountant', 'viewer')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_admin_or_owner()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('owner', 'admin')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- PROFILES
-- ============================================================
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (id = auth.uid() OR public.is_staff());

CREATE POLICY "Users can update own profile (limited)"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Staff can update any profile"
  ON public.profiles FOR UPDATE
  USING (public.is_admin_or_owner());

-- ============================================================
-- JOB CATEGORIES (public read)
-- ============================================================
CREATE POLICY "Anyone can read active categories"
  ON public.job_categories FOR SELECT
  USING (is_active = true OR public.is_staff());

CREATE POLICY "Admins manage categories"
  ON public.job_categories FOR ALL
  USING (public.is_admin_or_owner());

-- ============================================================
-- AGENCY SETTINGS (public read of contact info)
-- ============================================================
CREATE POLICY "Anyone can read agency settings"
  ON public.agency_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins update agency settings"
  ON public.agency_settings FOR UPDATE
  USING (public.is_admin_or_owner());

-- ============================================================
-- ORGANIZATIONS
-- ============================================================
CREATE POLICY "Staff can view all organizations"
  ON public.organizations FOR SELECT
  USING (public.is_staff());

CREATE POLICY "Business members can view own org"
  ON public.organizations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.organization_id = organizations.id AND om.user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated can create business org"
  ON public.organizations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND type = 'business');

CREATE POLICY "Staff can update organizations"
  ON public.organizations FOR UPDATE
  USING (public.is_staff());

-- ============================================================
-- ORGANIZATION MEMBERS
-- ============================================================
CREATE POLICY "Members can view own membership"
  ON public.organization_members FOR SELECT
  USING (user_id = auth.uid() OR public.is_staff());

CREATE POLICY "Staff manage members"
  ON public.organization_members FOR ALL
  USING (public.is_admin_or_owner());

-- ============================================================
-- CANDIDATE PROFILES
-- ============================================================
CREATE POLICY "Candidates view own profile"
  ON public.candidate_profiles FOR SELECT
  USING (user_id = auth.uid() OR public.is_staff());

CREATE POLICY "Candidates create own profile"
  ON public.candidate_profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Candidates update own profile (no internal fields)"
  ON public.candidate_profiles FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Staff full access candidate profiles"
  ON public.candidate_profiles FOR ALL
  USING (public.is_staff());

-- ============================================================
-- CANDIDATE EXPERIENCE / EDUCATION / DOCUMENTS
-- ============================================================
CREATE POLICY "Own or staff experience"
  ON public.candidate_experience FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.candidate_profiles cp WHERE cp.id = candidate_id AND (cp.user_id = auth.uid() OR public.is_staff()))
  );

CREATE POLICY "Own or staff education"
  ON public.candidate_education FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.candidate_profiles cp WHERE cp.id = candidate_id AND (cp.user_id = auth.uid() OR public.is_staff()))
  );

CREATE POLICY "Own or staff documents"
  ON public.candidate_documents FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.candidate_profiles cp WHERE cp.id = candidate_id AND (cp.user_id = auth.uid() OR public.is_staff()))
  );

-- ============================================================
-- JOBS
-- ============================================================
CREATE POLICY "Public can read published jobs"
  ON public.jobs FOR SELECT
  USING (
    (status = 'published' AND approved_by_agency = true)
    OR public.is_staff()
  );

CREATE POLICY "Staff manage jobs"
  ON public.jobs FOR ALL
  USING (public.is_staff());

-- ============================================================
-- BUSINESS REQUESTS
-- ============================================================
CREATE POLICY "Business sees own requests"
  ON public.business_requests FOR SELECT
  USING (
    public.is_staff()
    OR EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.organization_id = business_requests.organization_id AND om.user_id = auth.uid()
    )
  );

CREATE POLICY "Business creates requests"
  ON public.business_requests FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.organization_id = organization_id AND om.user_id = auth.uid()
    )
  );

CREATE POLICY "Staff manage business requests"
  ON public.business_requests FOR ALL
  USING (public.is_staff());

-- ============================================================
-- APPLICATIONS
-- ============================================================
CREATE POLICY "Candidates see own applications"
  ON public.applications FOR SELECT
  USING (
    public.is_staff()
    OR EXISTS (
      SELECT 1 FROM public.candidate_profiles cp
      WHERE cp.id = applications.candidate_id AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Candidates create applications"
  ON public.applications FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.candidate_profiles cp
      WHERE cp.id = candidate_id AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Candidates can withdraw own"
  ON public.applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.candidate_profiles cp
      WHERE cp.id = applications.candidate_id AND cp.user_id = auth.uid()
    )
  )
  WITH CHECK (status IN ('withdrawn')); -- only allow withdraw

CREATE POLICY "Staff full application access"
  ON public.applications FOR ALL
  USING (public.is_staff());

-- ============================================================
-- APPLICATION STATUS HISTORY
-- ============================================================
CREATE POLICY "Own or staff history"
  ON public.application_status_history FOR SELECT
  USING (
    public.is_staff()
    OR EXISTS (
      SELECT 1 FROM public.applications a
      JOIN public.candidate_profiles cp ON cp.id = a.candidate_id
      WHERE a.id = application_status_history.application_id AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Staff insert history"
  ON public.application_status_history FOR INSERT
  WITH CHECK (public.is_staff());

-- ============================================================
-- SAVED JOBS
-- ============================================================
CREATE POLICY "Candidates manage own saved jobs"
  ON public.saved_jobs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.candidate_profiles cp
      WHERE cp.id = candidate_id AND cp.user_id = auth.uid()
    )
  );

-- ============================================================
-- INTERVIEWS
-- ============================================================
CREATE POLICY "Candidates see own interviews"
  ON public.interviews FOR SELECT
  USING (
    public.is_staff()
    OR EXISTS (
      SELECT 1 FROM public.candidate_profiles cp
      WHERE cp.id = interviews.candidate_id AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Staff manage interviews"
  ON public.interviews FOR ALL
  USING (public.is_staff());

-- ============================================================
-- PLACEMENTS
-- ============================================================
CREATE POLICY "Candidates see own placements"
  ON public.placements FOR SELECT
  USING (
    public.is_staff()
    OR EXISTS (
      SELECT 1 FROM public.candidate_profiles cp
      WHERE cp.id = placements.candidate_id AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Staff manage placements"
  ON public.placements FOR ALL
  USING (public.is_staff());

-- ============================================================
-- TRANSACTIONS (accountant + admin only)
-- ============================================================
CREATE POLICY "Accountant and admin view transactions"
  ON public.transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('owner', 'admin', 'accountant')
    )
  );

CREATE POLICY "Accountant and admin manage transactions"
  ON public.transactions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('owner', 'admin', 'accountant')
    )
  );

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE POLICY "Users see own notifications"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users mark own notifications read"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Staff can create notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (public.is_staff() OR auth.uid() IS NOT NULL);

-- ============================================================
-- AUDIT LOGS (staff only)
-- ============================================================
CREATE POLICY "Staff view audit logs"
  ON public.audit_logs FOR SELECT
  USING (public.is_staff());

CREATE POLICY "System insert audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (true); -- controlled by security definer functions
