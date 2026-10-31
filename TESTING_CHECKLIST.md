# BrightPath CRM — Master Quality Assurance & Testing Checklist

> **Specification Reference**: `BrightPath_CRM_Full_Master_Build_Prompt.docx`  
> **Environment**: React 19 + TypeScript + Vite + Supabase Cloud (PostgreSQL 15+)  
> **Status**: All Suites Verified & Passing (PASS)

---

## Suite 1: Authentication & Role Lifecycle

| Test ID | Test Scenario | Steps / Input | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **AUTH-01** | Account Registration | Open Auth Modal &rarr; Select "Create an Account" &rarr; Provide Name, Email, Password &rarr; Submit | New user is created in `auth.users` and linked in `profiles` with default role `counsellor`. Session opens immediately with success toast. | **PASS** |
| **AUTH-02** | User Sign-In | Open Auth Modal &rarr; Enter valid staff email and password &rarr; Submit | User authenticates via Supabase Auth; JWT session is stored in localStorage; header reflects staff name & role badge. | **PASS** |
| **AUTH-03** | Invalid Credentials | Attempt sign-in with wrong password or non-existent email | Form shows field-level error message; submission is blocked; no crash or unhandled promise rejection. | **PASS** |
| **AUTH-04** | Session Persistence | Sign in &rarr; Refresh browser tab (`F5`) | User remains authenticated without re-prompt; profile details are restored seamlessly from Supabase. | **PASS** |
| **AUTH-05** | User Sign-Out | Click user profile in header &rarr; Click "Sign Out" | Session token is cleared; app returns to Guest mode banner; toast confirms sign-out. | **PASS** |
| **AUTH-06** | Guest Access Restrictions | Navigate app while signed out | Header displays "Guest Counsellor"; banner explains live database mode; public records viewable if permitted. | **PASS** |

---

## Suite 2: Student Enquiry (Lead) Management

| Test ID | Test Scenario | Steps / Input | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **LEAD-01** | Create Valid Enquiry | Click "Record Enquiry" &rarr; Fill Full Name, Phone, Course, Source, Notes &rarr; Save | Enquiry record persists in Supabase `leads`; table updates immediately; success toast displays student name. | **PASS** |
| **LEAD-02** | Form Validation | Submit "Record Enquiry" modal with blank Full Name or Phone | Form prevents submission; red error alert highlights missing mandatory fields. | **PASS** |
| **LEAD-03** | Edit Enquiry Details | Click pencil icon on lead row &rarr; Update course interest or contact info &rarr; Save | Record updates in PostgreSQL; table reflects updated data; success toast confirms update. | **PASS** |
| **LEAD-04** | Instant Search Filter | Type partial student name or phone number into search bar | Table filters instantaneously on client side without full page reload. | **PASS** |
| **LEAD-05** | Status & Source Multi-Filter | Select status `Qualified` and source `Website Form` | Table filters to show only matching enquiries; lead count updates accurately. | **PASS** |
| **LEAD-06** | Reset Filters Action | Click "Reset" button when filters are active | All dropdowns return to `all`; search query is cleared; full enquiry dataset is restored. | **PASS** |
| **LEAD-07** | Mandatory Lost Reason Modal | Select status `Lost` on lead row or dossier modal | Modal intercepts action prompting for mandatory lost reason; status change is cancelled if dismissed without reason. | **PASS** |
| **LEAD-08** | Lead Deletion Confirmation | Click trash icon (Admin/Manager role) &rarr; Confirm prompt | Enquiry is deleted from database; lead count decrements; info toast confirms deletion. | **PASS** |

---

## Suite 3: Follow-up Scheduling Engine & Overdue Logic

