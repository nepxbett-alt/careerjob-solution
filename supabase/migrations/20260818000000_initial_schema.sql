-- CareerJob Solution - Initial Schema
-- Nepal-focused recruitment platform
-- All tables use UUID primary keys, created_at / updated_at, and proper constraints.

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'candidate'
    CHECK (role IN ('candidate', 'business', 'owner', 'admin', 'recruiter', 'staff', 'accountant', 'viewer')),
  full_name TEXT,
  phone TEXT,
  email TEXT,
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_phone ON public.profiles(phone);

-- ============================================================
-- ORGANIZATIONS (for businesses and agency)
-- ============================================================
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'business'
    CHECK (type IN ('agency', 'business')),
  business_type TEXT,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  location TEXT,
  address TEXT,
  description TEXT,
  registration_info TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'verified', 'rejected', 'suspended')),
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES public.profiles(id),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_organizations_type ON public.organizations(type);
CREATE INDEX idx_organizations_status ON public.organizations(status);
CREATE INDEX idx_organizations_location ON public.organizations(location);

-- ============================================================
-- ORGANIZATION MEMBERS
-- ============================================================
CREATE TABLE public.organization_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member'
    CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

CREATE INDEX idx_org_members_user ON public.organization_members(user_id);
CREATE INDEX idx_org_members_org ON public.organization_members(organization_id);

-- ============================================================
-- JOB CATEGORIES
-- ============================================================
CREATE TABLE public.job_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed categories
INSERT INTO public.job_categories (name, slug, sort_order) VALUES
  ('Hospitality', 'hospitality', 1),
  ('Hotel & Restaurant', 'hotel-restaurant', 2),
  ('Sales', 'sales', 3),
  ('Marketing', 'marketing', 4),
  ('Office & Administration', 'office-administration', 5),
  ('IT & Technology', 'it-technology', 6),
  ('Driving', 'driving', 7),
  ('Construction', 'construction', 8),
  ('Security', 'security', 9),
  ('Healthcare', 'healthcare', 10),
  ('Education', 'education', 11),
  ('Retail', 'retail', 12),
  ('Manufacturing', 'manufacturing', 13),
  ('Customer Service', 'customer-service', 14),
  ('Cleaning', 'cleaning', 15),
  ('Other', 'other', 99);

-- ============================================================
-- CANDIDATE PROFILES
-- ============================================================
CREATE TABLE public.candidate_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  location TEXT,
  headline TEXT,
  bio TEXT,
  experience_years NUMERIC(4,1) DEFAULT 0,
  education TEXT,
  skills TEXT[] DEFAULT '{}',
  languages TEXT[] DEFAULT '{}',
  photo_url TEXT,
  cv_url TEXT,
  profile_completion INT NOT NULL DEFAULT 0 CHECK (profile_completion >= 0 AND profile_completion <= 100),
  is_verified BOOLEAN NOT NULL DEFAULT false,
  phone_verified BOOLEAN NOT NULL DEFAULT false,
  documents_checked BOOLEAN NOT NULL DEFAULT false,
  internal_notes TEXT, -- never visible to candidate
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_candidate_profiles_user ON public.candidate_profiles(user_id);
CREATE INDEX idx_candidate_profiles_location ON public.candidate_profiles(location);
CREATE INDEX idx_candidate_profiles_skills ON public.candidate_profiles USING GIN(skills);

