# 31 — Project Progress Status

> **Purpose.** Snapshot of where the Saudi Car Rental Platform stands at the latest known commit so a fresh AI/Claude session can resume work without being re-briefed on the full history.
> Update this file at the end of every approved task.

---

## 1. Project Identity

- **Repository:** https://github.com/Abdelhamidzain/saudi-car-rental
- **Product:** Saudi car rental **comparison and lead generation** platform.
- **Customer-facing experience:** Arabic, RTL. Customers compare offers and submit rental requests.
- **MVP positioning:**
  - It **is** a directory / search / comparison / request-routing platform.
  - It **is not** a booking platform, a payment platform, or a company that rents cars directly.
  - Prices are always shown as *starts-from*. The rental company contacts the customer directly to confirm final price and availability.

---

## 2. Core Non-Negotiable Rules

These rules override anything else. They come from `ai-docs/01_NON_NEGOTIABLE_RULES.md`.

- **No booking or payment** in MVP. Do not add booking/payment architecture.
- **No final-price guarantees.** All prices are *starts-from* only.
- **Rental company confirms** price and availability with the customer.
- **Customer data is never public.** Phone numbers and lead details stay inside the admin dashboard.
- **Manual workflow first, automation later.** No n8n / WhatsApp API yet.
- **Admin dashboard before company dashboard.** Company dashboard is Phase 2.
- **No auto-selected companies.** `selected_company_id` and `selected_offer_id` remain `NULL` on every lead created from the current static pages. They are reserved for a future DB-driven offer page.
- **Every lead action is logged** in `lead_activity_logs` with timestamp + actor.
- **Negative trust labels never shown publicly.** Internal scoring only.
- **Secrets stay local.** `.env.local` and `SUPABASE_SERVICE_ROLE_KEY` are never committed, never printed, never exposed to the browser.

---

## 3. Infrastructure Status

- **Git workflow:** direct push to `main`. No PRs in the current phase.
- **Latest known `main` commit:** `4319fcc` — *feat: add admin dashboard foundation*.
- **Hosting:** local dev today; Vercel target.
- **Supabase project (the only one to use):**
  - Name: `saudi-car-rental`
  - Project ref: `ygzdyoxhvhfduxsqrgmg`
  - Region: `eu-central-1` (Frankfurt)
  - Organization: **Zain Studio**
- **Do NOT touch** the older `Za3tr's Project` Supabase project in the same organisation — it is unrelated to this codebase.

---

## 4. Completed Tasks

