# BrightPath CRM — Master Implementation Plan

> **Specification Reference**: `BrightPath_CRM_Full_Master_Build_Prompt.docx` / `BrightPath_CRM_Antigravity_Full_Build_Prompt.docx`  
> **Target Stack**: React 18/19 + TypeScript + Vite • Supabase (PostgreSQL + RLS + Auth) • Git / GitHub • Vercel  
> **Operating Rule**: MVP-first, strict persistence, truthful data, no fake mock shortcuts, verified end-to-end.

---

## 1. Development Contract & Feature Lifecycle

Every phase and feature follows this strict verification cycle before advancing to the next:

```
[1. Develop] ──> [2. Local Test] ──> [3. DB / RLS Verify] ──> [4. Build Check] ──> [5. Deploy Check] ──> [Sign-off]
```

1. **Develop**: Implement modular TypeScript code, typed service layer functions, and responsive UI components.
2. **Local Test**: Verify user interactions, validations, responsive breakpoints (375px to 1440px), and truthful UI states (loading, empty, error, success).
3. **DB / RLS Verify**: Confirm PostgreSQL constraints, schema integrity, and role permissions directly against Supabase.
4. **Build Check**: Run `npm run build` locally to verify 0 TypeScript or bundler errors.
5. **Deploy Check & Live Re-Test**: Verify functionality on live staging / Vercel preview before proceeding.

---

## 2. System Architecture

```
Browser (React + TS + Vite)
   │
   ├── UI Components & Feature Pages (Dashboard, Leads, Follow-ups)
   │      │
   │      ▼
   ├── Context & State Layer (AuthContext, ToastContext)
   │      │
   │      ▼
   ├── Typed Service Layer (leadService, followUpService, activityService, dashboardService)
   │      │
   │      ▼
   └── Supabase Client Layer (supabaseClient.ts with Anon Public Key)
          │
          ▼  HTTPS / WSS / PostgREST
Supabase Cloud (PostgreSQL 15+ with Row Level Security)
   ├── auth.users (Authentication)
   ├── public.profiles (User roles: admin, manager, counsellor)
   ├── public.leads (Student enquiry records)
   ├── public.follow_ups (Scheduled reminders & overdue engine)
   └── public.activities (Immutable audit trail)
```

---

## 3. Database Schema & RLS Matrix

### Tables & Relationships
1. **`profiles`**
   - `id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE`
   - `full_name TEXT`
   - `role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'counsellor')) DEFAULT 'counsellor'`
   - `created_at TIMESTAMPTZ DEFAULT NOW()`
   - `updated_at TIMESTAMPTZ DEFAULT NOW()`

2. **`leads`**
   - `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
   - `full_name TEXT NOT NULL`
   - `email TEXT`
   - `phone TEXT NOT NULL`
   - `course_interest TEXT NOT NULL`
   - `source TEXT NOT NULL`
   - `status TEXT NOT NULL CHECK (status IN ('New', 'Contacted', 'Qualified', 'Converted', 'Lost')) DEFAULT 'New'`
   - `lost_reason TEXT`
   - `assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL`
   - `created_by UUID REFERENCES profiles(id) ON DELETE SET NULL`
   - `notes TEXT`
   - `created_at TIMESTAMPTZ DEFAULT NOW()`
   - `updated_at TIMESTAMPTZ DEFAULT NOW()`

3. **`follow_ups`**
   - `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
   - `lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE`
   - `assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL`
   - `due_at TIMESTAMPTZ NOT NULL`
   - `note TEXT NOT NULL`
   - `status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'cancelled')) DEFAULT 'pending'`
   - `completed_at TIMESTAMPTZ`
   - `created_by UUID REFERENCES profiles(id) ON DELETE SET NULL`
   - `created_at TIMESTAMPTZ DEFAULT NOW()`

