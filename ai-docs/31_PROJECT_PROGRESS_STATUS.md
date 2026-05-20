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
**Commit:** `4319fcc`.
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

### Task 4.0.1 — Admin Dashboard UI Alignment
**Commit:** `4afc44b`.
- New `src/app/(admin)/admin.css` holding the full admin design system (palette mirrors the public-site tokens: navy `#0D1B2A`, gold `#D4A853`, warm bg `#FAFAF7`, Cairo/Tajawal fonts).
- Sidebar restyled (brand row with gold dot, gold active-nav highlight), top bar restyled (email + uppercase gold role pill + ghost sign-out button), cards/inputs/buttons aligned with public `.feature-card`/`.form-submit` patterns.
- Login card gets a thin gold gradient top-border (echoes `.glass-form::before`).
- Status badges muted-tinted palette; lead detail uses a two-column grid; activity log rendered as a true gold-dot timeline.
- Pure CSS / JSX restyle — no auth, role, query, or RPC logic touched. Public site untouched.

### Task 4.1 — Lead Operations MVP
**Commit:** `8ade802` · **UX fix:** `64343f3`.
- Manual company/branch assignment from `/admin/leads/[id]`.
- New migration `…022_create_lead_routing_rpcs.sql` — two atomic RPCs:
  - `assign_lead_to_company_with_log` — inserts a `lead_company_routing` row, updates `leads.assigned_company_id` / `assigned_branch_id` / `assigned_whatsapp`, writes a `lead_assigned_to_company` activity log entry.
  - `record_routing_sent_with_log` — marks routing `company_response_status='sent'`, sets `sent_at` + `sent_by_user_id`, optionally auto-advances `leads.status` from `new`/`reviewed` → `sent_to_company` (with a paired `lead_status_changed` log), writes the primary `lead_sent_to_company` log.
- New admin routing helpers under `src/lib/admin/routing/*`: company/branch pickers, routing list, atomic-RPC wrappers, and a pure-function Arabic **WhatsApp message builder** following `ai-docs/24_MESSAGING_TEMPLATES.md` (best-offer + selected-offer templates; the selected-offer path is unreachable from current forms but ready for the future DB-driven offer page).
- New `RoutingPanel` client component on the lead detail page with: company dropdown → branch dropdown → live Arabic message preview → **Assign to company** button → per-routing **Copy message**, **Open WhatsApp** (`https://wa.me/<E.164>?text=…`), **Mark as sent** actions.
- Activity log events added by this task:
  - `lead_assigned_to_company`
  - `whatsapp_copied`
  - `whatsapp_opened`
  - `lead_sent_to_company`
  - `lead_status_changed` (when "Mark as sent" auto-advances from `new`/`reviewed` to `sent_to_company`)
- All five events store `actor_type='admin'` + the authenticated `actor_id` and embed `routing_id` in `metadata_json` where relevant.
- **Closing line of every WhatsApp message** always says "*فضلاً تواصلوا مع العميل لتأكيد التوفر والسعر النهائي*" — never implies confirmed booking or guaranteed final price.
- **Manual-first preserved:** no WhatsApp Business API, no n8n, no automation, no booking/payment, no company dashboard, no auto-selected companies.
- **Reassignment + WhatsApp deep-link UX fix (commit `64343f3`):**
  - Routing panel restructured into three sections: **Assign / Reassign** (always visible — the heading flips to "Reassign" once at least one routing exists, and an inline notice explains that a new routing row will be created and the lead pointer will advance); **Current routing** (the latest, green-highlighted with full Copy / Open WhatsApp / Mark-as-sent actions); **Previous routings (N)** (older history rows preserved for audit). The DB layer already supported reassignment — only the UI needed to make it obvious.
  - **Open WhatsApp** is now a real `<a href="https://wa.me/9665XXXXXXXX?text=…" target="_blank" rel="noopener noreferrer">` instead of `window.open(...)`. Popup-blocker friction is gone and WhatsApp reliably opens with the Arabic message prefilled (newlines, `+966...`, and `#` characters all survive `encodeURIComponent`).
  - When `branch.whatsapp_number` is null: Open WhatsApp is rendered as a disabled button + a visible "No WhatsApp number available for this branch — use Copy message and paste it into WhatsApp manually" notice. Copy and Mark-as-sent remain available.
  - Defensive fallback: if a routing row's snapshotted `generated_message` is somehow empty, the card rebuilds the Arabic message client-side from the live lead context + the routing's joined company/branch before exposing Copy / Open WhatsApp.
  - No schema / RPC / server-action changes — pure UI / link-behaviour fix. Files touched: `src/app/(admin)/admin/leads/[id]/routing-panel.tsx`, `src/app/(admin)/admin.css`.

### Task 4.2 — Customer Notes + Lead Quality
**Commit:** `e66d6eb`.
- New migration `…023_add_lead_customer_notes.sql`:
  - Adds nullable `customer_notes text` on `public.leads` with a CHECK constraint capping length at 500 characters.
  - Drops the old 21-arg `create_lead_with_activity_log` signature and recreates it with a trailing `p_customer_notes text default null` parameter, so notes are persisted in the same transaction as the lead row + activity-log entry.
- Public lead form gains an optional 2-row Arabic textarea labelled "ملاحظات إضافية (اختياري)" with placeholder examples (child seat, delivery to specific location, monthly rental). `maxLength={500}` on the client; server-side sanitizer mirrors the cap.
- Server-side sanitization in `src/lib/leads/validate.ts`:
  - Normalize CRLF / bare CR → LF.
  - Strip ASCII control chars except newline (`\n`) and tab (`\t`).
  - Trim leading/trailing whitespace.
  - Empty result → stored as `NULL`.
  - More than 500 chars after sanitization → rejected with `field: customer_notes, reason: too_long`.
- Admin lead detail page now renders a "Customer notes" row in the Details `<dl>` with `white-space: pre-wrap` so line breaks survive, and passes `lead.customer_notes` into `RoutingPanel.messageContext`. The WhatsApp message builder already gated the "ملاحظات العميل" section on truthiness — it now emits the section whenever the customer typed something, omits it otherwise.
- No URL/profanity filtering — deferred to Task 3.1.
- No admin-side notes editing — captured at submission only.

### Task 3.1 — Anti-Spam and Duplicate Detection
**Commit:** `97b0228`.
- **IP rate limit** ([src/lib/leads/rate-limit.ts](../src/lib/leads/rate-limit.ts)):
  - `MAX_LEADS_PER_IP_PER_HOUR = 10` over a 1-hour rolling window.
  - Counts leads via `public.leads.consent_ip` (existing column + index — no new infrastructure).
  - Blocks the 11th attempt with the inline Arabic message *"تم تجاوز الحد المسموح من المحاولات. يرجى المحاولة مرة أخرى بعد ساعة."* and no DB write.
  - Skips the check when `consent_ip` is null (proxy stripped the header) — never punishes a customer for missing data we couldn't extract.
  - Fail-open on query error: a transient DB problem cannot block legitimate submissions.
