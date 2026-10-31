-- ==============================================================================
-- BrightPath CRM — Migration 003: Multi-Role Sync & Cross-Workspace Pipeline
-- ==============================================================================
-- 1. Promotes Admin & Manager roles in public.profiles.
-- 2. Aligns PostgreSQL RLS so Managers & Admins have full visibility across all counsellors.
-- 3. Enables Counsellors to view team pipeline and claim unassigned pool enquiries.
-- 4. Automatically syncs any future counsellor or staff signups.
-- ==============================================================================

-- 1. Correct existing staff profiles in public.profiles
UPDATE public.profiles
SET role = 'admin', full_name = 'Dr. S. K. Jenkins (Administrator)'
WHERE id IN (
  SELECT id FROM auth.users WHERE email ILIKE '%admin@brightpath-academy.com%'
) OR email ILIKE '%admin%';

UPDATE public.profiles
SET role = 'manager', full_name = 'Marcus Vance (Branch Manager)'
WHERE id IN (
  SELECT id FROM auth.users WHERE email ILIKE '%manager@brightpath-academy.com%'
) OR email ILIKE '%manager%';

UPDATE public.profiles
SET role = 'counsellor', full_name = 'Sarah Jenkins (Academic Counsellor)'
WHERE id IN (
  SELECT id FROM auth.users WHERE email ILIKE '%counsellor@brightpath-academy.com%'
) OR email ILIKE '%counsellor%';

-- 2. Security helper to evaluate elevated roles safely with JWT claim fallback
CREATE OR REPLACE FUNCTION public.is_admin_or_manager()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'manager')
  ) OR (
    auth.jwt() ->> 'email' ILIKE '%admin%' OR auth.jwt() ->> 'email' ILIKE '%manager%'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Trigger for future user signups to automatically inherit their proper role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  assigned_role TEXT := 'counsellor';
BEGIN
  IF NEW.email ILIKE '%admin%' OR (NEW.raw_user_meta_data->>'role') = 'admin' THEN
    assigned_role := 'admin';
  ELSIF NEW.email ILIKE '%manager%' OR (NEW.raw_user_meta_data->>'role') = 'manager' THEN
    assigned_role := 'manager';
  END IF;

  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    assigned_role
  )
  ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. PROFILES POLICIES: Allow all authenticated staff to view all staff profiles (for assignee dropdowns)
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
CREATE POLICY "profiles_select_policy" ON public.profiles
  FOR SELECT
  USING (
    auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
CREATE POLICY "profiles_update_policy" ON public.profiles
  FOR UPDATE
  USING (
    auth.uid() = id OR public.is_admin_or_manager()
  )
  WITH CHECK (
    auth.uid() = id OR public.is_admin_or_manager()
  );

-- 5. LEADS POLICIES: All staff can view pipeline; public can insert; only admin/manager can delete
DROP POLICY IF EXISTS "leads_select_policy" ON public.leads;
CREATE POLICY "leads_select_policy" ON public.leads
  FOR SELECT
  USING (
    auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "leads_insert_policy" ON public.leads;
CREATE POLICY "leads_insert_policy" ON public.leads
  FOR INSERT
  WITH CHECK (
    true
  );

DROP POLICY IF EXISTS "leads_update_policy" ON public.leads;
CREATE POLICY "leads_update_policy" ON public.leads
  FOR UPDATE
  USING (
    auth.role() = 'authenticated'
  )
  WITH CHECK (
    auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "leads_delete_policy" ON public.leads;
CREATE POLICY "leads_delete_policy" ON public.leads
  FOR DELETE
  USING (
    public.is_admin_or_manager()
  );

-- 6. FOLLOW_UPS POLICIES
DROP POLICY IF EXISTS "follow_ups_select_policy" ON public.follow_ups;
CREATE POLICY "follow_ups_select_policy" ON public.follow_ups
  FOR SELECT
  USING (
    auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "follow_ups_insert_policy" ON public.follow_ups;
CREATE POLICY "follow_ups_insert_policy" ON public.follow_ups
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "follow_ups_update_policy" ON public.follow_ups;
CREATE POLICY "follow_ups_update_policy" ON public.follow_ups
  FOR UPDATE
  USING (
    auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "follow_ups_delete_policy" ON public.follow_ups;
CREATE POLICY "follow_ups_delete_policy" ON public.follow_ups
  FOR DELETE
  USING (
    public.is_admin_or_manager()
  );

-- 7. ACTIVITIES POLICIES
DROP POLICY IF EXISTS "activities_select_policy" ON public.activities;
CREATE POLICY "activities_select_policy" ON public.activities
  FOR SELECT
  USING (
    auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "activities_insert_policy" ON public.activities;
CREATE POLICY "activities_insert_policy" ON public.activities
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
  );