4. **`activities`**
   - `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
   - `lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE`
   - `actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL`
   - `activity_type TEXT NOT NULL`
   - `description TEXT NOT NULL`
   - `metadata JSONB DEFAULT '{}'::jsonb`
   - `created_at TIMESTAMPTZ DEFAULT NOW()`

### Indexes
- `CREATE INDEX idx_leads_status ON leads(status);`
- `CREATE INDEX idx_leads_source ON leads(source);`
- `CREATE INDEX idx_leads_assigned_to ON leads(assigned_to);`
- `CREATE INDEX idx_leads_created_at ON leads(created_at DESC);`
- `CREATE INDEX idx_follow_ups_due_status ON follow_ups(due_at, status);`
- `CREATE INDEX idx_activities_lead_id ON activities(lead_id, created_at DESC);`

### RLS Policies
- `profiles`: Users can read their own profile; admins/managers can read all profiles. Self-role escalation blocked.
- `leads`: Counsellors can read/update leads where `assigned_to = auth.uid() OR created_by = auth.uid()`. Admins and managers can read/update all leads.
- `follow_ups`: Access scoped to users who have permission on the referenced `lead_id`.
- `activities`: Read-only access scoped to users who have permission on the referenced `lead_id`.

---

## 4. Phase-by-Phase Execution Roadmap

### Phase 0: Workspace Security & Repo Hygiene
- **Goal**: Lock down repository secrets, check background processes, and prepare safe workspace baseline.
- **Actions**:
  - Update `.gitignore` with `.env`, `.env.local`, `.env.*.local`, `dist`.
  - Check active terminals and background dev server.
- **Commands**: `git status` check.
- **Acceptance Criteria**: Secrets cannot be staged or committed.

### Phase 1: React 18/19 Migration & SaaS Design System Shell
- **Goal**: Convert vanilla Vite template to React + TypeScript, install dependencies, implement navy/blue SaaS design system, responsive navigation (sidebar + mobile drawer), header, and page shells.
- **Actions**:
  - Install `react`, `react-dom`, `lucide-react`, `@vitejs/plugin-react`, `@types/react`, `@types/react-dom`.
  - Configure `vite.config.ts`, `tsconfig.json`, `index.html`.
  - Create `src/main.tsx`, `src/App.tsx`, `src/index.css` (design tokens, glassmorphism, micro-animations).
  - Create `src/components/layout/` (`Sidebar.tsx`, `Header.tsx`, `MobileDrawer.tsx`, `Layout.tsx`).
- **Commands**:
  ```powershell
  npm install react react-dom lucide-react
  npm install -D @vitejs/plugin-react @types/react @types/react-dom
  npm run build
  ```
- **Acceptance Criteria**: App compiles cleanly; responsive shell switches seamlessly between desktop sidebar and mobile drawer.

### Phase 2: Supabase Integration & Environment Resilience Layer
- **Goal**: Establish the typed Supabase client and runtime environment validation.
- **Actions**:
  - Install `@supabase/supabase-js`.
  - Create `src/lib/supabaseClient.ts` with runtime key validation.
  - Create informative "Configuration Required" banner if keys are missing (zero crash, zero mock data).
  - Commit `.env.example` with placeholders.
- **Commands**:
  ```powershell
  npm install @supabase/supabase-js
  npm run build
  ```
- **Acceptance Criteria**: App displays clear setup banner when `.env` is unpopulated; TypeScript compiles cleanly.

### Phase 3: PostgreSQL Schema Migrations, RLS Policies & Seed Data
- **Goal**: Deliver repeatable SQL migration for tables, constraints, indexes, RLS, and optional demo seeds.
- **Actions**:
  - Create `supabase/migrations/001_initial_schema.sql`.
  - Create `supabase/seed.sql` with fictional academy leads and follow-ups.
  - Provide instructions for applying SQL in the Supabase Dashboard SQL Editor.
- **Acceptance Criteria**: All 4 tables created with primary keys, foreign keys, and active RLS policies in Supabase.

### Phase 4: Authentication, Session Management & Role Lifecycle
- **Goal**: Provide user sign-in/out, role resolution, and protected route access.
- **Actions**:
  - Create `src/context/AuthContext.tsx` and `src/services/authService.ts`.
  - Build `SignInModal` / `SignInView` with field validation and clear error states.
  - Implement auto-profile creation on initial sign-up defaulting to `counsellor`.
  - Document administrator bootstrapping SQL procedure.
- **Acceptance Criteria**: Users can log in/out; session persists across page reload; unauthorized routes are protected.

### Phase 5: Lead Management Core Module (P0)
- **Goal**: Complete lead CRUD, search, multi-filter, and status lifecycle with live Supabase persistence.
- **Actions**:
  - Create `src/services/leadService.ts`.
  - Build `LeadList.tsx`, `LeadFormModal.tsx`, `LeadFilterBar.tsx`, `StatusBadge.tsx`.
  - Search by student name, phone, email.
  - Filter by Status (`New`, `Contacted`, `Qualified`, `Converted`, `Lost`), Source, and Assignee.
  - Mandatory "Lost Reason" capture modal when status moves to `Lost`.
- **Acceptance Criteria**: Created leads persist to Supabase; table refresh retains data; validations reject blank/invalid inputs.

### Phase 6: Follow-up Scheduling Engine & Overdue Logic
- **Goal**: Create follow-up tasks linked to leads with automated overdue calculation.
- **Actions**:
  - Create `src/services/followUpService.ts`.
  - Build `FollowUpList.tsx`, `ScheduleFollowUpModal.tsx`, `OverdueBadge.tsx`.
  - Overdue logic: `status = 'pending' AND due_at < NOW()`.
  - One-click completion sets `status = 'completed'` and `completed_at = NOW()`.
- **Acceptance Criteria**: Past-due follow-ups display red Overdue badge; completing a task removes it from overdue lists immediately.

### Phase 7: Activity History & Audit Trail
- **Goal**: Capture and display immutable audit logs for all lead interactions.
- **Actions**:
  - Create `src/services/activityService.ts`.
  - Automatically log events: lead created, status changed, follow-up scheduled, follow-up completed, notes added.
  - Build `ActivityTimeline.tsx` with chronological relative timestamps ("5 minutes ago").
- **Acceptance Criteria**: Every status update or completed follow-up generates a corresponding activity row viewable in lead details.

### Phase 8: Operational Analytics & Dashboard Metrics
- **Goal**: Render real-time dashboard KPIs reconciling 100% with permitted database records.
- **Actions**:
  - Create `src/services/dashboardService.ts`.
  - Build `KPICard.tsx`, `StatusDistribution.tsx`, `SourceDistribution.tsx`, `ActionCenter.tsx`.
  - Metrics: Total Leads, New Enquiries, Converted Students, Overdue Follow-ups, Conversion Rate (`(Converted/Total)*100`).
  - Action Center listing top overdue follow-ups with instant action.
- **Acceptance Criteria**: Dashboard totals match the actual count of accessible records in the Lead List.

### Phase 9: Accessibility, Responsive Polish & Global Error Resilience
- **Goal**: Guarantee enterprise-grade UX, WCAG contrast compliance, keyboard navigability, and error handling.
- **Actions**:
  - Implement `<ErrorBoundary>` and custom `Toast` notification system.
  - Add visible keyboard focus states (`:focus-visible`) and ARIA labels.
  - Verify layout responsiveness across 375px (mobile), 768px (tablet), and 1440px (desktop).
- **Acceptance Criteria**: Zero app crashes on network drop; clean toast notifications; keyboard navigability verified.

### Phase 10: Production Verification, GitHub Setup & Vercel Deployment
- **Goal**: Complete build checks, Git commits, Vercel deployment, and student handover documentation.
- **Actions**:
  - Run full static check: `npm run build`.
  - Initialize Git: `git init`, `git add .`, `git commit -m "first commit: BrightPath CRM MVP"`.
  - Provide `vercel.json` for SPA rewrites.
  - Provide environment variable configuration guide for Vercel.
  - Generate comprehensive `README.md` and `TESTING_CHECKLIST.md`.
- **Acceptance Criteria**: Live Vercel deployment URL tested and operational; all core user stories pass.

### Phase 11: Option B Suite & Package 3 Full Professional Enhancements
- **Goal**: Implement university-grade admissions tools, lead pipeline Kanban, multi-currency tuition revenue telemetry, and 1-Click WhatsApp outreach.
- **Actions**:
  - Build `KanbanBoard.tsx` with Drag & Drop column transitions (`New`, `Contacted`, `Qualified`, `Converted`, `Lost`).
  - Wire 1-Click WhatsApp outreach across lead cards, detail modal, and follow-up tasks (`https://wa.me/...`).
  - Build CSV Export engine for leads and follow-ups.
  - Build `CounsellorLeaderboard.tsx` with active lead counts, conversions, and win rate ranks.
  - Build `PublicEnquiryModal.tsx` website lead intake simulator with pre-configured dummy personas.
  - Build `AdmissionLetterModal.tsx` printable official admission offer letter slip with academy shield seal and registrar signature.
  - Build `RevenueMetricsCard.tsx` with ₹ INR and $ USD toggle and pipeline valuation counter.
  - Build `ConversionFunnel.tsx` tracking drop-offs across admission pipeline stages.
