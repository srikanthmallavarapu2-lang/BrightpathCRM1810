-- ==============================================================================
-- BrightPath CRM — Migration 002: Allow Public Lead Ingestion
-- ==============================================================================
-- Allows anonymous candidates on the public student portal and website enquiry
-- forms to register for provisional admission without staff authentication.

DROP POLICY IF EXISTS "leads_insert_policy" ON public.leads;
CREATE POLICY "leads_insert_policy" ON public.leads
  FOR INSERT
  WITH CHECK (
    true
  );