-- ============================================================
-- CANDIDATE EXPERIENCE
-- ============================================================
CREATE TABLE public.candidate_experience (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID NOT NULL REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  position TEXT NOT NULL,
  location TEXT,
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN DEFAULT false,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_candidate_exp_candidate ON public.candidate_experience(candidate_id);

-- ============================================================
-- CANDIDATE EDUCATION
-- ============================================================
CREATE TABLE public.candidate_education (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID NOT NULL REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
  institution TEXT NOT NULL,
  degree TEXT,
  field_of_study TEXT,
  start_year INT,
  end_year INT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_candidate_edu_candidate ON public.candidate_education(candidate_id);

-- ============================================================
-- CANDIDATE DOCUMENTS
-- ============================================================
CREATE TABLE public.candidate_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID NOT NULL REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INT,
  document_type TEXT DEFAULT 'cv' CHECK (document_type IN ('cv', 'certificate', 'id', 'other')),
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_candidate_docs_candidate ON public.candidate_documents(candidate_id);

-- ============================================================
-- JOBS
-- ============================================================
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES public.organizations(id),
  category_id UUID REFERENCES public.job_categories(id),
  title TEXT NOT NULL,
  slug TEXT,
  location TEXT NOT NULL,
  location_detail TEXT, -- e.g. "Lakeside" (public)
  salary_min INT,
  salary_max INT,
  salary_currency TEXT DEFAULT 'NPR',
  salary_display TEXT, -- e.g. "Rs. 20,000–25,000"
  job_type TEXT NOT NULL DEFAULT 'full-time'
    CHECK (job_type IN ('full-time', 'part-time', 'contract', 'temporary', 'internship')),
  experience_required TEXT, -- e.g. "1+ year"
  education_required TEXT,
  description TEXT,
  responsibilities TEXT,
  requirements TEXT,
  skills TEXT[] DEFAULT '{}',
  benefits TEXT,
  application_deadline DATE,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'pending_review', 'published', 'paused', 'filled', 'closed', 'archived')),
  approved_by_agency BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  employer_name_private BOOLEAN DEFAULT true, -- hide exact employer by default
  public_employer_label TEXT, -- e.g. "Reputed Hotel in Pokhara"
  view_count INT DEFAULT 0,
  application_count INT DEFAULT 0,
  created_by UUID REFERENCES public.profiles(id),
  published_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_jobs_status ON public.jobs(status);
CREATE INDEX idx_jobs_category ON public.jobs(category_id);
CREATE INDEX idx_jobs_location ON public.jobs(location);
CREATE INDEX idx_jobs_created_at ON public.jobs(created_at DESC);
CREATE INDEX idx_jobs_published ON public.jobs(status, approved_by_agency, published_at DESC)
  WHERE status = 'published' AND approved_by_agency = true;
CREATE INDEX idx_jobs_title_trgm ON public.jobs USING gin (title gin_trgm_ops); -- needs pg_trgm

-- ============================================================
-- BUSINESS REQUESTS (Hiring Requests)
-- ============================================================
CREATE TABLE public.business_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  position_title TEXT NOT NULL,
  number_required INT NOT NULL DEFAULT 1 CHECK (number_required > 0),
  category_id UUID REFERENCES public.job_categories(id),
  location TEXT NOT NULL,
  salary_min INT,
  salary_max INT,
  job_type TEXT DEFAULT 'full-time',
  experience_required TEXT,
  education_required TEXT,
  skills TEXT[] DEFAULT '{}',
  responsibilities TEXT,
  benefits TEXT,
  preferred_joining_date DATE,
  additional_requirements TEXT,
  contact_person TEXT,
  contact_phone TEXT,
  status TEXT NOT NULL DEFAULT 'submitted'
    CHECK (status IN ('submitted', 'under_review', 'accepted', 'recruiting', 'shortlisted', 'interview', 'filled', 'closed', 'rejected')),
  admin_notes TEXT,
  linked_job_id UUID REFERENCES public.jobs(id),
  created_by UUID REFERENCES public.profiles(id),
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_business_requests_org ON public.business_requests(organization_id);
CREATE INDEX idx_business_requests_status ON public.business_requests(status);
CREATE INDEX idx_business_requests_created ON public.business_requests(created_at DESC);

-- ============================================================
-- APPLICATIONS
-- ============================================================
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'applied'
    CHECK (status IN ('applied', 'under_review', 'shortlisted', 'interview', 'selected', 'placed', 'rejected', 'withdrawn', 'closed')),
  cover_message TEXT,
  cv_document_id UUID REFERENCES public.candidate_documents(id),
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(job_id, candidate_id)
);

CREATE INDEX idx_applications_job ON public.applications(job_id);
CREATE INDEX idx_applications_candidate ON public.applications(candidate_id);
CREATE INDEX idx_applications_status ON public.applications(status);
CREATE INDEX idx_applications_applied_at ON public.applications(applied_at DESC);

-- ============================================================
-- APPLICATION STATUS HISTORY
-- ============================================================
CREATE TABLE public.application_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status TEXT NOT NULL,
  changed_by UUID REFERENCES public.profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_app_history_application ON public.application_status_history(application_id);

-- ============================================================
-- SAVED JOBS
-- ============================================================
CREATE TABLE public.saved_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID NOT NULL REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(candidate_id, job_id)
);

CREATE INDEX idx_saved_jobs_candidate ON public.saved_jobs(candidate_id);