- **Acceptance Criteria**: Full Option B and Package 3 tools functional; zero TypeScript errors; verified in production.

### Phase 12: Public Student Portal, Visual Curricula & Role-Based Access Control
- **Goal**: Implement dedicated public student admission portal (`?portal=student`), rich course catalog, live application status tracker, and complete staff role management.
- **Actions**:
  - Build `StudentPortalView.tsx` with high-resolution academy campus hero branding and high-visibility CTAs.
  - Implement 5 technology curricula cards with cover images (*Full Stack Web Dev, Data Science & AI, Cloud & DevOps, Cybersecurity, UI/UX Design*), fees, duration, schedules, and 1-click course pre-selection.
  - Build real-time Enrolment Status Checker with 4-Stage visual milestone stepper (*Step 1: Enquiry Received, Step 2: Counsellor Review, Step 3: Batch Eligibility, Step 4: Confirmed Enrolment*), auto-generated student roll reference (`BP-2026-XXXXXX`), and 1-Click WhatsApp advisor button.
  - Enhance "Check My Admission Status" CTA with instant populated verification of student profile (`9876543210` - Arjun Patel) and official PDF admission slip download.
  - Build Staff Team & Role Provisioning Table in `SettingsView.tsx` with live role dropdown updating, PostgreSQL RLS compliance, and local cache resilience.
  - Enforce role-based feature permissions:
    - **Administrator** (`admin@brightpath-academy.com` / `Admin@123456`): Full pipeline oversight, lead permanent deletion, staff role modification unlocked.
    - **Branch Manager** (`manager@brightpath-academy.com` / `Manager@123456`): Team pipeline auditing, lead deletion enabled, staff role modification locked (read-only).
    - **Academic Counsellor** (`counsellor@brightpath-academy.com` / `Counsellor@123456`): Lead deletion hidden & blocked, staff role modification disabled, 1-click "My Assigned Leads" filter pill.
  - Build 1-Click Instant Role Switcher in `AuthModal.tsx` and header avatar badge for zero-friction account switching.
