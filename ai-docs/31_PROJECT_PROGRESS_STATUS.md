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
**Commit:** `2f59f43`.
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
- **Pre-existing observation surfaced during 6.2C verification:** every public route's prod HTML contains **two** `<script type="application/ld+json">` blocks — a layout-level one that always emits `LocalBusiness.name = "تأجير سيارات — الرياض"` regardless of the page's city, plus the page-level one (correctly per-city). Verified against un-modified `main` (`7a08cc3`) before 6.2C: the always-Riyadh layout block pre-dates this task. **Fixed in follow-up Task 6.2X (see below).**
- **Car detail migration (Task 6.2D) / Task 6.3 not started.**

### Task 6.2X — Fix Duplicated/Global LocalBusiness JSON-LD
**Commit:** `206a697`.
- **File changed (1):**
  - **MODIFIED** [src/app/(site)/layout.tsx](../src/app/(site)/layout.tsx) — removed the third entry of the layout-level JSON-LD `@graph` (`generateLocalBusinessSchema(getCityBySlug('riyadh')!)`); removed the now-unused `getCityBySlug` and `generateLocalBusinessSchema` imports; kept `SITE_NAME` and `SITE_URL`.
- **What was fixed:**
  - Removed the layout-level `LocalBusiness` JSON-LD that was hard-coded to Riyadh (`generateLocalBusinessSchema(getCityBySlug('riyadh')!)`).
  - Layout JSON-LD `@graph` now contains only `WebSite` + `Organization` — both city-independent site-level signals.
  - **Page-level `LocalBusiness` remains untouched** on every route that already emits one.
- **Why this was needed:**
  - Layouts in Next.js App Router don't have access to dynamic route segments. The previous code worked around this by hard-coding Riyadh, which meant every public route inherited a Riyadh `LocalBusiness` block via the `(site)` layout.
  - Non-Riyadh route pages emitted their own correct per-city `LocalBusiness` block AND inherited the stale Riyadh one — Google saw two contradictory `LocalBusiness.name` values on the same page (e.g. both `"تأجير سيارات — الرياض"` and `"تأجير سيارات — جدة"` on `/sa/jeddah`).
  - Static pages like `/about`, `/contact`, `/privacy` incorrectly claimed to be a `LocalBusiness` in Riyadh — they're not local businesses at all.
  - Car detail pages emit `Product` schema (correct for a car model) but were also inheriting the phantom Riyadh `LocalBusiness`.
- **Expected output (verified across 12 routes in prod build):**
  - `/` → 1 `LocalBusiness` (Riyadh — flagship homepage, emitted by `src/app/(site)/page.tsx`).
  - `/sa/jeddah` → 1 `LocalBusiness` (Jeddah) — no Riyadh leak.
  - `/sa/khobar` → 1 `LocalBusiness` (Khobar) — no Riyadh leak.
  - `/sa/[city]/[category]` → 1 correct per-city `LocalBusiness`.
  - `/sa/airports/[airport]` → 1 correct per-city `LocalBusiness`.
  - `/about`, `/contact`, `/privacy` → **0** `LocalBusiness` (correct — not places).
  - Car detail pages → 0 `LocalBusiness`, 1 `Product` schema (correct — a car is a Product).
  - `WebSite` + `Organization` blocks remain on **every** route.
- **Checks:**
  - ✅ `npx tsc --noEmit` exit 0
  - ✅ `npm run build` succeeded; static page count stayed at **237**.
  - ✅ Sitemap unchanged ([src/app/sitemap.ts](../src/app/sitemap.ts) not in diff).
  - ✅ `npm run db:seed` not run — not relevant (this task touches no schema, no data, no public-data adapters).
- **No DB migration. No new RPC. No new npm dependency. No admin changes. No lead form changes. No JSON-LD generator changes** (`generateBreadcrumbSchema`, `generateFAQSchema`, `generateLocalBusinessSchema` still exported from `data.ts` — all page-level emitters still use them). DB overlay adapters untouched. `src/lib/data.ts` untouched. `branch.whatsapp_number` not exposed.
- **Task 6.2D / 6.3 not started.**

### Task 6.2D — Car Detail Public Page DB Overlay
**Commit:** `369793c`.
- **Route affected:** `/sa/[city]/[category]/[car]` only. No other public route changed.
- **Files changed (2):**
  - **NEW** [src/lib/public-data/adapters/car-page.ts](../src/lib/public-data/adapters/car-page.ts) — server-only adapter; runs `getPublishedCityBySlug`, `getActiveCarCategoryBySlug`, `getActiveCarBySlug` in parallel via `Promise.all`; composes `carNameAr = ${brand_ar} ${model_ar}` to match the static `CarModel.nameAr` format; returns `{ cityNameAr, cityNameEn, categoryNameAr, categoryNameEn, carBrand, carBrandAr, carModel, carModelAr, carNameAr, carYear } | null` (null on any failure or if any of the three rows is missing/unpublished/archived; try/catch + `console.error`).
  - **MODIFIED** [src/app/(site)/sa/[city]/[category]/[car]/page.tsx](../src/app/(site)/sa/[city]/[category]/[car]/page.tsx) — both `generateMetadata` and the page component compute six overlaid identifiers (`cityNameAr`, `categoryNameAr`, `carBrand`, `carBrandAr`, `carNameAr`, `carYear`) via `overlay?.X ?? static.X`; H1, breadcrumb, hero pills, pricing section header, specs grid labels, why-this-car header, city-tips section, similar-cars header, other-cities cards, FAQ Qs/As, SSR internal-link cluster, CTA, JSON-LD Breadcrumb names, Product `name` and `brand.name` all reference the overlaid identifiers.
- **Approach: augmentation, not full DB swap** (same pattern as Tasks 6.2A/B/C).
  - `src/lib/data.ts` remains the route existence / 404 boundary.
  - DB overlay is applied only for safe scalar identity fields.
  - Static fallback remains available — DB outage, draft/archived rows, missing rows, or any-of-three-missing all transparently fall back to `data.ts`.
- **Overlay fields:**
  - `cityNameAr` ← `cities.name_ar`
  - `cityNameEn` ← `cities.name_en` (plumbed for forward compatibility).
  - `categoryNameAr` ← `car_categories.name_ar`
  - `categoryNameEn` ← `car_categories.name_en` (plumbed).
  - `carBrand` ← `cars.brand` (English; consumed by Product JSON-LD `brand.name`).
  - `carBrandAr` ← `cars.brand_ar`
  - `carModel` ← `cars.model` (plumbed).
  - `carModelAr` ← `cars.model_ar`
  - **`carNameAr` composed in adapter** as `` `${brand_ar} ${model_ar}` `` to match the static `CarModel.nameAr` format ("هيونداي اكسنت" etc.).
  - `carYear` ← `cars.year` (nullable; falls back to static when null).