| Test ID | Test Scenario | Steps / Input | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **FOL-01** | Schedule New Follow-up | Click "+ Schedule Task" &rarr; Select lead, due date/time, and note &rarr; Save | Follow-up task is inserted into `follow_ups` with `status = 'pending'`; audit event is logged. | **PASS** |
| **FOL-02** | Automated Overdue Flagging | View task where `due_at < NOW()` and `status = 'pending'` | Task displays red `OverdueBadge` with humanized interval (e.g. `Overdue by 2d 5h`). | **PASS** |
| **FOL-03** | Tab Filtering | Switch between "All Pending", "Overdue", "Due Today", and "Completed" | Tasks filter correctly into their respective temporal buckets; badge counters match tab contents. | **PASS** |
| **FOL-04** | 1-Click Task Completion | Click "Done" / Checkmark on a pending follow-up | Task status moves to `completed`; `completed_at` timestamp is set to `NOW()`; task moves out of Overdue immediately. | **PASS** |
| **FOL-05** | Task Rescheduling | Click "Reschedule" &rarr; Select new date & optional reason &rarr; Submit | Task due date updates in Supabase; status resets to pending; audit trail records reschedule note. | **PASS** |
| **FOL-06** | Lead Dossier Linking | Click student name on follow-up card | Opens Student Enquiry Dossier modal displaying full student history and other active tasks. | **PASS** |

---

## Suite 4: Activity History & Audit Trail

| Test ID | Test Scenario | Steps / Input | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **ACT-01** | Lead Creation Audit Log | Create a new student lead | System automatically records `lead_created` activity row tagged with current user ID and metadata. | **PASS** |
| **ACT-02** | Status Transition Logging | Change lead status from `New` to `Contacted` | Generates immutable `status_changed` activity with description and timestamp. | **PASS** |
| **ACT-03** | Lost Reason Metadata | Mark lead as `Lost` with reason "Fee constraint" | `status_changed` activity records lost reason in JSONB metadata and displays red callout chip in timeline. | **PASS** |
| **ACT-04** | Follow-up Lifecycle Audit | Schedule and complete a follow-up | Records `follow_up_scheduled` and `follow_up_completed` events with respective task descriptions. | **PASS** |
| **ACT-05** | Counsellor Note Logging | In Student Dossier &rarr; Type discussion note &rarr; Click "Post Note" | Appends note to lead summary and inserts `note_added` activity event with author attribution. | **PASS** |
| **ACT-06** | Relative Timestamps | Inspect activities in timeline | Displays humanized relative time (`just now`, `5m ago`, `Yesterday at 14:30`) with exact timestamp on hover. | **PASS** |

---

## Suite 5: Operational Analytics & Dashboard Metrics

| Test ID | Test Scenario | Steps / Input | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **DASH-01** | Total Leads Reconciliation | Compare "Total Leads" KPI against count in Leads table | Numbers match 100% exactly against accessible Supabase database records under RLS. | **PASS** |
| **DASH-02** | New Enquiries KPI | Compare "New Enquiries" KPI against Leads table filtered by `New` | Exact count matches without discrepancy. | **PASS** |
| **DASH-03** | Overdue Follow-ups KPI | Compare "Overdue Follow-ups" KPI against Overdue tab count | Count reconciles 100% with pending follow-ups where `due_at < NOW()`. Card switches to red alert theme when > 0. | **PASS** |
| **DASH-04** | Conversion Rate Formula | Inspect Conversion Rate card | Displays `(Converted / Total) * 100` formatted to 1 decimal place with zero division safeguard. | **PASS** |
| **DASH-05** | Urgent Action Center | View Action Center when overdue tasks exist | Lists top 5 urgent overdue items with student name, course, overdue badge, phone, and assignee. | **PASS** |
| **DASH-06** | Action Center 1-Click Done | Click "Mark Done" directly in Action Center | Follow-up is marked completed; action center and dashboard KPIs refresh dynamically without full page reload. | **PASS** |
| **DASH-07** | Drill-Down Filtering | Click on "Pipeline by Status" bar or "Leads by Source" channel | Navigates to Leads view pre-filtered by the clicked status stage or acquisition channel. | **PASS** |
| **DASH-08** | Manual KPI Sync | Click "Sync KPIs" button in dashboard header | Button displays spinning refresh icon; re-queries Supabase in real-time and refreshes all metrics. | **PASS** |

---

## Suite 6: Global Error Resilience & Toast System

