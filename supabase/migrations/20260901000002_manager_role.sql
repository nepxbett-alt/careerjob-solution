-- Add manager role (ops lead / receptionist can use same level later)
-- Does not remove existing roles or data

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN (
    'candidate', 'business',
    'owner', 'admin', 'manager', 'recruiter', 'staff', 'accountant', 'viewer'
  ));

-- Staff = anyone who can use the recruitment desk (not candidate/business)
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('owner', 'admin', 'manager', 'recruiter', 'staff', 'accountant', 'viewer')
  );
$$;

-- Full agency control: owner + admin only
CREATE OR REPLACE FUNCTION public.is_admin_or_owner()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('owner', 'admin')
  );
$$;

-- Manager-level ops (owner, admin, manager) — for future fine-grained policies
CREATE OR REPLACE FUNCTION public.is_manager_level()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('owner', 'admin', 'manager')
  );
$$;