### Task 1 — Supabase Database Foundation
**Commit:** `e3ff77a` (merged via PR #1).
- 18 migrations under `supabase/migrations/20260519000001…000018`.
- Tables: `cities`, `airports`, `companies`, `branches`, `users`, `car_categories`, `cars`, `offers`, `leads`, `lead_company_routing`, `lead_customer_followups`, `lead_activity_logs`, `company_quality_metrics`.
- Enums: `user_role`, `user_status`, `entity_status`, `public_status`, `trust_level`, `price_status`, `availability_status`, `approval_status`, `lead_status`, `request_type`, `lead_intent_score`, `company_response_status`, `followup_channel`, `price_match_status`, `customer_outcome`, `actor_type`.
- Triggers:
  - `generate_lead_number` (BEFORE INSERT on `leads`) — collision-safe `SCR-YYYYMM-NNNNN` generator via `pg_advisory_xact_lock`.
  - `set_updated_at` on every table with an `updated_at` column.
  - `handle_new_user` on `auth.users` → creates matching `public.users` row with `role='viewer'`.
- Hard constraints on `leads`:
  - `customer_phone ~ '^\+9665\d{8}$'`
  - `return_date >= pickup_date`
  - `rental_days >= 1`
  - `consent_accepted = true`
- **RLS:** enabled on every table with **no active policies**. All reads/writes go through the service-role client on the server. Future Phase-2 policies are scaffolded as comments in migration `…018`.

### Task 1.1 — Security Hardening
**Commit:** `92046f8` (merged via PR #2).
- Migration `…019_harden_function_security.sql`.
- All custom functions pinned to `set search_path = public` to prevent search-path attacks.
- Internal-only RPCs have execute privileges aligned with the service-role usage model.

### Task 2 — Seed Scripts and Seed Data
**Commit:** `a6d33f3` (merged via PR #2).
- `scripts/seed.ts` entry + `scripts/seed/*` modules.
- Runnable via `npm run db:seed` (uses `--env-file=.env.local --import tsx`).
- Idempotent — re-running inserts zero new rows.
- **Seeded counts:**
  - cities: **6** (riyadh, jeddah, dammam, makkah, madinah, khobar)
  - airports: **5**
  - car_categories: **7**
  - cars: **29**
  - companies: **6**
  - branches: **11**
  - offers: **319**
- **Skipped cities** (referenced by partner branches but not in our supported set): `abha`, `tabuk`. Seed emits a warning and proceeds.
- **`weekly_price_from` seed formula:**
  ```
  weekly_price_from = round(daily_price_from × 7 × 0.85, 2)
  ```
  **This formula is seed/demo only.** Once a real offer is created/edited via admin or partner workflow, the stored DB value is the authoritative source of truth. Never re-derive `weekly_price_from` from `daily_price_from` in production code.

### Task 2.1 — AI Knowledge Base and Claude Instructions
**Commit:** `645acbf`.
- Added the full `ai-docs/` knowledge base (30 numbered Markdown files + `README.md`).
- `CLAUDE.md` expanded into a real instruction file. Still begins with `@AGENTS.md` so the Next.js agent rules are loaded too.

### Housekeeping — macOS Metadata Ignore
**Commit:** `ab007f2`.
- `.gitignore` now ignores `.DS_Store` and `._*` AppleDouble files so they stop polluting `git status`.

### Task 3 — Lead Form Backend
**Commit:** `a651975`.
- Public form (`/`, `/sa/[city]`, `/sa/[city]/[category]`, `/sa/[city]/[category]/[car]`, `/sa/airports/[airport]`) now submits to a Supabase-backed server action.
- New migration `…020_create_lead_with_log_rpc.sql` — atomic `create_lead_with_activity_log(...)` RPC.
- Saudi phone normalisation (`05XXXXXXXX`, `5XXXXXXXX`, `+9665…`, `00966…`, Arabic-Indic digits `٠-٩`) → `+9665XXXXXXXX`.
- Implicit consent: clicking submit constitutes acceptance of the canonical Arabic notice in [src/lib/leads/consent.ts](../src/lib/leads/consent.ts). Server always stores `consent_accepted=true`, `consent_text_version='v1-2026-05'`, `consent_ip` (from `x-forwarded-for`), `consent_accepted_at` (DB default).
- Captures `source_page` (pathname + query) and UTM params (`utm_source|medium|campaign|content|term`).
- Honeypot field returns a fake-success sentinel (`SCR-000000-00000`) without a DB write.
- Success UI displays the real `lead_number` LTR/monospace.
- **All current-form submissions use `request_type = 'best_offer'`.** `selected_company_id`, `selected_offer_id` are hard-coded `null` in the RPC call. `selected_car_id` is resolved from the slug on car pages (context only, not company auto-selection).
- Inline Arabic error block replaces the previous `alert()`.

### Task 4 — Admin Dashboard Foundation
**Commit:** `4319fcc` (current `main` HEAD).
- Auth: Supabase email/password with cookie sessions (`@supabase/ssr`).
- New migration `…021_create_lead_status_change_rpc.sql` — atomic `update_lead_status_with_log(...)` RPC.
- Routes (all English, LTR):
  - `/admin/login` — sign-in / sign-up.
  - `/admin/leads` — latest-50 list with status filter.
  - `/admin/leads/[id]` — full detail card + status-change form + activity-log timeline.
- Middleware (`src/middleware.ts`) gates `/admin/:path*`; role checks happen in server components via `requireRole(...)` and in server actions via `assertRole(...)`.
- **First-admin bootstrap is manual.** New sign-ups land in `public.users` with `role='viewer'`. The operator promotes them via the SQL Editor:
  ```sql
  update public.users set role = 'admin' where email = 'you@example.com';
  ```
- **Role matrix:**
  - `owner`, `admin`: view + status updates.
  - `editor`: view only.
  - `viewer`, `company_*`, unauthenticated: redirected to `/admin/login`.
- Route-group refactor: public pages moved into `src/app/(site)/`, admin into `src/app/(admin)/`. **Public URLs unchanged** (route groups don't show in URLs).

---

## 5. Current Database State

- **Seed data:** present and idempotent — see counts above.
- **Real leads:** one or more rows may exist in `public.leads` from earlier browser smoke tests. **Do NOT delete leads** unless the user explicitly asks. Activity logs cascade with the lead.
- **Users:** one or more rows may exist in `public.users` and `auth.users` after the admin auth smoke test. Treat as production data.
- **Lead numbers:** the trigger uses `MAX(...) + 1` per month; deleted rows do not free their numbers.

---

## 6. Environment and Secret Rules

Required env vars (values live only in `.env.local` and Vercel project settings):

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_PROJECT_REF`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Rules:
- `.env.local` exists **only locally**. It is in `.gitignore` and must never be committed.
- `SUPABASE_SERVICE_ROLE_KEY` is **server-only**. It is read solely inside [src/lib/supabase/server.ts](../src/lib/supabase/server.ts) (re-exported as `getSupabaseAdminClient` from `src/lib/supabase/admin.ts`).
- No `'use client'` file may import the admin/service-role client. Modules that import it carry either `import "server-only";` or `"use server";`.
- The anon key + URL are safe to ship to the browser; they are gated by RLS (which currently denies everything to non-service-role callers, by design).
- Never print, log, or echo secret values into shell output or commit messages.

---

## 7. Current Development Workflow

1. **Branch:** work directly on `main`.
2. **Before starting a task:** `git pull origin main`.
3. **Before committing:**
   - `npx tsc --noEmit`
   - `npm run build`
   - `npm run db:seed` (idempotency check)
4. **Stage explicitly** — never `git add .` or `git add -A`. Use the specific paths agreed in the task plan so AppleDouble / local config files cannot slip in.
5. **Commit only the approved scope.** If something else is dirty, leave it unstaged or surface it to the user.
6. **Push** directly to `main` after the user approves the commit report.
7. **Migrations** are applied to the remote Supabase project via the Supabase MCP `apply_migration` tool, with the SQL also committed to `supabase/migrations/`.

---

## 8. What Has Not Been Built Yet

Capability gaps (do not assume any of these exist):

- Company assignment to a lead.
- WhatsApp message generation from lead data.
- "Copy WhatsApp Message" / "Open WhatsApp" buttons.
- Company follow-up form / table data entry.
- Customer follow-up form / table data entry.
- Admin reports / overview dashboard.
- Company dashboard (Phase 2).
- Companies CRUD in admin.
- Branches CRUD in admin.
- Cars CRUD in admin.
- Offers CRUD in admin.
- Public pages reading from Supabase (still using `src/lib/data.ts` static arrays).
- Rate limiting on the lead-form endpoint.
- Duplicate lead detection.
- Password reset flow.
- Email verification flow.
- n8n / automation pipelines.
- Booking / payment.
- Mobile app.

---

## 9. Recommended Next Tasks

### Task 4.1 — Lead Operations MVP (**recommended next**)

Scope:
- Manually assign a lead to a company / branch from the admin detail page.
- Generate a WhatsApp message from lead data (lead number, customer phone, dates, city, category, selected offer if any, "company confirms availability/price" disclaimer).
- "Copy WhatsApp Message" button (writes a `lead_activity_logs` row, `event_type='whatsapp_copied'`).
- "Open WhatsApp" button — opens `https://wa.me/...?text=...` and writes `event_type='whatsapp_opened'`.
- Insert a `lead_company_routing` row at assignment time, snapshot the `generated_message`.
- Activity log entries for: lead assigned, WhatsApp copied, WhatsApp opened, sent_to_company, manual status changes (already covered by Task 4 RPC).

### Task 3.1 — Anti-Spam and Duplicate Detection (alternative)

Scope:
- Rate-limit `/admin/login` and the public lead-form server action (per-IP bucket, simple `lead_rate_limits` table or Vercel KV).
- Duplicate-lead warning at admin level (same phone within 24h; same phone + city + dates).
- Honeypot already exists in the lead form; this task tightens the layer around it.

**Recommended priority: Task 4.1.** It unblocks the founder's manual workflow end-to-end. Task 3.1 is a defence layer that becomes urgent only once the form sees real traffic.

---

## 10. Short Context for Future AI Sessions

> Saudi car rental **comparison and lead-generation** platform. MVP only: no bookings, no payments, no final-price guarantees, no auto-routing. Customer fills an Arabic form on the public site → lead saved in Supabase with an atomic activity-log entry → admin reviews the lead in `/admin/leads`, can change status (also logged atomically). Database schema, seed data, lead form backend, and admin foundation (auth + leads list + lead detail + status updates) are **done and on `main`** at commit `4319fcc`. Next likely task is **Task 4.1 — Lead Operations MVP**: manual company assignment + WhatsApp message generation with copy/open buttons + matching activity-log entries. Public pages still read from `src/lib/data.ts`; migrating them to Supabase is **not** in scope yet. Service-role key is server-only; admin pages use cookie auth via `@supabase/ssr` and gate roles app-side.

---

## 11. Instructions for Claude / AI Assistants

Before implementing anything, read in this order:

1. `CLAUDE.md`
2. `ai-docs/01_NON_NEGOTIABLE_RULES.md`
3. `ai-docs/30_AI_CONTEXT_REFRESH_SUMMARY.md`
4. `ai-docs/31_PROJECT_PROGRESS_STATUS.md` (this file)
5. The task-specific file from `ai-docs/` (e.g. `08_ADMIN_DASHBOARD_SPEC.md`, `19_API_AND_SERVER_ACTIONS_SPEC.md`, `20_DATABASE_MIGRATION_AND_SEED_PLAN.md`).

Then follow the standard pre-flight in `CLAUDE.md`: inspect the codebase, present a plan, list files to change, wait for approval on anything non-trivial, run `tsc` + `build` after edits, summarise changes and risks.

Keep this file accurate. After each completed task, add a new entry under **Completed Tasks** and update **Recommended Next Tasks**.