- **Duplicate phone detection** ([src/lib/leads/duplicate-detect.ts](../src/lib/leads/duplicate-detect.ts)):
  - After the lead RPC succeeds, looks up sibling leads by normalized `customer_phone` in the last 24h, limit 5, newest first, excluding the new lead.
  - **Never blocks** the new lead (per `ai-docs/06_LEAD_MANAGEMENT_WORKFLOW.md`'s manual-first rule).
  - When ≥1 sibling exists, writes one `public.lead_activity_logs` row on the new lead: `event_type='lead_potential_duplicate'`, `actor_type='system'`, `title='Potential duplicate detected'`, with `metadata_json` containing `sibling_count` and a `siblings` array (each entry = `{id, lead_number, created_at, status}`).
  - Failure of the audit insert is non-fatal — the lead is already saved.
- **Customer notes URL stripping** ([src/lib/leads/sanitize-notes-urls.ts](../src/lib/leads/sanitize-notes-urls.ts)):
  - Replaces `http(s)://...` and bare `www....` (the latter via a `(?<!\S)` negative lookbehind so embedded text like `awww.example` is left alone) with the placeholder `[رابط محذوف]`.
  - Submission still succeeds. Admin sees the placeholder and can call back for clarification.
  - Hooked into the existing notes sanitization pipeline in `src/lib/leads/validate.ts` between control-char stripping and the trim. The 500-char cap from Task 4.2 still applies after stripping.
- **Admin UI** ([src/app/(admin)/admin/leads/[id]/page.tsx](../src/app/(admin)/admin/leads/[id]/page.tsx) · [src/lib/admin/leads/get-sibling-leads.ts](../src/lib/admin/leads/get-sibling-leads.ts)):
  - When sibling leads exist, the lead detail page renders a "⚠ Potential duplicates" gold-tinted card above the two-column grid, listing each sibling (lead number · city · status badge · Riyadh-formatted timestamp) as a clickable link to its own detail page.
  - No changes to the leads list page (intentionally deferred to keep this task focused).
- **No DB migration.** No new RPC. No new npm dependency. No CAPTCHA. No OTP. No WhatsApp automation. No public-page content changes — only the lead form's server-side error map gained the `rate_limited` entry. Service-role usage stays server-only (all 4 new helpers carry `import "server-only"`).

### Task 4.3 — Riyadh Date Handling Cleanup
**Commit:** `0edfc44`.
- **New util** [src/lib/leads/date-utils.ts](../src/lib/leads/date-utils.ts) exports `todayInRiyadh(): string` returning the Asia/Riyadh calendar date as `YYYY-MM-DD`. No `server-only` / Next imports — importable from both client and server modules.
- **`src/lib/leads/validate.ts`** removes its local `todayInRiyadh()` implementation and imports the shared one. Validation behaviour unchanged.
- **`src/components/lead-form.tsx`** replaces `new Date().toISOString().split('T')[0]` with `todayInRiyadh()`. The form's pickup-date default and both date inputs' `min` attributes now match Riyadh calendar — same source of truth the server uses.
- **Bug fixed:** during the UTC 21:00–24:00 window (when UTC date is one day behind Riyadh), the form previously pre-filled the UTC date for `pickup_date`, then the server rejected it as `pickup_date / in_past`. After this fix, the two sides agree on "today" at all hours. The smoke test ran in exactly that window — UTC was `2026-05-19` while Riyadh was `2026-05-20` — and confirmed end-to-end success.
- **No DB migration. No RPC change. No visible UI change. No admin change. No new npm dependency.**
- **Smoke-test highlights (8/8 PASS, transient lead `SCR-202605-00004` cleaned up):**
  - `todayInRiyadh()` returns `YYYY-MM-DD` format.
  - Matches `Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Riyadh' })` reference.
  - Riyadh today is always ≥ UTC today (never behind).
  - Validator accepts `pickup_date = todayInRiyadh()` even in the UTC-late window.
  - Validator rejects yesterday-in-Riyadh as `pickup_date/in_past`.
  - Same-day pickup/return → `rental_days = 1` (the `max(diff, 1)` floor preserved).
  - 366-day span rejected as `return_date/span_too_long`.
  - End-to-end RPC creates a real lead with today-in-Riyadh and succeeds.

### Task 5.1 — Company + Branch CRUD
**Commit:** `e623213`.
- **Admin routes added:**
  - `/admin/companies` — list with `status` and `public_status` filters, "+ New company" CTA.
  - `/admin/companies/new` — create form (full-page host for `<CompanyForm mode="create"/>`).
  - `/admin/companies/[id]` — two-column edit form + meta card + below-fold branches table with "+ New branch" CTA.
  - `/admin/companies/[id]/branches/new` — branch create form.
  - `/admin/companies/[id]/branches/[branchId]` — branch edit form (guards against URL tampering: 404s if `branch.company_id !== company.id`).
- **Companies CRUD:**
  - Create + edit (single shared `<CompanyForm/>` client component, controlled inputs, field-level error rendering).
  - Activation / deactivation via existing `status` (`active` / `inactive` / `archived`) and `public_status` (`draft` / `published` / `hidden` / `blocked`) enums.
  - **No physical delete.** Archive = `status='archived'`. Routing picker auto-skips because [list-companies.ts](../src/lib/admin/routing/list-companies.ts) filters `status='active'`.
  - Slug uniqueness enforced by existing DB UNIQUE constraint; the upsert helper maps `23505` → friendly inline `"Slug already taken — choose another."`.
- **Branches CRUD:**
  - Create + edit (single shared `<BranchForm/>` client component).
  - Branch WhatsApp numbers are **normalised server-side** via the existing `normalizeSaudiPhone` from Task 3 — admin can paste `05XXXXXXXX` and the DB stores `+9665XXXXXXXX`. The DB CHECK constraint `branches_whatsapp_format` is the final guard.
  - Status (`active` / `inactive` / `archived`) — no `public_status` column on branches (matches schema).
  - **No physical delete.** Inactive/archived branches are skipped by the routing branch dropdown.
  - `is_main_branch` checkbox with soft UI hint (no DB UNIQUE constraint enforces "only one main per company" — admin's responsibility).
- **Sidebar nav:** new **Companies** link added next to **Leads**. The hardcoded `is-active` class on the Leads link was removed (was always-on; now neither is highlighted — a future task can wire `usePathname()`).
- **Role permissions:**
  - `owner` / `admin`: full CRUD.
  - `editor`: read-only — pages render with all inputs disabled and submit buttons disabled; server actions also reject with 403 (`assertRole(['owner','admin'])`).
  - `viewer`, `company_*`, unauthenticated: middleware-level redirect to `/admin/login` (unchanged from Task 4).
- **New server-only library modules** (9 files under `src/lib/admin/`): `companies/{validate,list,get,upsert}.ts`, `branches/{validate,list-for-company,get,upsert}.ts`, `cities/list.ts`. Each carries `import "server-only"`.
- **No DB migration. No new RPC. No new npm dependency. No public site changes. No lead form changes. No routing logic changes** — the routing UI (Task 4.1) automatically sees new active companies/branches because it queries the same tables.
- **Smoke test highlights (14/14 PASS, transient test rows cleaned up):** company + branch validators behave correctly (whitespace trim, empty URL → null, bad slug rejected, WhatsApp `0501234567` normalised to `+966501234567`); DB CRUD round-trips work; `companies_slug_key` rejects duplicate slugs; `branches_whatsapp_format` CHECK rejects non-normalised numbers; archiving a company removes it from the routing picker.
- **Deferred (still not built):** `working_hours` JSON editor; rating snapshot fields editor; logo file upload (URL-only for now); audit log of company/branch changes; partial UNIQUE constraint on main-branch.

### Task 5.2A — Car CRUD
**Commit:** `3fbbe44`.
- **Admin routes added:**
  - `/admin/cars` — list with `status` filter; "+ New car" CTA visible to owner/admin only.
  - `/admin/cars/new` — create form (full-page host).
  - `/admin/cars/[id]` — two-column edit form + meta card; includes a read-only "Features JSON" card when `features_json` is non-trivial (admin edits that field via SQL Editor for now).
- **Cars CRUD:**
  - List seeded + custom cars, joined to category for display.
  - Create + edit via a single shared `<CarForm/>` client component (mode + initial-values prop).
  - Activation / deactivation / archival via existing `status` enum (`active` / `inactive` / `archived`). **No `public_status` column on cars** (companies have one, cars don't — confirmed against [migration 009](../supabase/migrations/20260519000009_create_cars.sql)).
  - **No physical delete.** Existing rows continue to satisfy any future offer FK in Task 5.2B.
- **Fields supported by the form:** `brand_ar`, `brand`, `model_ar`, `model`, `slug`, `year` (1990–2100 or null), `category_id`, `seats` (1–100 or null), `transmission` (`automatic` / `manual` / null), `fuel_type` (free text), `image_url` (URL-paste only), `description_ar`, `status`. Empty optional fields are stored as `null`.
- **Category dropdown** sourced from `listActiveCarCategories()` — closed set from seed; no category CRUD UI exists yet.
- **`features_json` preserved untouched** on edit because the upsert helper only writes form-controlled columns. Admin edits this via the Supabase SQL editor.
- **Role permissions:**
  - `owner` / `admin`: full CRUD.
  - `editor`: read-only — pages render with inputs/submit disabled; server actions reject with 403.
  - `viewer`, `company_*`, unauthenticated: middleware-level redirect to `/admin/login`.
- **New server-only library modules** (5 files): `cars/{validate,list,get,upsert}.ts`, `car-categories/list.ts`. Each carries `import "server-only"`.
- **No DB migration. No new RPC. No new npm dependency. No public site changes. No lead form changes. No routing logic changes. No company/branch CRUD changes.** Sidebar nav gains a third link: **Cars** (next to Leads + Companies).
- **Smoke test highlights (21/21 PASS, transient test car cleaned up):** validator rejects bad slug / year `1989` / year `"abc"` / seats `0` / seats `101` / transmission `"rocket"` / bad URL / bad enum / missing `category_id`; empty optional fields stored as null; DB CRUD round-trips; `cars_slug_key` rejects duplicates; `cars_year_range` rejects `1989`; `cars_transmission_check` rejects `"rocket"`; archival works.
- **Deferred (still not built):** `features_json` editor; car-category CRUD; image-upload UI (URL-paste only); audit log of car CRUD changes.

### Task 5.2B — Offer CRUD
**Commit:** `e452939`.
- **Admin routes added:**
  - `/admin/offers` — list with three filters (`approval_status`, `public_status`, `company_id`); "+ New offer" CTA visible to owner/admin only; rows highlight `last_updated_at` in red when > 30 days old.
  - `/admin/offers/new` — full-page create form.
  - `/admin/offers/[id]` — two-column edit form + meta card with `created_at` / `updated_at` / `last_updated_at`; renders a "stale price" warning card when `last_updated_at` is null or > 30 days.
- **Offers CRUD:**
  - List with filter trio (approval, public, company); sorted by `last_updated_at` desc.
  - Create + edit via a single shared `<OfferForm/>` client component (4-section layout: Who / Pricing / Terms / Workflow).
  - Activation / deactivation / archival via existing `status` + `public_status` enums.
  - **No physical delete.**
- **Fields supported by the form (19 total):** `company_id`, `branch_id`, `city_id` (server-derived from branch), `car_id`, `airport_id` (optional), `daily_price_from`, `weekly_price_from`, `monthly_price_from`, `deposit_amount`, `insurance_included` (tri-state), `insurance_type`, `mileage_limit`, `delivery_available`, `airport_delivery_available`, `price_status`, `availability_status`, `approval_status`, `public_status`, `status`.
- **Cascading picker:**
  - Company picker first.
  - Branch picker filtered client-side by selected company.
  - City auto-fills (read-only) from the chosen branch — the form never sends `city_id`; the server reads `branch.city_id` and writes it on save.
  - Server-side branch–company FK consistency check in [src/lib/admin/offers/upsert.ts](../src/lib/admin/offers/upsert.ts) (`resolveBranchCityForCompany`) catches URL-tampering.
- **Pricing rules:**
  - At least one of daily / weekly / monthly required — enforced by the validator.
  - ✨ Suggest buttons on weekly + monthly compute from daily (`weekly = round(daily × 7 × 0.85)`, `monthly = round(daily × 30 × 0.70)`); click-once-then-edit; never auto-applied. Stored DB values are the source of truth.
  - All prices must be ≥ 0 — validator + DB CHECK as defence in depth.
- **Approval / publication state machine:**
  - `public_status='published'` rejected unless `approval_status` is `approved` or `auto_approved` — soft gate, enforced by the validator with `not_approved_for_publish`.
  - `approval_status='rejected'` auto-forces `public_status='hidden'` in the same save — implemented by `applyRejectAutoReset` in [actions.ts](../src/app/(admin)/admin/offers/actions.ts).
  - Owner/admin can approve and publish in a single edit — no separate review role yet. A future Task 6+ might split this when partners self-submit via a company dashboard.
- **`last_updated_at` discipline** (per the migration 010 column comment):
  - **Set to now()** on INSERT.
  - **Bumped to now() on UPDATE** only when at least one of `daily_price_from` / `weekly_price_from` / `monthly_price_from` / `availability_status` changes. Other field changes (e.g. `insurance_type`) leave `last_updated_at` untouched.
- **New server-only library modules (5 files):** `offers/{validate,list,get,upsert}.ts`, `branches/list-all.ts`. Each carries `import "server-only"`.
- **No DB migration. No new RPC. No new npm dependency. No public site changes. No lead form changes. No routing logic changes. No companies / branches / cars CRUD changes.** Sidebar nav gains a fourth link: **Offers** (Leads · Companies · Cars · Offers).
- **Smoke test highlights (21/21 PASS, transient test offer cleaned up):** validator covers at-least-one-price rule, negative price/deposit/mileage rejection, bad enum, approval gate (publish without approval rejected; publish with approved/auto_approved accepted), invalid UUIDs; CRUD round-trip; `last_updated_at` correctly **does not** bump when only `insurance_type` changes but **does** bump when `daily_price` changes; branch–company mismatch identified at sanity-check level; DB CHECKs `offers_daily_price_non_negative` and `offers_deposit_non_negative` reject negatives.
- **Deferred (still not built):** parent-status guard (admin can publish an offer whose parent company / branch / car is archived); offer-price history table; bulk operations; offer images; date-windowed availability; image / file upload UI.

### Task 6.1 — Read-only Public DB Data Layer
**Commit:** `3d690a0`.
- **Purpose:** prepare a safe, server-only DB read layer that future public pages can consume in Task 6.2. **No public pages switched yet** — pure plumbing. `src/lib/data.ts` is byte-identical to before, no sitemap changes, no metadata changes, no JSON-LD changes, no UI changes anywhere.
- **New folder:** `src/lib/public-data/` with 7 files, each carrying `import "server-only"`:
  - [types.ts](../src/lib/public-data/types.ts) — shared row types (`PublicCity`, `PublicAirport`, `PublicCarCategory`, `PublicCar`, `PublicCompany`, `PublicOffer`).
  - [cities.ts](../src/lib/public-data/cities.ts) — `getPublishedCities()`, `getPublishedCityBySlug(slug)`.
  - [airports.ts](../src/lib/public-data/airports.ts) — `getPublishedAirports()`, `getPublishedAirportBySlug(slug)`, `getPublishedAirportsForCitySlug(citySlug)`.
  - [car-categories.ts](../src/lib/public-data/car-categories.ts) — `getActiveCarCategories()`, `getActiveCarCategoryBySlug(slug)`.
  - [cars.ts](../src/lib/public-data/cars.ts) — `getActiveCars()`, `getActiveCarBySlug(slug)`, `getActiveCarsByCategorySlug(categorySlug)`.
  - [companies.ts](../src/lib/public-data/companies.ts) — `getPublicCompanies()`, `getPublicCompanyBySlug(slug)`, `getPublicCompaniesByCitySlug(citySlug)`.
  - [offers.ts](../src/lib/public-data/offers.ts) — `getPublicOfferById(id)`, `getPublicOffersByCitySlug(citySlug)`, `getPublicOffersByCarSlug(carSlug)`.
- **Visibility rules enforced in WHERE clauses:**
  - **Cities / Airports:** `status='active' AND public_status='published'`.
  - **Car categories:** `status='active'` (no `public_status` column on this table).
  - **Cars:** `status='active'` (no `public_status` column on this table).
  - **Companies:** `status='active' AND public_status='published' AND trust_level <> 'blocked'`.
  - **Offers:** `offers.status='active' AND offers.public_status='published' AND offers.approval_status IN ('approved','auto_approved') AND offers.availability_status <> 'unavailable'`, plus parent-status filters (`company.status='active'` & `public_status='published'` & `trust_level <> 'blocked'`; `branch.status='active'`; `car.status='active'`). Parent filters use pre-resolved id-sets via `.in('company_id', ids)` etc.
- **Privacy (enforced by hand-written SELECT lists):** no leaks of `customer_*`, `consent_*`, leads, `lead_activity_logs`, `internal_notes`, `trust_level`, `approval_status`, row-level `status`, or `public_status` in return shapes. `branch.whatsapp_number` is **intentionally excluded** from public exposure per the Task 6.1 product decision — MVP public surface is lead-generation only; direct partner WhatsApp stays inside the admin routing flow.
- **No DB migration. No new RPC. No new npm dependency. No fallback wrapper or camelCase adapter (deferred to Task 6.2 by design).**
- **Smoke test highlights (15/15 PASS, transient draft city + blocked company + unavailable offer cleaned up):**
  - Seed counts: 6 cities, 5 airports, 7 categories, 5 economy cars, 6 public companies, **87 public offers in Riyadh**.
  - Slug lookups return correct rows; missing-slug returns null.
  - **Privacy:** `PublicCompany` returned shape has keys exactly `id, slug, name_ar, name_en, logo_url, website_url, google_maps_url, rating_snapshot, reviews_count_snapshot` — no `trust_level` / `internal_notes` / `status` / `public_status`.
  - **Leak tests:** `public_status='draft'` city, `trust_level='blocked'` company, and `availability_status='unavailable'` offer are all filtered out.
  - **`branch.whatsapp_number` is NOT in any returned shape** — verified by introspecting `PublicOffer.branch` keys (`id, district, address_ar`).

### Task 6.2A — Airport Public Page DB Overlay
**Commit:** `abbd9b9`.
- **Route affected:** `/sa/airports/[airport]` only. No other public route changed.
- **Files changed (3):**
  - **NEW** [src/lib/public-data/adapters/airport-page.ts](../src/lib/public-data/adapters/airport-page.ts) — server-only DB overlay adapter; converts snake_case DB rows to the camelCase shape the airport page JSX already consumes; returns `null` on any failure → page falls back to static.
  - **MODIFIED** [src/lib/public-data/cities.ts](../src/lib/public-data/cities.ts) — added `getPublishedCityById(id)` to resolve `airports.city_id` → city row (mirrors `getPublishedCityBySlug`).
  - **MODIFIED** [src/app/(site)/sa/airports/[airport]/page.tsx](../src/app/(site)/sa/airports/[airport]/page.tsx) — both `generateMetadata` and the page component compute four overlaid identifiers (`airportNameAr`, `airportCode`, `cityNameAr`, `cityMinPrice`) via `overlay?.X ?? staticFallback` and reference them in metadata + JSX. Static `ap` / `city` lookups (and `notFound()` boundary) preserved verbatim.
- **Approach: augmentation, not full DB swap.**
  - `src/lib/data.ts` remains the load-bearing base.
  - The DB overlay is applied only for safe visible fields (4 text/number values).
  - Static fallback remains available — if DB is down, the row is missing, or the parent city is unpublished, the page renders exactly as it did before Task 6.2A.
- **Static `data.ts` remains:**
  - the route existence / 404 boundary,
  - the `generateStaticParams` source (5 airport slugs at build time),
  - the JSON-LD city source (`generateLocalBusinessSchema(city)` still receives the static City).
- **JSON-LD remains safe** because `generateLocalBusinessSchema` continues to receive the static city object — DB schema lacks `lat`, `lng`, `partnerCount`, `nameEn`, so swapping the JSON-LD source would emit broken structured data. By design, JSON-LD output is unaffected by this adapter.
- **Sitemap unchanged.** [src/app/sitemap.ts](../src/app/sitemap.ts) was not touched; same URL set, same `<lastmod>` reasoning.
- **Metadata uses overlay values where safe, with static fallback.** `<title>`, `<meta name="description">`, OG, and Twitter all consume the overlaid identifiers via the same `??` chain.
- **DB-row state behaviour:**
  - If the DB row is missing, in draft (`public_status='draft'`), or its parent city is unpublished, the overlay returns `null` and the page falls back to `data.ts`.
  - If the DB airport `name_ar` (or `code` / parent city `name_ar` / `min_price_from`) is edited by an admin, the visible text and metadata reflect the DB overlay on the next request.
- **Build baseline unchanged: 237 static pages.** Verified before and after the change via `git stash`-based comparison of the airport page. (The "236" figure used as a planning baseline was a slightly stale count; this task introduces zero new static pages.)
- **Smoke tests passed (5/5 groups PASS, all transient DB mutations restored):**
  - All 5 airport pages — DB overlay matches static (`name_ar` / `code` / city `name_ar` / `min_price_from` aligned for `king-khalid`, `king-abdulaziz`, `king-fahd`, `prince-mohammed`, `taif`).
  - Missing slug — `getAirportBySlug` undefined AND DB overlay null → page would `notFound()`.
  - Draft DB row — flipping `king-khalid.public_status='draft'` makes overlay return null → page falls back to static; row restored to `published`.
  - Temporary DB name edit — changing `king-khalid.name_ar` makes overlay reflect the edited name; static source unchanged; row restored.
  - JSON-LD safety — static Riyadh retains `nameEn`, `partnerCount`, `lat`, `lng` for `generateLocalBusinessSchema`.
- **No DB migration. No new RPC. No new npm dependency. No admin changes. No lead form changes. No sitemap changes. No JSON-LD generator changes.** `branch.whatsapp_number` is not exposed (adapter returns only the 4 approved fields).
- **Task 6.2B / 6.3 not started.**

### Task 6.2B — City Public Page DB Overlay
**Commit:** `6960242`  ·  **Follow-up fix:** `9090d39`.
- **Route affected:** `/sa/[city]` only. No other public route changed.
- **Files changed (2):**
  - **NEW** [src/lib/public-data/adapters/city-page.ts](../src/lib/public-data/adapters/city-page.ts) — server-only adapter; returns `{ cityNameAr, cityNameEn, cityMinPrice } | null` on any failure → page falls back to static.
  - **MODIFIED** [src/app/(site)/sa/[city]/page.tsx](../src/app/(site)/sa/[city]/page.tsx) — both `generateMetadata` and the page component compute `cityNameAr` / `cityMinPrice` via `overlay?.X ?? static.X`; visible H1, breadcrumb, hero pill, section headers, SSR internal links, and FAQ Qs/As all reference the overlaid identifiers; `city.description` (hero subtitle) and `city.partnerCount` (body copy + JSON-LD) intentionally kept on static; `generateLocalBusinessSchema(city)` still receives the unchanged static `City` object.
- **Approach: augmentation, not full DB swap** (same pattern as Task 6.2A).
  - `src/lib/data.ts` remains the load-bearing base.
  - The DB overlay is applied only for safe city fields.
  - Static fallback remains available — if DB is down, the row is missing/draft/hidden/archived, or the column is null, the page renders exactly as it did before Task 6.2B.
- **Overlay fields:**
  - `cityNameAr` ← `cities.name_ar`
  - `cityMinPrice` ← `cities.min_price_from`
  - `cityNameEn` ← `cities.name_en` (plumbed through for forward compatibility; no active consumer on this page today).
- **Static `data.ts` remains the source for:**
  - route existence / 404 boundary,
  - `generateStaticParams` (6 city slugs at build time),
  - JSON-LD `LocalBusiness` (`lat`, `lng`, `partnerCount`, `description`, full City template),
  - hero subtitle (`city.description`),
  - `partnerCount` (body copy + FAQ + metadata description),
  - `cityGuides`, `categories`, `carModels`, `categoryGradients`, `getAirportsForCity`, `getPartnersForCity`.
- **JSON-LD remains safe** — `generateLocalBusinessSchema(city)` still receives the static `City` object (DB schema lacks `lat`/`lng`/`partnerCount`/`description`). `LocalBusiness.name` keeps the static `${SITE_NAME} — ${city.nameAr}` template. Breadcrumb name uses the overlaid `cityNameAr` (matches the visible breadcrumb on the same page).
- **Sitemap unchanged.** [src/app/sitemap.ts](../src/app/sitemap.ts) was not touched.
- **Arabic SEO title wording (current state, post-revert):** all three city-page titles (`metadata.title`, `openGraph.title`, `twitter.title`) use `تأجير سيارات في ${cityNameAr}`. Descriptions also use `في` throughout. Verified rendered output on all 6 city slugs:
  - `/sa/riyadh` → `تأجير سيارات في الرياض — أسعار من 89 ريال/يوم`
  - `/sa/jeddah` → `تأجير سيارات في جدة — أسعار من 99 ريال/يوم`
  - `/sa/dammam` → `تأجير سيارات في الدمام — أسعار من 79 ريال/يوم`
  - `/sa/makkah` → `تأجير سيارات في مكة المكرمة — أسعار من 95 ريال/يوم`
  - `/sa/madinah` → `تأجير سيارات في المدينة المنورة — أسعار من 92 ريال/يوم`
  - `/sa/khobar` → `تأجير سيارات في الخبر — أسعار من 42 ريال/يوم`
  - Verified by `grep -c "تأجير سيارات ب"` against `<title>` / `og:title` / `twitter:title` on all 6 pages → **zero matches**.
  - JSON-LD `LocalBusiness.name` unchanged throughout — still the static `${SITE_NAME} — ${city.nameAr}` template.
- **Follow-up fix:** `9090d39` — *fix: restore city meta title wording*.
  - **Reason:** the initial 6.2B commit shipped a `بـ`-prefix variant (`تأجير سيارات بالرياض`, `بجدة`, …) via a small `formatCityWithArabicBa(cityNameAr)` inline helper. After review, the better Arabic SEO wording is the original `تأجير سيارات في [city]` pattern. The follow-up commit removed the helper and restored `في` in all three titles (descriptions were already on `في`).
  - **Applied to:** `metadata.title`, `openGraph.title`, `twitter.title`.
  - **DB overlay augmentation remains intact** — `cityNameAr` and `cityMinPrice` are still computed via `overlay?.X ?? static.X`.
  - **Confirmations:** `src/lib/public-data/adapters/city-page.ts` untouched · `src/lib/data.ts` untouched · sitemap untouched · JSON-LD generators untouched · `LocalBusiness.name` unchanged · only `/sa/[city]` title wording changed · no admin / lead-form / DB-migration / RPC / npm-dep changes.

### Task 6.2C — Category Public Page DB Overlay
**Commit:** `2f59f43` (current `main` HEAD).
- **Route affected:** `/sa/[city]/[category]` only. No other public route changed.
- **Files changed (2):**
  - **NEW** [src/lib/public-data/adapters/category-page.ts](../src/lib/public-data/adapters/category-page.ts) — server-only adapter; runs `getPublishedCityBySlug` and `getActiveCarCategoryBySlug` in parallel via `Promise.all`; returns `{ cityNameAr, cityNameEn, categoryNameAr, categoryNameEn } | null` (null on any failure or if either side is missing/unpublished/archived; try/catch + `console.error`).
  - **MODIFIED** [src/app/(site)/sa/[city]/[category]/page.tsx](../src/app/(site)/sa/[city]/[category]/page.tsx) — both `generateMetadata` and the page component compute `cityNameAr` / `categoryNameAr` via `overlay?.X ?? static.X`; visible H1, breadcrumb, hero pill text, section headers (×4), `desc()` helper input, FAQ Qs/As, SSR internal-link cluster, and `generateBreadcrumbSchema` names all reference the overlaid identifiers. Static `cat.minPrice`, `cat.icon`, `cat.slug`, `city.slug`, `descs[cat.slug](...)`, `getCarsByCategory(...)`, `categoryGradients`, `LazyLeadForm defaultCategorySlug`, `generateLocalBusinessSchema(city)`, and every iteration over `otherCats` / `otherCities` / `categories` / `cities` preserved verbatim.
- **Approach: augmentation, not full DB swap** (same pattern as Tasks 6.2A / 6.2B).
  - `src/lib/data.ts` remains the load-bearing base.
  - The DB overlay is applied only for safe city/category name scalar fields.
  - Static fallback remains available — DB outage, draft/archived rows, missing rows, or one-side-missing all transparently fall back to `data.ts`.
- **Overlay fields:**
  - `cityNameAr` ← `cities.name_ar`
  - `cityNameEn` ← `cities.name_en` (plumbed for forward compatibility; no active consumer on this page).
  - `categoryNameAr` ← `car_categories.name_ar`
  - `categoryNameEn` ← `car_categories.name_en` (plumbed for forward compatibility).
- **One-side-missing rule.** If the city row is published but the category is archived (or vice versa), the adapter returns null and the page falls back fully to `data.ts`. This avoids mixing a DB city name with a static category name (or vice versa) on the same page.
- **Static `data.ts` remains the source for:**
  - route existence / 404 boundary,
  - `generateStaticParams` (6 cities × 7 categories = **42** combinations at build time),
  - JSON-LD `LocalBusiness` city source (`generateLocalBusinessSchema(city)` still receives the static `City`),
  - `cat.minPrice` (no DB column),
  - `cat.icon` (visual consistency with static `otherCats` iteration on the same page),
  - the car grid (`getCarsByCategory(cat.slug)` → `carModels`),
  - per-car `dailyPrice`,
  - `categoryGradients`,
  - `descs` (hand-authored per-category Arabic intros),
  - `cityGuides`, `getAirportsForCity`, `getPartnersForCity` (not consumed on this page but listed for completeness — none were migrated).
- **No offers/prices migrated.** Adapter never queries `offers` or `cars`; per-car `dailyPrice` continues to come from `data.ts.carModels[].dailyPrice`.
- **No car grid migrated.** Deferred to Task 6.2D.
- **No `cat.minPrice` migrated.** No DB column today; future schema task.
- **No category icon overlay.** Deferred to avoid visual flicker against static `otherCats` icon iteration on the same page.
- **JSON-LD generators unchanged.** `generateBreadcrumbSchema`, `generateFAQSchema`, `generateLocalBusinessSchema` all untouched. `LocalBusiness` continues to receive the static `City` for `lat`/`lng`/`partnerCount`/`description`/`nameAr`/`minPrice`. Breadcrumb item names use the overlaid `cityNameAr` / `categoryNameAr` so they match the visible breadcrumb.
- **Sitemap unchanged.** [src/app/sitemap.ts](../src/app/sitemap.ts) was not touched.
- **Build baseline unchanged: 237 static pages.**
- **Smoke tests passed (8/8 groups PASS, all transient DB mutations restored):**
  - **42/42 city × category combinations** matched static seed data (city `name_ar` and category `name_ar` aligned across all 6 × 7 pairs).
  - Missing city slug — `getCityBySlug("nonexistent")` undefined AND adapter null → page would `notFound()`.
  - Missing category slug — `getCategoryBySlug("nonexistent")` undefined AND adapter null → page would `notFound()`.
  - Draft city simulation — `riyadh.public_status='draft'` → adapter null → fallback to static. Restored.
  - Archived category simulation — `economy.status='archived'` → adapter null → fallback to static. Restored.
  - Transient category name edit — `economy.name_ar` → `"اختبار: اقتصادية"`; adapter reflected the edit; static `categories[0].nameAr` unchanged in source. Restored.
  - JSON-LD safety — static Riyadh retains `lat`, `lng`, `partnerCount`, `description`, `nameEn`, `minPrice`.
  - Car grid (5 cars) + `cat.minPrice` (79) + `cat.icon` (🚗) + `categoryGradients` all resolved from `data.ts` (not adapter).
- **Rendered-title + page-level `LocalBusiness.name` verification** on 6 representative routes (`riyadh/economy`, `jeddah/luxury`, `khobar/suv`, `makkah/7-seater`, `dammam/sedan`, `madinah/van`) — titles correctly interpolate the overlaid city/category names; page-level `LocalBusiness.name` correctly reflects each city's static template.
- **No DB migration. No new RPC. No new npm dependency. No admin changes. No lead form changes. No sitemap changes. No JSON-LD generator changes.** `branch.whatsapp_number` not exposed (adapter touches only `cities` and `car_categories`; no branch data fetched).
- **Pre-existing observation (not in scope for 6.2C):** the prod HTML for every `/sa/[city]/[category]` URL contains **two** `<script type="application/ld+json">` blocks — a layout-level one that always emits `LocalBusiness.name = "تأجير سيارات — الرياض"` (set at the site root before this task), and the page-level one (correctly per-city). Verified against un-modified `main` (`7a08cc3`) before this task: the always-Riyadh layout block pre-dates Task 6.2C. Not fixed here. Recommended as a small standalone follow-up: **Task 6.2X — Fix duplicated/global LocalBusiness JSON-LD** (see §9).
- **Car detail migration (Task 6.2D) / Task 6.3 not started.**
- **Build baseline unchanged: 237 static pages.**
- **Smoke tests passed (5/5 groups PASS, all transient DB mutations restored):**
  - All 6 city pages — DB overlay matches static (`name_ar` identical; `min_price_from` aligned for every row: 89/99/79/95/92/42 SAR).
  - Missing slug — `getCityBySlug` undefined AND adapter null → page would `notFound()`.
  - Draft DB row — flipping `riyadh.public_status='draft'` makes adapter return null → page falls back to static; row restored to `published`.
  - Temporary DB name edit — changing `riyadh.name_ar` makes adapter reflect the edit; static source unchanged; row restored.
  - JSON-LD safety — static Riyadh retains `lat`, `lng`, `partnerCount`, `description`, `nameEn` for `generateLocalBusinessSchema` + hero subtitle.
- **No DB migration. No new RPC. No new npm dependency. No admin changes. No lead form changes. No sitemap changes. No JSON-LD generator changes.** `branch.whatsapp_number` is not exposed (adapter touches only the `cities` table; no branch data fetched).
- **Task 6.2C / 6.3 not started.**

### Recent Operational Fixes

A running list of post-task fixes that don't constitute new tasks:

- **`64343f3` — Lead reassignment UX + WhatsApp deep-link reliability.** See the Task 4.1 entry above for the full description.

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

- WhatsApp Business API integration / automated sending (admin still copies / opens manually).
- Company follow-up form / table data entry.
- Customer follow-up form / table data entry.
- Admin reports / overview dashboard.
- Company dashboard (Phase 2).
- Car-category CRUD in admin (admin picks from seed-only set today; new categories require SQL).
- Audit log of company / branch / car / offer CRUD changes (relying on `updated_at` only).
- Parent-status guard on offer publish (admin can currently publish an offer whose company / branch / car is archived).
- Offer price history (only `last_updated_at` timestamp; no per-change row).
- Offer bulk operations (multi-select approve / publish / archive).
- `working_hours` JSON editor on branches.
- `features_json` editor on cars.
- Rating snapshot editor on companies.
- File-upload UI for logos and car images (URL-paste only today).
- Public pages reading from Supabase — partial: `/sa/airports/[airport]` (Task 6.2A), `/sa/[city]` (Task 6.2B), and `/sa/[city]/[category]` (Task 6.2C) now apply DB overlays over `src/lib/data.ts`. The remaining public routes (`/sa/[city]/[category]/[car]`, `/`, `/about`, `/contact`, `/privacy`) still render purely from `src/lib/data.ts`. The category page's car grid, per-car pricing, `cat.minPrice`, `categoryGradients`, and per-category Arabic intros (`descs`) also remain on `data.ts` — list-data and pricing migration is deferred to Task 6.2D and a future SEO-content refresh.
- Layout-level `LocalBusiness` JSON-LD always emits Riyadh — every public route renders **two** `<script type="application/ld+json">` blocks, one of which is a site-root layout block hard-coded to `"name":"تأجير سيارات — الرياض"` regardless of the page's city. Page-level JSON-LD is correct per-city. Predates Task 6.2C; recommended as standalone Task 6.2X (see §9).
- Rate limiting on `/admin/login` (the public lead-form endpoint is rate-limited; the admin sign-in form is not — Supabase Auth's own rate limit applies but app-side is unchanged).
- Profanity filter on `customer_notes` (URL stripping is in place; explicit profanity matching is not).
- Password reset flow.
- Email verification flow.
- n8n / automation pipelines.
- Booking / payment.
- Mobile app.

---

## 9. Recommended Next Tasks

All admin CRUD is in place (Leads, Companies, Branches, Cars, Offers), the read-only public DB data layer (Task 6.1) is in place, and three public routes — `/sa/airports/[airport]` (Task 6.2A), `/sa/[city]` (Task 6.2B), and `/sa/[city]/[category]` (Task 6.2C) — now consume it via the augmentation pattern. Before continuing with the remaining route migrations, a small SEO-cleanup task surfaced during 6.2C's verification should land first.

### Task 6.2X — Fix duplicated/global LocalBusiness JSON-LD (**recommended next, small**)

**Why now:** Task 6.2C verified that every public route renders **two** `<script type="application/ld+json">` blocks. The page-level block is correct (per-city `LocalBusiness.name`). A second, layout-level block emits `"name":"تأجير سيارات — الرياض"` regardless of which city the page is on. This predates Task 6.2C (confirmed by spot-checking un-modified `main` HEAD `7a08cc3` before applying the 6.2C changes) and is unrelated to the DB-overlay work.

Before migrating car detail pages (Task 6.2D), this duplicated/global `LocalBusiness` block should be cleaned up so we don't propagate the SEO structured-data confusion onto a fourth route type.

**Scope to plan (no implementation yet):**
1. Locate the layout-level JSON-LD emitter. Likely candidates: `src/app/layout.tsx`, `src/app/(site)/layout.tsx`, or a shared `<JsonLd>` component injected near the root.
2. Decide between three remediation patterns (to be confirmed at plan time):
   - **Drop the layout-level `LocalBusiness` entirely** — keep only page-level per-route JSON-LD. Cleanest for SEO; loses the always-on site-level signal.
   - **Replace the layout-level block with non-route-specific schema** — e.g. `Organization` or `WebSite` instead of `LocalBusiness`. Keeps a site-level signal without contradicting per-page `LocalBusiness`.
   - **Make the layout-level block route-aware** — read the current pathname / params at the layout level and emit the matching city. More work; arguably overkill given the page-level block already covers this.
3. Verify the fix on all 4 currently-migrated route types (`/`, `/sa/[city]`, `/sa/[city]/[category]`, `/sa/airports/[airport]`) — JSON-LD should be coherent on every URL.
4. Hold the same constraints as the 6.2 sub-tasks: no DB migration, no schema changes, no admin / lead-form / sitemap modifications. Static-page count must stay at 237.

**Expected file budget:** 1–2 files (the layout file + possibly a small JSON-LD helper). No new public-data adapter.

**No DB-overlay work in this task.** Pure structured-data cleanup.

### Task 6.2D — Car Detail Public Page DB Overlay (**after 6.2X**)

Route: `/sa/[city]/[category]/[car]`. Highest cognitive load of the public migration:

- Three-level join (city × category × car).
- The car may have `features_json`, `description_ar`, `image_url` — admin-authored fields with content gaps that the static fallback currently fills.
- Largest static-param fan-out (currently 174 cars permutations per the build log).
- Pricing decision: the page currently shows `dailyPrice` from `carModels` static; live pricing lives in `offers` table with the longer visibility chain. Whether to overlay live offers is a real product decision (cheapest offer? city-bound? per-branch?) — plan carefully.

**Decisions to bring into the 6.2D plan:**

1. **Static-page count target.** Stay at 237. `generateStaticParams` continues to read `data.ts.carModels` so cardinality is build-time DB-independent.
2. **What gets overlaid.** Recommendation (to confirm at plan time): the same scalar set as 6.2C — `cityNameAr`, `categoryNameAr` — plus a new `carBrandAr`, `carModelAr`, optional `carYear` if useful. Leave per-car pricing (`dailyPrice`, `monthlyPrice`), `features_json`, image URL, and the "compare offers" CTA on static for 6.2D.
3. **Pricing list deferral.** Live offers list and "cheapest current offer" computation belong in a separate sub-task (`6.2D-offers` or a future "live pricing" sub-task) — they require a new query helper and product decisions about ranking. Do NOT bundle into 6.2D.
4. **JSON-LD source.** Continue passing static `City` to `generateLocalBusinessSchema`. If the car page emits `Product` / `Offer` schema, those stay on `data.ts` for now.

#### Subsequent sub-tasks (planned, NOT to start until 6.2D lands)
- 6.2E — `/` (homepage) and `/about` / `/contact` / `/privacy` if they reference seeded data.

### Task 6.3 — SEO / sitemap validation after full DB switch (final)

Once Tasks 6.2A–E (+ 6.2X) are done, do the SEO regression sweep before celebrating.

**Scope:**
- Diff `app/sitemap.ts` output before vs after the full migration. Same URL set, same order, same `<lastmod>` reasoning.
- Diff per-page `<title>`, `<meta name="description">`, OG/Twitter, JSON-LD payloads. Where the DB has equivalent SEO copy (`seo_title_ar` / `seo_description_ar`), confirm it's used. Where the DB doesn't, confirm the fallback content matches.
- Confirm only one coherent `LocalBusiness` block per page (validates Task 6.2X).
- Spot-check three routes per type (one city, one category, one car, one airport) with Lighthouse + a manual SERP-preview tool.
- Update `ai-docs/10_SEO_AND_CONTENT_RULES.md` to declare the DB as the authoritative SEO content source (where applicable).
- Pure validation + docs work. No app file changes.

**Recommended priority order: 6.2X (small SEO cleanup) → 6.2D (car — HIGHER risk) → 6.2E (homepage + static pages) → 6.3.** Each step is reversible by reverting one commit. The augmentation pattern (overlay, never full swap) means the static `data.ts` fallback keeps the public site alive if any DB row is missing or draft.

**Important constraints for the remaining Task 6 sub-tasks:**
- Do not change the lead form, lead routing, or admin dashboard.
- Do not change the schema. Use existing visibility rules (`status='active' AND public_status='published'` for cities / airports / companies; the longer rule for offers).
- Customer-data privacy unchanged — public reads expose no leads, no admin notes, no internal trust levels. `branch.whatsapp_number` stays admin-side.
- Service-role usage stays server-only.
- Static-page count stays at its current baseline (237). Verify in the build log on every sub-task.
- JSON-LD generators continue to receive the static `data.ts` city/airport object until the schema gains `lat`/`lng`/`partnerCount`/`nameEn` — that's a separate future task.
- Once all 6.2 sub-tasks + 6.3 are done, the public site reflects admin-authored content via overlay and `src/lib/data.ts` becomes a fallback-only module; deleting it is a follow-up that depends on schema parity (SEO fields).

---

## 10. Short Context for Future AI Sessions

> Saudi car rental **comparison and lead-generation** platform. MVP only: no bookings, no payments, no final-price guarantees, no auto-routing. Customer fills an Arabic form on the public site (city, dates, vehicle, phone, **optional notes**) → lead saved in Supabase with an atomic activity-log entry → admin reviews and routes the lead in `/admin/leads`. The admin can manually assign or **reassign** a lead to a company/branch (each assignment creates a new `lead_company_routing` row; older routings stay visible as history; `leads.assigned_*` pointers advance to the latest), generate an Arabic WhatsApp message (customer notes auto-included when present), copy it to clipboard, click **Open WhatsApp** — which now uses a real `<a href="https://wa.me/9665...?text=…" target="_blank">` link so WhatsApp opens reliably with the message prefilled — and mark the routing as sent (auto-advances status from `new`/`reviewed` to `sent_to_company`). Every action is logged. **Manual-first** is preserved: no WhatsApp Business API, no n8n, no automation, no booking/payment, no company dashboard. Public pages still render from `src/lib/data.ts`, but the safe DB read layer for the future migration is now in place at `src/lib/public-data/` (Task 6.1) — 7 server-only helpers with strict visibility filters and a deliberate `branch.whatsapp_number` exclusion so direct partner contact stays admin-side. Service-role key is server-only; admin pages use cookie auth via `@supabase/ssr` and gate roles app-side. The lead form is rate-limited at 10/hour per IP, flags potential duplicates (same phone within 24h) to admin without blocking submissions, strips URLs out of customer notes, and computes the pickup-date default + minimum from Asia/Riyadh — same source the server validator uses — so the form never pre-fills a date the server would reject. Admin can also manage rental partners directly: `/admin/companies` lists every company; create / edit forms cover both companies and branches; activation / deactivation / archival is via existing `status` + `public_status` enums (no physical deletes); branch WhatsApp numbers are normalised to `+9665XXXXXXXX` on save; archived companies/branches automatically drop out of the routing picker. `/admin/cars` lists the car-model catalogue with the same create / edit / archive pattern; the form pre-fills English + Arabic brand and model, slug, year (1990–2100), category (dropdown of active `car_categories`), seats (1–100), transmission (`automatic` / `manual` / none), fuel type, image URL, and description; `features_json` is preserved on edit but not editable through the UI. `/admin/offers` ties everything together: a 19-field form in four sections (Who / Pricing / Terms / Workflow) creates company × branch × car × city × airport bundles with daily/weekly/monthly price tiers; the city is server-derived from the chosen branch (the form never sends it); at least one price is required; ✨ Suggest buttons offer non-binding weekly/monthly hints; **publishing an offer requires `approval_status='approved'` (or `auto_approved`)** and **rejecting an offer auto-forces `public_status='hidden'`**; `last_updated_at` bumps only when price or availability changes — stale offers (>30d) show a red indicator. All MVP admin CRUD is now complete (Leads · Companies · Branches · Cars · Offers), the read-only public data layer is in place, and three public routes now consume it via the **augmentation** pattern: `/sa/airports/[airport]` (6.2A), `/sa/[city]` (6.2B), and `/sa/[city]/[category]` (6.2C). On every migrated route, static `data.ts` stays load-bearing (route existence, `generateStaticParams`, JSON-LD `LocalBusiness` city source for `lat`/`lng`/`partnerCount`/`description`); a server-only DB overlay augments visible scalars (`name_ar`, `min_price_from`, etc.) with a `??` fallback so DB outages, draft/archived rows, or one-side-missing transparently fall back to static. The category-page car grid, per-car pricing (`dailyPrice`), `cat.minPrice`, `categoryGradients`, and hand-authored Arabic intros (`descs`) all deliberately stayed on `data.ts` — list-data and pricing migration is queued for 6.2D. City-page Arabic titles use the `تأجير سيارات في [city]` wording (6.2B's `6960242` initially shipped a `بـ`-prefix variant; follow-up `9090d39` reverted to `في`). Build baseline holds at 237 static pages. Pre-existing observation surfaced during 6.2C verification: every public route renders **two** JSON-LD `<script>` blocks, one of which is a layout-level `LocalBusiness` block hard-coded to Riyadh regardless of the page's city — predates 6.2C and is queued as **Task 6.2X — Fix duplicated/global LocalBusiness JSON-LD** (small standalone cleanup) before car detail migration. Car detail (6.2D), homepage + static (6.2E), and SEO validation (6.3) follow. Latest `main` HEAD: `2f59f43`.

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
