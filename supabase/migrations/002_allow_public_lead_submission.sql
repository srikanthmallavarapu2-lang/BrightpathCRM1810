-- ==============================================================================
-- BrightPath CRM — Migration 002: Public Lead Ingestion & Unassigned Pool Access
-- ==============================================================================
-- 1. Allows anonymous candidates on the public student portal and website enquiry
--    forms to register for provisional admission without staff authentication.
-- 2. Allows all counsellors to view and claim unassigned pool enquiries.

-- Allow public candidates & simulator to submit leads
DROP POLICY IF EXISTS "leads_insert_policy" ON public.leads;
CREATE POLICY "leads_insert_policy" ON public.leads
  FOR INSERT
  WITH CHECK (
    true
  );

-- Allow counsellors to view unassigned leads or their own leads; Admins/Managers view all
DROP POLICY IF EXISTS "leads_select_policy" ON public.leads;
CREATE POLICY "leads_select_policy" ON public.leads
  FOR SELECT
  USING (
    assigned_to = auth.uid()
    OR created_by = auth.uid()
    OR assigned_to IS NULL
    OR public.is_admin_or_manager()
  );

-- Allow counsellors to claim/update unassigned leads or their own leads; Admins/Managers update all
DROP POLICY IF EXISTS "leads_update_policy" ON public.leads;
CREATE POLICY "leads_update_policy" ON public.leads
  FOR UPDATE
  USING (
    assigned_to = auth.uid()
    OR created_by = auth.uid()
    OR assigned_to IS NULL
    OR public.is_admin_or_manager()
  )
  WITH CHECK (
    assigned_to = auth.uid()
    OR created_by = auth.uid()
    OR assigned_to IS NULL
    OR public.is_admin_or_manager()
  );

