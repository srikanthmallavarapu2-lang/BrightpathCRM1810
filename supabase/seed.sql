-- ==============================================================================
-- BrightPath CRM — Fictional Workshop Demo Seed Data (Phase 3)
-- Relational dataset: sample leads, follow-ups, and activity audit entries
-- Idempotent: Can be executed multiple times without generating duplicates
-- ==============================================================================

-- 1. INSERT SAMPLE LEADS
INSERT INTO public.leads (
  id,
  full_name,
  email,
  phone,
  course_interest,
  source,
  status,
  lost_reason,
  notes,
  created_at
)
VALUES
  (
    'a1111111-1111-1111-1111-111111111111',
    'Aarav Sharma',
    'aarav.sharma@example.com',
    '+91 98765 43210',
    'Full Stack Web Dev',
    'Website Form',
    'New',
    NULL,
    'Enquired about weekend evening batches for working professionals. Interested in React + Node.js track.',
    NOW() - INTERVAL '3 hours'
  ),
  (
    'b2222222-2222-2222-2222-222222222222',
    'Diya Patel',
    'diya.p@example.com',
    '+91 98234 56789',
    'Data Science & AI',
    'Walk-in Visit',
    'Contacted',
    NULL,
    'Visited campus with parents. Took brochure and syllabus details. Inquired about scholarship eligibility test.',
    NOW() - INTERVAL '1 day'
  ),
  (
    'c3333333-3333-3333-3333-333333333333',
    'Rohan Verma',
    'rohan.v@example.com',
    '+91 97123 45678',
    'Cloud Computing & DevOps',
    'Inbound Phone Call',
    'Qualified',
    NULL,
    'Has 1 year experience in systems admin. Wants AWS + Kubernetes certification coaching. Demo class booked.',
    NOW() - INTERVAL '2 days'
  ),
  (
    'd4444444-4444-4444-4444-444444444444',
    'Ananya Iyer',
    'ananya.iyer@example.com',
    '+91 98456 78901',
    'Cybersecurity Fundamentals',
    'Student Referral',
    'Converted',
    NULL,
    'Referred by alumni Rahul M. Completed admission application and registered for November batch.',
    NOW() - INTERVAL '4 days'
  ),
  (
    'e5555555-5555-5555-5555-555555555555',
    'Kavya Reddy',
    'kavya.r@example.com',
    '+91 98111 22334',
    'Full Stack Web Dev',
    'Website Form',
    'Lost',
    'Joined competitor institute due to closer physical branch location',
    'Prefers classroom sessions within walking distance of Indiranagar campus.',
    NOW() - INTERVAL '5 days'
  )
ON CONFLICT (id) DO NOTHING;

-- 2. INSERT SAMPLE FOLLOW-UPS
INSERT INTO public.follow_ups (
  id,
  lead_id,
  due_at,
  note,
  status,
  completed_at,
  created_at
)
VALUES
  -- Overdue Follow-up 1 (Due 2 hours ago)
  (
    'f1111111-1111-1111-1111-111111111111',
    'a1111111-1111-1111-1111-111111111111',
    NOW() - INTERVAL '2 hours',
    'Call student to share Web Dev curriculum and batch timings.',
    'pending',
    NULL,
    NOW() - INTERVAL '3 hours'
  ),
  -- Overdue Follow-up 2 (Due yesterday)
  (
    'f2222222-2222-2222-2222-222222222222',
    'b2222222-2222-2222-2222-222222222222',
    NOW() - INTERVAL '1 day',
    'Follow up on scholarship test registration link and confirm date.',
    'pending',
    NULL,
    NOW() - INTERVAL '2 days'
  ),
  -- Upcoming Follow-up 3 (Due tomorrow morning)
  (
    'f3333333-3333-3333-3333-333333333333',
    'c3333333-3333-3333-3333-333333333333',
    NOW() + INTERVAL '1 day',
    'Confirm attendance for Saturday morning Cloud Computing demo workshop.',
    'pending',
    NULL,
    NOW() - INTERVAL '1 day'
  ),
  -- Completed Follow-up 4 (Completed 3 days ago)
  (
    'f4444444-4444-4444-4444-444444444444',
    'd4444444-4444-4444-4444-444444444444',
    NOW() - INTERVAL '3 days',
    'Send fee invoice and enrollment confirmation kit.',
    'completed',
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '4 days'
  )
ON CONFLICT (id) DO NOTHING;

-- 3. INSERT SAMPLE ACTIVITY AUDIT LOGS
INSERT INTO public.activities (
  id,
  lead_id,
  activity_type,
  description,
  metadata,
  created_at
)
VALUES
  (
    'ac111111-1111-1111-1111-111111111111',
    'a1111111-1111-1111-1111-111111111111',
    'lead_created',
    'Enquiry received from Website Form for Full Stack Web Dev',
    '{"source": "Website Form", "course": "Full Stack Web Dev"}'::jsonb,
    NOW() - INTERVAL '3 hours'
  ),
  (
    'ac222222-2222-2222-2222-222222222222',
    'b2222222-2222-2222-2222-222222222222',
    'status_changed',
    'Status updated from New to Contacted during in-person counselling',
    '{"from": "New", "to": "Contacted"}'::jsonb,
    NOW() - INTERVAL '1 day'
  ),
  (
    'ac333333-3333-3333-3333-333333333333',
    'd4444444-4444-4444-4444-444444444444',
    'status_changed',
    'Student converted and enrolled in Cybersecurity Fundamentals',
    '{"from": "Qualified", "to": "Converted"}'::jsonb,
    NOW() - INTERVAL '4 days'
  )
ON CONFLICT (id) DO NOTHING;