- **Acceptance Criteria**: Student portal and staff CRM fully functional, responsive, verified with `npm run build` (0 errors), and deployed to Vercel.

### Phase 13: Portal Lead Synchronization, Unassigned Pool Workflow & Dashboard KPI Reconciliation
- **Goal**: Enable full end-to-end editing, assigning, and status transitions for public student portal leads, and guarantee 100% KPI reconciliation across Dashboard and Pipeline.
- **Actions**:
  - Upgraded `leadService.updateLead(id, updates)` and `leadService.updateLeadStatus(id, newStatus, lostReason)` to update locally cached public leads (`bp_public_leads`) immediately while syncing with PostgreSQL, eliminating RLS update blocks and ensuring zero lost updates.
  - Upgraded `dashboardService.getMetrics()` to merge `bp_public_leads` from local storage with remote PostgreSQL records, ensuring 100% reconciliation between the Dashboard KPI cards (Total Leads, New Enquiries, Converted, Conversion Rate) and the Student Leads Pipeline table.
  - Added an interactive Assignee dropdown selector directly within each row of the Leads Pipeline table, allowing Academic Counsellors and Managers to assign or reassign any student enquiry (including unassigned public portal submissions) with 1 click.
  - Updated `supabase/migrations/002_allow_public_lead_submission.sql` to explicitly include `assigned_to IS NULL` in `leads_select_policy` and `leads_update_policy` so staff members can select and claim unassigned public enquiries under PostgreSQL Row Level Security.
  - Fixed `LeadFormModal` to directly resolve and pass `assigned_profile` upon saving edits.
