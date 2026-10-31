# BrightPath CRM — Admissions & Pipeline Management System

> **Live Production MVP**: Built with React 19 + TypeScript + Vite + Supabase (PostgreSQL, Row Level Security, Auth) + Vercel  
> **Repository**: [https://github.com/srikanthmallavarapu2-lang/BrightpathCRM1810.git](https://github.com/srikanthmallavarapu2-lang/BrightpathCRM1810.git)  
> **Scenario**: Fictional vocational coaching institute — *BrightPath Academy*

---

## 1. Executive Overview & Business Problem

BrightPath Academy receives dozens of student course enquiries every week via their website forms, inbound phone calls, student referrals, messaging channels, and in-person walk-ins. Previously, counsellors tracked enquiries across disconnected spreadsheets and messaging apps, leading to:
- **Forgotten follow-up calls** with prospective students.
- **Lost enquiry history** and duplicate records.
- **Unclear staff ownership** and pipeline visibility.
- **No actionable metrics** on enquiry-to-enrolment conversion rates.

**BrightPath CRM** solves these operational challenges by providing a unified, real-time admissions workspace with strict PostgreSQL persistence, automated overdue task calculation, an immutable audit trail, and live dashboard analytics.

---

## 2. Core Modules & Key Features

### 📊 1. Operational Analytics & Dashboard
- **Live Reconciled KPIs**: Total Leads, New Enquiries, Converted Students, Overdue Follow-ups, and Conversion Rate (`(Converted/Total) × 100`).
- **Urgent Action Center**: Surfaces high-priority overdue follow-up calls with instant **1-Click "Mark Done"** and **Reschedule** capabilities.
- **Interactive Funnel & Channels**: Visual stage distributions (`New`, `Contacted`, `Qualified`, `Converted`, `Lost`) and source channels with one-click drill-down filtering to the leads list.
- **Live Database Health Radar**: Real-time ping diagnostics verifying connectivity to Supabase.

### 👥 2. Student Lead Management
- **Full CRUD & Persistence**: Record, view, edit, search, and delete student enquiries backed by live Supabase PostgreSQL.
- **Instant Search & Multi-Filter**: Filter enquiries in real-time by status, marketing source, and staff assignee, with a one-click reset action.
- **Mandatory "Lost Reason" Validation**: Transitioning an enquiry to `Lost` requires an explicit, structured reason (e.g. joined competitor, fee constraint, schedule clash).

### ⏰ 3. Follow-Up Scheduling & Overdue Engine
- **Automated Overdue Detection**: Tasks are dynamically flagged as overdue when `status = 'pending' AND due_at < NOW()`.
- **Dynamic Overdue Badges**: Displays humanized overdue intervals (e.g., `Overdue by 2d 4h`, `Overdue by 45m`).
- **One-Click Completion & Rescheduling**: Completing a task immediately moves it to the archived tab and logs an audit activity; rescheduling updates the due date with optional notes.

### 📜 4. Activity History & Audit Trail
- **Immutable Interaction Stepper**: Visual vertical timeline logging `lead_created`, `status_changed`, `follow_up_scheduled`, `follow_up_completed`, and `note_added`.
- **Student Dossier Modal**: Comprehensive student view showing contact details, active follow-ups, and a quick counsellor note composer.
- **Actor Attribution**: Every event records the staff member's name and role along with humanized relative timestamps (`just now`, `15m ago`, `Yesterday at 11:00 AM`).

### 🛡️ 5. Global Error Resilience & WCAG 2.1 AA Accessibility
- **React `<ErrorBoundary>`**: Replaces white-screen crashes with an actionable recovery screen ("Try Again", "Return to Home") and diagnostic toggles.
- **Accessible Toast Notifications**: Floating, non-blocking toast notifications (`role="status"`, `aria-live="polite"`) replacing all browser `alert()` popups.
- **Keyboard & Modal Navigation**: Global `Escape` key close handlers on all modal dialogs, visible `:focus-visible` blue outline rings, and an accessible `<SkipLink />`.
- **Responsive Layout**: Tested across 375px (mobile), 768px (tablet), and 1440px+ (desktop widescreen).

---

## 3. Technology Stack & Architecture

```
Browser Client (React 19 + TypeScript + Vite)
   │
   ├── UI Components & Feature Modules (Dashboard, Leads, Follow-ups, Activities)
   │      │
   │      ▼
   ├── Context & State Providers (AuthContext, ToastContext, ErrorBoundary)
   │      │
   │      ▼
   ├── Typed Service Layer (leadService, followUpService, activityService, dashboardService)
   │      │
   │      ▼
   └── Supabase Client Layer (src/lib/supabaseClient.ts)
          │
          ▼  HTTPS / WSS (PostgREST + Row Level Security)
Supabase Cloud (PostgreSQL 15+)
   ├── auth.users (Authentication)
   ├── public.profiles (Roles: admin, manager, counsellor)
   ├── public.leads (Student enquiry records)
   ├── public.follow_ups (Scheduled tasks & overdue engine)
   └── public.activities (Immutable audit trail events)
```

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Frontend Framework** | React 19 (`react`, `react-dom`) | Modern component architecture, functional hooks |
| **Language** | TypeScript (~6.0) | Strict typing, database entity interfaces, build safety |
| **Bundler & Tooling** | Vite 8 | Fast HMR dev server and optimized production rollup builds |
| **Icons** | Lucide React | Consistent, accessible SVG icon library |
| **Database & Auth** | Supabase (PostgreSQL 15+) | Row Level Security (RLS), JWT auth, PostgREST API |
| **Deployment** | Vercel | Global Edge CDN hosting with SPA rewrite rules (`vercel.json`) |

---

## 4. Local Setup & Installation

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **pnpm**
- A free **Supabase** project account ([supabase.com](https://supabase.com))

### 1. Clone Repository & Install Dependencies
```bash
git clone https://github.com/srikanthmallavarapu2-lang/BrightpathCRM1810.git
cd BrightpathCRM1810/brightpath-crm
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the `brightpath-crm` directory (copied from `.env.example`):
```bash
cp .env.example .env
```
Populate `.env` with your Supabase credentials:
```env
# Supabase Project URL (from Supabase Dashboard -> Project Settings -> API)
VITE_SUPABASE_URL=https://your-project-id.supabase.co

# Supabase Publishable / Anon Client Key
VITE_SUPABASE_ANON_KEY=your-anon-publishable-key
```

> [!WARNING]
> Never commit your real `.env` file or privileged `service_role` keys to Git. The `.gitignore` file is strictly configured to protect local environment files.

### 3. Start Local Development Server
```bash
npm run dev
```
Open [http://localhost:5173/](http://localhost:5173/) in your browser.

### 4. Build for Production
```bash
npm run build
```
This runs TypeScript static verification (`tsc`) followed by Vite production bundling, generating output assets in `dist/`.

---

## 5. Database Schema & SQL Migrations

The database migrations are located in `supabase/migrations/`:
- `001_initial_schema.sql`: Table DDL, constraints, foreign keys, and indexes.
- `002_rls_policies.sql`: Row Level Security policies for `profiles`, `leads`, `follow_ups`, and `activities`.
- `003_seed_data.sql`: Realistic demonstration enquiries, follow-ups, and activity history.

### Applying Migrations via Supabase SQL Editor
1. Open your project on [Supabase Dashboard](https://supabase.com/dashboard).
2. Navigate to **SQL Editor** in the left sidebar.
3. Open `supabase/migrations/001_initial_schema.sql`, paste its content into the SQL Editor, and click **Run**.
4. Repeat for `002_rls_policies.sql` and `003_seed_data.sql`.

### Core Tables Summary
- **`profiles`**: Linked 1:1 with `auth.users(id)`. Defines staff role (`admin`, `manager`, `counsellor`).
- **`leads`**: Student enquiries with `full_name`, `phone`, `email`, `course_interest`, `source`, `status`, `lost_reason`, `assigned_to`, and `created_by`.
- **`follow_ups`**: Tasks scheduled against a lead with `due_at`, `note`, `status` (`pending`, `completed`), and `completed_at`.
- **`activities`**: Append-only audit records with `lead_id`, `actor_id`, `activity_type`, `description`, `metadata`, and `created_at`.

---

## 6. Role-Based Access Control (RBAC) & RLS Matrix

BrightPath CRM enforces security at the PostgreSQL database layer via Row Level Security (RLS):

| Role | Leads Permissions | Follow-ups Permissions | Activities Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | Full access to create, view, edit, and delete all enquiries | Full access to schedule, complete, and delete any task | Can view and audit all interaction history |
| **Manager** | Full access to team enquiries and reassignment | Can monitor and assign all team follow-ups | Can review team-wide activity logs |
| **Counsellor** | Can view and edit assigned enquiries or enquiries they created | Can view and complete tasks assigned to them | Can log notes and view history for permitted leads |

---

## 7. Metrics & KPI Dictionary

| Metric | Business Definition | Database Formula |
| :--- | :--- | :--- |
| **Total Leads** | Total accessible enquiries in the pipeline | `COUNT(*)` from `leads` under active RLS |
| **New Enquiries** | Prospective students awaiting initial contact | `COUNT(*)` from `leads WHERE status = 'New'` |
| **Converted Students** | Enrolled admissions | `COUNT(*)` from `leads WHERE status = 'Converted'` |
| **Overdue Follow-ups** | Tasks past their scheduled due date | `COUNT(*)` from `follow_ups WHERE status = 'pending' AND due_at < NOW()` |
| **Conversion Rate** | Admissions conversion efficiency percentage | `totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : 0` |
| **Added Today** | Volume of enquiries received in current 24h cycle | `COUNT(*)` where `created_at` matches user's local date |

---

## 8. Vercel Production Deployment Guide

Deploying BrightPath CRM to Vercel takes less than 3 minutes:

### Step 1: Push Code to GitHub
Ensure all code is committed and pushed to your GitHub repository:
```bash
git push origin main
```

### Step 2: Import Project in Vercel
1. Log in to [Vercel](https://vercel.com/) with your GitHub account.
2. Click **Add New...** &rarr; **Project**.
3. Select your repository: `BrightpathCRM1810`.

### Step 3: Configure Project Settings
- **Framework Preset**: `Vite` (automatically detected).
- **Root Directory**: If your repository holds the app in `brightpath-crm`, set the Root Directory to `brightpath-crm`.
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Step 4: Add Environment Variables
Under the **Environment Variables** section in the Vercel setup screen, add:
1. `VITE_SUPABASE_URL` = `https://your-project-id.supabase.co`
2. `VITE_SUPABASE_ANON_KEY` = `your-anon-publishable-key`

### Step 5: Deploy & Verify
1. Click **Deploy**.
2. Vercel will run the production build and deploy your app to global Edge CDN locations.
3. Once finished, click the generated deployment URL (e.g. `https://brightpath-crm-xyz.vercel.app`).
4. Test sign-in, lead creation, follow-up scheduling, and dashboard metrics on the live URL.

---

## 9. Testing & Quality Assurance

Refer to [`TESTING_CHECKLIST.md`](./TESTING_CHECKLIST.md) for the complete 8-suite manual and automated test execution checklist covering all user stories and acceptance criteria.

---

## 10. Limitations & Production Considerations

- **Fictional Data**: The workshop dataset contains synthetic demonstration records. Do not enter real sensitive student records in demo environments.
- **Email Confirmations**: If testing account signups rapidly, disable "Confirm email" in Supabase Auth settings to avoid SMTP rate-limit bottlenecks.
- **Future Roadmap**:
  - Direct WhatsApp and SMS messaging integrations.
  - Automated webhook triggers for course fee payments.
  - Advanced counsellor conversion pacing and quota leaderboards.

---

*BrightPath CRM &copy; 2026. Handover documentation for training and production deployment.*