-- ============================================================
-- INTERVIEWS
-- ============================================================
CREATE TABLE public.interviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES public.candidate_profiles(id),
  job_id UUID NOT NULL REFERENCES public.jobs(id),
  organization_id UUID REFERENCES public.organizations(id),
  scheduled_at TIMESTAMPTZ NOT NULL,
  location TEXT,
  instructions TEXT,
  notes TEXT, -- internal
  status TEXT NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'confirmed', 'reschedule_requested', 'completed', 'cancelled', 'no_show')),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_interviews_application ON public.interviews(application_id);
CREATE INDEX idx_interviews_candidate ON public.interviews(candidate_id);
CREATE INDEX idx_interviews_scheduled ON public.interviews(scheduled_at);
CREATE INDEX idx_interviews_status ON public.interviews(status);

-- ============================================================
-- PLACEMENTS
-- ============================================================
CREATE TABLE public.placements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES public.applications(id),
  candidate_id UUID NOT NULL REFERENCES public.candidate_profiles(id),
  job_id UUID NOT NULL REFERENCES public.jobs(id),
  organization_id UUID REFERENCES public.organizations(id),
  placement_date DATE NOT NULL DEFAULT CURRENT_DATE,
  joining_date DATE,
  status TEXT NOT NULL DEFAULT 'placed'
    CHECK (status IN ('document_check', 'joining_confirmed', 'placed', 'cancelled')),
  staff_id UUID REFERENCES public.profiles(id),
  notes TEXT,
  financial_reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_placements_candidate ON public.placements(candidate_id);
CREATE INDEX idx_placements_job ON public.placements(job_id);
CREATE INDEX idx_placements_status ON public.placements(status);

-- ============================================================
-- TRANSACTIONS (simple accounting)
-- ============================================================
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES public.organizations(id),
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'commission', 'pending', 'received', 'adjustment')),
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'NPR',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'received', 'cancelled')),
  reference TEXT,
  description TEXT,
  placement_id UUID REFERENCES public.placements(id),
  created_by UUID REFERENCES public.profiles(id),
  is_finalized BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_transactions_type ON public.transactions(type);
CREATE INDEX idx_transactions_status ON public.transactions(status);
CREATE INDEX idx_transactions_created ON public.transactions(created_at DESC);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  type TEXT NOT NULL DEFAULT 'info',
  entity_type TEXT,
  entity_id UUID,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_created ON public.notifications(created_at DESC);

-- ============================================================
-- AUDIT LOGS
-- ============================================================
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES public.profiles(id),
  organization_id UUID REFERENCES public.organizations(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_actor ON public.audit_logs(actor_id);
CREATE INDEX idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON public.audit_logs(created_at DESC);

-- ============================================================
-- AGENCY SETTINGS
-- ============================================================
CREATE TABLE public.agency_settings (
  id TEXT PRIMARY KEY DEFAULT 'main',
  agency_name TEXT NOT NULL DEFAULT 'CareerJob Solution',
  phone TEXT,
  phones TEXT[] DEFAULT '{}',
  whatsapp TEXT,
  email TEXT,
  address TEXT,
  office_hours TEXT,
  maps_url TEXT,
  logo_url TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.agency_settings (id, agency_name, phone, phones, whatsapp, email, address, office_hours)
VALUES (
  'main',
  'CareerJob Solution',
  '9802858215',
  ARRAY['9802858215', '9802858216', '9802858217'],
  '9802858215',
  'Solutioncareerjob32@gmail.com',
  'Srijana Chowk, Pokhara, Nepal',
  'Sunday – Friday, 9:00 AM – 6:00 PM'
);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER tr_organizations_updated BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER tr_candidate_profiles_updated BEFORE UPDATE ON public.candidate_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER tr_jobs_updated BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER tr_business_requests_updated BEFORE UPDATE ON public.business_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER tr_applications_updated BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER tr_interviews_updated BEFORE UPDATE ON public.interviews
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER tr_placements_updated BEFORE UPDATE ON public.placements
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER tr_transactions_updated BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- HANDLE NEW USER (create profile)
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'candidate')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- APPLICATION STATUS CHANGE → HISTORY + AUDIT
-- ============================================================
CREATE OR REPLACE FUNCTION public.log_application_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.application_status_history (application_id, from_status, to_status, changed_by)
    VALUES (NEW.id, OLD.status, NEW.status, auth.uid());

    INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, metadata)
    VALUES (
      auth.uid(),
      'application_status_changed',
      'application',
      NEW.id,
      jsonb_build_object('from', OLD.status, 'to', NEW.status)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_application_status_change
  AFTER UPDATE OF status ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.log_application_status_change();