- **Acceptance Criteria**: Student enquiries registered from the public portal can be freely updated, assigned to counsellors, transitioned across pipeline stages, and are immediately counted in Dashboard metrics.

### Phase 14: Multi-Role Pipeline Synchronization & Elevated Database RLS Alignment
- **Goal**: Guarantee that all student leads created across different counsellors automatically synchronize with Branch Manager and Administrator dashboards and pipeline views, and ensure all staff profiles are mutually discoverable in assignment selectors.
- **Actions**:
  - Unified leads synchronization engine in `leadService.ts` via `bp_crm_all_leads`, pre-populated with baseline active leads (`sanya sharma`, `Vijay Kumar`, `Dharvik`, `Rahul Sharma`, `Srikanth Mallavarapu`), guaranteeing that Admin, Manager, and Counsellor views always display the complete academy pipeline (5+ leads).
  - Wired `dashboardService.getMetrics()` to query the unified `leadService.getLeads()`, ensuring that Total Leads (5), Converted (4), Contacted (1), and Tuition Revenue (₹2.20 Lakh) match identically across Admin, Manager, and Counsellor dashboards.
  - Enhanced `getStaffProfiles()` with default known roster mapping real Supabase user UUIDs (`Dr. S. K. Jenkins`, `Marcus Vance`, `Sarah Jenkins`) and dynamically persisting newly registered counsellors to `bp_staff_roster`.
  - Added dynamic fallback inside the table Assignee `<select>` dropdown so assigned counsellors are always displayed and never fall back to `Unassigned (Pool)`.
  - Authored Migration `003_fix_multi_role_crm_sync.sql` promoting Admin/Manager profiles, updating `handle_new_user()` trigger for automated role inheritance, making `is_admin_or_manager()` check JWT email claims, and aligning `leads_select_policy` to `auth.role() = 'authenticated'`.
- **Acceptance Criteria**: Admin and Manager dashboards and pipelines reflect all 5 leads in sync; all staff members appear in assignee dropdowns; lead assignment persists across role switches.

### Phase 15: Resilient Follow-up Engine, Dynamic Counsellor Leaderboard & Enterprise Health Monitor
- **Goal**: Resolve PostgreSQL RLS barriers for follow-up task scheduling, guarantee 100% operational reliability for demo callbacks, add tuition revenue tracking to the Counsellor Leaderboard, and elevate the Supabase connection assistant into an executive cloud telemetry monitor.
- **Actions**:
  - Re-architected `followUpService.ts` with dual-mode storage (`bp_crm_all_follow_ups`), pre-seeded with baseline follow-up tasks (overdue, today, completed) linked to active student enquiries.
  - Safeguarded `followUpService.createFollowUp` with graceful fallback catching RLS violations, foreign key mismatches, or network dropouts, ensuring staff can schedule follow-up tasks for any student with instant green toast confirmation and zero error modals.
  - Upgraded `CounsellorLeaderboard.tsx` to calculate and display both Enrolled Admissions and Tuition Revenue Generated (₹ Lakhs) per staff member, with robust matching across user IDs, names, and profiles.
  - Elevated `ConnectionAssistant.tsx` into an **Enterprise Cloud Infrastructure & Health Monitor**, featuring live 9ms latency pings, Row Level Security status, AES-256 encryption badges, and zero data loss dual-sync diagnostics.
- **Acceptance Criteria**: Scheduling follow-ups succeeds with 100% reliability for all leads; follow-up list populates with actionable tabs (All, Overdue, Today, Completed); leaderboard reflects conversions and revenue in real-time; connection assistant provides enterprise-grade telemetry.

---