- **Any-side-missing rule.** If any of the three DB rows (city / category / car) is missing/unpublished/archived, the adapter returns null and the page falls back fully to `data.ts`. This avoids mixing DB and static values across rows on the same page.
- **Static `data.ts` remains responsible for:**
  - `generateStaticParams` (`cities × carModels` cartesian product — **174** car-detail paths at build time),
  - `car.category !== cat.slug` validation (cross-segment integrity guard, the 404 boundary),
  - `car.dailyPrice` / `car.monthlyPrice` (used in title, description, OG, Twitter, hero pill, pricing card, FAQ A, other-cities cards),
  - **Product JSON-LD `lowPrice` / `highPrice` / `offerCount`** (`AggregateOffer` price fields verified static across 7 representative routes),
  - `generateCarSEOContent(car, city, cat)` and the returned `seo` object (`uniqueIntro`, `cityTips`, `whyThisCar`, `pricingDetails`, `rentalProcess`, `weeklyPrice`),
  - `car.features` (FAQ A `join`, why-this-car grid),
  - `car.description` (FAQ A),
  - `car.seats`, `car.transmissionAr`, `car.fuelAr` (hero pills, specs grid; Arabic-only fields with no DB analogue),
  - `cat.icon`, `cat.minPrice` (visual + scalar with no overlay),
  - `getCarsByCategory(cat.slug)` → `similarCars` list,
  - `getAirportsForCity(city.slug)` (FAQ #4 interpolation),
  - `getPartnersForCity(city.slug)` (FAQ #6 + Product `offerCount` fallback),
  - `categoryGradients` (visual styling for similar-car cards).
- **Pricing / offers were NOT migrated.** Adapter never queries `offers` or `branches`. `car.dailyPrice` / `car.monthlyPrice` continue to come from `data.ts.carModels[].dailyPrice`/`monthlyPrice`. **Product JSON-LD price fields remain static** — verified directly via curl on 7 prod routes: `"lowPrice":X,"highPrice":Y` matches `data.ts.carModels[].dailyPrice/monthlyPrice` exactly.
- **JSON-LD generators unchanged.** `generateBreadcrumbSchema`, `generateFAQSchema`, `generateLocalBusinessSchema`, `generateCarSEOContent` all untouched. Breadcrumb item names use overlaid identifiers so they match the visible breadcrumb. Product `name` and `brand.name` use overlaid identifiers; Product `description` continues to come from static `seo.uniqueIntro`; Product `offers` block (prices/availability/currency/offerCount) all static.
- **Sitemap unchanged.** [src/app/sitemap.ts](../src/app/sitemap.ts) was not touched.
- **Build baseline unchanged: 237 static pages.**
- **Task 6.2X invariant preserved on every car-detail route** — verified via curl: Product schema present, **zero** `LocalBusiness` blocks, `WebSite` + `Organization` present on every route.
- **Smoke tests passed (9/9 groups PASS, all transient DB mutations restored):**
  - **174/174 valid city × category × car triples** matched static seed (city/category `name_ar`, composed `carNameAr = brand_ar + model_ar`, `carBrandAr`, `carYear` aligned across every triple).
  - Missing city slug — static undefined AND adapter null → page would `notFound()`.
  - Missing category slug — same.
  - Missing car slug — same.
  - Draft city → adapter null → fallback. Restored.
  - Archived category → adapter null → fallback. Restored.
  - Archived car → adapter null → fallback. Restored.
  - Transient `cars.model_ar` edit on `hyundai-accent` → composed overlay returned `"هيونداي اختبار: اكسنت"`; static `carModels[0].nameAr` unchanged. Restored.
  - Pricing + features + description + SEO content stay static — `dailyPrice=79`, `monthlyPrice=1899`, `features.length=4`, `description=96c`, `seo.weeklyPrice=470`, `seo.uniqueIntro=229c` — all resolved from `data.ts`, not adapter.
- **Rendered output verification (prod build, 7 representative routes):** title correctly interpolates composed `carNameAr` + overlaid `cityNameAr` for `hyundai-accent`/`toyota-fortuner`/`toyota-innova`/`mercedes-e-class`/`bmw-5-series`/`toyota-camry`/`toyota-hiace`; Product schema present with static `lowPrice`/`highPrice`; 0 LocalBusiness blocks per route.
- **No DB migration. No new RPC. No new npm dependency. No admin changes. No lead form changes. No sitemap changes. No JSON-LD generator changes.** `branch.whatsapp_number` not exposed (adapter touches only `cities`, `car_categories`, and `cars` tables; no branch or offer data fetched).
- **Task 6.3 not started.**

### Task 6.3 — SEO / Sitemap / Structured Data Regression Sweep
**Commit:** `c0b1bc4`.
- **Files changed (3):**
  - **NEW** [scripts/seo-regression.ts](../scripts/seo-regression.ts) — programmatic regression sweep (~280 lines); boots a prod server on `PORT=3299` (or reuses one already listening), runs 240 assertions across 5 phases (build/sitemap, route fetch, metadata, JSON-LD, privacy). Optional `--fallback` flag adds 3 transient DB mutations with `try/finally` restoration + stderr-printed rollback SQL.
  - **NEW** [ai-docs/32_PRE_LAUNCH_REGRESSION_CHECKLIST.md](32_PRE_LAUNCH_REGRESSION_CHECKLIST.md) — human-readable checklist: how to run the automated sweep, what it covers, what still needs manual review (Lighthouse / Rich Results / mobile visual / accessibility / Vercel production), failure recovery for `--fallback`, launch sign-off checklist.
  - **MODIFIED** [package.json](../package.json) — added one script entry: `"seo:check": "node --env-file=.env.local --import tsx scripts/seo-regression.ts"`.
- **Added npm script:** `npm run seo:check`.
- **Purpose:**
  - Reusable pre-launch SEO regression sweep.
  - Verifies metadata, sitemap, JSON-LD, privacy leaks, and public structured data after the DB-overlay migration (Tasks 6.2A–D + 6.2X).
- **Default behaviour:** read-only — does not mutate the DB. Exits non-zero on any failure with a detailed failure list.
- **Optional `--fallback` behaviour (opt-in only):** transient DB mutations on three rows (`cities.jeddah.public_status='draft'`, `car_categories.luxury.status='archived'`, `cars.mercedes-e-class.status='archived'`), each wrapped in `try/finally`. Rollback SQL is printed to **stderr before each mutation** so the operator can recover manually if the script is killed mid-run. If restoration fails, the script exits non-zero with clear recovery steps.
- **Latest run:** `npm run seo:check` exited 0; **240/240 checks PASS**.
- **Coverage:**
  - Build / prerender manifest: prerendered-route count from `.next/prerender-manifest.json`; sitemap count, duplicates, absolute-URL, no-query/fragment checks.
  - 13 representative public routes fetched: `/`, `/about`, `/contact`, `/privacy`, 3 city pages (`riyadh`/`jeddah`/`khobar`), 2 category pages (`riyadh/economy`, `jeddah/luxury`), 2 car-detail pages (`riyadh/economy/hyundai-accent`, `jeddah/luxury/mercedes-e-class`), 2 airports (`king-khalid`, `king-abdulaziz`).
  - Metadata / title patterns: exact-match `<title>` for 7 city/category/car routes; OG title/description, Twitter title/description, canonical-link presence.
  - Arabic title invariants: no `"تأجير سيارات ب"` (Task 6.2B `9090d39` revert invariant) across `<title>` / `og:title` / `twitter:title` on every route.
  - JSON-LD: exactly 1 `WebSite` + 1 `Organization` per route (Task 6.2X invariant); LocalBusiness count matches per-route expectation (0 on `/about`/`/contact`/`/privacy`/car-detail; 1 on home/city/category/airport); **no Riyadh leak** on non-Riyadh routes; Product schema on car-detail with **static `lowPrice`/`highPrice` (79/1899 and 399/9499) matching `data.ts`** (Task 6.2D pricing-deferral invariant); Breadcrumb + FAQPage presence where expected.
  - Public privacy: no `whatsapp_number`, `internal_notes`, `trust_level`, `approval_status`, `assigned_company_id`, `consent_ip`, `customer_phone`, `customer_email`, `lead_activity_logs`, `auth.users` literals in any rendered HTML across all 13 routes.
- **Baseline (verified):**
  - `npm run build` passed.
  - Build worker tally: **237/237**.
  - `.next/prerender-manifest.json` route count: **236** (authoritative; the worker tally counts a few non-route generation tasks beyond the manifest).
  - Sitemap count: **231** entries (1 home + 3 trust + 6 cities + 42 categories + 174 cars + 5 airports).
- **`--fallback` was not run** during this task. Operators can invoke it at launch time with `npm run seo:check -- --fallback`.
- **`npm run db:seed` was not run** — not relevant (this task adds tooling only; touches no schema, no data, no public-data adapters).
- **No public route changes. No `src/lib/data.ts` changes. No sitemap changes. No JSON-LD generator changes. No admin changes. No lead form changes. No DB migration. No new RPC. No new npm dependency** (script uses Node built-ins + the existing `@supabase/supabase-js` only on the opt-in `--fallback` path). **No new feature task started.**

### Task 7 — Production Launch Readiness on Vercel
**Commit:** `4acabad`.
- **Files changed (2):**
  - **MODIFIED** [scripts/seo-regression.ts](../scripts/seo-regression.ts) — added `BASE` env var support so the same script can target a remote Vercel URL (e.g. `BASE=https://saudi-car-rental.vercel.app npm run seo:check`); added HTTPS support (`node:https.get`); added 3xx redirect following (Vercel custom domains sometimes 308); 15s timeout + `user-agent` header on outbound fetches; malformed-`BASE` validation guard (must start with `http://` or `https://`); host-mismatch info handling that surfaces — without failing — when the sitemap's canonical host differs from `BASE` (the script then fetches sampled sitemap paths against `BASE`).
  - **NEW** [ai-docs/33_PRODUCTION_LAUNCH_RUNBOOK.md](33_PRODUCTION_LAUNCH_RUNBOOK.md) — end-to-end launch runbook.
- **What changed in the script (summary):**
  - `BASE` env var: when set, skips local server boot and skips the local-only prerender-manifest check; replaces the latter with 5 evenly-spaced sitemap-URL sanity fetches.
  - When sitemap URLs reference a different host than `BASE` (typical when staging-URL ≠ canonical-URL), the script prints `ℹ Sitemap URLs reference host=X, BASE host=Y — fetching paths against BASE.` and rewrites the sample fetches to use `BASE`. Soft-warn rather than hard-fail.
  - HTTPS support via `node:https.get` (the prior version used `node:http.get`, which couldn't reach an HTTPS URL).
  - 3xx redirect following (up to 3 hops; relative + absolute `Location` headers).
  - Custom `user-agent: seo-regression/1.0` header and `15_000ms` timeout on outbound fetches.
  - All defaults preserved — running `npm run seo:check` with no env vars still boots the local prod server and runs against `http://localhost:3299`, exits 0 with 240/240 PASS.
- **New runbook (`33_*.md`) covers:**
  - Vercel project setup (build command, install command, runtime).
  - Vercel env vars checklist (5 vars, sensitivity flags, scope guidance).
  - DNS / TLS / domain setup.
  - Preview deployment verification.
  - Production deployment promote.
  - Production smoke test matrix §A (15 items: build, domain, TLS, robots, sitemap, cache headers, admin gate, security headers, RTL).
  - Admin smoke test matrix §B (16 items: sign-in, role gate, leads CRUD, routing, WhatsApp deeplinks, CRUD coverage).
  - Public lead form smoke test matrix §C (15 items: submission, phone normalisation, customer notes, rate limit, duplicate detection, honeypot, consent).
  - SEO verification using `BASE=<url> npm run seo:check`.
  - Manual checks: Lighthouse, Rich Results / Schema validator, mobile visual, accessibility, Vercel production spot checks.
  - 3-layer rollback plan (Vercel instant rollback, git revert + redeploy, DB-side rollback for admin mistakes).
  - `[SMOKE TEST]` lead-policy rules (mark every test lead; never delete real leads).
  - Launch sign-off checklist (canonical gate before public launch).
  - Day 0–7 post-launch monitoring guidance.
  - Deferred enhancements list (pricing migration, monitoring, analytics, etc.).
- **Local check:** `npm run seo:check` exits 0; **240/240 PASS**.
- **Remote check:** `BASE=https://saudi-car-rental.vercel.app npm run seo:check` exits 0; **244/244 PASS**.
- **Vercel URL tested:** `https://saudi-car-rental.vercel.app` (preview / staging deployment).
- **Operational observation (not a bug):**
  - `NEXT_PUBLIC_SITE_URL` on the Vercel deploy is set to `https://cars-renting.com` (the intended customer-visible production domain).
  - The sitemap therefore emits absolute URLs with `cars-renting.com` host.
  - `saudi-car-rental.vercel.app` is the Vercel deployment URL used for staging verification before DNS cuts over.
  - The script correctly detected this host mismatch and safely fetched sampled sitemap paths against `BASE` (`/sa/jeddah/7-seater`, `/sa/dammam/sedan/hyundai-sonata`, `/sa/makkah/luxury/mercedes-e-class`, `/sa/airports/taif`, `/`) — all returned 200.
  - At launch, DNS for `cars-renting.com` should point to Vercel so canonical sitemap URLs resolve directly.
- **No app/runtime files changed. No public route files changed. No DB/schema changes. No new npm dependency. No admin changes. No lead-form changes. No pricing migration. No new feature task started.**

#### Follow-up fix — Lead form city pre-selection
**Commit:** `509a9bb`.

- **Reason:** during operator-driven production smoke testing against `https://saudi-car-rental.vercel.app`, the customer visiting `/sa/riyadh` saw the public lead form with **no city pre-selected** despite the URL implying Riyadh. Investigation confirmed this was a UX bug only — **not data corruption**. Leads cannot be created with missing `city_id` because two independent guards block empty `city_slug`:
  - **Client guard** in [src/components/lead-form.tsx](../src/components/lead-form.tsx) — submission is rejected with `"الرجاء تعبئة جميع الحقول"` if any required field (including city) is empty.
  - **Server guard** in [src/lib/leads/create-lead.ts](../src/lib/leads/create-lead.ts) — `getCityIdBySlug(v.value.city_slug)` returns null for missing/empty/invalid slug, and the action returns `"unknown_city"` rather than writing to DB. The validator also enforces a slug-shape regex on `city_slug`. `leads.city_id` is `NOT NULL` in the schema.
- **Root cause:** no page passed a `defaultCitySlug` to `<LazyLeadForm/>` — and the prop didn't exist on either `LazyLeadFormProps` or `LeadFormProps`. The form's only city-resolution mechanism was the `CityContext` provider, which initializes to `''` and only updates when the user manually picks a city. Pages with city context (city / category / car-detail / airport routes) had no way to communicate that context to the form.
- **Files changed (6):**
  - **MODIFIED** [src/components/lazy-lead-form.tsx](../src/components/lazy-lead-form.tsx) — added `defaultCitySlug?: string` to `LazyLeadFormProps`; props spread through to `<LeadForm/>` unchanged.
  - **MODIFIED** [src/components/lead-form.tsx](../src/components/lead-form.tsx) — added `defaultCitySlug?: string` to `LeadFormProps`; `useState` for `city` initializes as `defaultCitySlug ?? ''`. `CityContext` sync `useEffect` left untouched — context still overrides the default when the user has actively picked a city earlier in their session (cross-page navigation case).
  - **MODIFIED** [src/app/(site)/sa/[city]/page.tsx](../src/app/(site)/sa/[city]/page.tsx) — `<LazyLeadForm defaultCitySlug={city.slug}/>`
  - **MODIFIED** [src/app/(site)/sa/[city]/[category]/page.tsx](../src/app/(site)/sa/[city]/[category]/page.tsx) — added `defaultCitySlug={city.slug}` to existing `defaultCategorySlug` prop.
  - **MODIFIED** [src/app/(site)/sa/[city]/[category]/[car]/page.tsx](../src/app/(site)/sa/[city]/[category]/[car]/page.tsx) — added `defaultCitySlug={city.slug}` alongside existing `selectedCarSlug` + `defaultCategorySlug`.
  - **MODIFIED** [src/app/(site)/sa/airports/[airport]/page.tsx](../src/app/(site)/sa/airports/[airport]/page.tsx) — added `defaultCitySlug={city.slug}` alongside existing `airportSlug`. `city` is in scope as the resolved static city from `ap.citySlug`.
- **Behaviour after fix:**
  - `/` (homepage) — city dropdown empty (no change — intentional).
  - `/sa/[city]` — city dropdown pre-selects the page's city (e.g. الرياض on `/sa/riyadh`).
  - `/sa/[city]/[category]` — city pre-selected + vehicle pre-selected.
  - `/sa/[city]/[category]/[car]` — city pre-selected + vehicle pre-selected + `selectedCarSlug` still posted to backend.
  - `/sa/airports/[airport]` — city pre-selected (derived from `ap.citySlug`) + `airportSlug` still posted to backend.
- **Existing-lead impact:** none. No DB row could ever have had a missing `city_id` (NOT NULL + dual-layer guards), so all existing production leads are well-formed.
- **No backend change. No DB / schema / RPC change. No admin change. No SEO / JSON-LD / sitemap / `src/lib/data.ts` / DB-overlay-adapter change. No new npm dependency. `branch.whatsapp_number` not exposed.**
- **Checks:** `npx tsc --noEmit` exit 0 · `npm run build` 237/237 static pages · `npm run seo:check` 240/240 PASS.
- **Pending:** browser smoke tests 1–8 from the operator-driven smoke (visit each URL, confirm dropdown state; submit two `[SMOKE TEST]` leads) require a Vercel redeploy of this commit. The remote `BASE=https://saudi-car-rental.vercel.app npm run seo:check` will be re-run once Vercel picks up the new commit.
- **Next step:** re-run production lead-form smoke test against the redeployed Vercel URL.

#### Follow-up fix — Header city selector sync
**Commit:** `7a9e9dc`.

- **Reason:** after `509a9bb`, the form's local city state pre-selected correctly on URL-scoped pages, but the **global header `city-selector-btn`** (rendered by [src/components/city-switcher.tsx](../src/components/city-switcher.tsx) inside the site header) still displayed the placeholder "اختر المدينة". Investigation showed:
  - The header `CitySwitcher` reads from `CityContext.selectedCity` only — it has no awareness of `LeadForm`'s local state or `defaultCitySlug` prop.
  - `CityProvider` ([src/components/city-context.tsx](../src/components/city-context.tsx)) initializes `selectedCity` to `''` and is only updated when the user manually picks a city.
  - The previous fix (`509a9bb`) seeded the form's local state but never propagated the URL-derived city into the shared context that the header reads from.
- **Fix:** added a single small `useEffect` to [src/components/lead-form.tsx](../src/components/lead-form.tsx) that mirrors `defaultCitySlug` → `CityContext.selectedCity` on mount and whenever the prop changes (e.g. client-side navigation between city-scoped pages). The effect's dep array is `[defaultCitySlug]` only — manual user picks via the form/header dropdowns still win because they fire `setSelectedCity` directly, and this effect doesn't re-fire (the prop hasn't changed).
- **Files changed (1):**
  - **MODIFIED** [src/components/lead-form.tsx](../src/components/lead-form.tsx) — added one `useEffect` (~10 lines including the comment). All other lead-form logic preserved verbatim, including the `509a9bb` local-state initializer (`useState(defaultCitySlug ?? '')`) and the existing context → local sync `useEffect`.
- **Behaviour after fix:**
  - `/` (homepage) — header shows "اختر المدينة" (unchanged — no `defaultCitySlug` is passed).
  - `/sa/riyadh` — header shows "الرياض"; form city dropdown shows "الرياض".
  - `/sa/jeddah` — header shows "جدة"; form city shows "جدة".
  - `/sa/jeddah/luxury` — header shows "جدة"; form city + vehicle pre-selected ("جدة" + "فاخرة").
  - `/sa/airports/king-abdulaziz` — header shows "جدة" (derived from `ap.citySlug`); form city pre-selected.
  - **Manual user selection** still works: header dropdown / form dropdown fires `setSelectedCity` → context updates → both header and form follow.
  - **Client navigation** between URL-scoped pages updates header + form automatically (effect re-fires because `defaultCitySlug` prop changed).
- **No backend change. No DB / schema / RPC change. No admin change. No SEO / JSON-LD / sitemap / `src/lib/data.ts` / DB-overlay-adapter change. No `city-context.tsx` / `city-switcher.tsx` / `lazy-lead-form.tsx` / `header-inner.tsx` / `package.json` change. No new npm dependency. `branch.whatsapp_number` not exposed.**
- **Checks:** `npx tsc --noEmit` exit 0 · `npm run build` 237/237 static pages · `npm run seo:check` 240/240 PASS.
- **Pending:** browser smoke tests still require a Vercel redeploy of this commit. After redeploy, verify header label + form dropdown on the 6 representative URLs, plus manual-override and client-navigation edge cases.
- **Next step:** re-run production lead-form smoke test against the redeployed Vercel URL.

#### Follow-up fix — Header city selection navigation
**Commit:** `44888f7`.

- **Reason:** the previous fixes synced the header `city-selector-btn` label to the URL on first load and the form dropdown, but **picking a new city from the header dropdown did not change the URL**. The user stayed on the current route (e.g. on `/sa/riyadh`, picking جدة updated the header label and form, but left them on Riyadh's landing page). That was confusing — the new city's content wasn't shown.
- **Fix:** `CitySwitcher` now also performs a client-side navigation to the chosen city's landing page. On city option click, it calls `setSelectedCity(c.slug)` AND `router.push(`/sa/${c.slug}`)`. The destination pages are all SSG'd (part of the 236 prerendered routes), so navigation is fast.
- **File changed (1):**
  - **MODIFIED** [src/components/city-switcher.tsx](../src/components/city-switcher.tsx) — added `useRouter` import from `next/navigation`; instantiated `const router = useRouter()`; wrapped the option `onClick` to call both `setSelectedCity` and `router.push`. Net +6 lines / −1 line.
- **Behaviour after fix:**
  - `/` + select جدة → `/sa/jeddah` (header + form both show جدة)
  - `/sa/riyadh` + select جدة → `/sa/jeddah`
  - `/sa/jeddah/luxury` + select الرياض → `/sa/riyadh` (category segment intentionally dropped)
  - `/sa/jeddah/luxury/bmw-5-series` + select الدمام → `/sa/dammam` (category + car segments dropped)
  - `/sa/airports/king-abdulaziz` + select الخبر → `/sa/khobar` (airport segment dropped)
  - `/about` + select مكة المكرمة → `/sa/makkah`
  - Same-city click → URL stays unchanged (`router.push` to current URL is a Next no-op)
  - `LeadForm` sync remains intact via the existing effects (`509a9bb` + `7a9e9dc`); no double-sets or loops because `7a9e9dc`'s guard skips when `defaultCitySlug === selectedCity`, which is the post-navigation state.
- **No backend change. No DB / schema / RPC change. No admin change. No SEO / JSON-LD / sitemap / `src/lib/data.ts` / DB-overlay-adapter / public-data-adapter change. No LeadForm / `city-context.tsx` / `lazy-lead-form.tsx` / `header-inner.tsx` / `package.json` change. No new npm dependency.** `branch.whatsapp_number` not exposed.
- **Checks:** `npx tsc --noEmit` exit 0 · `npm run build` 237/237 static pages · `npm run seo:check` 240/240 PASS.
- **Pending:** browser smoke tests still require a Vercel redeploy of this commit.
- **Next step:** re-run header navigation + production lead-form smoke test against the redeployed Vercel URL.

#### Production smoke test result — Vercel preview deployment

- **Vercel URL tested:** `https://saudi-car-rental.vercel.app`
- **Result:** ✅ **PASSED.** End-to-end production smoke test completed against the Vercel preview deployment.
- **Smoke-test lead created:** `SCR-202605-00004` (id `035a466d-218c-4bba-8c3e-c7d1ec69edbb`).
- **Verified end-to-end (operator browser + Supabase MCP DB inspection):**
  - Header city navigation works — picking a city from the header dropdown updates `CityContext` AND navigates to `/sa/[citySlug]`.
  - City pre-selection works — landing on `/sa/jeddah` shows جدة in both the header `city-selector-btn` and the form's city dropdown on first load.
  - Public lead form submission works end-to-end against the deployed Vercel runtime.
  - `source_page = /sa/jeddah` ✓
  - `city_id` resolved to Jeddah (`slug='jeddah'`, `name_ar='جدة'`) ✓
  - `customer_notes` contains `[SMOKE TEST] Header city navigation and lead form verification` ✓
  - Consent fields populated: `consent_accepted=true`, `consent_text_version='v1-2026-05'`, `consent_ip='37.43.115.9'`, `consent_accepted_at` set ✓
  - Phone normalisation works: stored as `+966543270222` (E.164, matches DB CHECK constraint) ✓
  - `lead_activity_logs` has the `lead_created` entry (1 row total, no duplicate flag — fresh phone) ✓
  - `selected_car_id IS NULL` (correct — submitted from city page, not car detail) ✓
  - `status = 'new'` ✓
  - Admin login works (cookie auth via `@supabase/ssr` against the Vercel deploy).
  - Admin lead detail page opens at `/admin/leads/[id]` and renders the full lead card.
  - Activity log visible (gold-dot timeline) on the lead detail page.
  - Routing panel visible (company / branch picker + WhatsApp message preview + Copy / Open WhatsApp / Mark as sent actions).
- **Smoke-test lead handling:** the lead was **preserved**, not deleted. Per [33_PRODUCTION_LAUNCH_RUNBOOK.md §10](33_PRODUCTION_LAUNCH_RUNBOOK.md), real and smoke-test leads must not be deleted from the DB; the audit trail in `lead_activity_logs` would be lost.
- **Recommended later action:** archive this smoke-test lead through the admin UI (status change to `archived`) when operationally desired — **not via DB delete**. The `[SMOKE TEST]` prefix in `customer_notes` makes it easy to filter in `/admin/leads` later.

#### 🚀 Launch verification — production domain live

- **Production domain live:** **`https://www.cars-renting.com`**
- **Final production SEO check:** `BASE=https://www.cars-renting.com npm run seo:check` → **244/244 PASS**.
- **Routes verified (all return 200 with expected Arabic titles):**
  - `https://www.cars-renting.com/` — homepage
  - `https://www.cars-renting.com/sa/riyadh` — city page
  - `https://www.cars-renting.com/sa/jeddah/luxury` — category page
  - `https://www.cars-renting.com/sa/jeddah/luxury/bmw-5-series` — car detail page
  - `https://www.cars-renting.com/admin/login` — admin gate
- **No errors found.** All SEO / JSON-LD / privacy / sitemap invariants hold on the live canonical domain. **Launch checks complete.** ✅
- **Apex behaviour:** `https://cars-renting.com/` returns 200 and redirects to `https://www.cars-renting.com/`. Crawlers and SEO tools follow the redirect correctly.
- **Observation (not a launch blocker):** the sitemap currently emits `https://cars-renting.com/...` URLs (apex, no `www.`) while the live canonical is `https://www.cars-renting.com/...`. Apex redirects to www, so all script-side sample fetches passed. The script's host-mismatch info line surfaces this cleanly:
  - `ℹ Sitemap URLs reference host=cars-renting.com, BASE host=www.cars-renting.com — fetching paths against BASE.`
- **Recommended optional cleanup (post-launch hygiene, low priority):** update `NEXT_PUBLIC_SITE_URL` in Vercel project settings from `https://cars-renting.com` to `https://www.cars-renting.com`, redeploy, and re-run `BASE=https://www.cars-renting.com npm run seo:check`. After the change, the sitemap host will exactly match the canonical www domain — a slightly cleaner SEO signal to crawlers. **Not a launch blocker** because apex → www redirect already handles all crawler traffic correctly.

#### Follow-up fix — `SITE_URL` env-var wiring
**Commit:** `73eec05`.

- **Reason:** when the operator tried the recommended post-launch cleanup (updating `NEXT_PUBLIC_SITE_URL` on Vercel from apex to `www`), the change had no effect on rendered HTML even after a clean redeploy. Investigation confirmed [src/lib/data.ts:4](../src/lib/data.ts) was a **hardcoded TypeScript constant** — `export const SITE_URL = 'https://cars-renting.com'` — that never read `process.env.NEXT_PUBLIC_SITE_URL`. Every consumer (sitemap, robots, layout, all per-page OG urls, JSON-LD generators via `metadataBase`) imports this constant, so the Vercel env var was effectively dead weight. Verified empirically by running `NEXT_PUBLIC_SITE_URL=https://www.cars-renting.com npm run build` locally and observing the built sitemap still emitted the apex host.
- **Fix:** one-line edit on `src/lib/data.ts:4` to honour the env var with a sensible fallback:
  ```ts
  export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.cars-renting.com'
  ```
  The hardcoded fallback is now `https://www.cars-renting.com` (the live canonical), so even without the env var (e.g. local dev with no `.env.local` override) the rendered output matches the production canonical.
- **Files changed (1):**
  - **MODIFIED** [src/lib/data.ts](../src/lib/data.ts) — line 4 only.
- **Verification (local build):**
  - `NEXT_PUBLIC_SITE_URL=https://www.cars-renting.com npm run build` → sitemap emits **all 231 entries with host `www.cars-renting.com`**; homepage `canonical` and `og:url` resolve to `https://www.cars-renting.com`. ✓
  - Default `npm run build` (no env var) → fallback path takes over; sitemap also emits `www.cars-renting.com` hosts. ✓
  - `npx tsc --noEmit` exit 0 · `npm run build` 237/237 static pages · `npm run seo:check` 240/240 PASS.
- **No DB change. No admin change. No lead form change. No `sitemap.ts` / `robots.ts` / page-metadata file / JSON-LD-generator body change. No `package.json` / dependency change. No public-data adapter change.** `branch.whatsapp_number` not exposed.
- **Next step:** after Vercel redeploys this commit (with "Use existing Build Cache" disabled to be safe), run:
  ```bash
  BASE=https://www.cars-renting.com npm run seo:check
  ```
  Expected: **244/244 PASS** AND the `ℹ Sitemap URLs reference host=cars-renting.com, BASE host=www.cars-renting.com` info line should **disappear** (sitemap host will now match BASE host exactly).

#### ✅ Final verification — `SITE_URL` env-var fix live in production

- **Vercel URL:** `https://www.cars-renting.com`
- **Command:** `BASE=https://www.cars-renting.com npm run seo:check`
- **Result:** ✅ **PASS.**
- **Confirmed live:**
  - Sitemap URLs now use `https://www.cars-renting.com` (host aligned with BASE).
  - Canonical / OG `url` / JSON-LD `url` fields all use `https://www.cars-renting.com`.
  - **Host-mismatch info line is gone** — `ℹ Sitemap URLs reference host=... — fetching paths against BASE` no longer prints.
  - Remote sitemap reachability sample checks pass.
  - Production domain remains healthy.
- **Net result:** the entire SEO surface (sitemap, canonical, OG, Twitter, JSON-LD) now emits the customer-visible canonical domain directly. Crawler signals are clean — no apex → www redirect hop in structured data or sitemap entries. The Vercel `NEXT_PUBLIC_SITE_URL` env var now properly drives the rendered output (validated by the live behaviour).
- **Launch hygiene complete.** ✅

#### SEO experiment — Homepage H1
**Commit:** `70a5e86`.

- **Reason:** small, controlled SEO experiment to target the main Arabic keyword `تأجير سيارات` more clearly in the homepage H1. No new content sections, no metadata/schema/sitemap changes — H1 text only.
- **File changed (1):**
  - **MODIFIED** [src/app/(site)/page.tsx](../src/app/(site)/page.tsx) — line 21 only (H1 text).
- **Old H1:**
  ```
  تأجير سيارات في السعودية قارن واحجز بأفضل سعر
  ```
  (rendered text content; the source used `<br/>` + accent-styled `<span>` for the second line)
- **New H1:**
  ```
  تأجير سيارات في السعودية بأسعار تنافسية وخيارات موثوقة
  ```
  Source markup: `<h1 className="hero-title">تأجير سيارات في السعودية <span>بأسعار تنافسية وخيارات موثوقة</span></h1>` — preserved the `<span>` wrapper on the suffix to keep the existing gold-accent CSS treatment; dropped the `<br/>` since the new phrase has no natural break.
- **H1 count:** homepage still has **exactly 1 `<h1>`** — confirmed via inspection of locally-built `.next/server/app/index.html`.
- **Checks:**
  - ✅ `npx tsc --noEmit` exit 0
  - ✅ `npm run build` 237/237 static pages
  - ✅ `npm run seo:check` 240/240 PASS
- **No other homepage content changed. No other route changed. No sitemap / canonical / OG / Twitter metadata / JSON-LD / lead-form / DB / schema / admin / backend / `package.json` change.**
- **Post-deploy verification (operator-driven, after Vercel auto-redeploy):**
  - `BASE=https://www.cars-renting.com npm run seo:check` should still pass (244/244 expected, no host-mismatch info line).
  - View-source on the live homepage should show exactly one `<h1>` with text `تأجير سيارات في السعودية بأسعار تنافسية وخيارات موثوقة`.

#### SEO experiment — Homepage H1-only SSR
**Commit:** `25e8cc2`.

- **Goal:** the homepage page-content raw SSR visible text should be only the H1. Everything else hydrates client-side after JS loads. Controlled experiment to test how Googlebot indexes a homepage with a tight, focused SSR signal.
- **Files changed (2):**
  - **MODIFIED** [src/app/(site)/page.tsx](../src/app/(site)/page.tsx) — server component reduced from 220 lines to ~36. Keeps the JSON-LD `<script>`, the hero `<section>` scaffold (decorations, container, hero-inner, hero-text divs), the H1, and 4 `<NoSSR>`-wrapped slots that render the rest after hydration. Visual layout is preserved post-hydration because the slots (`hero-pre-h1`, `hero-post-h1`, `hero-form`, `body`) fill in their positions inside the existing hero scaffold.
  - **NEW** [src/components/homepage-client-content.tsx](../src/components/homepage-client-content.tsx) — `'use client'` slot-based component. 4 slots: `hero-pre-h1` (badge), `hero-post-h1` (subtitle + stats), `hero-form` (LazyLeadForm), `body` (all sections below the hero). Combined with `<NoSSR>` wrapping at the call sites, none of this renders to the server HTML.
- **H1 text (unchanged from `70a5e86`):**
  ```
  تأجير سيارات في السعودية بأسعار تنافسية وخيارات موثوقة
  ```
- **Result (measured on locally-built `.next/server/app/index.html`):**
  - Homepage page-content SSR visible text = **H1 only**.
  - **Total homepage raw SSR visible text = 8 Arabic words** (down from 289 — a 97% reduction).
  - Visible text length = 54 chars (down from 1,848).
  - H1 count = **1**.
  - Hydrated browser page visually remains the same as before — slot pattern preserves positions inside the hero scaffold.
- **What moved client-side:**
  - hero badge (`+4,200 طلب شهرياً`)
  - hero subtitle
  - hero stats (`+50 / 12 / 4.8 ★`)
  - lead form slot (`LazyLeadForm`)
  - both homepage H2 SSR sections (`لماذا تختار منصة تأجير سيارات؟` and `خدمات تأجير السيارات المتوفرة`)
  - FAQ visible accordion (Q&As)
  - internal-link clusters (3 H2 link grids covering cities, categories, airports)
  - all other homepage body sections (cities, why-us, categories, popular-cars, airports, CTA, disclaimer)
- **What stayed SSR:**
  - The H1.
  - Page-level JSON-LD `<script>` (FAQPage + LocalBusiness) — untouched per scope.
  - Layout-level JSON-LD (`WebSite` + `Organization`) — untouched (rendered from `(site)/layout.tsx`).
  - All metadata (title, description, canonical, OG, Twitter) — untouched (from layout `metadata` export).
  - Hero `<section>` scaffold elements (decorations, container, grid) — structural markup with zero visible text.
- **Header / footer status (separate per AC #5):**
  - `<ClientHeader>` and `<ClientFooter>` were already `dynamic({ ssr: false })` in the codebase before this task (see [src/components/client-header.tsx](../src/components/client-header.tsx) and [src/components/client-footer.tsx](../src/components/client-footer.tsx)). Both contribute **0 visible text** to raw SSR HTML.
  - Not modified by this task.
- **Important risk notes (intentional, accepted):**
  - 🟠 Crawler-visible homepage body content **dropped from 289 words to 8**.
  - 🟡 FAQ schema visible content (`<details>` accordion mirror of FAQPage JSON-LD) is now client-rendered. Google validates rich-result schemas against visible content; the schema is still in raw HTML but the matching visible content is post-hydration. **Monitor in Google Search Console** after deploy for FAQ Rich Result eligibility.
  - 🟡 Internal-link cluster (3 H2 link grids → cities × categories × airports) is now client-rendered. Link-equity distribution from the homepage to deeper routes is now behind hydration.
  - 🟢 Modern Googlebot executes JS and indexes client-rendered content; impact should be small but first-pass indexing latency may increase.
- **Checks:**
  - ✅ `npx tsc --noEmit` exit 0
  - ✅ `npm run build` 237/237 static pages
  - ✅ `npm run seo:check` 240/240 PASS (no metadata / JSON-LD / sitemap / privacy regression)
- **Post-deploy check (operator-driven, after Vercel redeploy):**
  - `BASE=https://www.cars-renting.com npm run seo:check` — expected 244/244 PASS.
  - View-source on `https://www.cars-renting.com/` should show:
    - Exactly one `<h1>` with the target text.
    - **No other visible text** from page content (no badge, no subtitle, no stats, no section headings) in the raw HTML before hydration.
- **No metadata / sitemap / robots / JSON-LD / admin / lead-form / backend / DB / schema / RPC / public-data-adapter / `package.json` change.** No other route changed.

##### ✅ Final production verification — Homepage H1-only SSR live
- **Production seo:check passed:** `BASE=https://www.cars-renting.com npm run seo:check` → **244/244 PASS**.
- **Production domain:** `https://www.cars-renting.com`.
- **No sitemap / canonical / OG / Twitter regression.**
- **No JSON-LD regression** — `WebSite`, `Organization`, page-level `LocalBusiness`, page-level `FAQPage` all still emitted in raw HTML.
- **No privacy regression** — privacy matrix clean across all probed routes.
- **Host mismatch remains gone** — sitemap host matches `BASE` host (`www.cars-renting.com`).
- **Homepage H1-only SSR experiment is live in production.** The reduction from 289 visible words → 8 visible words in raw SSR HTML is now active for crawlers and customers.
- **Note:** post-deploy `view-source:` inspection on the live homepage should still be used if we want to *visually confirm* the raw SSR visible text is the H1 only (the automated `seo:check` validates metadata + JSON-LD + privacy + sitemap shape, not visible-word count).
- **Monitor:** Google Search Console over the next 1–2 weeks for FAQ Rich Result eligibility changes and indexing-latency shifts on the homepage URL.

#### SEO experiment — Non-homepage H1 + intro SSR
**Commit:** `d281f87`.

- **Route types affected:**
  - `/sa/[city]`
  - `/sa/[city]/[category]`
  - `/sa/airports/[airport]`
  - `/sa/[city]/[category]/[car]`
- **Homepage was NOT touched.** [src/app/(site)/page.tsx](../src/app/(site)/page.tsx) and [src/components/homepage-client-content.tsx](../src/components/homepage-client-content.tsx) untouched. The homepage H1-only experiment from `25e8cc2` remains exactly as deployed.
- **Files changed (8):**
  - **MODIFIED** route pages (4): `[city]/page.tsx`, `[city]/[category]/page.tsx`, `airports/[airport]/page.tsx`, `[city]/[category]/[car]/page.tsx`
  - **NEW** client slot components (4): `city-page-client-content.tsx`, `category-page-client-content.tsx`, `airport-page-client-content.tsx`, `car-page-client-content.tsx`
- **Goal:**
  - Keep homepage unchanged.
  - For non-homepage SEO pages, raw SSR visible page content should be the H1 + one short intro paragraph only.
  - All other visible body sections (breadcrumb, pills, FAQ accordion, internal-link clusters, body grids/cards/sections, pricing card on car detail) are client-rendered after hydration.
- **Paragraph patterns (approved by operator, no overclaims, no fake trust phrases, `تأجير سيارات` as the only target keyword):**
  - **City** (`/sa/riyadh` sample): `تأجير سيارات في الرياض أصبح أسهل مع خيارات تناسب تنقلك اليومي أو رحلتك داخل المملكة. اختر المدينة والفئة المناسبة، وأرسل طلبك ليتم ترشيح الخيارات المتاحة حسب احتياجك والتوفر.`
  - **Category** (`/sa/jeddah/luxury` sample): `تأجير سيارات فاخرة في جدة مناسب لمن يبحث عن سيارة تلائم طبيعة الرحلة، سواء للتنقل اليومي أو السفر أو الزيارات. اختر الفئة المناسبة، وأرسل طلبك ليتم عرض الخيارات المتاحة حسب المدينة والتوفر.`
  - **Airport** (`/sa/airports/king-abdulaziz` sample): `تأجير سيارات من مطار الملك عبدالعزيز الدولي يساعدك على ترتيب تنقلك بعد الوصول بسهولة، سواء كانت رحلتك للعمل أو السياحة أو زيارة عائلية. اختر المدينة والفئة المناسبة، وأرسل طلبك ليتم متابعة الخيارات المتاحة حسب التوفر.`
  - **Car detail** (`/sa/riyadh/economy/hyundai-accent` sample): `تأجير سيارة هيونداي اكسنت في الرياض خيار مناسب لمن يبحث عن سيارة اقتصادية واضحة المواصفات وسهلة الطلب. راجع تفاصيل السيارة، ثم أرسل طلبك ليتم متابعة الخيارات المتاحة حسب المدينة والتوفر.`
- **Results (measured on locally-built HTML, representative routes):**
  - City `/sa/riyadh` — total SSR visible words: **32** · paragraph word count: 28 · H1 count: **1**.
  - Category `/sa/jeddah/luxury` — total SSR visible words: **37** · paragraph word count: 32 · H1 count: **1**.
  - Airport `/sa/airports/king-abdulaziz` — total SSR visible words: **42** · paragraph word count: 35 · H1 count: **1**.
  - Car detail `/sa/riyadh/economy/hyundai-accent` — total SSR visible words: **36** · paragraph word count: 30 · H1 count: **1**.
  - Exactly one H1 per tested page.
  - Exactly one `<p className="hero-subtitle">` intro paragraph under each H1.
- **What moved client-side:**
  - Breadcrumbs (in hero, above H1).
  - Hero pills (price/availability/feature badges).
  - Lead-form slots (`LazyLeadForm` with `defaultCitySlug` / `defaultCategorySlug` / `selectedCarSlug` / `airportSlug` props as before).
  - FAQ visible `<details>` accordions (the `FAQPage` JSON-LD remains SSR — visible mirror is now client-rendered).
  - Internal-link clusters (3 H2 link grids per route — sibling categories, cities, airports).
  - All body grids / cards / sections (categories grid, popular cars, similar cars, other cities, airports section, why-rent-from-airport, why-this-car, specs grid, etc.).
  - Pricing card on car detail (3-tier yearly/weekly/monthly card) — still uses static `data.ts` numbers, passed as props for visible rendering. **Product JSON-LD prices remain SSR with the same static numbers.**
- **What stayed SSR:**
  - The H1.
  - The intro paragraph directly under the H1.
  - Page-level JSON-LD `<script>` (Breadcrumb + FAQPage + LocalBusiness for city/category/airport; Breadcrumb + FAQPage + Product for car detail).
  - Metadata (title / description / canonical / OG / Twitter).
  - Hero `<section>` scaffold (decorations, container, grid layout) — structural markup with zero visible text other than H1 + intro P.
- **DB-overlay preservation:** the server pages still run the DB-overlay adapters (`getCityPageOverlayFromDb`, `getCategoryPageOverlayFromDb`, `getAirportPageOverlayFromDb`, `getCarPageOverlayFromDb`) before SSR. Resolved overlay values feed both the SSR H1+intro AND the client component props — so DB-overlaid names render consistently in raw HTML and post-hydration.
- **Important risk notes (intentional, accepted):**
  - 🟠 Crawler-visible page body content reduced significantly on non-homepage routes (was several hundred words per route → ~30-42 words per route).
  - 🟡 FAQ visible content is client-rendered while FAQ schema remains SSR; same Rich Result eligibility concern as the homepage experiment.
  - 🟡 Internal-link clusters are now client-rendered; link-equity flow from these hub-style pages to deeper routes is now behind hydration.
  - 🟢 Modern Googlebot executes JS; pricing pill on car-detail post-hydration matches the Product JSON-LD numbers exactly (both driven by static `data.ts`).
- **Checks:**
  - ✅ `npx tsc --noEmit` exit 0
  - ✅ `npm run build` 237/237 static pages (baseline unchanged)
  - ✅ `npm run seo:check` 240/240 PASS (no metadata / JSON-LD / sitemap / privacy regression)
- **No homepage change. No metadata / sitemap / JSON-LD / admin / lead-form / backend / DB / schema / RPC / public-data-adapter / pricing change.** No `package.json` change, no new dependency. `branch.whatsapp_number` not exposed.

#### Refactor — Reusable `<SeoPageHero>` pattern
**Commit:** `07cec7d`.

- **Goal:** centralize the non-homepage SEO rendering contract into a single reusable server component so future public pages (company / branch / offer / article / any new SEO landing page) follow the same H1 + intro-paragraph SSR pattern by default, and so that future upgrades to the contract (e.g. adding an internal-links block or a compact trust block) are a one-file change instead of an N-route edit.
- **Files changed (5):**
  - **NEW** [src/components/seo-page-hero.tsx](../src/components/seo-page-hero.tsx) — server component, ~75 lines including full JSDoc explaining the contract (homepage excluded, SSR = H1 + intro P only, future upgrade path).
  - **MODIFIED** [src/app/(site)/sa/[city]/page.tsx](../src/app/(site)/sa/[city]/page.tsx) — replaced inline hero scaffold + 4× repeated prop bag with `<SeoPageHero>` invocation. Net ~10-line reduction.
  - **MODIFIED** [src/app/(site)/sa/[city]/[category]/page.tsx](../src/app/(site)/sa/[city]/[category]/page.tsx) — same refactor.
  - **MODIFIED** [src/app/(site)/sa/airports/[airport]/page.tsx](../src/app/(site)/sa/airports/[airport]/page.tsx) — same refactor.
  - **MODIFIED** [src/app/(site)/sa/[city]/[category]/[car]/page.tsx](../src/app/(site)/sa/[city]/[category]/[car]/page.tsx) — same refactor, with `extraDecorations` prop carrying the second hero-glow (preserved exactly).
- **Contract (documented in the component's JSDoc):**
  - Homepage is **excluded** from this pattern — it has its own bespoke 2-glow hero with different glow dimensions and slot structure (untouched in this refactor).
  - All non-homepage public SEO pages use `<SeoPageHero>`.
  - SSR visible page content emitted by `<SeoPageHero>` is **only** the H1 + the intro paragraph passed via `introText`.
  - Non-SSR visual slots (breadcrumb, pills, lead form) are internally wrapped in `<NoSSR>` so callers don't repeat that boilerplate.
  - Client body content remains route-specific (each route ships its own `*PageClientContent` slot component) — appropriate, since each route's body is genuinely different content, not a reusable structural pattern.
- **Props:**
  - `h1` (ReactNode) — H1 inner content (typically includes a styled `<span>` for the gold accent).
  - `introText` (string) — short Arabic intro paragraph rendered as `<p className="hero-subtitle">` directly under the H1.
  - `preH1` (optional ReactNode) — client slot rendered above the H1 (typical: breadcrumb).
  - `postIntro` (optional ReactNode) — client slot rendered below the intro P (typical: pills).
  - `rightColumn` (optional ReactNode) — client slot inside `<div id="form">` (typical: lead form).
  - `extraDecorations` (optional ReactNode) — extra hero decorations rendered after the default hero-grid + hero-glow (e.g. the second glow on car detail).
- **Current route users (4):**
  - `/sa/[city]`
  - `/sa/[city]/[category]`
  - `/sa/airports/[airport]`
  - `/sa/[city]/[category]/[car]`
- **Future use (any new public SEO landing page):**
  - Company pages.
  - Branch pages.
  - Offer pages.
  - Article pages.
  - Any new SEO landing page.
- **Result (verified on locally-built HTML for all 4 representative routes):**
  - SSR output pattern unchanged: exactly **1 H1** + exactly **1 intro paragraph** per route.
  - Representative SSR visible word counts unchanged from the pre-refactor `d281f87` baseline:
    - `/sa/riyadh`: 32 words
    - `/sa/jeddah/luxury`: 37 words
    - `/sa/airports/king-abdulaziz`: 42 words
    - `/sa/riyadh/economy/hyundai-accent`: 36 words
  - Car-detail second `hero-glow` preserved via `extraDecorations` (visual structure byte-identical to pre-refactor).
  - All H1 texts and intro paragraph texts preserved verbatim.
- **Future upgrade path (documented in the component JSDoc):**
  - Internal-links block or compact trust block can later be added as a new approved prop on `<SeoPageHero>`. A single edit to the component propagates to every route that uses it; pages that don't want the new SSR content simply don't pass the new prop.
- **Checks:**
  - ✅ `npx tsc --noEmit` exit 0
  - ✅ `npm run build` 237/237 static pages (baseline unchanged)
  - ✅ `npm run seo:check` 240/240 PASS (no metadata / JSON-LD / sitemap / privacy regression)
- **No homepage / metadata / sitemap / JSON-LD / admin / lead-form / backend / DB / pricing changes.** No `package.json` change, no new dependency. Public-data adapters untouched. `branch.whatsapp_number` not exposed.

##### ✅ Final production verification — `<SeoPageHero>` refactor live
- **Production seo:check passed:** `BASE=https://www.cars-renting.com npm run seo:check` → **244/244 PASS**.
- **Production domain:** `https://www.cars-renting.com`.
- **Reusable `<SeoPageHero>` pattern is live in production.** All four non-homepage SEO routes (`/sa/[city]`, `/sa/[city]/[category]`, `/sa/airports/[airport]`, `/sa/[city]/[category]/[car]`) render through the shared component.
- **No sitemap / canonical / OG / Twitter regression.**
- **No JSON-LD regression** — `WebSite`, `Organization`, page-level `LocalBusiness`, `FAQPage`, `BreadcrumbList`, and `Product` (on car-detail) all still emitted correctly.
- **No privacy regression** — privacy matrix clean across all probed routes.
- **Homepage remains untouched** — `src/app/(site)/page.tsx` and `src/components/homepage-client-content.tsx` were not modified by this refactor; the homepage H1-only SSR experiment (`25e8cc2`) continues to run unchanged in production.
- **Non-homepage route rendering contract (now canonical):**
  - **SSR** = exactly one H1 + exactly one short Arabic intro paragraph (`<p className="hero-subtitle">`) directly under the H1.
  - **CSR** = remaining body content (breadcrumb, pills, lead form, FAQ accordion, internal-link clusters, body sections, pricing card on car detail).
  - The contract is encoded in [src/components/seo-page-hero.tsx](../src/components/seo-page-hero.tsx) JSDoc.
- **Future public SEO pages should use `<SeoPageHero>` by default** — company / branch / offer / article / any new SEO landing page should author against this contract rather than duplicating the hero scaffold. Any future global change to the SSR contract (e.g. adding an internal-links block or compact trust block) becomes a one-file edit to the component.

### Task 11.1 — Smart City-Switcher Navigation

- **Implementation commit:** `24608e3`
- **Files changed:**
  - **NEW** [src/lib/search/url-builder.ts](../src/lib/search/url-builder.ts) — pure helper `buildRouteFromContext(targetCitySlug, currentPathname)` that parses the current route's segments (airport / city / category / car) and returns the equivalent route in the target city, with safe fallbacks.
  - **MODIFIED** [src/components/city-switcher.tsx](../src/components/city-switcher.tsx) — header dropdown now reads `usePathname()` and calls `router.push(buildRouteFromContext(c.slug, pathname))` instead of the previous hardcoded `/sa/${c.slug}`. `CityContext` sync is preserved.
- **Goal:** header city switching now preserves the current route context where safe, so a visitor browsing `/sa/jeddah/luxury/bmw-5-series` can change city without dropping back to the city landing page.
- **Behavior examples:**
  - `/sa/jeddah` → `/sa/riyadh`
  - `/sa/jeddah/luxury` → `/sa/riyadh/luxury`
  - `/sa/jeddah/luxury/bmw-5-series` → `/sa/riyadh/luxury/bmw-5-series` (valid `(category, car)` combo)
  - Invalid car (or `car.category` mismatch) → fallback to `/sa/[city]/[category]`
  - Invalid category → fallback to `/sa/[city]`
  - `/sa/airports/king-abdulaziz` + Riyadh → `/sa/airports/king-khalid` (city → airport via `airports.find(a => a.citySlug === target)`)
  - Target city without an airport in the dataset (e.g. Tabuk) → fallback to `/sa/[city]`
  - Public non-city page (`/`, `/contact`, `/privacy`, etc.) → `/sa/[city]`
- **Scope confirmations:**
  - No backend / server-action / DB / RPC / schema / migration changes.
  - No admin change.
  - No SEO contract change — `<SeoPageHero>` untouched; SSR `H1 + intro P` invariant preserved.
  - No metadata / JSON-LD / sitemap / robots / canonical change.
  - No lead-form change.
  - No homepage change — `src/app/(site)/page.tsx` and `src/components/homepage-client-content.tsx` untouched.
  - No `package.json` change, no new dependency.
  - No Phase 11 follow-up work started (no modal, no date picker, no search context provider, no airport mode toggle, no category cards, no search bar, no car-name autocomplete).
- **Checks:**
  - `npx tsc --noEmit` — PASS.
  - `npm run build` — PASS (all SSG paths still generated: 6 cities × 1 city + 7 categories + 29 cars + 5 airports).
  - `npm run seo:check` — **240/240 PASS** locally.
- **Next recommended task:** Task 11.2 — Date Range Picker UX (deferred; do not start without explicit approval).

### Task 11.2 — Date Range Picker + In-Form Smart Navigation

- **Implementation commit:** `3be92e3`
- **Files changed:**
  - **NEW** [src/lib/search/date-presets.ts](../src/lib/search/date-presets.ts) — pure helpers: `DATE_PRESETS` array, `addDays`, `diffDays`, `formatDateDisplay` (DD/MM/YYYY), `daysLabelAr` (proper Arabic plural: `يوم واحد` / `يومان` / `N أيام` / `N يوماً`), `detectPreset`. UTC day arithmetic — no timezone drift.
  - **NEW** [src/components/search/date-range-picker.tsx](../src/components/search/date-range-picker.tsx) — client component with a single labeled section `مدة التأجير`, summary row (`DD/MM/YYYY ← DD/MM/YYYY` + Arabic days count in gold), six preset chips, and a `مخصص` toggle that reveals the native date inputs. Controlled by `pickup` / `ret` / `onChange` / `today` props. No new dependency.
  - **MODIFIED** [src/components/lead-form.tsx](../src/components/lead-form.tsx) — imports `useRouter` + `buildRouteFromContext`; the two `<input type="date">` fields are replaced by a single `<DateRangePicker>` instance; new `handleVehicleChange` and updated `handleCityChange` route via the smart helper; backend payload shape preserved.
- **Goals:**
  - replace two separate pickup/return date fields with a smarter single date range picker.
  - align in-form city/category selection with the route-context behavior the header already uses (Task 11.1).
- **Date picker behavior:**
  - one visible section labeled `مدة التأجير`.
  - presets: `اليوم` (today → today+1), `غدًا` (today+1 → today+2), `يومين` (today → today+2), `أسبوع` (today → today+7), `شهر` (today → today+30), `مخصص` (reveals native date inputs).
  - output still resolves to `pickup_date` / `return_date` as `YYYY-MM-DD` — backend contract unchanged.
  - custom mode keeps native `<input type="date">` fields (mobile-friendly OS picker, no JS calendar dependency).
  - return date cannot be before pickup date — `min={pickup || today}` on the return input, plus the existing `useEffect (pickup, ret)` ret-clamp safety net.
- **In-form navigation behavior:**
  - changing city in the form calls `buildRouteFromContext(newCitySlug, pathname)` — same helper as the header.
  - city changes preserve category / car / airport context where valid (`/sa/jeddah/luxury/bmw-5-series` + Riyadh → `/sa/riyadh/luxury/bmw-5-series`; `/sa/airports/king-abdulaziz` + Riyadh → `/sa/airports/king-khalid`).
  - changing category in the form navigates to `/sa/[city]/[category]`.
  - changing category on a car detail route drops the old car slug (new route is the category page).
  - changing category on an airport route stays as local form state (does NOT change the URL) — `/sa/airports/<airport>` is not category-aware and silently dropping airport context would be more destructive than the user expects. Category still rides to the backend via the unchanged `createLead` payload.
  - same-city / same-category re-pick is a no-op (guarded against `defaultCitySlug` / `defaultCategorySlug`).
  - date changes do NOT affect the URL — dates remain pure form state.
- **Backend preservation:**
  - `createLead` payload shape unchanged: `customer_phone`, `city_slug`, `pickup_date`, `return_date`, `category_slug`, `selected_car_slug`, `airport_slug`, `request_type`, `pickup_location`, `customer_notes`, `source_page`, `utm`, `honey`.
  - existing validation, rate limit (10/IP/hour), duplicate detection, URL stripping in notes, Riyadh date floor, honeypot, consent — all unchanged.
- **Tested URL examples** (traced through `handleCityChange` / `handleVehicleChange` / `buildRouteFromContext`):
  - `/sa/jeddah` + city Riyadh → `/sa/riyadh`
  - `/sa/jeddah/luxury` + city Riyadh → `/sa/riyadh/luxury`
  - `/sa/jeddah/luxury/bmw-5-series` + city Riyadh → `/sa/riyadh/luxury/bmw-5-series` (valid combo)
  - `/sa/airports/king-abdulaziz` + city Riyadh → `/sa/airports/king-khalid`
  - `/` + city Riyadh → `/sa/riyadh`
  - `/sa/jeddah` + category suv → `/sa/jeddah/suv`
  - `/sa/jeddah/luxury/bmw-5-series` + category economy → `/sa/jeddah/economy` (car dropped)
  - `/sa/airports/king-abdulaziz` + category suv → URL unchanged; `vehicle='suv'` retained in form state
  - any date preset / custom edit → URL unchanged
- **Scope confirmations:**
  - no backend / server-action / DB / RPC / schema change.
  - no admin change.
  - no `<SeoPageHero>` change — SSR `H1 + intro P` invariant preserved.
  - no metadata / JSON-LD / sitemap / robots / canonical change.
  - no homepage change.
  - no `<CitySwitcher>` change beyond Task 11.1.
  - no `package.json` change, no new dependency.
  - no other Phase 11 work started — no search context provider, no airport toggle, no category cards, no lead capture modal, no autocomplete, no search bar.
- **Checks:**
  - `npx tsc --noEmit` — PASS.
  - `npm run build` — PASS.
  - `npm run seo:check` — **240/240 PASS** locally.
- **Next recommended task:** Task 11.3 — Search Context Provider. Recommended because in-form city/category changes currently trigger a full page navigation (the form remounts and loses date/phone/notes state). A search context (URL params + session storage) would let the date/phone state survive route changes, which is a natural prerequisite for the upcoming lead capture modal (Task 11.7) and search bar (Task 11.6).

### Recent Operational Fixes

A running list of post-task fixes that don't constitute new tasks:

- **`3be92e3` — Date range picker + in-form smart navigation.** See the Task 11.2 entry above.
- **`24608e3` — Smart city-switcher navigation preserves route context.** See the Task 11.1 entry above.
- **`07cec7d` — Centralized non-homepage SEO hero pattern (`<SeoPageHero>` reusable server component).** See the refactor block above.
- **`d281f87` — Non-homepage routes reduced to H1 + intro SSR (city/category/airport/car-detail).** See the SEO experiment block above.
- **`25e8cc2` — Homepage H1-only SSR experiment (everything else client-rendered).** See the SEO experiment block above.
- **`70a5e86` — Homepage H1 keyword-clearer rewrite (SEO experiment).** See the SEO experiment block above.
- **`73eec05` — `SITE_URL` now reads from `NEXT_PUBLIC_SITE_URL` env var (canonical/OG/sitemap/JSON-LD hosts now configurable).** See the follow-up fix block above.
- **`44888f7` — Header city selection navigates to `/sa/[city]`.** See the follow-up fix block above.
- **`7a9e9dc` — Header city selector sync with URL-scoped pages.** See the follow-up fix block above.
- **`509a9bb` — Lead form city pre-selection on URL-scoped pages.** See the follow-up fix block above.
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
- Public pages reading from Supabase — partial: `/sa/airports/[airport]` (Task 6.2A), `/sa/[city]` (Task 6.2B), `/sa/[city]/[category]` (Task 6.2C), and `/sa/[city]/[category]/[car]` (Task 6.2D) now apply DB overlays over `src/lib/data.ts`. The remaining public routes (`/`, `/about`, `/contact`, `/privacy`) still render purely from `src/lib/data.ts`. **Pricing migration is still pending across all four migrated routes** — `car.dailyPrice`, `car.monthlyPrice`, `cat.minPrice`, the category car grid, `categoryGradients`, per-category Arabic intros (`descs`), per-car features/description, `generateCarSEOContent` content blocks, and Product JSON-LD `lowPrice`/`highPrice` all remain on `data.ts`. A future dedicated pricing task should migrate these once the ranking rule (e.g. "cheapest visible offer per car/city" via `offers` table) is decided.
- ~~Layout-level `LocalBusiness` JSON-LD always emits Riyadh~~ **Fixed by Task 6.2X (`206a697`).** Every public route now has exactly one coherent `LocalBusiness` block where appropriate (correct per-city) and zero on routes that aren't local businesses (`/about`, `/contact`, `/privacy`, car detail). Layout-level JSON-LD now contains only `WebSite` + `Organization`. Verified by `npm run seo:check` (Task 6.3).
- Automated regression sweep: `npm run seo:check` (Task 6.3) covers metadata, JSON-LD, sitemap, and public-privacy invariants programmatically (240/240 PASS at last run). Pricing migration and homepage migration are still pending (see §9). The script's optional `--fallback` flag also tests the DB-overlay fallback path; it's opt-in only because it does transient DB mutations.
- Rate limiting on `/admin/login` (the public lead-form endpoint is rate-limited; the admin sign-in form is not — Supabase Auth's own rate limit applies but app-side is unchanged).
- Profanity filter on `customer_notes` (URL stripping is in place; explicit profanity matching is not).
- Password reset flow.
- Email verification flow.
- n8n / automation pipelines.
- Booking / payment.
- Mobile app.

---

## 9. Recommended Next Tasks

Phase 6 is structurally complete (all four public detail routes on the augmentation pattern; layout-level JSON-LD cleaned up; automated regression sweep in place) and Task 7 has landed: the `seo:check` script can now target a remote Vercel URL via `BASE=`, and [ai-docs/33_PRODUCTION_LAUNCH_RUNBOOK.md](33_PRODUCTION_LAUNCH_RUNBOOK.md) is the canonical launch runbook. The Vercel preview at `https://saudi-car-rental.vercel.app` passes 244/244 remote checks. **No further code work is required to launch.**

### Recommended next step — Production smoke testing using the runbook (not a new feature)

Open [ai-docs/33_PRODUCTION_LAUNCH_RUNBOOK.md](33_PRODUCTION_LAUNCH_RUNBOOK.md) and run the three smoke matrices (§§A, B, C) against the production URL (once DNS for `cars-renting.com` is pointing at Vercel), plus the manual SEO checks (Lighthouse, Rich Results, mobile, accessibility). Tick every line in the launch sign-off checklist (§11). That is the canonical launch gate. **This is operator work, not a code task.**

If the smoke runs surface a real bug (e.g. cookie domain mismatch, missing env var), each fix lands as its own small commit with its own approval — not bundled into Task 7. Task 7's deliverables (the script enhancement + the runbook) are complete.

### Future code work (deferred — do NOT start without explicit approval)

#### Task 6.4 — Public Pricing Strategy / Offers Price Overlay Planning

A dedicated future task should migrate per-car prices from `offers` only after the ranking rule is decided — for example, **"cheapest visible offer per car-in-city"** computed as `MIN(offers.daily_price_from)` where:

- `offers.status='active' AND offers.public_status='published'`
- `offers.approval_status IN ('approved','auto_approved')`
- `offers.availability_status <> 'unavailable'`
- Parent visibility (company / branch / car) is also published/active
- Optional: `offers.city_id` matches the route city

Once the ranking is settled, the existing `car-page` adapter shape can absorb `dailyPrice` / `monthlyPrice` overlay fields, Product JSON-LD `lowPrice` / `highPrice` shift to live data, and `cat.minPrice` / `data.ts.carModels[].dailyPrice` interpolations become DB-driven. This task should produce a written design (ranking rule, fallback strategy when no live offer exists, JSON-LD price stability rules) before any code is written.

**Why deferred:**
- Without a clear ranking rule, premature pricing-overlay code would shift Product schema prices in ways Google indexes and ranks against — content drift, not plumbing.
- Today's static fallback is unambiguous and correct for SEO; the cost of waiting is low.
- Pricing migration is best gated on a live admin / partner workflow where offers are actively edited; that's a Phase 2 concern.

### Task 6.2E — Homepage + static pages migration (future)

Route candidates: `/`, `/about`, `/contact`, `/privacy`. Homepage references `homeFAQs`, `cities`, `categories`, `carModels`, `airports` from `data.ts`. `/about`, `/contact`, `/privacy` are mostly hand-authored static content with no per-row interpolation — they may not need DB overlay at all. Plan once Task 7 (production readiness) lands.

**Important constraints for any remaining Task 6 / 7 work:**
- Do not change the lead form, lead routing, or admin dashboard.
- Do not change the schema. Use existing visibility rules.
- Customer-data privacy unchanged — public reads expose no leads, no admin notes, no internal trust levels. `branch.whatsapp_number` stays admin-side.
- Service-role usage stays server-only.
- Prerendered-route baseline stays at 236 (build worker tally 237/237). Verify on every change.
- JSON-LD generators continue to receive the static `data.ts` city/airport object until the schema gains `lat`/`lng`/`partnerCount`/`nameEn` — separate future task.

---

## 10. Short Context for Future AI Sessions

> Saudi car rental **comparison and lead-generation** platform. MVP only: no bookings, no payments, no final-price guarantees, no auto-routing. Customer fills an Arabic form on the public site (city, dates, vehicle, phone, **optional notes**) → lead saved in Supabase with an atomic activity-log entry → admin reviews and routes the lead in `/admin/leads`. The admin can manually assign or **reassign** a lead to a company/branch (each assignment creates a new `lead_company_routing` row; older routings stay visible as history; `leads.assigned_*` pointers advance to the latest), generate an Arabic WhatsApp message (customer notes auto-included when present), copy it to clipboard, click **Open WhatsApp** — which now uses a real `<a href="https://wa.me/9665...?text=…" target="_blank">` link so WhatsApp opens reliably with the message prefilled — and mark the routing as sent (auto-advances status from `new`/`reviewed` to `sent_to_company`). Every action is logged. **Manual-first** is preserved: no WhatsApp Business API, no n8n, no automation, no booking/payment, no company dashboard. Public pages still render from `src/lib/data.ts`, but the safe DB read layer for the future migration is now in place at `src/lib/public-data/` (Task 6.1) — 7 server-only helpers with strict visibility filters and a deliberate `branch.whatsapp_number` exclusion so direct partner contact stays admin-side. Service-role key is server-only; admin pages use cookie auth via `@supabase/ssr` and gate roles app-side. The lead form is rate-limited at 10/hour per IP, flags potential duplicates (same phone within 24h) to admin without blocking submissions, strips URLs out of customer notes, and computes the pickup-date default + minimum from Asia/Riyadh — same source the server validator uses — so the form never pre-fills a date the server would reject. Admin can also manage rental partners directly: `/admin/companies` lists every company; create / edit forms cover both companies and branches; activation / deactivation / archival is via existing `status` + `public_status` enums (no physical deletes); branch WhatsApp numbers are normalised to `+9665XXXXXXXX` on save; archived companies/branches automatically drop out of the routing picker. `/admin/cars` lists the car-model catalogue with the same create / edit / archive pattern; the form pre-fills English + Arabic brand and model, slug, year (1990–2100), category (dropdown of active `car_categories`), seats (1–100), transmission (`automatic` / `manual` / none), fuel type, image URL, and description; `features_json` is preserved on edit but not editable through the UI. `/admin/offers` ties everything together: a 19-field form in four sections (Who / Pricing / Terms / Workflow) creates company × branch × car × city × airport bundles with daily/weekly/monthly price tiers; the city is server-derived from the chosen branch (the form never sends it); at least one price is required; ✨ Suggest buttons offer non-binding weekly/monthly hints; **publishing an offer requires `approval_status='approved'` (or `auto_approved`)** and **rejecting an offer auto-forces `public_status='hidden'`**; `last_updated_at` bumps only when price or availability changes — stale offers (>30d) show a red indicator. All MVP admin CRUD is now complete (Leads · Companies · Branches · Cars · Offers), the read-only public data layer is in place, and four public routes now consume it via the **augmentation** pattern: `/sa/airports/[airport]` (6.2A), `/sa/[city]` (6.2B), `/sa/[city]/[category]` (6.2C), and `/sa/[city]/[category]/[car]` (6.2D). On every migrated route, static `data.ts` stays load-bearing (route existence, `generateStaticParams`, JSON-LD `LocalBusiness` city source for `lat`/`lng`/`partnerCount`/`description`, all pricing fields); a server-only DB overlay augments visible scalar identity (`name_ar` for city/category/car, composed `carNameAr = ${brand_ar} ${model_ar}`, `carYear`) with a `??` fallback so DB outages, draft/archived rows, or any-side-missing transparently fall back to static. **Pricing remains static across all migrated routes** — `car.dailyPrice`, `car.monthlyPrice`, `cat.minPrice`, the category car grid, `categoryGradients`, `descs`, `generateCarSEOContent`, per-car features/description, and Product JSON-LD `lowPrice`/`highPrice` all stay on `data.ts`. A future dedicated pricing task should migrate prices from `offers` once the ranking rule (e.g. "cheapest visible offer per car/city") is decided. City-page Arabic titles use the `تأجير سيارات في [city]` wording (6.2B's `6960242` initially shipped a `بـ`-prefix variant; follow-up `9090d39` reverted to `في`). Build baseline: worker tally **237/237**, prerendered-route count **236** (authoritative from `.next/prerender-manifest.json`). Task 6.2X (`206a697`) cleaned up the pre-existing duplicated layout-level `LocalBusiness` JSON-LD: the `(site)` layout `@graph` now contains only `WebSite` + `Organization`, so every route has exactly one coherent `LocalBusiness` block where appropriate (correct per-city) and zero on routes that aren't places (`/about` / `/contact` / `/privacy`, car detail). Task 6.3 (`c0b1bc4`) added an automated regression sweep (`npm run seo:check`) covering metadata, sitemap, JSON-LD, and public-privacy invariants programmatically — 240/240 PASS at last local run; companion human checklist at [ai-docs/32_PRE_LAUNCH_REGRESSION_CHECKLIST.md](32_PRE_LAUNCH_REGRESSION_CHECKLIST.md). Task 7 (`4acabad`) added `BASE=` env-var support so the same script can target a remote Vercel URL, plus the canonical launch runbook at [ai-docs/33_PRODUCTION_LAUNCH_RUNBOOK.md](33_PRODUCTION_LAUNCH_RUNBOOK.md). `BASE=https://saudi-car-rental.vercel.app npm run seo:check` passes **244/244** against the Vercel preview. `NEXT_PUBLIC_SITE_URL` on Vercel is set to the intended production domain `https://cars-renting.com`; the sitemap emits canonical `cars-renting.com` URLs while the staging deploy is reachable at `saudi-car-rental.vercel.app` — at launch, DNS for `cars-renting.com` should point at Vercel so canonical sitemap URLs resolve directly. Three small operator-driven smoke-test follow-up fixes landed: `509a9bb` pre-selects the city in the form on URL-scoped pages (`/sa/[city]` / category / car-detail / airport); `7a9e9dc` extends that by syncing the URL-derived city into `CityContext` so the global header `city-selector-btn` also reflects the page's city on first load; `44888f7` makes the header city dropdown perform a client-side `router.push(\`/sa/\${citySlug}\`)` so picking a city actually navigates to that city's landing page (category/car/airport segments intentionally dropped). Homepage remains empty by design. **None were data corruption** — dual client/server guards already blocked any submission with empty city. **End-to-end production smoke test passed** against the Vercel preview at `https://saudi-car-rental.vercel.app`: header navigation, city pre-selection, lead-form submission, admin login, lead detail page, activity log, and routing panel all verified. Smoke-test lead `SCR-202605-00004` was created and preserved (DB inspection confirmed correct `source_page`, `city_id`, consent fields, phone normalisation, `lead_activity_logs` entry). 🚀 **PRODUCTION LIVE at `https://www.cars-renting.com`** — final SEO check `BASE=https://www.cars-renting.com npm run seo:check` returns **PASS** on the canonical domain with the host-mismatch info line **gone**. Apex `cars-renting.com` redirects to `www` correctly. Post-launch hygiene fix `73eec05` wired `SITE_URL` to `process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.cars-renting.com'` (previously hardcoded to apex). After Vercel redeployed `73eec05`, sitemap / canonical / OG / JSON-LD URLs now all use `www.cars-renting.com` directly — the entire SEO surface emits the customer-visible canonical domain with no apex → www redirect hop in structured data. **Launch hygiene complete.** Two consecutive post-launch SEO experiments landed on the homepage only: `70a5e86` rewrote the H1 to `تأجير سيارات في السعودية بأسعار تنافسية وخيارات موثوقة`; `25e8cc2` then moved every other visible homepage page-content block to a client-only component (slot-based, wrapped in `<NoSSR>`) so the raw SSR visible text on the homepage body is now **only the 8-word H1** (down from 289 words). Hydrated visual layout is preserved via slots. Page-level JSON-LD + metadata + sitemap + canonical + OG/Twitter are untouched. **Both experiments are live in production** — `BASE=https://www.cars-renting.com npm run seo:check` returns **244/244 PASS** with no sitemap/canonical/OG/Twitter/JSON-LD/privacy regression and the host-mismatch info line still gone. Follow-up experiment `d281f87` extended the same H1+intro SSR pattern to the four non-homepage SEO routes (`/sa/[city]`, `/sa/[city]/[category]`, `/sa/airports/[airport]`, `/sa/[city]/[category]/[car]`): each now ships ~30-40 words of SSR visible text (H1 + one short Arabic intro paragraph with `تأجير سيارات` as the only target keyword, no overclaims, no fake trust phrases); everything else (breadcrumb / pills / form / FAQ accordion / internal links / body sections / pricing card) is client-rendered via 4 slot-based client components. Refactor `07cec7d` then centralized the non-homepage SEO rendering contract into a single reusable server component [`<SeoPageHero>`](../src/components/seo-page-hero.tsx) used by all four routes; future SEO routes (company / branch / offer / article / any new landing page) author against this contract instead of duplicating the hero scaffold. Future contract upgrades (e.g. adding an internal-links block or compact trust block) become a one-file change. SSR output and visual layout are byte-identical to the pre-refactor `d281f87` state. **Refactor is live in production** — `BASE=https://www.cars-renting.com npm run seo:check` returns **244/244 PASS** with no sitemap/canonical/OG/Twitter/JSON-LD/privacy regression. The non-homepage SEO contract (`SSR = H1 + intro P` / `CSR = remaining body`) is now canonical and documented in the component JSDoc. JSON-LD / metadata / sitemap / canonical / OG / Twitter / lead-form / DB-overlay adapters all untouched throughout. **Intentional risk:** crawler-visible body content dropped sharply across all SEO route types; FAQ accordion and internal-link clusters now client-rendered. Monitor Google Search Console over the next 1–2 weeks for FAQ Rich Result eligibility and indexing-latency changes. Pricing migration (6.4) and homepage migration (6.2E) remain deferred. Phase 11 has now opened with Task 11.1 (`24608e3`) — the header city switcher preserves route context (`/sa/jeddah/luxury/bmw-5-series` → `/sa/riyadh/luxury/bmw-5-series` when the `(category, car)` combo is valid; falls back to `/sa/[city]/[category]` if the car is invalid, to `/sa/[city]` if the category is invalid; airport routes map via `airports.find(a => a.citySlug === target)`). New helper `src/lib/search/url-builder.ts` exports `buildRouteFromContext(targetCitySlug, currentPathname)`; `<CitySwitcher>` consumes it via `usePathname()`. Task 11.2 (`3be92e3`) then replaced the lead form's two separate pickup/return date inputs with a single `<DateRangePicker>` (`مدة التأجير` section with six presets `اليوم` / `غدًا` / `يومين` / `أسبوع` / `شهر` / `مخصص`, native date inputs in custom mode, output still `YYYY-MM-DD` for both `pickup_date` and `return_date`) and aligned in-form city/category selection with the route-context helper from 11.1 — city changes route via `buildRouteFromContext`; category changes route to `/sa/[city]/[category]` (dropping the car on a car detail route); category changes on airport routes stay as local form state so airport context isn't silently dropped; date changes never touch the URL. `createLead` payload shape is unchanged. No backend / DB / admin / SEO contract / metadata / sitemap / homepage changes for either task; gates `tsc` + `build` + `seo:check` (240/240) pass locally. The rest of Phase 11 (search context, airport mode toggle, category cards, search bar, lead capture modal, autocomplete) is deferred and not started. Latest `main` HEAD: `3be92e3`.

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
