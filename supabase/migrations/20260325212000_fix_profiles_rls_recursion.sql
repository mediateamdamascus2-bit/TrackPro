-- Fix RLS recursion on public.profiles
-- Error: infinite recursion detected in policy for relation "profiles"

-- Remove old recursive policies (if they exist)
DROP POLICY IF EXISTS profiles_select ON public.profiles;
DROP POLICY IF EXISTS profiles_update_self ON public.profiles;
DROP POLICY IF EXISTS profiles_update_manager ON public.profiles;

-- Helper functions run as definer to safely read current user's profile
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.profiles
  WHERE id = auth.uid()
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.current_user_department_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT department_id
  FROM public.profiles
  WHERE id = auth.uid()
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.current_user_role() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.current_user_department_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.current_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_user_department_id() TO authenticated;

-- New non-recursive policies for profiles
CREATE POLICY profiles_select
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    id = auth.uid()
    OR public.current_user_role() IN ('manager', 'communication_officer')
  );

CREATE POLICY profiles_update_self
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY profiles_update_manager
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (public.current_user_role() = 'manager')
  WITH CHECK (public.current_user_role() = 'manager');