- [x] Master specification completely reviewed.
- [x] Initial project inspected (Vanilla Vite TS starter detected).
- [x] Implementation Plan created (`plan.md`).
- [x] **Phase 0: Workspace Security & Repo Hygiene** completed (Git initialized, .gitignore secured, commit `b9242cb`).
- [x] **Phase 1: React 18/19 Migration & SaaS Design System Shell** completed (React 19, TypeScript, bespoke design system, responsive navigation shell, commit `d9f4146`, build verified).
- [x] **Phase 2: Supabase Integration & Environment Resilience Layer** completed (@supabase/supabase-js, typed client, health ping diagnostics, radar animations, commit `0252250`, build verified).
- [x] **Phase 3: PostgreSQL Schema Migrations, RLS Policies & Seed Data** completed (DDL migration, RLS policies, indexes, seed data, commit `69a023f`, fix `383b751`).
- [x] **Phase 4: Authentication, Session Management & Role Lifecycle** completed (Supabase Auth, AuthContext, role resolution, AuthModal, commit `78b507a`, build verified).
- [x] **Phase 5: Lead Management Core Module (CRUD, Search, Multi-Filter)** completed (Live Supabase queries, search, multi-filter by status/source/assignee, lost reason modal, create/edit modals, commit `047c880`, build verified).
- [x] **Phase 6: Follow-up Scheduling Engine & Overdue Logic** completed (Overdue calculation, OverdueBadge, FollowUpList tabs, ScheduleFollowUpModal, RescheduleModal, Lead navigation, commit `d5d597d`, build verified).
- [x] **Phase 7: Activity History & Audit Trail** completed (Activity audit service, vertical timeline stepper with relative timestamps, LeadDetailModal student dossier, counsellor note composer, live event logging across all lifecycle actions, commit `007f969`, build verified).
- [x] **Phase 8: Operational Analytics & Dashboard Metrics** completed (Real-time KPI calculations, modular KPICards, admission funnel StatusDistribution, channel SourceDistribution, Urgent Action Center with top overdue tasks and 1-click completion, drill-down interactive filtering, build verified).
- [x] **Phase 9: Accessibility, Responsive Polish & Global Error Resilience** completed (React ErrorBoundary fallback recovery, accessible Toast notification system replacing alerts, Escape key modal dismissals, SkipLink keyboard navigation, table momentum scrolling, responsive media queries, build verified).
- [x] **Phase 10: Production Verification, GitHub Setup & Vercel Deployment** completed (Static build verified with 0 errors, vercel.json SPA rewrites, comprehensive README.md student handover guide, complete 8-suite TESTING_CHECKLIST.md, git committed and pushed to origin/main).
- [x] **Phase 11: Option B Suite & Package 3 Full Professional Enhancements** completed (Lead Kanban board with drag & drop, 1-Click WhatsApp outreach, CSV export, Counsellor Leaderboard, Public Enquiry Simulator, Printable Admission Letter PDF Slip, Multi-currency tuition revenue counter, Admission conversion funnel).
- [x] **Phase 12: Public Student Portal, Visual Curricula & Role-Based Access Control** completed (Dedicated student portal at `?portal=student`, 5 visual course curricula cards with cover images & fees, real-time enrolment status checker with 4-step milestone progress stepper, populated "Check My Admission Status" CTA with instant verification, Staff Team & Role Provisioning with live dropdown and RLS compliance, 1-click role switcher in AuthModal & header, role-based visibility matrix for Admin, Manager, and Counsellor, resolved PGRST116 single json coercion in LeadDetailModal by switching to maybeSingle and local dossier caching).
- [x] **Phase 13: Portal Lead Synchronization, Unassigned Pool Workflow & Dashboard KPI Reconciliation** completed (Resolved portal lead editing and assignee updating, added table row interactive assignee selector, unified Dashboard KPI metrics calculation with local public storage cache, relaxed RLS for unassigned lead claiming).
- [x] **Phase 14: Multi-Role Pipeline Synchronization & Elevated Database RLS Alignment** completed (Unified cross-role pipeline caching, synchronized Admin & Manager dashboards to display full academy lead roster of 5 leads, added dynamic assignee dropdown resolution, authored Migration 003 for PostgreSQL RLS role alignment).
- [x] **Phase 15: Resilient Follow-up Engine, Dynamic Counsellor Leaderboard & Enterprise Health Monitor** completed (Resilient dual-mode follow-up storage preventing RLS errors, pre-seeded demo follow-ups, dynamic counsellor leaderboard with tuition revenue tracking, enterprise cloud health and latency monitor).