| Test ID | Test Scenario | Steps / Input | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **ERR-01** | React Error Boundary | Trigger an unhandled component rendering error | App displays reassuring fallback screen ("Something went wrong") with "Try Again" and "Return to Home" buttons; no white screen crash. | **PASS** |
| **ERR-02** | Diagnostic Toggle | Click "Show technical diagnostics" on Error Boundary screen | Collapses/expands formatted error name and stack trace without leaking data in normal UI. | **PASS** |
| **ERR-03** | Success Toast Notification | Create lead or complete task | Floating green toast notification slides in at bottom-right with checkmark icon and auto-dismisses after 4s. | **PASS** |
| **ERR-04** | Error Toast Notification | Simulate database or validation failure | Red error toast displays descriptive message; no crude browser `window.alert()` popup appears. | **PASS** |
| **ERR-05** | Toast Manual Dismiss | Click `X` icon on any active toast item | Toast dismisses immediately from the active queue. | **PASS** |
| **ERR-06** | Screen Reader Accessibility | Screen reader inspection of toast notifications | Container announces notifications via `role="status"` and `aria-live="polite"`. | **PASS** |

---

## Suite 7: WCAG 2.1 AA Accessibility & Responsive Polish

| Test ID | Test Scenario | Steps / Input | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **A11Y-01** | Skip to Content Link | Load app &rarr; Press `Tab` key as first interaction | Prominent blue "Skip to main content" banner appears; pressing `Enter` moves focus past sidebar directly to `<main id="main-content">`. | **PASS** |
| **A11Y-02** | Keyboard Focus Ring | Press `Tab` repeatedly through buttons, inputs, tabs | All interactive elements display a high-contrast 2px royal blue outline (`:focus-visible`). | **PASS** |
| **A11Y-03** | Modal Escape Key Close | Open any modal (`LeadDetailModal`, `LeadFormModal`, `RescheduleModal`, etc.) &rarr; Press `Escape` | Modal closes immediately and cleanly without submitting form. | **PASS** |
| **A11Y-04** | Modal Accessibility Semantics | Inspect modal elements in DOM | Modals contain `role="dialog"`, `aria-modal="true"`, and `aria-labelledby`. | **PASS** |
| **RESP-01** | Mobile Viewport (375px) | Inspect app on mobile resolution (375px & 414px) | Sidebar collapses into mobile drawer; leads table has horizontal momentum scroll; modals fit 100% viewport width without clipping. | **PASS** |
| **RESP-02** | Tablet Viewport (768px) | Inspect app on tablet resolution (768px iPad) | Two-column cards align neatly; header icons wrap gracefully; drawer toggle operates smoothly. | **PASS** |
| **RESP-03** | Desktop Viewport (1440px) | Inspect app on widescreen resolution | Sidebar toggle collapses to icon mode (`78px`); spacious SaaS layout with crisp typography. | **PASS** |

---

## Suite 8: Production Build & Vercel Deployment

| Test ID | Test Scenario | Steps / Input | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **DEP-01** | TypeScript Static Check | Run `npm run build` | `tsc` runs cleanly with 0 TypeScript compiler warnings or errors. | **PASS** |
| **DEP-02** | Vite Production Bundler | Inspect build output in `dist/` | Generates `index.html`, minified CSS (`assets/index-*.css`), and optimized JS chunks (`assets/index-*.js`). | **PASS** |
| **DEP-03** | Vercel SPA Routing Configuration | Inspect `vercel.json` | Contains valid JSON rewrite rules redirecting `/(.*)` to `/index.html` preventing 404 errors on deep routes. | **PASS** |
| **DEP-04** | Environment Variables Protection | Inspect `.gitignore` and `git status` | `.env` is ignored; only `.env.example` placeholder template is committed. | **PASS** |
| **DEP-05** | Git Synchronization | Inspect `git log` and `git remote -v` | All commits pushed to `https://github.com/srikanthmallavarapu2-lang/BrightpathCRM1810.git` on branch `main`. | **PASS** |

---

### Master QA Sign-off
**Overall Result**: 100% of test cases passed across all 8 suites.  
**Build Status**: `npm run build` &rarr; Exit Code 0 (Production Ready).

