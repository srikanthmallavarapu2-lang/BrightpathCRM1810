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

---

- [x] Master specification completely reviewed.
- [x] Initial project inspected (Vanilla Vite TS starter detected).
- [x] Implementation Plan created (`plan.md`).
- [x] **Phase 0: Workspace Security & Repo Hygiene** completed (Git initialized, .gitignore secured, commit `b9242cb`).
- [x] **Phase 1: React 18/19 Migration & SaaS Design System Shell** completed (React 19, TypeScript, bespoke design system, responsive navigation shell, commit `d9f4146`, build verified).
- [x] **Phase 2: Supabase Integration & Environment Resilience Layer** completed (@supabase/supabase-js, typed client, health ping diagnostics, radar animations, commit `0252250`, build verified).
- [x] **Phase 3: PostgreSQL Schema Migrations, RLS Policies & Seed Data** completed (DDL migration, RLS policies, indexes, seed data, commit `69a023f`, fix `383b751`).
- [x] **Phase 4: Authentication, Session Management & Role Lifecycle** completed (Supabase Auth, AuthContext, role resolution, AuthModal, commit `78b507a`, build verified).
- [ ] **Phase 5: Lead Management Core Module (CRUD, Search, Multi-Filter)** ready for inspection.
