# BrightPath CRM — Supabase Database Setup & Migrations Guide

This guide walks you through applying the database schema, constraints, Row Level Security (RLS) policies, and demo seed data into your Supabase project.

---

## 1. Apply Schema Migration (`001_initial_schema.sql`)

1. Open your [Supabase Project Dashboard](https://supabase.com/dashboard).
2. Select your project: **`xurqhphtcucdgxfrqiff`**.
3. In the left navigation bar, click on **SQL Editor** (icon with `>_`).
4. Click **New Query** (or the green `+` icon).
5. Open [`supabase/migrations/001_initial_schema.sql`](file:///c:/Users/MY%20PC/Projects/BrightPath-CRM-1810/brightpath-crm/supabase/migrations/001_initial_schema.sql) in this repository, copy its entire contents, and paste it into the SQL Editor.
6. Click **Run** (or press `Ctrl + Enter` / `Cmd + Enter`).
7. **Expected Result**: A green notification reading:  
   `Success. No rows returned.`

---

## 2. (Optional) Apply Demo Seed Data (`seed.sql`)

To populate your CRM with sample academy leads, follow-ups, and audit history:
1. In the Supabase **SQL Editor**, click **New Query**.
2. Copy the contents of [`supabase/seed.sql`](file:///c:/Users/MY%20PC/Projects/BrightPath-CRM-1810/brightpath-crm/supabase/seed.sql) and paste into the editor.
3. Click **Run**.
4. **Expected Result**:  
   `Success. Rows affected: 5 (leads), 4 (follow-ups), 3 (activities)`.

---

## 3. Verify Created Tables & RLS Policies

1. In the left sidebar, click on **Table Editor** (grid icon).
2. Confirm the 4 public tables exist:
   * **`profiles`** (🔒 RLS Enabled)
   * **`leads`** (🔒 RLS Enabled)
   * **`follow_ups`** (🔒 RLS Enabled)
   * **`activities`** (🔒 RLS Enabled)
3. Under **Authentication** $\rightarrow$ **Providers**, verify that **Email** is enabled.

---

## 4. Administrator Bootstrap Procedure

When a team member signs up via the app, they receive the default least-privileged role (`counsellor`).  
To promote a user to `admin` or `manager`:
1. Open the Supabase **SQL Editor**.
2. Run this query (replace with the user's registered email):
   ```sql
   UPDATE public.profiles
   SET role = 'admin'
   WHERE id = (
     SELECT id FROM auth.users WHERE email = 'admin@brightpath.edu'
   );
   ```
